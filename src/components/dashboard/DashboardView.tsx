import { useLanguage } from '../../context/LanguageContext';
import { EmergencyAlerts } from './EmergencyAlerts';
import { SummaryCards } from './SummaryCards';
import { HeartRateColumn } from './HeartRateColumn';
import { BreathingRateColumn } from './BreathingRateColumn';
import { getHeartRateSeverity, getBreathingRateSeverity } from '../../utils/dashboardUtils';
import { useDashboardData } from '../../hooks/useDashboardData';

interface DashboardViewProps {
    data: ReturnType<typeof useDashboardData>;
    onViewPatientDetails: (patientId: string) => void;
}

export function DashboardView({ data, onViewPatientDetails }: DashboardViewProps) {
    const { t, language } = useLanguage();
    const {
        summary,
        loading,
        error,
        sortedActiveAlerts,
        patientsByHeartRate,
        patientsByBreathingRate,
        handleAcknowledgeAlert,
        handleResolveAlert,
        refetch
    } = data;

    // Show loading state
    if (loading && (!sortedActiveAlerts || sortedActiveAlerts.length === 0)) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    // Show error state
    if (error && (!sortedActiveAlerts || sortedActiveAlerts.length === 0)) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100 max-w-md">
                    <p className="text-red-600 font-bold mb-2">{t('error.loadingData')}</p>
                    <p className="text-red-500 text-xs mb-6 font-medium bg-white/50 p-3 rounded-lg border border-red-50">
                        {typeof error === 'string' ? error : JSON.stringify(error)}
                    </p>
                    <button
                        onClick={refetch}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                    >
                        {t('common.reset')}
                    </button>
                </div>
            </div>
        );
    }

    const summaryData = summary || {};
    const totalPatients = summaryData.totalPatients || 0;
    const criticalCount = summaryData.criticalPatients || 0;
    const connectedDevices = typeof summaryData.connectedDevices === 'object'
        ? summaryData.connectedDevices?.connected || 0
        : (summaryData.connectedDevices || 0);
    const totalDevices = typeof summaryData.connectedDevices === 'object'
        ? summaryData.connectedDevices?.total || 0
        : (summaryData.totalDevices || 0);

    return (
        <div className="space-y-4 md:space-y-6">
            <SummaryCards
                totalPatients={totalPatients}
                activeAlertsCount={sortedActiveAlerts.length}
                criticalCount={criticalCount}
                connectedDevices={connectedDevices}
                totalDevices={totalDevices}
                t={t}
            />

            {sortedActiveAlerts.length > 0 && (
                <EmergencyAlerts
                    alerts={sortedActiveAlerts as any}
                    onViewPatientDetails={onViewPatientDetails}
                    onAcknowledge={handleAcknowledgeAlert}
                    onResolve={handleResolveAlert}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <HeartRateColumn
                    patients={patientsByHeartRate as any}
                    language={language}
                    t={t}
                    onViewPatientDetails={onViewPatientDetails}
                    getHeartRateSeverity={getHeartRateSeverity}
                />

                <BreathingRateColumn
                    patients={patientsByBreathingRate as any}
                    language={language}
                    t={t}
                    onViewPatientDetails={onViewPatientDetails}
                    getBreathingRateSeverity={getBreathingRateSeverity}
                />
            </div>
        </div>
    );
}
