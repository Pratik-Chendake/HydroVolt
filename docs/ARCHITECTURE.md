# Smart Water & Energy Manager - System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    HARDWARE LAYER                                     |
|                                                                                       |
|   +-----------------------+              +------------------------+                   |
|   | YF-S201 Flow Sensor   |              | (Future/Optional)      |                   |
|   | Hall-Effect Turbine   |              | Electricity Meter      |                   |
|   +-----------+-----------+              | (RS485 / Modbus RTU)   |                   |
|               | Pulses (INT0)            +-----------+------------+                   |
|               v                                      | (Isolated)                     |
|   +-----------------------+                          |                                |
|   |  Arduino Uno / Nano   |                          v                                |
|   |  Interrupt ISR        |                  [Not Configured]                         |
|   |  NDJSON Generator     |                                                           |
|   +-----------+-----------+                                                           |
+---------------|-----------------------------------------------------------------------+
                | USB Serial (COM3, 9600 baud)
+---------------v-----------------------------------------------------------------------+
|                                    BACKEND LAYER                                      |
|                                                                                       |
|   +---------------------------------------------------------------+                   |
|   | Python PySerial Bridge Worker (app/services/serial_service.py) |                   |
|   | - Port Auto-Discovery & Auto-Reconnect                        |                   |
|   | - Monotonic Sequence Number Validation & Deduplication        |                   |
|   | - Deterministic Test Simulator Engine                         |                   |
|   +-------------------------------+-------------------------------+                   |
|                                   |                                                   |
|                +------------------+------------------+                                |
|                |                                     |                                |
|                v                                     v                                |
|   +-------------------------+           +--------------------------+                  |
|   | SQLite Database Engine  |           | WebSocket Live Engine    |                  |
|   | (SQLAlchemy 2.0 ORM)    |           | (/ws/live Broadcaster)   |                  |
|   | - WaterReadings         |           +------------+-------------+                  |
|   | - CalibrationRecords    |                        |                                |
|   | - TariffConfig (INR)    |                        | Broadcast                      |
|   | - Alert & Audit Tables  |                        | Live Packets                   |
|   +------------+------------+                        |                                |
|                |                                     |                                |
|                v                                     |                                |
|   +---------------------------------------+          |                                |
|   | FastAPI REST API (v1)                 |          |                                |
|   | - Water Telemetry & History           |          |                                |
|   | - Tiered Tariff & Bill Calculation    |          |                                |
|   | - Calibration Formulas & Verification |          |                                |
|   | - Explainable Statistical AI Engine   |          |                                |
|   | - Streaming CSV Telemetry Generator   |          |                                |
|   +-------------------+-------------------+          |                                |
+-----------------------|------------------------------|--------------------------------+
                        | REST JSON                    | WS frames
+-----------------------v------------------------------v--------------------------------+
|                                    FRONTEND LAYER                                     |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   | React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts         |   |
|   | Modern Dark Navy UI (#0B132B / #1C2541) with Cyan/Aqua/Emerald Accents        |   |
|   |                                                                               |   |
|   | Complete 14 Pages:                                                            |   |
|   | 1.  Home Dashboard (Gauges, Target Budgets, Live Cards, Freshness)           |   |
|   | 2.  Water Monitoring (Live Flow Tachometer, Pulse Oscilloscope, Telemetry)    |   |
|   | 3.  Water History (Filterable Paginated Telemetry Table, Date Ranges)         |   |
|   | 4.  Analytics & Trends (Hourly Peak Heatmaps, Weekly/Monthly Comparisons)     |   |
|   | 5.  Alerts & Events (Leak Detection, Surge Anomaly, Severity Management)      |   |
|   | 6.  Device Management (Hardware Health, Signal Sequence, Firmware Profile)    |   |
|   | 7.  Arduino Serial Configuration (COM Port Scanner, Baud, Simulator Mode)    |   |
|   | 8.  Sensor Calibration (Known Volume Bucket Wizard, Factor Adjustment)        |   |
|   | 9.  Electricity Meter Setup (Strictly Isolated, Honest "Not Configured" Form) |   |
|   | 10. Billing & Water Tariffs (Tier 1/2/3 Sliders, Sewerage %, INR Billing)     |   |
|   | 11. Reports & Exports (Live CSV Generator & Printable Telemetry Summaries)    |   |
|   | 12. AI Insights (Explainable MNF Night Flow Leak Analysis, Forecasts)         |   |
|   | 13. Settings (Thresholds, Preferences, Offline Storage, Diagnostics)          |   |
|   | 14. Help & Hardware Setup (Pinouts, Schematics, Troubleshooting Steps)        |   |
+---------------------------------------------------------------------------------------+
```
