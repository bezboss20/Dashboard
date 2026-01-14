import { Moon, Clock, AlertCircle, Activity } from 'lucide-react';
import { Patient } from '../../data/mockData';

interface SessionSummaryProps {
    currentPatient: Patient;
    isSmallScreen: boolean;
    useScaledDesktopLayout: boolean;
    t: (key: string) => string;
}

export function SessionSummary({
    currentPatient,
    isSmallScreen,
    useScaledDesktopLayout,
    t
}: SessionSummaryProps) {
    const summaryCards = [
        {
            label: t('sleep.totalSleep'),
            value: `${Math.floor(currentPatient.sleepData.duration)}${t('time.hour')} ${Math.round(
                (currentPatient.sleepData.duration % 1) * 60
            )}${t('time.minute')}`,
            sub: `${t('sleep.goal')}: 8${t('time.hour')} 00${t('time.minute')}`,
            icon: Moon,
            color: 'bg-blue-50 text-blue-600'
        },
        {
            label: t('sleep.efficiency'),
            value: `${currentPatient.sleepSession?.efficiency || 90}%`,
            sub: t('sleep.normalRange'),
            icon: Activity,
            color: 'bg-purple-50 text-purple-600'
        },
        {
            label: t('sleep.interruptions'),
            value: currentPatient.sleepSession?.interruptions || 2,
            sub: t('sleep.timesWokenUp'),
            icon: AlertCircle,
            color: 'bg-orange-50 text-orange-600'
        },
        {
            label: t('sleep.latency'),
            value: `${currentPatient.sleepSession?.latency || 25}${t('time.minute')}`,
            sub: t('sleep.timeToFallAsleep'),
            icon: Clock,
            color: 'bg-teal-50 text-teal-600'
        }
    ];

    const stageLabels: Record<string, string> = {
        Awake: t('detail.awake'),
        REM: t('detail.remSleep'),
        'Light Sleep': t('detail.lightSleep'),
        'Deep Sleep': t('detail.deepSleep')
    };

    const stageColors = ['bg-orange-400', 'bg-purple-500', 'bg-blue-400', 'bg-blue-600'];

    return (
        <div className={useScaledDesktopLayout ? 'grid grid-cols-4 gap-6' : 'grid grid-cols-1 md:grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6'}>
            <div
                className={[
                    'bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-between',
                    useScaledDesktopLayout ? 'col-span-4 p-6' : isSmallScreen ? 'xl:col-span-4 p-3' : 'xl:col-span-4 p-4 md:p-6'
                ].join(' ')}
            >
                <div>
                    <div className={isSmallScreen ? 'mb-3' : 'mb-6'}>
                        <div className={isSmallScreen ? 'flex flex-col gap-1' : 'flex items-end justify-between gap-3'}>
                            <h3 className={isSmallScreen ? 'text-base font-bold text-gray-900 whitespace-nowrap leading-tight' : 'text-lg font-bold text-gray-900'}>
                                {t('sleep.sessionSummary')}
                            </h3>
                            <p className={isSmallScreen ? 'text-[10px] text-gray-400 font-medium leading-none' : 'text-xs text-gray-400 font-medium whitespace-nowrap'}>
                                {t('sleep.lastNight')} • Oct 12 - Oct 13
                            </p>
                        </div>
                    </div>

                    <div
                        className={
                            isSmallScreen
                                ? 'grid grid-cols-2 max-[360px]:grid-cols-1 gap-2 mb-4'
                                : useScaledDesktopLayout
                                    ? 'grid grid-cols-4 gap-6 mb-8'
                                    : 'grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-8'
                        }
                    >
                        {summaryCards.map((card, idx) => (
                            <div
                                key={idx}
                                className={
                                    isSmallScreen
                                        ? 'bg-gray-50 rounded-2xl border border-gray-100 px-3 py-2.5 w-full flex flex-col items-center text-center'
                                        : 'space-y-1 lg:space-y-3'
                                }
                            >
                                {isSmallScreen ? (
                                    <>
                                        <div className="flex items-start justify-center gap-2 w-full">
                                            <card.icon className={`w-[14px] h-[14px] ${card.color.split(' ')[1]} flex-shrink-0 mt-[1px]`} />
                                            <p className="text-[10px] font-black text-gray-800 leading-tight break-words">{card.label}</p>
                                        </div>
                                        <p className="mt-1 text-[14px] font-black text-gray-900 leading-none">{card.value}</p>
                                        <p className="mt-1 text-[10px] text-gray-400 font-bold leading-tight break-words">{card.sub}</p>
                                    </>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <card.icon className={`w-3.5 h-3.5 ${card.color.split(' ')[1]} flex-shrink-0`} />
                                            <span className="text-[9px] lg:text-[10px] font-black text-gray-400 tracking-wider uppercase">{card.label}</span>
                                        </div>
                                        <p className="text-lg lg:text-2xl font-black text-gray-900 tracking-tight">{card.value}</p>
                                        <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold">{card.sub}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={isSmallScreen ? 'space-y-2 pt-3 border-t border-gray-100' : 'space-y-3 pt-6 border-t border-gray-100'}>
                    <div className={isSmallScreen ? 'flex flex-col gap-2' : 'flex justify-between items-end'}>
                        <div className={isSmallScreen ? 'flex flex-wrap gap-x-4 gap-y-2' : 'flex gap-4'}>
                            {currentPatient.sleepData.stages.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${stageColors[idx]}`} />
                                    <span className={isSmallScreen ? 'text-[10px] font-bold text-gray-500 whitespace-nowrap' : 'text-[10px] font-bold text-gray-500'}>
                                        {stageLabels[s.stage] || s.stage} ({s.percentage}%)
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className={isSmallScreen ? 'text-[10px] text-gray-400 font-bold whitespace-nowrap' : 'text-[10px] text-gray-400 font-bold'}>
                            {t('sleep.totalTimeInBed')}: 8{t('time.hour')} 6{t('time.minute')}
                        </p>
                    </div>

                    <div className={isSmallScreen ? 'h-3 w-full flex rounded-full overflow-hidden shadow-inner' : 'h-4 w-full flex rounded-full overflow-hidden shadow-inner'}>
                        {currentPatient.sleepData.stages.map((s, idx) => (
                            <div key={idx} style={{ width: `${s.percentage}%` }} className={stageColors[idx]} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
