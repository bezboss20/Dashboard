import { AlertTriangle } from 'lucide-react';

interface AlertEntry {
    id: string;
    type: string;
    message: string;
    time: string;
    severity: 'high' | 'medium' | 'low';
}

interface AlertsSectionProps {
    alerts: AlertEntry[];
    t: (key: string) => string;
}

function AlertRow({
    severity,
    title,
    time,
    compact = false
}: {
    severity: string;
    title: string;
    time: string;
    compact?: boolean;
}) {
    const color = severity === 'high' ? 'bg-red-500' : severity === 'medium' ? 'bg-orange-400' : 'bg-blue-500';
    const bgColor = severity === 'high' ? 'bg-red-50' : severity === 'medium' ? 'bg-orange-50' : 'bg-blue-50';

    return (
        <div
            className={[
                'flex items-center border-l-4',
                'rounded-md',
                bgColor,
                color.replace('bg-', 'border-'),
                compact ? 'gap-1.5 p-1.5' : 'gap-2 p-3',
                compact ? 'mb-0.5' : 'mb-2'
            ].join(' ')}
        >
            <AlertTriangle className={compact ? 'w-3.5 h-3.5 text-gray-400 shrink-0' : 'w-4 h-4 text-gray-400'} />

            <span className={`${compact ? 'text-[11px]' : 'text-[13px]'} font-bold text-gray-800 flex-1 leading-snug`}>
                {title}
            </span>

            <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-gray-400 font-medium whitespace-nowrap`}>
                {time}
            </span>
        </div>
    );
}

export function AlertsSection({ alerts, t }: AlertsSectionProps) {
    const alertsForDisplay = alerts.slice(0, 1);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-6 pb-1.5 sm:pb-6">
            <div className="mb-1.5 sm:mb-4">
                <div className="flex gap-2 flex-row items-center justify-between">
                    <h3 className="text-[13px] sm:text-[17px] font-bold text-gray-900 leading-tight break-keep">
                        {t('detail.alerts')}
                    </h3>
                    <div className="shrink-0">
                        <button className="text-[10px] sm:text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                            {t('alerts.viewAll') || 'View All'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-0">
                <div className="sm:hidden">
                    {alertsForDisplay.map(alert => (
                        <AlertRow
                            key={alert.id}
                            severity={alert.severity}
                            title={alert.message}
                            time={alert.time}
                            compact={true}
                        />
                    ))}
                </div>
                <div className="hidden sm:block">
                    {alerts.map(alert => (
                        <AlertRow key={alert.id} severity={alert.severity} title={alert.message} time={alert.time} />
                    ))}
                </div>
            </div>
        </div>
    );
}
