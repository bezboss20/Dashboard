import { useState } from 'react';
import { mockPatients, mockAlerts } from '../data/mockData';
import { EmergencyAlerts } from '../components/EmergencyAlerts';
import { Users, AlertTriangle, Activity, TrendingUp, Heart, Wind } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { deriveHealthStatus } from '../utils/statusLabels';
import { appendNotificationLog, createLogFromAlert } from '../data/notificationLogStore';

interface DashboardPageProps {
    systemOnline: boolean;
    onViewPatientDetails: (patientId: string) => void;
}

export function DashboardPage({ systemOnline, onViewPatientDetails }: DashboardPageProps) {
    const { t, language } = useLanguage();
    const [alerts, setAlerts] = useState(() => {
        const baseAlerts = [...mockAlerts];

        // Ensure every patient with critical/warning vitals has an alert
        mockPatients.forEach(patient => {
            const hasActiveAlert = baseAlerts.some(a => a.patientId === patient.id && a.status === 'active');

            // Emergency criteria matching the table thresholds
            const isHeartEmergency = patient.heartRate > 100 || patient.heartRate < 60;
            const isBreathingEmergency = patient.breathingRate > 20 || patient.breathingRate < 12;
            const isNonNormal = patient.alertStatus !== 'normal';

            if (!hasActiveAlert && (isHeartEmergency || isBreathingEmergency || isNonNormal)) {
                let severity: 'critical' | 'warning' | 'caution' = 'caution';
                let typeKey = 'dashboard.heartEmergency';
                let value = `${patient.heartRate} BPM`;

                // Calculate priority severity
                if (patient.heartRate > 100 || patient.heartRate < 50 || patient.breathingRate > 25 || patient.breathingRate < 10) {
                    severity = 'critical';
                } else if (isHeartEmergency || isBreathingEmergency) {
                    severity = 'warning';
                } else if (isNonNormal) {
                    severity = patient.alertStatus === 'critical' ? 'critical' :
                        patient.alertStatus === 'warning' ? 'warning' : 'caution';
                }

                // Determine primary type
                if (isBreathingEmergency && !isHeartEmergency) {
                    typeKey = 'dashboard.breathingEmergency';
                    value = `${patient.breathingRate} RPM`;
                }

                baseAlerts.unshift({
                    id: `AUTO-${patient.id}`,
                    patientId: patient.id,
                    patientName: patient.nameKorean,
                    patientNameEnglish: patient.nameEnglish,
                    type: t(typeKey) as any,
                    severity,
                    timestamp: new Date(),
                    status: 'active',
                    value
                });
            }
        });
        return baseAlerts;
    });

    const activeAlerts = alerts.filter(alert => alert.status === 'active');
    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
    const connectedDevices = mockPatients.filter(p => {
        const health = deriveHealthStatus({
            connectionStatus: p.deviceStatus,
            deviceStatus: p.sensorConnected ? 'normal' : 'error'
        });
        return health === 'normal';
    }).length;
    const totalDevices = mockPatients.length;

    // Alert management handlers
    const handleAcknowledgeAlert = (alertId: string, note: string) => {
        setAlerts(prevAlerts => {
            const targetAlert = prevAlerts.find(a => a.id === alertId);
            if (targetAlert) {
                appendNotificationLog(createLogFromAlert(targetAlert, 'acknowledged'));
            }
            return prevAlerts.map(alert =>
                alert.id === alertId
                    ? {
                        ...alert,
                        status: 'acknowledged' as const,
                        acknowledgedAt: new Date(),
                        acknowledgedBy: 'Admin',
                        notes: note || alert.notes
                    }
                    : alert
            );
        });
    };

    const handleResolveAlert = (alertId: string) => {
        setAlerts(prevAlerts => {
            const targetAlert = prevAlerts.find(a => a.id === alertId);
            if (targetAlert) {
                appendNotificationLog(createLogFromAlert(targetAlert, 'resolved'));
            }
            return prevAlerts.map(alert =>
                alert.id === alertId
                    ? {
                        ...alert,
                        status: 'resolved' as const,
                        resolvedAt: new Date(),
                        resolvedBy: 'Admin'
                    }
                    : alert
            );
        });
    };

    // Helper function to determine heart rate severity
    const getHeartRateSeverity = (hr: number): 'critical' | 'warning' | 'caution' | 'normal' => {
        if (hr > 100 || hr < 50) return 'critical';
        if (hr > 90 || hr < 60) return 'warning';
        if (hr > 85 || hr < 65) return 'caution';
        return 'normal';
    };

    // Helper function to determine breathing rate severity
    const getBreathingRateSeverity = (br: number): 'critical' | 'warning' | 'caution' | 'normal' => {
        if (br > 25 || br < 10) return 'critical';
        if (br > 22 || br < 12) return 'warning';
        if (br > 20 || br < 14) return 'caution';
        return 'normal';
    };

    // Helper function to calculate urgency score (deviation from normal range)
    const getHeartRateUrgency = (hr: number) => {
        if (hr > 90) return hr - 90;
        if (hr < 60) return 60 - hr;
        return 0;
    };

    const getBreathingRateUrgency = (br: number) => {
        if (br > 20) return br - 20;
        if (br < 12) return 12 - br;
        return 0;
    };

    // Sort patients by heart rate emergency level (numerical urgency)
    const patientsByHeartRate = [...mockPatients].sort((a, b) => {
        const aUrgency = getHeartRateUrgency(a.heartRate);
        const bUrgency = getHeartRateUrgency(b.heartRate);

        // Primary sort: urgency score (descending)
        if (bUrgency !== aUrgency) {
            return bUrgency - aUrgency;
        }

        // Secondary sort: severity category
        const severityOrder = { critical: 0, warning: 1, caution: 2, normal: 3 };
        const aSeverity = getHeartRateSeverity(a.heartRate);
        const bSeverity = getHeartRateSeverity(b.heartRate);
        return (severityOrder[aSeverity as keyof typeof severityOrder] ?? 3) - (severityOrder[bSeverity as keyof typeof severityOrder] ?? 3);
    });

    // Sort patients by breathing rate emergency level (numerical urgency)
    const patientsByBreathingRate = [...mockPatients].sort((a, b) => {
        const aUrgency = getBreathingRateUrgency(a.breathingRate);
        const bUrgency = getBreathingRateUrgency(b.breathingRate);

        // Primary sort: urgency score (descending)
        if (bUrgency !== aUrgency) {
            return bUrgency - aUrgency;
        }

        // Secondary sort: severity category
        const severityOrder = { critical: 0, warning: 1, caution: 2, normal: 3 };
        const aSeverity = getBreathingRateSeverity(a.breathingRate);
        const bSeverity = getBreathingRateSeverity(b.breathingRate);
        return (severityOrder[aSeverity as keyof typeof severityOrder] ?? 3) - (severityOrder[bSeverity as keyof typeof severityOrder] ?? 3);
    });

    // Unified Alert Sorting Logic
    const getAlertUrgencyScore = (alert: typeof mockAlerts[0]) => {
        const patient = mockPatients.find(p => p.id === alert.patientId);
        if (!patient) return 0;

        const hrUrgency = getHeartRateUrgency(patient.heartRate);
        const brUrgency = getBreathingRateUrgency(patient.breathingRate);

        // Base score is the maximum deviation of either HR or RR
        let score = Math.max(hrUrgency, brUrgency);

        // Priority boost for 낙상 감지 (Fall)
        if (alert.type === '낙상 감지') score += 100;

        // Boost based on severity category to maintain groupings
        if (alert.severity === 'critical') score += 1000;
        if (alert.severity === 'warning') score += 500;

        return score;
    };

    const sortedActiveAlerts = [...activeAlerts].sort((a, b) =>
        getAlertUrgencyScore(b) - getAlertUrgencyScore(a)
    );

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                            <p className="text-[9px] min-[380px]:text-[10px] lg:text-sm text-gray-500 mb-0.5 lg:mb-1 leading-tight truncate">{t('dashboard.totalPatients')}</p>
                            <p className="text-base min-[380px]:text-lg lg:text-3xl text-blue-600 font-bold">{mockPatients.length}</p>
                        </div>
                        <div className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 lg:w-12 lg:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                            <p className="text-[9px] min-[380px]:text-[10px] lg:text-sm text-gray-500 mb-0.5 lg:mb-1 leading-tight truncate">{t('dashboard.activeAlerts')}</p>
                            <p className="text-base min-[380px]:text-lg lg:text-3xl text-red-600 font-bold">{activeAlerts.length}</p>
                        </div>
                        <div className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 lg:w-12 lg:h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3 lg:w-6 lg:h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                            <p className="text-[9px] min-[380px]:text-[10px] lg:text-sm text-gray-500 mb-0.5 lg:mb-1 leading-tight truncate">{t('dashboard.criticalPatients')}</p>
                            <p className="text-base min-[380px]:text-lg lg:text-3xl text-orange-600 font-bold">{criticalCount}</p>
                        </div>
                        <div className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 lg:w-12 lg:h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Activity className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                            <p className="text-[9px] min-[380px]:text-[10px] lg:text-sm text-gray-500 mb-0.5 lg:mb-1 leading-tight truncate">{t('dashboard.devicesConnected')}</p>
                            <p className="text-base min-[380px]:text-lg lg:text-3xl text-green-600 font-bold">{connectedDevices}/{totalDevices}</p>
                        </div>
                        <div className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 lg:w-12 lg:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3 lg:w-6 lg:h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Alerts Section */}
            {sortedActiveAlerts.length > 0 && (
                <EmergencyAlerts
                    alerts={sortedActiveAlerts}
                    onViewPatientDetails={onViewPatientDetails}
                    onAcknowledge={handleAcknowledgeAlert}
                    onResolve={handleResolveAlert}
                />
            )}

            {/* Heart Rate and Breathing Rate Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
                {/* Heart Rate Column */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-6 flex flex-col">
                    <div className="flex items-center gap-2 lg:gap-3 mb-4">
                        <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 lg:w-10 lg:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Heart className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 lg:w-6 lg:h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xs lg:text-base font-bold text-gray-900 leading-tight">{t('dashboard.heartRateTitle')}</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('dashboard.sortedByUrgency')}</p>
                        </div>
                    </div>
                    <div className="space-y-1.5 lg:space-y-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
                        {patientsByHeartRate.map((patient) => {
                            const severity = getHeartRateSeverity(patient.heartRate);
                            const bgColor = severity === 'critical' ? 'bg-red-50 border-red-200' :
                                severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                                    'bg-green-50 border-green-200';
                            const textColor = severity === 'critical' ? 'text-red-700' :
                                severity === 'warning' ? 'text-orange-700' :
                                    'text-green-700';
                            const badgeColor = severity === 'critical' ? 'bg-red-100 text-red-700 font-bold' :
                                severity === 'warning' ? 'bg-orange-100 text-orange-700 font-bold' :
                                    'bg-green-100 text-green-700 font-bold';

                            return (
                                <div key={patient.id} className={`p-2 lg:p-3 rounded-xl border ${bgColor} cursor-pointer hover:shadow-sm transition-shadow`} onClick={() => onViewPatientDetails(patient.id)}>
                                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className={`px-1 py-0.5 rounded text-[8px] min-[380px]:text-[9px] font-mono ${badgeColor} flex-shrink-0`}>
                                                {patient.id.split('-')[1] || patient.id}
                                            </div>
                                            <span className="text-xs lg:text-sm font-bold text-gray-700 truncate">{language === 'ko' ? patient.nameKorean : patient.nameEnglish}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1 flex-shrink-0">
                                            <span className={`text-base lg:text-lg font-black ${textColor}`}>{patient.heartRate}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">{t('common.bpm')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Breathing Rate Column */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-6 flex flex-col">
                    <div className="flex items-center gap-2 lg:gap-3 mb-4">
                        <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 lg:w-10 lg:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wind className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xs lg:text-base font-bold text-gray-900 leading-tight">{t('dashboard.breathingRateTitle')}</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('dashboard.sortedByUrgency')}</p>
                        </div>
                    </div>
                    <div className="space-y-1.5 lg:space-y-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
                        {patientsByBreathingRate.map((patient) => {
                            const severity = getBreathingRateSeverity(patient.breathingRate);
                            const bgColor = severity === 'critical' ? 'bg-red-50 border-red-200' :
                                severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                                    'bg-green-50 border-green-200';
                            const textColor = severity === 'critical' ? 'text-red-700' :
                                severity === 'warning' ? 'text-orange-700' :
                                    'text-green-700';
                            const badgeColor = severity === 'critical' ? 'bg-red-100 text-red-700 font-bold' :
                                severity === 'warning' ? 'bg-orange-100 text-orange-700 font-bold' :
                                    'bg-green-100 text-green-700 font-bold';

                            return (
                                <div key={patient.id} className={`p-2 lg:p-3 rounded-xl border ${bgColor} cursor-pointer hover:shadow-sm transition-shadow`} onClick={() => onViewPatientDetails(patient.id)}>
                                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className={`px-1 py-0.5 rounded text-[8px] min-[380px]:text-[9px] font-mono ${badgeColor} flex-shrink-0`}>
                                                {patient.id.split('-')[1] || patient.id}
                                            </div>
                                            <span className="text-xs lg:text-sm font-bold text-gray-700 truncate">{language === 'ko' ? patient.nameKorean : patient.nameEnglish}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1 flex-shrink-0">
                                            <span className={`text-base lg:text-lg font-black ${textColor}`}>{patient.breathingRate}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">{t('common.rpm')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
