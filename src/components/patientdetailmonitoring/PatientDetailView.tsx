import { ArrowLeft } from 'lucide-react';
import { PatientInfoCard } from './PatientInfoCard';
import { AlertsSection } from './AlertsSection';
import { VitalMetrics } from './VitalMetrics';
import { VitalChart } from './VitalChart';
import { SleepAnalysisSection } from './SleepAnalysisSection';
import { usePatientDetail } from '../../hooks/usePatientDetail';

interface PatientDetailViewProps {
    model: ReturnType<typeof usePatientDetail>;
    onBack?: () => void;
}

export function PatientDetailView({ model, onBack }: PatientDetailViewProps) {
    const {
        data,
        loading,
        error,
        hrData,
        rrData,
        hrBaseline,
        rrBaseline,
        hrRange,
        setHrRange,
        rrRange,
        setRrRange,
        handleStatusChange,
        t,
        language
    } = model;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-red-500 font-medium">{error ? t(error) : t('error.patientNotFound')}</p>
                <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    {t('detail.back')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-10 sm:pb-12 font-sans">
            <div className="mx-auto w-full max-w-[1440px] min-[2500px]:max-w-none px-0.5 sm:px-4 lg:px-6 xl:px-8">
                {/* Top Header */}
                <header className="py-3 sm:py-6 relative flex items-center justify-center">
                    <button
                        onClick={onBack}
                        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline text-[15px] font-semibold">{t('detail.back')}</span>
                    </button>
                    <h1 className="text-[18px] sm:text-[22px] font-extrabold text-gray-900 tracking-tight">
                        {t('detail.patientInfo')}
                    </h1>
                </header>

                <div className="grid gap-4 sm:gap-6 items-start grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
                    {/* LEFT */}
                    <div className="space-y-4 sm:space-y-6 min-w-0">
                        <PatientInfoCard
                            data={data}
                            language={language}
                            t={t}
                            onStatusChange={handleStatusChange}
                        />
                        <AlertsSection alerts={data.alerts} t={t} />
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4 sm:space-y-6 min-w-0">
                        <VitalMetrics vitals={data.vitals} deviceId={data.deviceId} lastUpdated={data.lastUpdated} t={t} />

                        {/* HR */}
                        <VitalChart
                            title={t('detail.hrMonitoring')}
                            data={hrData}
                            dataKey="hr"
                            baseline={hrBaseline}
                            currentRange={hrRange}
                            onRangeChange={setHrRange}
                            color="#EF4444"
                            unit="BPM"
                            gradientId="colorHr"
                            t={t}
                        />

                        {/* RR */}
                        <VitalChart
                            title={t('detail.rrMonitoring')}
                            data={rrData}
                            dataKey="rr"
                            baseline={rrBaseline}
                            currentRange={rrRange}
                            onRangeChange={setRrRange}
                            color="#10B981"
                            unit="RPM"
                            gradientId="colorRr"
                            t={t}
                        />

                        {/* Sleep */}
                        <SleepAnalysisSection sleepRecord={data.sleepRecord} t={t} />
                    </div>
                </div>
            </div>
        </div>
    );
}
