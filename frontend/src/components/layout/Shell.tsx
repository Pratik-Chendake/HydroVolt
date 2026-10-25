import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AlertBanner } from '../common/AlertBanner';
import { LiveWaterStatus, Alert } from '../../types';
import { api } from '../../services/api';
import { wsClient } from '../../services/websocket';

export interface ShellContextType {
  status: LiveWaterStatus | null;
  refreshStatus: () => Promise<void>;
  alerts: Alert[];
  refreshAlerts: () => Promise<void>;
}

export const Shell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState<LiveWaterStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchStatus = async () => {
    try {
      const data = await api.getLiveWaterStatus();
      setStatus(data);
    } catch (err) {
      console.warn('Failed to fetch live water status:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts(false, 10);
      setAlerts(data);
    } catch (err) {
      console.warn('Failed to fetch alerts:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchAlerts();

    const unsubscribe = wsClient.subscribe((payload) => {
      if (payload.type === 'TELEMETRY_UPDATE') {
        setStatus((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            flow_rate_lpm: payload.flow_rate_lpm,
            total_liters: payload.total_liters,
            pulses: payload.pulses,
            sensor_status: payload.sensor_status,
            is_simulated: payload.is_simulated,
            last_reading_time: payload.timestamp,
            data_freshness_seconds: 0,
          };
        });
      }
    });

    const interval = setInterval(() => {
      fetchStatus();
      fetchAlerts();
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleDismissAlert = async (id: number) => {
    try {
      await api.updateAlert(id, { acknowledged: true });
      fetchAlerts();
    } catch {}
  };

  const contextValue: ShellContextType = {
    status,
    refreshStatus: fetchStatus,
    alerts,
    refreshAlerts: fetchAlerts,
  };

  return (
    <div className="relative min-h-screen bg-black text-slate-100 flex overflow-x-hidden">
      {/* =========================================================================
          PERSISTENT VIDEO BACKGROUND WITH CINEMATIC DARK EFFECT
          ========================================================================= */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Background Looping Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-105 filter brightness-[0.32] contrast-[1.3] saturate-[1.25] transition-all duration-1000"
        >
          <source src="/background.mp4" type="video/mp4" />
          <source src="/intro.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Dark Effect Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/95 backdrop-blur-[2px]" />
        
        {/* Ambient Spatial Lighting (Electric Blue Top-Left, Neon Rose Bottom-Right) */}
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-cyber-blue/15 filter blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full bg-neon-rose/15 filter blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full bg-cyber-cyan/8 filter blur-[100px] pointer-events-none" />

        {/* Spatial Cybernetic Micro-Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #00D2FF 1px, transparent 1px),
              linear-gradient(to bottom, #FF007F 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 75% 70% at 50% 40%, #000 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 40%, #000 60%, transparent 100%)',
          }}
        />
      </div>

      {/* =========================================================================
          SPATIAL UI LAYER & FLOATING APPLICATION SHELL
          ========================================================================= */}
      <div className="relative z-10 flex min-h-screen w-full">
        {/* Sidebar navigation */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          status={status}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            status={status}
            onRefresh={() => {
              fetchStatus();
              fetchAlerts();
            }}
          />

          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
            <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />
            <Outlet context={contextValue} />
          </main>
        </div>
      </div>
    </div>
  );
};
