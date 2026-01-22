import { VitalCorrelation } from '../../store/slices/sleepSlice';
import { Heart, Wind, Activity as SpO2Icon } from 'lucide-react';
import {
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';

interface VitalsCorrelationProps {
    vitalCorrelations: VitalCorrelation[];
    isSmallScreen: boolean;
    useScaledDesktopLayout: boolean;
    t: (key: string) => string;
}

export function VitalsCorrelation({
    vitalCorrelations,
    isSmallScreen,
    useScaledDesktopLayout,
    t
}: VitalsCorrelationProps) {
    const getIcon = (type: string) => {
        if (type.includes('심박') || type.includes('Heart')) return Heart;
        if (type.includes('호흡') || type.includes('Breathing')) return Wind;
        return SpO2Icon;
    };

    const getColor = (type: string) => {
        if (type.includes('심박') || type.includes('Heart')) return 'text-red-500';
        if (type.includes('호흡') || type.includes('Breathing')) return 'text-blue-400';
        return 'text-teal-500';
    };

    const getStroke = (type: string) => {
        if (type.includes('심박수변동')) return '#14b8a6';
        if (type.includes('심박')) return '#ef4444';
        return '#60a5fa';
    };

    const getTint = (type: string) => {
        if (type.includes('심박수변동') || type.includes('HRV')) return 'bg-teal-50/60 border-teal-100';
        if (type.includes('심박') || type.includes('Heart') || type.includes('HR')) return 'bg-red-50/60 border-red-100';
        return 'bg-blue-50/60 border-blue-100';
    };

    // Translate Korean labels to current language
    const getLabel = (type: string) => {
        if (type.includes('심박수변동') || type.toLowerCase().includes('hrv')) return t('sleep.avgHrv');
        if (type.includes('심박') || type.toLowerCase().includes('heart')) return t('sleep.avgHr');
        if (type.includes('호흡') || type.toLowerCase().includes('resp') || type.toLowerCase().includes('breathing')) return t('sleep.avgResp');
        if (type.includes('산소') || type.toLowerCase().includes('spo2')) return t('sleep.avgSpO2');
        return type;
    };

    const vitalsData = (vitalCorrelations || []).map(v => ({
        label: getLabel(v.type),
        value: v.value,
        unit: v.unit,
        icon: getIcon(v.type),
        color: getColor(v.type),
        stroke: getStroke(v.type),
        tint: getTint(v.type),
        spark: [v.value, v.value + 2, v.value - 1, v.value, v.value + 3, v.value - 2, v.value] // Simplified generator
    }));

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

                        <div className={isSmallScreen ? 'mt-1 h-4 w-full min-w-0' : 'mt-2 h-7 w-full min-w-0'}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
