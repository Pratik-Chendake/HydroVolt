import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Set

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.models import (
    DeviceConfig, TariffConfig, ElectricityConfig, WaterReading, Alert
)
from app.services.serial_service import serial_service
from app.api.v1.serial_routes import router as serial_router
from app.api.v1.water_routes import router as water_router
from app.api.v1.calibration_routes import router as calibration_router
from app.api.v1.alert_routes import router as alert_router
from app.api.v1.tariff_routes import router as tariff_router
from app.api.v1.electricity_routes import router as electricity_router
from app.api.v1.ai_routes import router as ai_router
from app.api.v1.report_routes import router as report_router
from app.api.v1.analytics_routes import router as analytics_router
from app.api.v1.device_routes import router as device_router
from app.api.v1.supabase_routes import router as supabase_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# Active WebSocket connections
active_connections: Set[WebSocket] = set()

def seed_defaults():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        # Default Device Config
        if not db.query(DeviceConfig).first():
            db.add(DeviceConfig(
                serial_port="COM3",
                baud_rate=9600,
                auto_reconnect=True,
                reconnect_interval_sec=5,
                sensor_model="YF-S201 (Hall Effect)",
                sensor_pin="Pin D2 (Interrupt 0)",
                calibration_factor=450.0,
                flow_warning_threshold_lpm=25.0,
                continuous_leak_threshold_lpm=0.25,
                continuous_leak_duration_mins=45
            ))

        # Default Tariff Config
        if not db.query(TariffConfig).first():
            db.add(TariffConfig(
                tier1_limit_liters=10000.0,
                tier1_rate_per_kl=15.0,
                tier2_limit_liters=25000.0,
                tier2_rate_per_kl=25.0,
                tier3_rate_per_kl=40.0,
                fixed_meter_charge=50.0,
                sewerage_charge_percent=10.0,
                monthly_target_liters=15000.0,
                daily_target_liters=500.0,
                currency="₹"
            ))

        # Default Electricity Config (Explicitly Disabled & Not Configured)
        if not db.query(ElectricityConfig).first():
            db.add(ElectricityConfig(
                is_enabled=False,
                meter_model="",
                interface_type="RS485 / Modbus RTU",
                baud_rate=9600,
                parity="None",
                slave_address=1,
                status="Not configured",
                notes="Hardware electricity meter is not yet connected. Water monitoring operates completely independently."
            ))

        # If zero historical water readings exist, create initial realistic baseline data
        # so analytics, charts, and AI insights work straight away out of the box!
        if db.query(WaterReading).count() == 0:
            now = datetime.now(timezone.utc)
            base_liters = 100.0
            readings = []
            
            # Generate 48 hours of baseline data at 3-hour intervals
            for h in range(48, 0, -1):
                t = now - timedelta(hours=h)
                # Realistic pattern: higher flow in morning (7-9 AM) and evening (7-9 PM)
                hour_of_day = t.hour
                if 7 <= hour_of_day <= 9:
                    flow = 5.2
                    delta_vol = 14.5
                elif 19 <= hour_of_day <= 21:
                    flow = 4.8
                    delta_vol = 12.0
                elif 1 <= hour_of_day <= 4:
                    flow = 0.0 # Clean zero night flow
                    delta_vol = 0.0
                else:
                    flow = 1.2
                    delta_vol = 3.5

                base_liters += delta_vol
                pulses = int(delta_vol * 450.0)
                readings.append(WaterReading(
                    timestamp=t,
                    flow_rate_lpm=flow,
                    pulses=pulses,
                    total_liters=round(base_liters, 2),
                    sequence_id=500 - h,
                    sensor_id="YF-S201",
                    status="OK",
                    is_simulated=True
                ))

            db.bulk_save_objects(readings)

            # Add an initial welcome alert
            db.add(Alert(
                timestamp=now - timedelta(hours=2),
                alert_type="SYSTEM",
                severity="info",
                title="Smart Water Telemetry Engine Initialized",
                message="Monitoring system online. Serial COM port discovery and flow calculation engine ready.",
                acknowledged=True,
                resolved=True
            ))

        db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Smart Water & Energy Manager backend...")
    seed_defaults()
    
    try:
        loop = asyncio.get_running_loop()
        def broadcast_callback(data):
            if active_connections and loop.is_running():
                asyncio.run_coroutine_threadsafe(_broadcast_to_websockets(data), loop)
        serial_service.subscribe(broadcast_callback)
    except Exception as e:
        logger.warning(f"Could not bind WebSocket event loop: {e}")
        broadcast_callback = None

    yield

    # Shutdown
    logger.info("Shutting down serial bridge service...")
    if broadcast_callback:
        serial_service.unsubscribe(broadcast_callback)
    serial_service.disconnect()
    serial_service.stop_simulation()

app = FastAPI(
    title="Smart Water & Energy Manager API",
    version="1.0.0",
    description="IoT telemetry backend with Arduino serial bridge, flow rate calculation, tariffs, and AI insights.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(serial_router, prefix=settings.API_V1_STR)
app.include_router(water_router, prefix=settings.API_V1_STR)
app.include_router(calibration_router, prefix=settings.API_V1_STR)
app.include_router(alert_router, prefix=settings.API_V1_STR)
app.include_router(tariff_router, prefix=settings.API_V1_STR)
app.include_router(electricity_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(report_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(device_router, prefix=settings.API_V1_STR)
app.include_router(supabase_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "serial_connected": serial_service.is_connected,
        "is_simulated": serial_service.is_simulated
    }

async def _broadcast_to_websockets(data: dict):
    if not active_connections:
        return
    dead_connections = set()
    for ws in list(active_connections):
        try:
            await ws.send_json(data)
        except Exception:
            dead_connections.add(ws)
    for ws in dead_connections:
        active_connections.discard(ws)

@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        # Send initial status snapshot upon connection
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "status": serial_service.get_status()
        })
        while True:
            # Keep socket alive and respond to client ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        active_connections.discard(websocket)
    except Exception:
        active_connections.discard(websocket)
