import { Heart, Activity, Wind, Moon, Link2 } from 'lucide-react';
import {
    getHealthStatusLabel,
    getHealthStatusClasses,
    DeviceHealthStatus
} from '../../utils/statusLabels';

interface VitalMetric {
    value: number | string;
    status: string;
    isNormal: boolean;
}

interface VitalMetricsProps {
    vitals: {
        hr: VitalMetric;
        stressIndex: VitalMetric;
        rr: VitalMetric;
        sleepIndex: VitalMetric;
        connection: VitalMetric & { healthStatus: DeviceHealthStatus };
    };
    deviceId: string;
    lastUpdated?: string;
    t: (key: string) => string;
}

function MetricCard({
    icon: Icon,
    label,
    value,
    unit,
    status,
    statusKey,
    colorClass,
    progressColor
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    unit?: string;
    status: string;
    statusKey?: string;
    colorClass: string;
    progressColor: string;
}) {
    const getStatusColors = (key?: string) => {
        if (!key) return 'text-green-600 bg-green-50';
        if (key.includes('critical')) return 'text-red-600 bg-red-50';
        if (key.includes('warning')) return 'text-orange-600 bg-orange-50';
        if (key.includes('caution')) return 'text-blue-600 bg-blue-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full p-1.5 sm:p-4">
            <div className="min-w-0">
                <div className="flex justify-between items-center gap-1.5 mb-1 sm:mb-2 min-w-0">
                    <div className={`rounded-lg bg-opacity-10 shrink-0 p-1.5 sm:p-2.5 ${colorClass}`}>
                        <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${colorClass.replace('bg-', 'text-')}`} />
                    </div>

                    <span
                        className={`font-bold rounded-full inline-flex items-center justify-center whitespace-nowrap leading-none shrink-0 text-[8px] px-1.5 py-0.5 sm:text-[10px] sm:px-2.5 sm:py-0.5 max-w-[72px] truncate ${getStatusColors(statusKey)}`}
                        title={status}
                    >
                        {status}
                    </span>
                </div>

                <p className="text-[9px] sm:text-[11px] text-gray-500 font-semibold mb-0.5 sm:mb-1 leading-tight wrap-break-word">
                    {label}
                </p>

                <div className="flex items-baseline gap-1 min-w-0">
                    <span className="text-[16px] sm:text-2xl font-bold text-gray-900 leading-none">{value}</span>
                    {unit && <span className="text-[9px] sm:text-[11px] text-gray-400 font-medium">{unit}</span>}
                </div>
            </div>

            <div className="mt-2 sm:mt-4 h-0.5 sm:h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${progressColor}`} style={{ width: '65%' }} />
            </div>
        </div>
    );
}

export function VitalMetrics({ vitals, deviceId, lastUpdated, t }: VitalMetricsProps) {
    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-gray-700">{t('table.overview')}</h3>
                {lastUpdated && (
                    <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                        {t('table.lastUpdated')}: {formatTime(lastUpdated)}
                    </span>
                )}
            </div>
            <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
                <MetricCard
                    icon={Heart}
                    label={t('detail.hr')}
                    value={vitals.hr.value}
                    unit={t('common.bpm')}
                    status={t(vitals.hr.status)}
                    statusKey={vitals.hr.status}
                    colorClass="bg-red-300"
                    progressColor="bg-red-300"
                />
                <MetricCard
                    icon={Activity}
                    label={t('detail.stress')}
                    value={vitals.stressIndex.value}
                    status={t(vitals.stressIndex.status)}
                    statusKey={vitals.stressIndex.status}
                    colorClass="bg-blue-300"
                    progressColor="bg-blue-300"
                />
                <MetricCard
                    icon={Wind}
                    label={t('detail.rr')}
                    value={vitals.rr.value}
                    unit={t('common.rpm')}
                    status={t(vitals.rr.status)}
                    statusKey={vitals.rr.status}
                    colorClass="bg-teal-300"
                    progressColor="bg-teal-300"
                />
                <MetricCard
                    icon={Moon}
                    label={t('detail.sleepEfficiency')}
                    value={vitals.sleepIndex.value}
                    status={t(vitals.sleepIndex.status)}
                    statusKey={vitals.sleepIndex.status}
                    colorClass="bg-orange-300"
                    progressColor="bg-orange-300"
                />
            </div>
        </div>
    );
}
