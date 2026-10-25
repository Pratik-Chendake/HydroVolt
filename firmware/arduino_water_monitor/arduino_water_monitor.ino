/*
 * ============================================================================
 * Smart Water & Energy Manager - Arduino Water Flow Firmware
 * Compatible with: Arduino Uno (ATmega328P), Arduino Nano (ATmega328P)
 * Flow Sensor: Hall-Effect Pulse Flow Sensor (e.g., YF-S201, FS300A, OF05ZAT)
 * 
 * Hardware Wiring:
 *   Sensor RED Wire    --> Arduino 5V
 *   Sensor BLACK Wire  --> Arduino GND
 *   Sensor YELLOW Wire --> Arduino Digital Pin 2 (External Interrupt 0)
 *   (Optional: 4.7k - 10k Ohm pull-up resistor between YELLOW and 5V if sensor
 *    output is open-collector without internal pull-up)
 * 
 * Communication:
 *   Baud Rate: 9600 bps (configurable)
 *   Format: Newline-Delimited JSON (NDJSON)
 * ============================================================================
 */

#include <Arduino.h>

// Pin Configuration
const byte SENSOR_INTERRUPT_PIN = 2; // Pin D2 supports INT0 on Uno/Nano
const char* SENSOR_MODEL = "YF-S201";

// Calibration Parameter: pulses per liter
// Nominal YF-S201 frequency formula: F (Hz) = 7.5 * Q (L/min)
// Pulses per liter = 7.5 * 60 seconds = 450.0 pulses / Liter.
volatile float calibrationFactor = 450.0;

// Pulse Counter (volatile for interrupt service routine)
volatile unsigned long pulseCounter = 0;

// Timing and Sequence Tracking
unsigned long oldTime = 0;
unsigned long sequenceId = 0;
float cumulativeLiters = 0.0;

// Interrupt Service Routine (ISR)
void IRAM_ATTR pulseISR() {
  pulseCounter++;
}

void setup() {
  // Initialize USB Serial communication
  Serial.begin(9600);
  while (!Serial && millis() < 3000) {
    ; // Wait for serial port to connect (mainly for Leonardo/Micro)
  }

  // Configure sensor pin with internal pull-up
  pinMode(SENSOR_INTERRUPT_PIN, INPUT_PULLUP);

  // Attach interrupt to pin 2 on RISING edge
  attachInterrupt(digitalPinToInterrupt(SENSOR_INTERRUPT_PIN), pulseISR, RISING);

  oldTime = millis();
}

void loop() {
  unsigned long currentTime = millis();
  unsigned long timeInterval = currentTime - oldTime;

  // Process sample every 1000 milliseconds (1 second)
  if (timeInterval >= 1000) {
    // Disable interrupt while copying volatile pulse count for atomicity
    noInterrupts();
    unsigned long currentPulses = pulseCounter;
    pulseCounter = 0; // Reset for next window
    interrupts();

    // Calculate elapsed time in seconds
    float elapsedSeconds = (float)timeInterval / 1000.0;
    oldTime = currentTime;

    // Instantaneous flow rate calculation in Liters per minute (L/min)
    // flow_lpm = (pulses / elapsedSeconds) * 60 / calibrationFactor
    float flowLpm = 0.0;
    if (calibrationFactor > 0.0) {
      flowLpm = ((float)currentPulses / elapsedSeconds) * (60.0 / calibrationFactor);
    }

    // Cumulative volume increment: pulses / calibrationFactor
    float intervalLiters = (float)currentPulses / calibrationFactor;
    cumulativeLiters += intervalLiters;
    sequenceId++;

    // Print Newline-Delimited JSON packet
    Serial.print("{\"seq\":");
    Serial.print(sequenceId);
    Serial.print(",\"sensor\":\"");
    Serial.print(SENSOR_MODEL);
    Serial.print("\",\"flow_lpm\":");
    Serial.print(flowLpm, 2);
    Serial.print(",\"pulses\":");
    Serial.print(currentPulses);
    Serial.print(",\"total_l\":");
    Serial.print(cumulativeLiters, 2);
    Serial.print(",\"status\":\"OK\"}\r\n");
  }

  // Handle incoming commands from Python serial bridge
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd.startsWith("CAL:")) {
      float newCal = cmd.substring(4).toFloat();
      if (newCal > 50.0 && newCal < 2000.0) {
        calibrationFactor = newCal;
        Serial.print("{\"status\":\"CAL_UPDATED\",\"cal\":");
        Serial.print(calibrationFactor, 2);
        Serial.println("}");
      }
    } else if (cmd.equals("RESET")) {
      cumulativeLiters = 0.0;
      sequenceId = 0;
      Serial.println("{\"status\":\"COUNTER_RESET\"}");
    } else if (cmd.equals("PING")) {
      Serial.println("{\"pong\":true,\"sensor\":\"YF-S201\"}");
    }
  }
}
