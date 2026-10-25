import pytest
import json
from app.services.serial_service import SerialBridgeService

def test_serial_parser_valid_payload():
    service = SerialBridgeService()
    payload = json.dumps({
        "seq": 105,
        "sensor": "YF-S201",
        "flow_lpm": 3.75,
        "pulses": 28,
        "total_l": 15.42,
        "status": "OK"
    })
    
    # Process
    service._process_raw_payload(payload, is_simulated=True)
    
    assert service.last_sequence_id == 105
    assert service.current_flow_lpm == 3.75
    assert service.cumulative_liters == 15.42
    assert service.current_pulses == 28

def test_serial_parser_duplicate_packet_dropped():
    service = SerialBridgeService()
    payload = json.dumps({
        "seq": 200,
        "sensor": "YF-S201",
        "flow_lpm": 4.10,
        "pulses": 30,
        "total_l": 20.00,
        "status": "OK"
    })
    service._process_raw_payload(payload, is_simulated=True)
    assert service.last_sequence_id == 200

    # Send identical sequence again with different flow (duplicate test)
    duplicate_payload = json.dumps({
        "seq": 200,
        "sensor": "YF-S201",
        "flow_lpm": 9.99,
        "pulses": 99,
        "total_l": 99.00,
        "status": "OK"
    })
    service._process_raw_payload(duplicate_payload, is_simulated=True)
    # Sequence was duplicate, so current_flow_lpm remains 4.10
    assert service.current_flow_lpm == 4.10

def test_serial_parser_malformed_json_handled_safely():
    service = SerialBridgeService()
    # Malformed packet should not throw exception
    service._process_raw_payload("INVALID_GARBAGE_SERIAL_DATA", is_simulated=True)
    assert service.last_sequence_id == -1
