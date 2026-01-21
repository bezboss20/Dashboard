import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

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
    const color = severity === 'high' ? 'border-red-500' : severity === 'medium' ? 'border-orange-400' : 'border-blue-500';
    const bgColor = severity === 'high' ? 'bg-red-50' : severity === 'medium' ? 'bg-orange-50' : 'bg-blue-50';

    return (
        <div
            className={`
                flex items-center border-l-4 rounded-md transition-all duration-200
                ${bgColor} ${color}
                ${compact ? 'gap-1.5 p-1.5 mb-1' : 'gap-2 p-3 mb-2'}
            `}
        >
            <AlertTriangle className={compact ? 'w-3.5 h-3.5 text-gray-400 shrink-0' : 'w-4 h-4 text-gray-400 shrink-0'} />

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
    const [isExpanded, setIsExpanded] = useState(false);

    if (!alerts || alerts.length === 0) return null;

    const displayAlerts = isExpanded ? alerts : alerts.slice(0, 1);
    const hasMore = alerts.length > 1;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <div className="mb-3 sm:mb-4">
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-[14px] sm:text-[17px] font-bold text-gray-900 leading-tight">
                        {t('detail.alerts')}
                    </h3>
                    {hasMore && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 text-[11px] sm:text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            {isExpanded ? (t('common.collapse') || 'Collapse') : (t('alerts.viewAll') || 'View All')}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-0 overflow-hidden transition-all duration-300">
                {displayAlerts.map((alert) => {
                    // Translate message if it's a translation key
                    const translatedMessage = alert.message.startsWith('alerts.')
                        ? t(alert.message)
                        : alert.message;
                    return (
                        <AlertRow
                            key={alert.id}
                            severity={alert.severity}
                            title={translatedMessage}
                            time={alert.time}
                            compact={false}
                        />
                    );
                })}
            </div>
        </div>
    );
}
