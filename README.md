# Smart Water & Energy Manager

A professional, full-stack IoT and AI telemetry platform designed for college engineering projects and residential/commercial water stewardship.

The system connects to physical **Arduino Uno / Arduino Nano** microcontrollers running real-time pulse counting firmware on external hardware interrupt `INT0`, streams newline-delimited JSON (NDJSON) over USB serial using `pyserial`, stores high-resolution telemetry in persistent SQLite/PostgreSQL databases, and powers a modern, high-contrast **Light Theme** (with one-click Dark Mode toggle) responsive dashboard with live WebSocket push updates, tiered water tariffs in Indian Rupees (₹), sensor calibration, automated leak heuristics, and explainable AI insights.

---

## 1. System Architecture

```
  +-------------------------------------------------------------------------+
  |                          Physical Hardware Layer                        |
  |                                                                         |
  |   +-----------------------+              +--------------------------+   |
  |   | YF-S201 Flow Sensor   |              | Electricity Meter        |   |
  |   | Hall-Effect Turbine   |              | (RS485 / Modbus RTU)     |   |
  |   +-----------+-----------+              +------------+-------------+   |
  |               | Pulses (INT0)                         | (Isolated)      |
  |               v                                       v                 |
  |   +-----------------------+                   [Not Configured]          |
  |   |  Arduino Uno / Nano   |                                             |
  |   |  Interrupt ISR        |                                             |
  |   |  NDJSON Generator     |                                             |
  |   +-----------+-----------+                                             |
  +---------------|---------------------------------------------------------+
                  | USB Serial (COM3, 9600 baud)
  +---------------v---------------------------------------------------------+
  |                             Backend Layer                               |
  |                                                                         |
  |   Python PySerial Bridge Worker (app/services/serial_service.py)        |
  |     - Port Auto-Discovery & Auto-Reconnect                              |
  |     - Monotonic Sequence Validation & Deduplication                     |
  |     - Deterministic Test Simulator Engine                               |
  |                                                                         |
  |   SQLite Database (SQLAlchemy 2.0 ORM) + FastAPI REST / WebSocket       |
  |     - Telemetry Accumulator & Tiered INR Billing (₹)                    |
  |     - Explainable AI Engine (Minimum Night Flow Leak Heuristics)        |
  |     - Streaming CSV Telemetry Generator                                 |
  +---------------|---------------------------------------------------------+
                  | REST JSON + WebSocket /ws/live
  +---------------v---------------------------------------------------------+
  |                            Frontend Layer                               |
  |                                                                         |
  |   React 18 + TypeScript + Vite + Tailwind CSS + Lucide + Recharts       |
  |   Dark Navy Theme (#060B18 / #0A1128) with Aqua, Cyan, Emerald Accents  |
  +-------------------------------------------------------------------------+
```

---

## 2. Implemented Pages (14 Complete Modules)

1. **Home Dashboard (`/`)**: Instantaneous flow tachometer gauge, lifetime cumulative volume, today's consumption vs. daily budget progress bar, estimated bill in ₹, 24h consumption area chart, hardware freshness timer, and isolated electricity status widget.
2. **Water Monitoring (`/monitoring`)**: Dedicated real-time flow visualizer, pulse frequency tachometer (Hz), rolling 25-second oscilloscope line chart, sequence integrity check, and raw NDJSON live bus stream log with pause/resume controls.
3. **Water History (`/history`)**: Filterable, paginated telemetry table with date range picker, search filter by sequence/sensor, and direct CSV download.
4. **Analytics & Trends (`/analytics`)**: 24-hour diurnal usage bar chart, 7-day volume evolution, peak demand hour analysis, and today vs. yesterday percentage delta.
5. **Alerts & Events (`/alerts`)**: Notification center for high flow velocity, continuous seeping leaks, and hardware disconnects; with one-click **"Acknowledge"**, **"Mark Resolved"**, and **"Trigger Diagnostic Alert"** buttons.
6. **Device Management (`/devices`)**: Hardware MCU profile (ATmega328P 16MHz), interrupt mapping (Pin D2 / INT0), packet drop rate (0.00%), and safety threshold configuration.
7. **Arduino Serial Config (`/arduino-config`)**: COM port auto-discovery scanner, baud rate selector (9600 / 115200), **"Connect"** / **"Disconnect"** controls, and **"Start Offline Test Simulator"** toggle for hardware-free demonstrations.
8. **Sensor Calibration (`/calibration`)**: Known-volume container calibration wizard (bucket test), empirical variance calculation against nominal 450 p/L, and persistent calibration audit logs.
9. **Electricity Meter Setup (`/electricity`)**: Modular independent extension. Clearly marked **"Not configured"** by default with zero fabricated values; allows registering meter manufacturer, model, RS485 slave address, and Modbus registers. Fully isolated so it never blocks water monitoring.
10. **Billing & Tariffs (`/tariffs`)**: Tiered Indian Rupee (₹) water tariffs (Tier 1 @ ₹15/kL, Tier 2 @ ₹25/kL, Tier 3 @ ₹40/kL), sewerage surcharge %, fixed meter charge, monthly water targets, and an interactive bill estimator slider.
11. **Reports & Exports (`/reports`)**: Date-filtered telemetry CSV generator (real backend streaming) and print-ready HTML/PDF audit statement.
12. **AI Insights (`/ai-insights`)**: Explainable statistical analysis of actual historical data: Minimum Night Flow (MNF 01:00-04:30 AM) basal leak detection with explicit time windows, 7-day predictive forward forecast, and actionable conservation tips.
13. **Settings (`/settings`)**: Currency selector (₹ / $ / €), timezone selection, WebSocket / HTTP fallback preferences, and data retention policies.
14. **Help & Hardware Setup (`/help`)**: Complete circuit diagrams, sensor wire color coding, Arduino IDE flashing instructions, and diagnostic checklists.

