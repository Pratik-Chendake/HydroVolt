import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';

import { DashboardPage } from './pages/DashboardPage';
import { WaterMonitoringPage } from './pages/WaterMonitoringPage';
import { WaterHistoryPage } from './pages/WaterHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { DeviceManagementPage } from './pages/DeviceManagementPage';
import { ArduinoConfigPage } from './pages/ArduinoConfigPage';
import { CalibrationPage } from './pages/CalibrationPage';
import { ElectricitySetupPage } from './pages/ElectricitySetupPage';
import { BillingTariffsPage } from './pages/BillingTariffsPage';
import { ReportsExportsPage } from './pages/ReportsExportsPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpHardwarePage } from './pages/HelpHardwarePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="monitoring" element={<WaterMonitoringPage />} />
          <Route path="history" element={<WaterHistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="devices" element={<DeviceManagementPage />} />
          <Route path="arduino-config" element={<ArduinoConfigPage />} />
          <Route path="calibration" element={<CalibrationPage />} />
          <Route path="electricity" element={<ElectricitySetupPage />} />
          <Route path="tariffs" element={<BillingTariffsPage />} />
          <Route path="reports" element={<ReportsExportsPage />} />
          <Route path="ai-insights" element={<AiInsightsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpHardwarePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
