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

const MENU_SLUGS: Record<MenuItem, string> = {
  '통합 대시보드': 'dashboard',
  '환자 목록': 'patients',
  '알림 기록': 'notifications',
  '수면 관리': 'sleep',
  '환자 등록': 'registration',
  'GPS 위치 추적': 'gps',
  '설정': 'settings'
};

const getPageFromHash = (hash: string): MenuItem => {
  const h = hash.replace('#/', '');
  for (const [page, slug] of Object.entries(MENU_SLUGS)) {
    if (h.startsWith(slug)) return page as MenuItem;
  }
  return '통합 대시보드';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<MenuItem>(() => getPageFromHash(window.location.hash));
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(() => {
    const h = window.location.hash;
    if (h.includes('patient/')) return h.split('patient/')[1];
    return null;
  });
  const [sleepPatientId, setSleepPatientId] = useState<string | null>(() => {
    const h = window.location.hash;
    if (h.startsWith('#/sleep/') && h.split('sleep/')[1]) return h.split('sleep/')[1];
    return null;
  });
  const [systemOnline, setSystemOnline] = useState(true);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      const hash = window.location.hash;

      if (state) {
        setCurrentPage(state.page || '통합 대시보드');
        setSelectedPatientId(state.patientId || null);
        setSleepPatientId(state.sleepPatientId || null);
      } else {
        // Fallback to hash if state is missing
        setCurrentPage(getPageFromHash(hash));
        if (hash.includes('patient/')) {
          setSelectedPatientId(hash.split('patient/')[1]);
        } else {
          setSelectedPatientId(null);
        }

        if (hash.startsWith('#/sleep/')) {
          setSleepPatientId(hash.split('sleep/')[1]);
        } else {
          setSleepPatientId(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Ensure we have a history stack that allows "Back" to work even on fresh landings
    if (!window.history.state) {
      const isInitialDashboard = currentPage === '통합 대시보드' && !selectedPatientId && !sleepPatientId;

      if (isInitialDashboard) {
        window.history.replaceState({ page: '통합 대시보드', patientId: null, sleepPatientId: null }, '', '#/dashboard');
      } else {
        // We landed on a sub-page, so we inject a dashboard entry BEFORE the current one
        // so that the browser's "back" button takes us to the dashboard.
        window.history.replaceState({ page: '통합 대시보드', patientId: null, sleepPatientId: null }, '', '#/dashboard');
        window.history.pushState(
          { page: currentPage, patientId: selectedPatientId, sleepPatientId },
          '',
          window.location.hash
        );
      }
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage, selectedPatientId, sleepPatientId]);

  const handlePageChange = (page: MenuItem) => {
    if (page === currentPage && !selectedPatientId && !sleepPatientId) return;
    setCurrentPage(page);
    setSelectedPatientId(null);
    setSleepPatientId(null);
    const slug = MENU_SLUGS[page];
    window.history.pushState({ page, patientId: null, sleepPatientId: null }, '', `#/${slug}`);
  };

  const handleViewPatientDetails = (testId: string) => {
    setSelectedPatientId(testId);
    window.history.pushState({ page: currentPage, patientId: testId, sleepPatientId }, '', `#/patient/${testId}`);
  };

  const handleBackFromPatientDetails = () => {
    // If the previous history entry has no patientId, or we're at the start, use back()
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setSelectedPatientId(null);
      window.history.pushState({ page: currentPage, patientId: null, sleepPatientId: null }, '', `#/${MENU_SLUGS[currentPage]}`);
    }
  };

  const handleViewSleepPage = (patientId: string) => {
    setSleepPatientId(patientId);
    setCurrentPage('수면 관리');
    window.history.pushState({ page: '수면 관리', patientId: null, sleepPatientId: patientId }, '', `#/sleep/${patientId}`);
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
