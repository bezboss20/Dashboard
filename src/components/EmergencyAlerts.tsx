import { AlertTriangle, ChevronRight, Check } from 'lucide-react';
import { Alert } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface EmergencyAlertsProps {
    alerts: Alert[];
    onViewPatientDetails: (patientId: string) => void;
    onAcknowledge: (alertId: string, note: string) => void;
    onResolve: (alertId: string) => void;
}

export function EmergencyAlerts({ alerts, onViewPatientDetails, onAcknowledge, onResolve }: EmergencyAlertsProps) {
    const { t, language } = useLanguage();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold">{t('alerts.title')}</h3>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{alerts.length}</span>
            </div>

            <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 no-scrollbar">
                {alerts.map((alert) => {
                    const isCritical = alert.severity === 'critical';
                    const isWarning = alert.severity === 'warning';

                    const bgColor = isCritical ? 'bg-red-50 border-red-100' : isWarning ? 'bg-orange-50 border-orange-100' : 'bg-yellow-50 border-yellow-100';
                    const textColor = isCritical ? 'text-red-700' : isWarning ? 'text-orange-700' : 'text-yellow-700';
                    const badgeColor = isCritical ? 'bg-red-600' : isWarning ? 'bg-orange-600' : 'bg-yellow-600';

                    return (
                        <div
                            key={alert.id}
                            className={`flex-shrink-0 w-[220px] lg:w-[280px] ${bgColor} border rounded-xl p-2.5 lg:p-4 shadow-sm relative group transition-all hover:shadow-md`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
                                    <div className={`w-2 h-2 ${badgeColor} rounded-full ${isCritical ? 'animate-pulse' : ''} flex-shrink-0`} />
                                    <span className={`text-[9px] min-[380px]:text-[10px] lg:text-xs font-bold ${textColor} flex-shrink-0`}>{t(`status.${alert.severity}`).toUpperCase()}</span>
                                    <span className="text-[9px] lg:text-[10px] text-gray-400 font-medium truncate">
                                        | {alert.type === '심박 위급' ? t('dashboard.heartEmergency') :
                                            alert.type === '호흡 위급' ? t('dashboard.breathingEmergency') :
                                                alert.type === '낙상 감지' ? t('dashboard.fallDetected') : alert.type}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onViewPatientDetails(alert.patientId)}
                                    className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-0.5 lg:space-y-1 mb-2 lg:mb-4">
                                <p className="text-[10px] lg:text-xs text-gray-500 truncate">
                                    {t('alerts.patient')}: {alert.patientId.split('-')[1] || alert.patientId} - {language === 'ko' ? alert.patientName : alert.patientNameEnglish}
                                </p>
                                <p className="text-xs lg:text-sm font-bold text-gray-900 truncate">{t('alerts.value')}: {alert.value}</p>
                                <p className="text-[9px] lg:text-[10px] text-gray-400">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => onAcknowledge(alert.id, '')}
                                    className="flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[9px] lg:text-[10px] font-bold hover:bg-gray-50 transition-colors uppercase"
                                >
                                    {t('alerts.acknowledge')}
                                </button>
                                <button
                                    onClick={() => onResolve(alert.id)}
                                    className={`flex items-center justify-center gap-1 py-1.5 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-yellow-500'} text-white rounded-lg text-[9px] lg:text-[10px] font-bold hover:opacity-90 transition-colors uppercase`}
                                >
                                    <Check className="w-3 h-3 flex-shrink-0" />
                                    {t('alerts.resolve')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
