import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { SleepManagementPage } from './pages/SleepManagementPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { SettingsPage } from './pages/SettingsPage';
import { PatientDetailMonitoringPage } from './pages/PatientDetailMonitoringPage';
import { MilitaryGPSPage } from './pages/MilitaryGPSPage';
import { LanguageProvider } from './context/LanguageContext';

export type MenuItem = '통합 대시보드' | '환자 목록' | '알림 기록' | '수면 관리' | '환자 등록' | '군사 GPS' | '설정';

export default function App() {
    const [currentPage, setCurrentPage] = useState<MenuItem>('통합 대시보드');
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [systemOnline, setSystemOnline] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleViewPatientDetails = (patientId: string) => {
        setSelectedPatientId(patientId);
        closeSidebar();
    };

    const handleBackFromPatientDetails = () => {
        setSelectedPatientId(null);
    };

    return (
        <LanguageProvider>
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
                                    <MonitoringPage onViewPatientDetails={handleViewPatientDetails} />
                                )}
                                {currentPage === '알림 기록' && <NotificationCenterPage onViewPatientDetails={handleViewPatientDetails} />}
                                {currentPage === '수면 관리' && <SleepManagementPage />}
                                {currentPage === '환자 등록' && <RegistrationPage />}
                                {currentPage === '군사 GPS' && <MilitaryGPSPage />}
                                {currentPage === '설정' && <SettingsPage />}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </LanguageProvider>
    );
}
