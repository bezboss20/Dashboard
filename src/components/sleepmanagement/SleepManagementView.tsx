import { SessionSummary } from './SessionSummary';
import { Hypnogram } from './Hypnogram';
import { SleepTimeInfo } from './SleepTimeInfo';
import { WeeklyTrend } from './WeeklyTrend';
import { VitalsCorrelation } from './VitalsCorrelation';
import { useSleepAnalytics } from '../../hooks/useSleepAnalytics';

interface SleepManagementViewProps {
    model: ReturnType<typeof useSleepAnalytics>;
    onBack?: () => void;
}

export function SleepManagementView({ model, onBack }: SleepManagementViewProps) {
    const {
        analytics,
        loading,
        error,
        selectedPatientId,
        trendView,
        setTrendView,
        isSmallScreen,
        useScaledDesktopLayout,
        hypnogramData,
        trendData,
        trendMinWidth,
        patientName,
        t,
        refresh
    } = model;

    if (loading && !analytics) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    // Handle error as string or object
    const errorMessage = error ? (typeof error === 'string' ? error : JSON.stringify(error)) : null;

    if (errorMessage) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-bold">{t('error.loadingData')}</p>
                <p className="text-xs text-gray-500">{errorMessage}</p>
                <div className="flex gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                        >
                            {t('detail.back')}
                        </button>
                    )}
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        {t('common.reset')}
                    </button>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    return (
        <div className="space-y-4 lg:space-y-6">
            <SessionSummary
                summary={analytics.summary}
                stagePercentages={analytics.stagePercentages}
                isSmallScreen={isSmallScreen}
                useScaledDesktopLayout={useScaledDesktopLayout}
                t={t}
                patientName={patientName}
                onBack={onBack}
            />

            <div
                className={
                    useScaledDesktopLayout
                        ? 'grid grid-cols-4 gap-6'
                        : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6'
                }
            >
                <Hypnogram data={hypnogramData} isSmallScreen={isSmallScreen} useScaledDesktopLayout={useScaledDesktopLayout} t={t} />
                <SleepTimeInfo timeInfo={analytics.timeInfo} isSmallScreen={isSmallScreen} useScaledDesktopLayout={useScaledDesktopLayout} t={t} />
            </div>

            <div
                className={
                    useScaledDesktopLayout
                        ? 'grid grid-cols-4 gap-6'
                        : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6'
                }
            >
                <WeeklyTrend
                    trendData={trendData}
                    trendView={trendView}
                    trendMinWidth={trendMinWidth}
                    isSmallScreen={isSmallScreen}
                    useScaledDesktopLayout={useScaledDesktopLayout}
                    onTrendViewChange={setTrendView}
                    t={t}
                />
                <VitalsCorrelation vitalCorrelations={analytics.vitalCorrelations} isSmallScreen={isSmallScreen} useScaledDesktopLayout={useScaledDesktopLayout} t={t} />
            </div>
        </div>
    );
}
