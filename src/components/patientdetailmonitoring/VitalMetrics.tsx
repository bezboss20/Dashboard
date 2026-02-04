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
    defaultColor = 'blue'
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    unit?: string;
    status: string;
    statusKey?: string;
    defaultColor?: string;
}) {
    const getSeverity = (key?: string): 'critical' | 'warning' | 'caution' | 'normal' => {
        if (!key) return 'normal';
        const k = key.toLowerCase();
        if (k.includes('critical') || k.includes('abnormal')) return 'critical';
        if (k.includes('warning')) return 'warning';
        if (k.includes('caution')) return 'caution';
        if (k.includes('normal')) return 'normal';
        return 'normal';
    };

    const severity = getSeverity(statusKey);

    const getStatusColors = (sev: string) => {
        switch (sev) {
            case 'critical': return 'text-red-600 bg-red-50';
            case 'warning': return 'text-orange-600 bg-orange-50';
            case 'caution': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-green-600 bg-green-50';
        }
    };

    const theme = {
        critical: { iconBg: 'bg-red-100', iconText: 'text-red-600', progress: 'bg-red-500' },
        warning: { iconBg: 'bg-orange-100', iconText: 'text-orange-600', progress: 'bg-orange-500' },
        caution: { iconBg: 'bg-yellow-100', iconText: 'text-yellow-600', progress: 'bg-yellow-500' },
        normal: {
            blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-600', progress: 'bg-blue-500' },
            teal: { iconBg: 'bg-teal-100', iconText: 'text-teal-600', progress: 'bg-teal-500' },
            green: { iconBg: 'bg-green-100', iconText: 'text-green-600', progress: 'bg-green-500' },
            orange: { iconBg: 'bg-orange-100', iconText: 'text-orange-600', progress: 'bg-orange-500' },
        }
    };

    const currentTheme = severity === 'normal'
        ? (theme.normal as any)[defaultColor] || theme.normal.blue
        : (theme as any)[severity];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full p-2.5 sm:p-4">
            <div className="min-w-0">
                <div className="flex justify-between items-center gap-1.5 mb-2 sm:mb-2.5 min-w-0">
                    <div className={`rounded-lg shrink-0 p-1.5 sm:p-2.5 ${currentTheme.iconBg}`}>
                        <Icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${currentTheme.iconText}`} />
                    </div>

                    <span
                        className={`font-bold rounded-full inline-flex items-center justify-center whitespace-nowrap leading-none shrink-0 text-[9px] px-2 py-1 sm:text-[10px] sm:px-2.5 sm:py-0.5 max-w-[80px] truncate ${getStatusColors(severity)}`}
                        title={status}
                    >
                        {status}
                    </span>
                </div>

                <p className="text-[10px] sm:text-[12px] text-gray-500 font-bold mb-0.5 sm:mb-1 leading-tight wrap-break-word">
                    {label}
                </p>

                <div className="flex items-baseline gap-1 min-w-0">
                    <span className="text-[18px] sm:text-2xl font-black text-gray-900 leading-none">{value}</span>
                    {unit && <span className="text-[10px] sm:text-[12px] text-gray-400 font-bold">{unit}</span>}
                </div>
            </div>

            <div className="mt-3 sm:mt-5 h-1 sm:h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${currentTheme.progress} transition-all duration-500`} style={{ width: '65%' }} />
            </div>
        </div>
    );
}

export function VitalMetrics({ vitals, deviceId, lastUpdated, t }: VitalMetricsProps) {
    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) {
            return t(isoString);
        }
        const diffMinutes = Math.floor((Date.now() - d.getTime()) / 60000);
        if (diffMinutes < 1) return t('time.justNow');
        return `${diffMinutes}${t('time.minutesAgo')}`;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-gray-700">{t('table.overview')}</h3>
                {lastUpdated && (
                    <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 uppercase tracking-tight">
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
                    defaultColor="red"
                />
                <MetricCard
                    icon={Activity}
                    label={t('detail.stress')}
                    value={vitals.stressIndex.value}
                    status={t(vitals.stressIndex.status)}
                    statusKey={vitals.stressIndex.status}
                    defaultColor="blue"
                />
                <MetricCard
                    icon={Wind}
                    label={t('detail.rr')}
                    value={vitals.rr.value}
                    unit={t('common.rpm')}
                    status={t(vitals.rr.status)}
                    statusKey={vitals.rr.status}
                    defaultColor="teal"
                />
                <MetricCard
                    icon={Moon}
                    label={t('detail.sleepEfficiency')}
                    value={vitals.sleepIndex.value}
                    status={t(vitals.sleepIndex.status)}
                    statusKey={vitals.sleepIndex.status}
                    defaultColor="orange"
                />
            </div>
        </div>
    );
}
