import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        setCurrentPage(state.page || '통합 대시보드');
        setSelectedPatientId(state.patientId || null);
        setSleepPatientId(state.sleepPatientId || null);
      } else {
        setCurrentPage('통합 대시보드');
        setSelectedPatientId(null);
        setSleepPatientId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial state
    if (!window.history.state) {
      window.history.replaceState({ page: currentPage, patientId: selectedPatientId, sleepPatientId }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePageChange = (page: MenuItem) => {
    if (page === currentPage && !selectedPatientId && !sleepPatientId) return;
    setCurrentPage(page);
    setSelectedPatientId(null);
    setSleepPatientId(null);
    window.history.pushState({ page, patientId: null, sleepPatientId: null }, '');
  };

  const handleViewPatientDetails = (testId: string) => {
    setSelectedPatientId(testId);
    window.history.pushState({ page: currentPage, patientId: testId, sleepPatientId }, '');
  };

  const handleBackFromPatientDetails = () => {
    if (window.history.state?.patientId) {
      window.history.back();
    } else {
      setSelectedPatientId(null);
    }
  };

  const handleViewSleepPage = (patientId: string) => {
    setSleepPatientId(patientId);
    setCurrentPage('수면 관리');
    window.history.pushState({ page: '수면 관리', patientId: null, sleepPatientId: patientId }, '');
  };

  return (
    <LanguageProvider>
      <ResponsiveScaleShell mobileMax={1440}>
        <EmergencyAlertToastProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden relative">
            <Navbar
              currentPage={currentPage}
              onPageChange={handlePageChange}
              systemOnline={systemOnline}
              onToggleSystem={() => setSystemOnline(!systemOnline)}
            />

            {/* Keep your existing padding/responsive exactly the same */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 lg:p-6">
              {/* Center-justify the whole page content WITHOUT changing current padding:
                  align-elements adds px-5, so we override with px-0 to preserve p-3/lg:p-6 */}
              <div className="align-elements w-full px-0">
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
                        onBack={() => {
                          if (window.history.state?.page === '환자 목록') {
                            window.history.back();
                          } else {
                            handlePageChange('환자 목록');
                          }
                        }}
                      />
                    )}

                    {currentPage === '환자 등록' && <RegistrationPage />}
                    {currentPage === 'GPS 위치 추적' && <GPSTrackingPage />}
                    {currentPage === '설정' && <SettingsPage />}
                  </>
                )}
              </div>
            </main>
          </div>
        </EmergencyAlertToastProvider>
      </ResponsiveScaleShell>
    </LanguageProvider>
  );
}
