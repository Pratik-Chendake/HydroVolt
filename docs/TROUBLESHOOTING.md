# Troubleshooting & Diagnostic Guide

### 1. Serial Port "Permission Denied" / "Access Is Denied"
- **Cause:** Another program is holding the serial port open. Common culprits:
  - Arduino IDE Serial Monitor or Serial Plotter is open.
  - Another instance of python serial bridge is running.
  - Cura, Repetier-Host, or 3D printing slicing software.
- **Solution:** Close Arduino Serial Monitor. Check Windows Task Manager for background python tasks and kill them if orphaned.

### 2. COM Port Does Not Appear in Serial Port List
- **Cause:** Missing CH340 or FTDI USB-UART driver on Windows.
- **Solution:**
  1. Open Windows **Device Manager** (`Win + X` -> Device Manager).
  2. Look under **Ports (COM & LPT)**.
  3. If listed with yellow warning icon or under "Other Devices" as `USB2.0-Serial`, download and install the **CH340G driver** (standard for most low-cost Arduino Uno/Nano clones).

### 3. Flow Rate Reads 0.00 Even When Water Is Running
- **Cause:** Sensor wire loose, wrong interrupt pin, or backward water flow direction.
- **Diagnostics:**
  - Verify water flow direction follows the directional arrow molded onto the sensor plastic housing.
  - Verify Yellow signal wire is firmly plugged into Arduino Pin D2.
  - Blow gently into the sensor nozzle; you should hear the turbine spin and see pulses increment on the web dashboard.

### 4. Electricity Meter Setup Shows "Not configured"
- **Expected Behavior:** Electricity monitoring is an isolated modular extension and is deliberately disabled until actual Modbus/RS485 meter hardware is wired and confirmed.
- It will never prevent or disrupt the Arduino water monitoring system from functioning.

### 5. Running in Test / Simulation Mode
- If physical Arduino hardware is not plugged in, click **"Start Test Simulation"** in the **Arduino Serial Configuration** page or top header bar.
- The system will generate deterministic, realistic tap and shower flow cycles with pulses and cumulative volume clearly labeled `[SIMULATED]`.
