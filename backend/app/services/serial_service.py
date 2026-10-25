import json
import logging
import threading
import time
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Callable
import serial
import serial.tools.list_ports

from app.database import SessionLocal
from app.models.models import WaterReading, DeviceConfig
from app.services.alert_service import alert_service
from app.services.supabase_service import supabase_service
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger("serial_service")

_sync_pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="supabase_sync")

def _dispatch_supabase_reading(payload: Dict[str, Any]):
    try:
        asyncio.run(supabase_service.sync_reading(payload))
    except Exception:
        pass

class SerialBridgeService:
    def __init__(self):
        self.port: str = "COM3"
        self.baud_rate: int = 9600
        self.is_connected: bool = False
        self.is_simulated: bool = False
        self.should_run: bool = False
        self.serial_instance: Optional[serial.Serial] = None
        self.thread: Optional[threading.Thread] = None
        self.sim_thread: Optional[threading.Thread] = None
        
        # State tracking
        self.last_sequence_id: int = -1
        self.last_reading_time: Optional[datetime] = None
        self.current_flow_lpm: float = 0.0
        self.cumulative_liters: float = 0.0
        self.current_pulses: int = 0
        self.sensor_status: str = "DISCONNECTED"
        self.last_error_message: Optional[str] = None
        
        # Subscribers for live websocket feeds
        self.subscribers: List[Callable[[Dict[str, Any]], None]] = []
        self._lock = threading.Lock()

    def subscribe(self, callback: Callable[[Dict[str, Any]], None]):
        with self._lock:
            if callback not in self.subscribers:
                self.subscribers.append(callback)

    def unsubscribe(self, callback: Callable[[Dict[str, Any]], None]):
        with self._lock:
            if callback in self.subscribers:
                self.subscribers.remove(callback)

    def _broadcast(self, data: Dict[str, Any]):
        with self._lock:
            callbacks = list(self.subscribers)
        for cb in callbacks:
            try:
                cb(data)
            except Exception as e:
                logger.error(f"Error notifying subscriber: {e}")

    def list_available_ports(self) -> List[Dict[str, str]]:
        ports = serial.tools.list_ports.comports()
        result = []
        for p in ports:
            result.append({
                "port": p.device,
                "description": p.description or "Generic Serial Device",
                "hwid": p.hwid or "Unknown"
            })
        return result

    def get_status(self) -> Dict[str, Any]:
        freshness = None
        if self.last_reading_time:
            freshness = (datetime.now(timezone.utc) - self.last_reading_time).total_seconds()

        return {
            "connected": self.is_connected,
            "is_simulated": self.is_simulated,
            "port": self.port,
            "baud_rate": self.baud_rate,
            "last_reading_time": self.last_reading_time,
            "data_freshness_seconds": round(freshness, 1) if freshness is not None else None,
            "flow_rate_lpm": round(self.current_flow_lpm, 2),
            "total_liters": round(self.cumulative_liters, 2),
            "pulses": self.current_pulses,
            "sensor_status": self.sensor_status,
            "last_error": self.last_error_message
        }

    def connect(self, port: str = "COM3", baud_rate: int = 9600) -> bool:
        if self.is_connected:
            self.disconnect()

        self.port = port
        self.baud_rate = baud_rate
        self.last_error_message = None

        try:
            self.serial_instance = serial.Serial(
                port=self.port,
                baudrate=self.baud_rate,
                timeout=2.0
            )
            self.is_connected = True
            self.is_simulated = False
            self.sensor_status = "ONLINE"
            self.should_run = True

            self.thread = threading.Thread(target=self._read_serial_loop, daemon=True)
            self.thread.start()
            logger.info(f"Connected to Arduino on {self.port} at {self.baud_rate} baud.")
            return True
        except Exception as e:
            self.is_connected = False
            self.sensor_status = "ERROR"
            self.last_error_message = str(e)
            logger.error(f"Failed to connect to {port}: {e}")
            return False

    def disconnect(self):
        self.should_run = False
        if self.serial_instance and self.serial_instance.is_open:
            try:
                self.serial_instance.close()
            except Exception as e:
                logger.error(f"Error closing serial port: {e}")
        
        self.is_connected = False
        self.sensor_status = "DISCONNECTED"
        if not self.is_simulated:
            self.current_flow_lpm = 0.0

    def start_simulation(self):
        """Starts realistic test mode when hardware is not connected."""
        if self.is_connected:
            self.disconnect()

        self.is_simulated = True
        self.is_connected = True
        self.sensor_status = "SIMULATED_ACTIVE"
        self.should_run = True

        if not self.sim_thread or not self.sim_thread.is_alive():
            self.sim_thread = threading.Thread(target=self._simulation_loop, daemon=True)
            self.sim_thread.start()

    def stop_simulation(self):
        self.is_simulated = False
        self.is_connected = False
        self.sensor_status = "DISCONNECTED"
        self.should_run = False
        self.current_flow_lpm = 0.0

    def _read_serial_loop(self):
        """Worker loop reading newline-delimited JSON from physical Arduino."""
        buffer = ""
        while self.should_run and self.serial_instance and self.serial_instance.is_open:
            try:
                line = self.serial_instance.readline().decode("utf-8", errors="replace").strip()
                if not line:
                    continue

                if not line.startswith("{") or not line.endswith("}"):
                    continue

                self._process_raw_payload(line, is_simulated=False)

            except serial.SerialException as se:
                logger.error(f"Serial port exception: {se}")
                self.last_error_message = f"Hardware disconnected: {se}"
                self.sensor_status = "ERROR"
                self.is_connected = False
                break
            except Exception as e:
                logger.error(f"Unexpected serial read error: {e}")
                time.sleep(0.5)

    def _simulation_loop(self):
        """Generates realistic telemetry pulses for testing/evaluation."""
        seq = 1000
        sim_pulses = 0
        state = "FLOWING"
        cycle_counter = 0

        # Load cumulative volume from DB if exists
        with SessionLocal() as db:
            last = db.query(WaterReading).order_by(WaterReading.id.desc()).first()
            if last:
                self.cumulative_liters = last.total_liters

        while self.should_run and self.is_simulated:
            cycle_counter += 1
            seq += 1

            # Deterministic simulation cycle:
            # 1-12s: tap running at 3.5 - 6.0 LPM
            # 13-18s: tap idle (0.0 LPM)
            # 19-30s: shower running at 6.0 - 9.5 LPM
            # 31-38s: idle (0.0 LPM)
            phase = cycle_counter % 40
            if 0 <= phase < 12:
                flow_lpm = 4.2 + (0.5 * (phase % 3))
                pulses = int((flow_lpm / 60.0) * 450.0) # ~31 pulses per sec
            elif 12 <= phase < 18:
                flow_lpm = 0.0
                pulses = 0
            elif 18 <= phase < 32:
                flow_lpm = 7.5 + (0.8 * (phase % 4))
                pulses = int((flow_lpm / 60.0) * 450.0) # ~56 pulses per sec
            else:
                flow_lpm = 0.0
                pulses = 0

            added_liters = pulses / 450.0
            self.cumulative_liters += added_liters

            sim_payload = json.dumps({
                "seq": seq,
                "sensor": "YF-S201-SIM",
                "flow_lpm": round(flow_lpm, 2),
                "pulses": pulses,
                "total_l": round(self.cumulative_liters, 2),
                "status": "OK"
            })

            self._process_raw_payload(sim_payload, is_simulated=True)
            time.sleep(1.0)

    def _process_raw_payload(self, raw_str: str, is_simulated: bool):
        try:
            data = json.loads(raw_str)
        except json.JSONDecodeError as err:
            logger.warning(f"Malformed JSON from serial: {err}")
            return

        seq = data.get("seq")
        sensor_id = data.get("sensor", "YF-S201")
        flow_lpm = float(data.get("flow_lpm", 0.0))
        pulses = int(data.get("pulses", 0))
        total_l = float(data.get("total_l", self.cumulative_liters))
        status = data.get("status", "OK")

        # Basic range checks
        if flow_lpm < 0 or pulses < 0:
            logger.warning("Invalid negative values in serial packet")
            return

        # Sequence check and duplicate protection
        if seq is not None:
            if seq == self.last_sequence_id:
                logger.debug(f"Duplicate sequence packet {seq} dropped")
                return
            self.last_sequence_id = seq

        # Update service telemetry cache
        now = datetime.now(timezone.utc)
        self.last_reading_time = now
        self.current_flow_lpm = flow_lpm
        self.current_pulses = pulses
        self.cumulative_liters = total_l
        self.sensor_status = "ONLINE" if not is_simulated else "SIMULATED_ACTIVE"

        # Persist to database
        try:
            with SessionLocal() as db:
                config = db.query(DeviceConfig).first()
                reading = WaterReading(
                    timestamp=now,
                    flow_rate_lpm=flow_lpm,
                    pulses=pulses,
                    total_liters=total_l,
                    sequence_id=seq or 0,
                    sensor_id=sensor_id,
                    status=status,
                    is_simulated=is_simulated
                )
                db.add(reading)
                db.commit()
                db.refresh(reading)

                # Check for alerts
                alert_service.check_reading_for_alerts(db, reading, config)

        except Exception as db_err:
            logger.error(f"Failed to persist water reading: {db_err}")

        # Broadcast live tick over WebSockets
        broadcast_data = {
            "type": "TELEMETRY_UPDATE",
            "timestamp": now.isoformat(),
            "flow_rate_lpm": round(flow_lpm, 2),
            "pulses": pulses,
            "total_liters": round(total_l, 2),
            "sequence_id": seq,
            "sensor_id": sensor_id,
            "sensor_status": self.sensor_status,
            "is_simulated": is_simulated
        }
        self._broadcast(broadcast_data)

        # Dispatch async sync to Supabase cloud
        try:
            _sync_pool.submit(_dispatch_supabase_reading, broadcast_data)
        except Exception:
            pass

serial_service = SerialBridgeService()
