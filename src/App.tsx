import { useState } from 'react';
import { Navbar } from './components/Navbar';
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
import { EmergencyAlertToastProvider } from './providers/EmergencyAlertToastProvider';

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

  const handleViewPatientDetails = (testId: string) => {
    setSelectedPatientId(testId);
  };

  const handleBackFromPatientDetails = () => {
    setSelectedPatientId(null);
  };

  const handleViewSleepPage = (patientId: string) => {
    setSleepPatientId(patientId);
    setCurrentPage('수면 관리');
  };

  return (
    <LanguageProvider>
      <ResponsiveScaleShell mobileMax={1440}>
        <EmergencyAlertToastProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden relative">
            <Navbar
              currentPage={currentPage}
              onPageChange={(page: MenuItem) => {
                setCurrentPage(page);
                setSelectedPatientId(null);
                setSleepPatientId(null);
              }}
              systemOnline={systemOnline}
              onToggleSystem={() => setSystemOnline(!systemOnline)}
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
        </EmergencyAlertToastProvider>
      </ResponsiveScaleShell>
    </LanguageProvider>
  );
}
