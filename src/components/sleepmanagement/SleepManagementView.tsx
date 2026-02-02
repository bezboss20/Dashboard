import { SessionSummary } from './SessionSummary';
import { Hypnogram } from './Hypnogram';
import { SleepTimeInfo } from './SleepTimeInfo';
import { WeeklyTrend } from './WeeklyTrend';
import { VitalsCorrelation } from './VitalsCorrelation';
import { useSleepAnalytics } from '../../hooks/useSleepAnalytics';
import { User, Tag } from 'lucide-react';

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
        patientCode,
        dateRangeString,
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
        <div className="space-y-3 sm:space-y-4 lg:space-y-6 pb-6">
            {/* Patient Name Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2.5 sm:p-5 flex flex-row items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all shrink-0"
                            title={t('detail.back')}
                            aria-label={t('detail.back')}
                        >
                            <svg
                                width={isSmallScreen ? "16" : "20"}
                                height={isSmallScreen ? "16" : "20"}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-current"
                            >
                                <path
                                    d="M15 18L9 12L15 6"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center shadow-inner border border-blue-100 shrink-0">
                        <User className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-0.5 sm:mb-1">
                            <h2 className="text-[14px] sm:text-xl font-black text-gray-900 leading-tight whitespace-nowrap truncate">
                                {patientName || t('common.unknown')}
                            </h2>
                            <div className="px-1.5 py-0.5 rounded-md bg-blue-600 text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider shrink-0">
                                Patient
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 min-w-0">
                            <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                            <span className="text-[10px] sm:text-xs font-bold tracking-tight whitespace-nowrap">ID: {patientCode || selectedPatientId || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <SessionSummary
                summary={analytics.summary}
                stagePercentages={analytics.stagePercentages}
                timeInfo={analytics.timeInfo}
                isSmallScreen={isSmallScreen}
                useScaledDesktopLayout={useScaledDesktopLayout}
                t={t}
                patientName={patientName}
                dateRangeSuffix={dateRangeString}
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
