# Hardware Setup & Wiring Guide

## 1. Bill of Materials (BOM)

| Component | Quantity | Purpose |
|---|---|---|
| **Arduino Uno R3** or **Arduino Nano** | 1 | Microcontroller running telemetry firmware |
| **YF-S201 Water Flow Sensor** (1/2" BSP) | 1 | In-line Hall-effect turbine pulse generator |
| **USB Type-A to Type-B** (or Mini-USB for Nano) | 1 | Power & serial telemetry link to PC |
| **4.7kΩ or 10kΩ Resistor** | 1 (Optional) | External pull-up resistor between 5V and Signal |
| **Jumper Wires & Breadboard** | 3-5 wires | Circuit connections |
| **Plumbing Couplers & Tubing** | 1/2 inch | Pipe fittings connecting water line |

---

## 2. Wiring Connections

```
      +---------------------+
      |   YF-S201 Sensor    |
      |                     |
      |   RED (VCC) --------+--------> Arduino 5V
      |                     |
      |   BLACK (GND) ------+--------> Arduino GND
      |                     |
      |   YELLOW (Signal) --+--------> Arduino Digital Pin 2 (INT0)
      +---------------------+
                               ^
                               | (Optional 10k pull-up to 5V)
```

### Pin Assignment Details

1. **VCC (Red wire):** Connect to Arduino **5V** header pin. (Operating voltage: 4.5V – 18V DC).
2. **GND (Black wire):** Connect to any Arduino **GND** pin.
3. **Signal (Yellow wire):** Connect to Arduino **Digital Pin 2**. Digital Pin 2 is hardware interrupt `INT0` on ATmega328P, enabling microsecond pulse counting without CPU polling overhead.
4. **Pull-Up Note:** The firmware configures `pinMode(2, INPUT_PULLUP)` using the internal ATmega328P ~20k-50k pull-up resistor. If you observe pulse bouncing or noisy readings with long wire runs (> 1 meter), add a dedicated 4.7kΩ external pull-up between Pin 2 and 5V.

---

## 3. Flow Sensor Characteristics & Calibration

- **Model:** YF-S201 (1/2 inch thread)
- **Working Flow Range:** 1 – 30 Liters/min
- **Working Pressure:** < 1.75 MPa
- **Frequency Formula:**
  $$\text{Frequency (Hz)} = 7.5 \times Q \quad (Q \text{ in L/min})$$
- **Nominal Pulses per Liter:**
  $$K = 7.5 \times 60 \text{ s} = 450 \text{ pulses/Liter}$$
- Individual pipe installations, water pressure, and temperature introduce slight variation ($\pm 3\% - 8\%$). Use the **Sensor Calibration Page** in the web interface to perform a 5-Liter bucket test and auto-calibrate.

---

## 4. Flashing the Firmware

1. Install the official **Arduino IDE** (or Arduino CLI).
2. Connect the Arduino Uno/Nano to your computer via USB.
3. Open `firmware/arduino_water_monitor/arduino_water_monitor.ino`.
4. In Arduino IDE:
   - Go to **Tools > Board** -> Select **Arduino Uno** (or **Arduino Nano**).
   - If using Nano, check **Tools > Processor** -> Select **ATmega328P** (or Old Bootloader if clone).
   - Go to **Tools > Port** -> Select the active COM port (e.g. `COM3`, `COM4`).
5. Click **Upload** (Ctrl + U).
6. Once uploaded, close Arduino Serial Monitor so that Python serial bridge can acquire exclusive lock on the COM port.
