import { useState } from 'react';
import { mockPatients, mockAlerts } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { deriveHealthStatus } from '../../utils/statusLabels';
import { appendNotificationLog, createLogFromAlert } from '../../data/notificationLogStore';

// Dashboard sub-components
import { EmergencyAlerts } from '../../components/dashboard/EmergencyAlerts';
import { SummaryCards } from '../../components/dashboard/SummaryCards';
import { HeartRateColumn } from '../../components/dashboard/HeartRateColumn';
import { BreathingRateColumn } from '../../components/dashboard/BreathingRateColumn';

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

        if (bUrgency !== aUrgency) {
            return bUrgency - aUrgency;
        }

        const severityOrder = { critical: 0, warning: 1, caution: 2, normal: 3 };
        const aSeverity = getHeartRateSeverity(a.heartRate);
        const bSeverity = getHeartRateSeverity(b.heartRate);
        return (severityOrder[aSeverity as keyof typeof severityOrder] ?? 3) - (severityOrder[bSeverity as keyof typeof severityOrder] ?? 3);
    });

    // Sort patients by breathing rate emergency level (numerical urgency)
    const patientsByBreathingRate = [...mockPatients].sort((a, b) => {
        const aUrgency = getBreathingRateUrgency(a.breathingRate);
        const bUrgency = getBreathingRateUrgency(b.breathingRate);

        if (bUrgency !== aUrgency) {
            return bUrgency - aUrgency;
        }

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

        let score = Math.max(hrUrgency, brUrgency);

        if (alert.type === '낙상 감지') score += 100;

        if (alert.severity === 'critical') score += 1000;
        if (alert.severity === 'warning') score += 500;

        return score;
    };

    const sortedActiveAlerts = [...activeAlerts].sort((a, b) =>
        getAlertUrgencyScore(b) - getAlertUrgencyScore(a)
    );

    return (
        <div className="space-y-4 md:space-y-6">
            <SummaryCards
                totalPatients={mockPatients.length}
                activeAlertsCount={activeAlerts.length}
                criticalCount={criticalCount}
                connectedDevices={connectedDevices}
                totalDevices={totalDevices}
                t={t}
            />

            {sortedActiveAlerts.length > 0 && (
                <EmergencyAlerts
                    alerts={sortedActiveAlerts}
                    onViewPatientDetails={onViewPatientDetails}
                    onAcknowledge={handleAcknowledgeAlert}
                    onResolve={handleResolveAlert}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <HeartRateColumn
                    patients={patientsByHeartRate}
                    language={language}
                    t={t}
                    onViewPatientDetails={onViewPatientDetails}
                    getHeartRateSeverity={getHeartRateSeverity}
                />

                <BreathingRateColumn
                    patients={patientsByBreathingRate}
                    language={language}
                    t={t}
                    onViewPatientDetails={onViewPatientDetails}
                    getBreathingRateSeverity={getBreathingRateSeverity}
                />
            </div>
        </div>
    );
}