---

## 3. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6.
- **Backend:** Python 3.14 / 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, PySerial, Pandas, Uvicorn, WebSockets.
- **Database:** SQLite (local development `water_manager.db`), PostgreSQL compatible.
- **Firmware:** C++ / Arduino Wire framework (compatible with Arduino Uno & Arduino Nano).

---

## 4. Quick Start Guide (Windows PowerShell)

### Option A: One-Click Launch (Recommended)
Double-click `start_app.bat` or run in PowerShell:
```powershell
.\start_app.bat
```
This automatically launches both the FastAPI backend and Vite frontend in dedicated terminal windows!

### Option B: Manual Terminal Launch

#### Terminal 1 — Start the Backend API & Serial Bridge:
```powershell
cd c:\Users\prati\Downloads\HydoVolt
.\run_backend.ps1
```
The backend server will start at:
- **API Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **WebSocket Live Telemetry:** `ws://127.0.0.1:8000/ws/live`

#### Terminal 2 — Start the Frontend Application:
```powershell
cd c:\Users\prati\Downloads\HydoVolt
.\run_frontend.ps1
```
The website will be available at:
- **Local Website URL:** `http://localhost:5173`

---

## 5. Arduino Firmware Upload Instructions

1. Connect your **Arduino Uno** or **Arduino Nano** to your PC via USB.
2. Wire the **YF-S201** sensor:
   - **RED Wire:** Arduino `5V`
   - **BLACK Wire:** Arduino `GND`
   - **YELLOW Wire:** Arduino `Digital Pin 2` (Interrupt INT0)
3. Open `firmware/arduino_water_monitor/arduino_water_monitor.ino` in the Arduino IDE.
4. Select **Tools > Board > Arduino Uno** (or Nano) and choose the appropriate COM port.
5. Click **Upload** (Ctrl + U).
6. **Important:** Close the Arduino IDE Serial Monitor so Python can open the port exclusively.
7. Open `http://localhost:5173/arduino-config` in your browser, select your COM port, and click **"Connect to Arduino"**.

---

## 6. Offline Test Mode (Simulation for College Demonstrations)

If you are demonstrating the project in a classroom or without physical plumbing connected:
1. Open the dashboard at `http://localhost:5173`.
2. Click **"Run Test Sim"** in the top navigation bar (or via the **Arduino Serial Configuration** page).
3. The system will immediately generate realistic tap, idle, and shower pulse telemetry, store records in the database, and display `[TEST SIMULATOR]` purple badges.
4. When physical Arduino hardware is connected later, simply click **"Connect to Arduino"** and live hardware data will seamlessly take precedence!

---

## 7. Running Automated Tests

### Backend Unit Tests (Pytest)
```powershell
$env:PYTHONPATH="backend"
.\backend\venv\Scripts\pytest.exe backend\tests -v
```
*Result: 16/16 automated tests passing (Serial parser, sequence deduplication, calibration formulas, tiered INR tariffs, Supabase cloud sync, and API health).*

### Frontend Type-Check & Production Build
```powershell
cd frontend
npm run build
```
*Result: 0 errors; built production bundle in `frontend/dist/`.*

---

## 8. Supabase Cloud Integration

HydoVolt is integrated with Supabase Cloud for live remote telemetry replication, historical queries, and cloud analytics.

### Configuration
- **Project URL:** `https://escefqdmzcqcfbgqwjil.supabase.co`
- **Project Ref:** `escefqdmzcqcfbgqwjil`
- **Configured in:** `.env`, `.env.example`, `frontend/.env`, `frontend/.env.example`

### Provisioning the Cloud Schema
1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/escefqdmzcqcfbgqwjil/sql](https://supabase.com/dashboard/project/escefqdmzcqcfbgqwjil/sql)
2. Open the file `supabase_schema.sql` located in the root directory.
3. Paste the contents into the Supabase SQL Editor and click **Run**.
4. All 7 tables (`water_readings`, `daily_summaries`, `calibration_records`, `alerts`, `tariff_config`, `device_config`, `electricity_config`), Row-Level Security (RLS) policies, and Realtime publications will be created instantly.
5. In the HydoVolt web dashboard, open **Settings** to run a live handshake test and synchronize all local SQLite records to the cloud with one click.
#   H y d r o V o l t  
 