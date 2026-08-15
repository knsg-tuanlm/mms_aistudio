import React, { useState } from 'react';
import { WarehouseProvider, useWarehouse } from './services/warehouseStore';
import { Sidebar, NavModule } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ReceivingModule } from './components/ReceivingModule';
import { QualityControlModule } from './components/QualityControlModule';
import { PutawayModule } from './components/PutawayModule';
import { InventoryModule } from './components/InventoryModule';
import { OutboundModule } from './components/OutboundModule';
import { ReportsModule } from './components/ReportsModule';
import { SettingsModule } from './components/SettingsModule';
import { HandheldModule } from './components/HandheldModule';
import { BarcodeLabelModal } from './components/BarcodeLabelModal';

const AppContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NavModule>('handheld');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 industrial-grid-bg flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onSearch={(_q) => {}}
        onLaunchHandheld={() => setActiveModule('handheld')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            setIsMobileSidebarOpen(false);
          }}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && <Dashboard onNavigate={setActiveModule} />}
            {activeModule === 'handheld' && <HandheldModule onExitToDesktop={() => setActiveModule('dashboard')} />}
            {activeModule === 'receiving' && <ReceivingModule />}
            {activeModule === 'qc' && <QualityControlModule />}
            {activeModule === 'putaway' && <PutawayModule />}
            {activeModule === 'inventory' && <InventoryModule />}
            {activeModule === 'outbound' && <OutboundModule />}
            {activeModule === 'reports' && <ReportsModule />}
            {activeModule === 'settings' && <SettingsModule />}
          </div>
        </main>
      </div>

      {/* Global Printable Barcode Label Modal */}
      <BarcodeLabelModal />
    </div>
  );
};

export function App() {
  return (
    <WarehouseProvider>
      <AppContent />
    </WarehouseProvider>
  );
}

export default App;
