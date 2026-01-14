import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { MonitoringPage } from './pages/monitoring/MonitoringPage';
import { NotificationCenterPage } from './pages/notificationcentre/NotificationCenterPage';
import { SleepManagementPage } from './pages/sleepmanagement/SleepManagementPage';
import { RegistrationPage } from './pages/registration/RegistrationPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { PatientDetailMonitoringPage } from './pages/patientdetailmonitoring/PatientDetailMonitoringPage';
import { GPSTrackingPage } from './pages/gpstracking/GPSTrackingPage';
import { LanguageProvider } from './context/LanguageContext';
import { ResponsiveScaleShell } from './components/layout/ResponsiveScaleShell';

export type MenuItem =
  | '통합 대시보드'
  | '환자 목록'
  | '알림 기록'
  | '수면 관리'
  | '환자 등록'
  | 'GPS 위치 추적'
  | '설정';

export default function App() {
  const [currentPage, setCurrentPage] = useState<MenuItem>('통합 대시보드');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [sleepPatientId, setSleepPatientId] = useState<string | null>(null);
  const [systemOnline, setSystemOnline] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleViewPatientDetails = (testId: string) => {
    setSelectedPatientId(testId);
    closeSidebar();
  };

  const handleBackFromPatientDetails = () => {
    setSelectedPatientId(null);
  };

  const handleViewSleepPage = (patientId: string) => {
    setSleepPatientId(patientId);
    setCurrentPage('수면 관리');
    closeSidebar();
  };

  return (
    <LanguageProvider>
      <ResponsiveScaleShell>
        <div className="min-h-screen bg-gray-50 flex relative lg:static">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeSidebar}
            />
          )}

          <Sidebar
            currentPage={currentPage}
            isOpen={isSidebarOpen}
            onPageChange={(page) => {
              setCurrentPage(page);
              setSelectedPatientId(null);
              setSleepPatientId(null);
              closeSidebar();
            }}
          />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header
              systemOnline={systemOnline}
              onToggleSystem={() => setSystemOnline(!systemOnline)}
              onToggleSidebar={toggleSidebar}
            />

            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 lg:p-6">
              {selectedPatientId ? (
                <PatientDetailMonitoringPage
                  patientId={selectedPatientId}
                  onBack={handleBackFromPatientDetails}
                />
              ) : (
                <>
                  {currentPage === '통합 대시보드' && (
                    <DashboardPage
                      systemOnline={systemOnline}
                      onViewPatientDetails={handleViewPatientDetails}
                    />
                  )}

                  {currentPage === '환자 목록' && (
                    <MonitoringPage
                      onViewPatientDetails={handleViewPatientDetails}
                      onViewSleepPage={handleViewSleepPage}
                    />
                  )}

                  {currentPage === '알림 기록' && (
                    <NotificationCenterPage onViewPatientDetails={handleViewPatientDetails} />
                  )}

                  {currentPage === '수면 관리' && (
                    <SleepManagementPage
                      initialPatientId={sleepPatientId}
                      onBack={() => setCurrentPage('환자 목록')}
                    />
                  )}

                  {currentPage === '환자 등록' && <RegistrationPage />}
                  {currentPage === 'GPS 위치 추적' && <GPSTrackingPage />}
                  {currentPage === '설정' && <SettingsPage />}
                </>
              )}
            </main>
          </div>
        </div>
      </ResponsiveScaleShell>
    </LanguageProvider>
  );
}
