import { AlertTriangle, ChevronRight, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Local interface for alert data from API
interface Alert {
    id: string;
    patientId?: string;
    patientCode?: string;
    patientName: string;
    patientNameEnglish?: string;
    patientNameData?: Record<string, string>; // Multilingual name data from API
    type?: string;
    message?: {
        ko: string;
        en: string;
    };
    severity: 'critical' | 'warning' | 'caution';
    timestamp: Date;
    status: 'active' | 'acknowledged' | 'resolved';
    value?: string;
}

interface EmergencyAlertsProps {
    alerts: Alert[];
    onViewPatientDetails: (patientId: string) => void;
    onAcknowledge: (alertId: string, note: string) => void;
    onResolve: (alertId: string) => void;
}

export function EmergencyAlerts({ alerts, onViewPatientDetails, onAcknowledge, onResolve }: EmergencyAlertsProps) {
    const { t, language, getLocalizedText } = useLanguage();

    // Helper to translate alert messages from API (which may be in Korean)
    const translateAlertMessage = (message: string | undefined): string => {
        if (!message) return '';

        // Map Korean messages to translation keys
        if (message.includes('심박수') && message.includes('초과')) {
            return t('alerts.msg.hrExceeded');
        }
        if (message.includes('심박수') && (message.includes('이하') || message.includes('below'))) {
            return t('alerts.msg.hrLow');
        }
        if (message.includes('호흡수') && message.includes('벗어')) {
            return t('alerts.msg.rrOutOfRange');
        }
        if (message.includes('호흡수') && message.includes('초과')) {
            return t('alerts.msg.rrHigh');
        }
        if (message.includes('낙상') || message.includes('Fall')) {
            return t('alerts.msg.fallDetected');
        }

        return message;
    };

    // Increase display limit so all active alerts are visible (e.g. 20+)
    const displayAlerts = alerts.slice(0, 50);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold">{t('alerts.title')}</h3>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{alerts.length}</span>
            </div>

            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar -mx-1 px-1">
                {displayAlerts.map((alert) => {
                    const isCritical = alert.severity === 'critical';
                    const isWarning = alert.severity === 'warning';

                    const bgColor = isCritical ? 'bg-red-50 border-red-100' : isWarning ? 'bg-orange-50 border-orange-100' : 'bg-yellow-50 border-yellow-100';
                    const textColor = isCritical ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-yellow-700';
                    const badgeColor = isCritical ? 'bg-red-600' : isWarning ? 'bg-orange-600' : 'bg-yellow-600';

                    // Get patient identifier - use patientCode or patientId
                    const patientIdentifier = alert.patientCode || alert.patientId || 'Unknown';
                    const patientIdShort = patientIdentifier.includes('-')
                        ? patientIdentifier.split('-')[1] || patientIdentifier
                        : patientIdentifier;

                    // Get alert type - use type or message based on language
                    const rawAlertType = alert.type || alert.message?.ko || alert.message?.en || '';
                    // Translate alert type labels
                    const displayType = rawAlertType === '심박 위급' ? t('dashboard.heartEmergency') :
                        rawAlertType === '호흡 위급' ? t('dashboard.breathingEmergency') :
                            rawAlertType === '낙상 감지' ? t('dashboard.fallDetected') :
                                translateAlertMessage(rawAlertType);

                    // Secure Patient ID retrieval
                    const patientId = alert.patientId;

                    return (
                        <div
                            key={alert.id}
                            onClick={() => {
                                if (patientId) {
                                    onViewPatientDetails(patientId);
                                } else {
                                    console.error(`Alert card clicked but no valid backend patientId found for: ${alert.patientName} (${alert.patientCode})`);
                                }
                            }}
                            className={`shrink-0 w-[240px] xs:w-[250px] sm:w-[260px] lg:w-[280px] snap-center ${bgColor} border rounded-2xl p-2.5 lg:p-3 shadow-sm relative group transition-all hover:shadow-md ${patientId ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                        >
                            <div className="flex items-start justify-between mb-1.5">
                                <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
                                    <div className={`w-1.5 h-1.5 ${badgeColor} rounded-full ${isCritical ? 'animate-pulse' : ''} shrink-0`} />
                                    <span className={`text-[9px] min-[380px]:text-[10px] lg:text-[11px] font-bold ${textColor} shrink-0`}>{t(`status.${alert.severity}`).toUpperCase()}</span>
                                    <span className="text-[8px] lg:text-[9px] text-gray-400 font-medium truncate">
                                        | {displayType}
                                    </span>
                                </div>
                                <div
                                    className="p-1 text-gray-400 group-hover:text-gray-600 shrink-0 bg-gray-50 rounded-full transition-colors"
                                    title={t('table.viewDetails')}
                                >
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>

                            <div className="w-full text-left mb-2 group-hover:bg-black/5 p-1 -m-1 rounded-lg transition-colors overflow-hidden">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-[9px] lg:text-[10px] text-gray-500 truncate font-medium">
                                        {alert.patientName} {alert.patientCode ? `(${alert.patientCode})` : ''}
                                    </p>
                                    <p className="text-[8px] lg:text-[9px] text-gray-400 shrink-0">{alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <p className="text-xs lg:text-[13px] font-bold text-gray-900">
                                    <span className="line-clamp-2 leading-tight break-keep block">
                                        {displayType}
                                    </span>
                                </p>
                                <div className="flex justify-end h-3.5 mt-0.5">
                                    <span className="text-[9px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {t('table.viewDetails')} →
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAcknowledge(alert.id, '');
                                    }}
                                    className="flex items-center justify-center gap-1 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-[9px] lg:text-[10px] font-bold hover:bg-gray-50 transition-colors uppercase truncate px-1"
                                >
                                    <span className="truncate">{t('alerts.acknowledge')}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
