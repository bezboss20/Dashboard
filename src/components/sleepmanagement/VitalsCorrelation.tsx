import { Heart, Wind, Activity as SpO2Icon } from 'lucide-react';
import {
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';
import { Patient } from '../../data/mockData';

interface VitalsCorrelationProps {
    currentPatient: Patient;
    isSmallScreen: boolean;
    useScaledDesktopLayout: boolean;
    t: (key: string) => string;
}

export function VitalsCorrelation({
    currentPatient,
    isSmallScreen,
    useScaledDesktopLayout,
    t
}: VitalsCorrelationProps) {
    const vitalsData = [
        {
            label: t('sleep.avgHr'),
            value: currentPatient.heartRate,
            unit: 'bpm',
            icon: Heart,
            color: 'text-red-500',
            stroke: '#ef4444',
            tint: 'bg-red-50/60 border-red-100',
            spark: [65, 68, 72, 70, 68, 69, 72, 75, 74, 72, 70]
        },
        {
            label: t('sleep.avgResp'),
            value: currentPatient.breathingRate,
            unit: 'brm',
            icon: Wind,
            color: 'text-blue-400',
            stroke: '#60a5fa',
            tint: 'bg-blue-50/60 border-blue-100',
            spark: [14, 15, 14, 13, 13, 14, 15, 14, 14, 13, 13]
        },
        {
            label: t('sleep.avgSpO2'),
            value: currentPatient.sleepSession?.avgSpO2 || 99,
            unit: '%',
            icon: SpO2Icon,
            color: 'text-teal-500',
            stroke: '#14b8a6',
            tint: 'bg-teal-50/60 border-teal-100',
            spark: [98, 99, 99, 98, 99, 99, 98, 99, 99, 99, 99]
        }
    ];

    return (
        <div
            className={
                isSmallScreen
                    ? 'bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full'
                    : useScaledDesktopLayout
                        ? 'col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full'
                        : 'md:col-span-1 xl:col-span-1 bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full'
            }
        >
            <h3
                className={
                    isSmallScreen
                        ? 'text-[14px] font-black text-gray-900 mb-2 tracking-tight whitespace-nowrap truncate'
                        : 'text-base font-black text-gray-900 mb-5 uppercase tracking-widest whitespace-nowrap'
                }
            >
                {t('sleep.vitalsCorrelation')}
            </h3>

            <div className={isSmallScreen ? 'space-y-1.5' : 'flex-1 flex flex-col justify-between py-1'}>
                {vitalsData.map((v, idx) => (
                    <div
                        key={idx}
                        className={
                            isSmallScreen
                                ? `rounded-xl border ${v.tint} px-3 py-1.5`
                                : `rounded-2xl border ${v.tint} px-4 py-3`
                        }
                    >
                        <div className="flex items-center justify-between">
                            <div className={isSmallScreen ? 'flex items-center gap-2 min-w-0' : 'flex items-center gap-2.5 min-w-0'}>
                                <v.icon className={isSmallScreen ? `w-3.5 h-3.5 ${v.color} flex-shrink-0` : `w-4 h-4 ${v.color} flex-shrink-0`} />
                                <span className={isSmallScreen ? 'text-[10px] font-bold text-gray-700 truncate' : 'text-[11px] font-bold text-gray-600 truncate'}>
                                    {v.label}
                                </span>
                            </div>

                            <div className="flex items-baseline gap-1 flex-shrink-0">
                                <span className={isSmallScreen ? 'text-[13px] font-black text-gray-900 tracking-tight' : 'text-sm font-black text-gray-900 tracking-tight'}>
                                    {v.value}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase">{v.unit}</span>
                            </div>
                        </div>

                        <div className={isSmallScreen ? 'mt-1 h-4 w-full' : 'mt-2 h-7 w-full'}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={v.spark.map((val, i) => ({ val, i }))} margin={{ top: 1, right: 2, bottom: 1, left: 2 }}>
                                    <Line type="monotone" dataKey="val" stroke={v.stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
