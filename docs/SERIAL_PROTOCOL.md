# Serial Communication Protocol Specification

**Device:** Arduino Uno / Nano Water Monitor  
**Interface:** USB Serial  
**Default Baud Rate:** 9600 bps (8-N-1)  
**Message Format:** Newline-Delimited JSON (NDJSON)

---

## 1. Upstream Telemetry Packet (Arduino -> Python)

Every 1000 milliseconds (1 second), the Arduino computes flow rate and volume, transmitting a single-line JSON string followed by `\r\n`:

```json
{
  "seq": 1042,
  "sensor": "YF-S201",
  "flow_lpm": 4.25,
  "pulses": 32,
  "total_l": 18.75,
  "status": "OK"
}
```

### Field Definitions

| Field | Type | Unit | Description |
|---|---|---|---|
| `seq` | Integer | - | Monotonically increasing sequence number (1, 2, 3...) for duplicate/drop detection. |
| `sensor` | String | - | Hardware sensor identifier (e.g. `YF-S201`, `FS300A`). |
| `flow_lpm` | Float | L/min | Instantaneous flow rate computed over the 1-second sample interval. |
| `pulses` | Integer | Pulses | Raw Hall-effect pulse count accumulated during the last 1000 ms. |
| `total_l` | Float | Liters | Cumulative volume measured by the device since power-on / reset. |
| `status` | String | - | Operating status flag (`OK`, `WARNING`, `ANOMALY`). |

---

## 2. Downstream Commands (Python -> Arduino)

Commands sent from host to Arduino over USB serial:

- `CAL:<factor>\n`: Dynamically updates the calibration pulse factor in Arduino RAM (e.g. `CAL:462.5\n`).
  - Response: `{"status":"CAL_UPDATED","cal":462.50}`
- `RESET\n`: Resets cumulative volume counter to 0.0 Liters and sequence number to 0.
  - Response: `{"status":"COUNTER_RESET"}`
- `PING\n`: Heartbeat verification.
  - Response: `{"pong":true,"sensor":"YF-S201"}`

---

## 3. Data Integrity & Validation Rules

1. **Non-blocking read:** The Python serial thread buffers line endings and discards partial packets.
2. **JSON Schema Validation:** Packets lacking `seq`, `flow_lpm`, or `pulses` are logged as malformed and dropped without crashing the daemon.
3. **Sequence Tracking:** If `seq == last_seq`, the packet is dropped to prevent double-counting.
4. **Range checks:** Negative flow rates or pulse counts are rejected.
