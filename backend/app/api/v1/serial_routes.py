from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.services.serial_service import serial_service
from app.schemas.schemas import SerialPortInfo, SerialConnectRequest

router = APIRouter(prefix="/serial", tags=["Serial Communication"])

@router.get("/ports", response_model=List[SerialPortInfo])
def get_serial_ports():
    return serial_service.list_available_ports()

@router.get("/status")
def get_serial_status():
    return serial_service.get_status()

@router.post("/connect")
def connect_serial(req: SerialConnectRequest):
    success = serial_service.connect(port=req.port, baud_rate=req.baud_rate)
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to connect to serial port {req.port}. Error: {serial_service.last_error_message}"
        )
    return {"message": f"Successfully connected to {req.port}", "status": serial_service.get_status()}

@router.post("/disconnect")
def disconnect_serial():
    serial_service.disconnect()
    return {"message": "Serial connection closed", "status": serial_service.get_status()}

@router.post("/simulate/start")
def start_simulation():
    serial_service.start_simulation()
    return {"message": "Test simulation mode started", "status": serial_service.get_status()}

@router.post("/simulate/stop")
def stop_simulation():
    serial_service.stop_simulation()
    return {"message": "Simulation mode stopped", "status": serial_service.get_status()}
