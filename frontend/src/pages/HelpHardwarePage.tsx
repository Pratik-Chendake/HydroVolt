import React from 'react';
import {
  HelpCircle,
  Cpu,
  Usb,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const HelpHardwarePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 relative overflow-hidden bento-card border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-3 left-3 skeuo-screw hidden sm:block" />
        <div className="absolute top-3 right-3 skeuo-screw hidden sm:block" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              CIRCUIT MATRIX
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              ARDUINO UNO/NANO
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <HelpCircle className="w-6 h-6 text-cyber-cyan animate-pulse drop-shadow-[0_0_8px_#00D2FF]" />
            HARDWARE SETUP &amp; WIRING SCHEMATIC DOCUMENTATION
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Complete schematic diagrams &bull; Arduino Uno/Nano pinout &bull; Step-by-step flashing guide
          </p>
        </div>
      </div>

      {/* Wiring Diagram Card (Bento) */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-neon-rose" />
          <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
            ARDUINO UNO / NANO TO YF-S201 WATER FLOW SENSOR PINOUT
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
          {/* ASCII Circuit Diagram */}
          <div className="p-4 rounded-2xl bg-black/90 border border-white/15 text-xs text-slate-200 overflow-x-auto shadow-inner">
            <div className="text-neon-rose font-black mb-2 flex items-center gap-1.5">
              <span>●</span> SCHEMATIC DIAGRAM:
            </div>
            <pre className="text-cyber-cyan leading-relaxed">
{`+-------------------------+
| YF-S201 Water Sensor    |
|                         |
| RED (VCC) --------------+--------> Arduino 5V
|                         |
| BLACK (GND) ------------+--------> Arduino GND
|                         |
| YELLOW (Pulse Signal) --+--------> Arduino Digital Pin 2
+-------------------------+             (Interrupt INT0)
                             ^
                             | (Optional 4.7k-10k Pull-up)
                             +--------> 5V Rail`}
            </pre>
          </div>

          {/* Connections Table */}
          <div className="border border-white/10 rounded-2xl overflow-hidden shadow-inner bg-black/60">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/80 text-slate-400 border-b border-white/10 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">SENSOR WIRE</th>
                  <th className="py-2.5 px-3">ARDUINO PIN</th>
                  <th className="py-2.5 px-3">SIGNAL FUNCTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-neon-rose">RED Wire</td>
                  <td className="py-2.5 px-3 font-bold text-white">5V Pin</td>
                  <td className="py-2.5 px-3 text-slate-400">Power Input (4.5V – 18V DC)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-400">BLACK Wire</td>
                  <td className="py-2.5 px-3 font-bold text-white">GND Pin</td>
                  <td className="py-2.5 px-3 text-slate-400">Common Ground Reference</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-cyber-cyan">YELLOW Wire</td>
                  <td className="py-2.5 px-3 font-bold text-neon-rose">Digital Pin 2</td>
                  <td className="py-2.5 px-3 text-slate-400">Hardware Interrupt 0 (INT0)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Flashing Steps */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex items-center gap-2 mb-4">
          <FileCode className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
            HOW TO FLASH THE ARDUINO FIRMWARE
          </h2>
        </div>

        <div className="space-y-4 text-xs font-mono text-slate-300">
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3 shadow-inner">
            <div className="w-7 h-7 rounded-xl bg-cyber-blue/20 text-cyber-cyan border border-cyber-cyan/40 flex items-center justify-center font-black shrink-0 font-mono">
              1
            </div>
            <div>
              <strong className="text-white block font-black mb-1">
                OPEN FIRMWARE IN ARDUINO IDE
              </strong>
              <p className="text-slate-400">
                Open file: <code className="text-cyber-cyan font-bold font-mono">firmware/arduino_water_monitor/arduino_water_monitor.ino</code> in the official Arduino IDE or VS Code Arduino extension.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3 shadow-inner">
            <div className="w-7 h-7 rounded-xl bg-cyber-blue/20 text-cyber-cyan border border-cyber-cyan/40 flex items-center justify-center font-black shrink-0 font-mono">
              2
            </div>
            <div>
              <strong className="text-white block font-black mb-1">
                SELECT BOARD AND PROCESSOR
              </strong>
              <p className="text-slate-400">
                Go to <strong>Tools &gt; Board</strong> &rarr; Select <strong>Arduino Uno</strong> (or <strong>Arduino Nano</strong>). If using an Arduino Nano clone with CH340 chip, select <strong>Processor: ATmega328P (Old Bootloader)</strong>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3 shadow-inner">
            <div className="w-7 h-7 rounded-xl bg-cyber-blue/20 text-cyber-cyan border border-cyber-cyan/40 flex items-center justify-center font-black shrink-0 font-mono">
              3
            </div>
            <div>
              <strong className="text-white block font-black mb-1">
                SELECT PORT AND UPLOAD
              </strong>
              <p className="text-slate-400">
                Select your USB COM port (e.g. COM3) and click <strong>Upload</strong> (Ctrl + U).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3 shadow-inner">
            <div className="w-7 h-7 rounded-xl bg-neon-rose/20 text-neon-rose border border-neon-rose/40 flex items-center justify-center font-black shrink-0 font-mono">
              4
            </div>
            <div>
              <strong className="text-white block font-black mb-1">
                CLOSE ARDUINO SERIAL MONITOR
              </strong>
              <p className="text-slate-400">
                Important: Close the Arduino IDE Serial Monitor window before connecting via this web application. Windows only allows one process to hold exclusive access to a COM port at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
