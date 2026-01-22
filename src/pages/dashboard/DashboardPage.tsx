import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from '../../context/LanguageContext';
import { appendNotificationLog, createLogFromAlert } from '../../data/notificationLogStore';
import { fetchOverviewAsync, updateAlert } from '../../store/slices/dashboardSlice';
import type { RootState, AppDispatch } from '../../store/store';
import type { AlertData, VitalData } from '../../store/slices/dashboardSlice';

// Dashboard sub-components
import { EmergencyAlerts } from '../../components/dashboard/EmergencyAlerts';
import { SummaryCards } from '../../components/dashboard/SummaryCards';
import { HeartRateColumn } from '../../components/dashboard/HeartRateColumn';
import { BreathingRateColumn } from '../../components/dashboard/BreathingRateColumn';

// Helper to get the most reliable patient ID for navigation (HEX ID only)
// The API returns patientId directly as a string (hex ID), not nested in a patient object
const getBestPatientId = (item: any): string => {
    if (!item) return '';

    const p = item.patient || {};
    const pIdField = item.patientId;

    // Check all common locations for a 24-char MongoDB Hex ID
    // Priority 1: Direct patientId field (most common in current API)
    // Priority 2: Nested in patient object
    // CRITICAL: We DO NOT use item.id here because for alerts, item.id is the ALERT ID, not the patient ID.
    const possibleIds = [
        // Direct patientId as string (current API format)
        (typeof pIdField === 'string' ? pIdField : undefined),
        // Nested in patient object
        p._id,
        p.id,
        // patientId as object with nested _id or id
        (typeof pIdField === 'object' ? pIdField?._id : undefined),
        (typeof pIdField === 'object' ? pIdField?.id : undefined),
        // patient field as string
        (typeof item.patient === 'string' ? item.patient : undefined)
    ];

    for (const id of possibleIds) {
        if (id && typeof id === 'string' && id.length > 20 && id !== item.patientCode) {
            return id;
        }
    }

    return '';
};

interface DashboardPageProps {
    systemOnline: boolean;
    onViewPatientDetails: (patientId: string) => void;
}

export function DashboardPage({ systemOnline, onViewPatientDetails }: DashboardPageProps) {
    const { t, language, getLocalizedText } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();

    // Get data from Redux store
    const { summary, alerts, vitals, loading, error } = useSelector((state: RootState) => state.dashboard);

    console.log('DashboardPage State:', {
        summary,
        alertsCount: alerts?.length,
        vitalsCount: (vitals?.heartRate?.length + vitals?.respiratoryRate?.length),
        loading,
        error
    });

    // Fetch data on mount
    useEffect(() => {
        console.log('DashboardPage - Mounting/Fetching overview');
        dispatch(fetchOverviewAsync());

        // Set up polling every 10 seconds
        const interval = setInterval(() => {
            console.log('DashboardPage - Polling overview');
            dispatch(fetchOverviewAsync());
        }, 10000);

        return () => clearInterval(interval);
    }, [dispatch]);

    useEffect(() => {
        if (alerts && alerts.length > 0) {
            console.log('DashboardPage - Sample Alert Raw:', alerts[0]);
        }
    }, [alerts]);

    // Create a lookup map for patient IDs based on patient codes from vitals
    const patientIdMap = new Map<string, string>();
    const allVitals = [...(vitals?.heartRate || []), ...(vitals?.respiratoryRate || [])];
    allVitals.forEach(v => {
        if (v?.patientCode && v?.patientId && String(v.patientId).length > 20) {
            patientIdMap.set(v.patientCode, String(v.patientId));
        }
    });

    // Map API alerts to display format with multilingual support
    // Increase display limit so all active alerts are visible (e.g. 20+)
    const displayAlerts = (alerts || []).slice(0, 50).map((a, idx) => {
        try {
            let pId = getBestPatientId(a);

            // Fallback: If no hex ID found in alert, try to find it in the patientIdMap via patientCode
            if (!pId && a.patientCode && patientIdMap.has(a.patientCode)) {
                pId = patientIdMap.get(a.patientCode)!;
                console.log(`Resolved missing patientId for ${a.patientCode} using vitals map: ${pId}`);
            }

            // Aggressive name resolution - API now returns patientName as {ko, en} object
            const patientObj = (a.patient || {}) as any;
            // Priority: a.patientName (object), a.patientNameData, a.fullNameData, a.fullName, patientObj fields
            const rawPatientName = (a as any).patientName;
            const isPatientNameObject = rawPatientName && typeof rawPatientName === 'object' && (rawPatientName.ko || rawPatientName.en);
            const patientNameData = isPatientNameObject ? rawPatientName : (a.patientNameData || (a as any).fullNameData || (a as any).fullName || patientObj.fullName || patientObj.fullNameData);

            const nameEn = patientNameData?.en || a.patientNameEnglish || (a as any).nameEnglish || patientObj.nameEnglish || '';
            const nameKo = patientNameData?.ko || (typeof rawPatientName === 'string' ? rawPatientName : '') || (a as any).nameKorean || patientObj.nameKorean || patientObj.name || '';

            return {
                ...a,
                patientId: pId, // Must be the HEX ID, or empty string.
                patientName: getLocalizedText(
                    patientNameData || { ko: nameKo, en: nameEn },
                    nameKo || a.patientCode || ''
                ),
                patientNameEnglish: nameEn,
                type: a.message?.ko || a.type || '',
                timestamp: a.createdAt ? new Date(a.createdAt) : (a.timestamp ? new Date(a.timestamp) : new Date()),
                severity: a.severity?.toLowerCase() || 'caution',
                status: a.status === 'NEW' ? 'active' : (a.status || 'active'), // Ensure 'NEW' is treated as 'active' for display
            };
        } catch (e) {
            console.error('Error mapping alert:', a, e);
            return null;
        }
    }).filter(Boolean) as any[];

    // Filter active alerts
    const activeAlerts = displayAlerts.filter(alert => alert.status === 'active');

    // Extract summary data with proper fallbacks
    const summaryData = summary || {};
    const totalPatients = summaryData.totalPatients || 0;
    const criticalCount = summaryData.criticalPatients || 0;
    const connectedDevices = typeof summaryData.connectedDevices === 'object'
        ? summaryData.connectedDevices?.connected || 0
        : (summaryData.connectedDevices || 0);
    const totalDevices = typeof summaryData.connectedDevices === 'object'
        ? summaryData.connectedDevices?.total || 0
        : (summaryData.totalDevices || 0);

    // Create unified patient list from vitals data
    const createPatientsFromVitals = () => {
        // Merge heart rate and respiratory rate data by patient
        const patientMap = new Map();

        const hrVitals = vitals?.heartRate || [];
        const rrVitals = vitals?.respiratoryRate || [];

        // Add heart rate data
        hrVitals.forEach(hr => {
            if (!hr) return;
            const pId = getBestPatientId(hr);
            if (!pId) return;

            const vitalsHr = hr as any;
            // API returns name as {ko, en} object - check this first
            // Fallback to other possible name fields for backwards compatibility
            const nameData = vitalsHr.name || vitalsHr.fullNameData || vitalsHr.fullName || vitalsHr.nameData || vitalsHr.patientNameData;
            const isNameObject = nameData && typeof nameData === 'object' && (nameData.ko || nameData.en);
            const nameKo = isNameObject ? nameData.ko : (hr.patientName || vitalsHr.nameKorean || '');
            const nameEn = isNameObject ? nameData.en : (hr.patientNameEnglish || vitalsHr.nameEnglish || '');

            patientMap.set(pId, {
                id: pId,
                patientId: pId,
                patientCode: hr.patientCode || '',
                name: getLocalizedText(isNameObject ? nameData : { ko: nameKo, en: nameEn }, nameKo || hr.patientCode || ''),
                heartRate: hr.value || 0,
                breathingRate: 0,
                alertStatus: 'normal' as 'normal' | 'caution' | 'warning' | 'critical',
            });
        });

        // Add respiratory rate data
        rrVitals.forEach(rr => {
            if (!rr) return;
            const pId = getBestPatientId(rr);
            if (!pId) return;

            const existing = patientMap.get(pId);
            if (existing) {
                existing.breathingRate = rr.value || 0;
            } else {
                const vitalsRr = rr as any;
                // API returns name as {ko, en} object - check this first
                const nameData = vitalsRr.name || vitalsRr.fullNameData || vitalsRr.fullName || vitalsRr.nameData || vitalsRr.patientNameData;
                const isNameObject = nameData && typeof nameData === 'object' && (nameData.ko || nameData.en);
                const nameKo = isNameObject ? nameData.ko : (rr.patientName || vitalsRr.nameKorean || '');
                const nameEn = isNameObject ? nameData.en : (rr.patientNameEnglish || vitalsRr.nameEnglish || '');

                patientMap.set(pId, {
                    id: pId,
                    patientId: pId,
                    patientCode: rr.patientCode || '',
                    name: getLocalizedText(isNameObject ? nameData : { ko: nameKo, en: nameEn }, nameKo || rr.patientCode || ''),
                    heartRate: 0,
                    breathingRate: rr.value || 0,
                    alertStatus: 'normal' as 'normal' | 'caution' | 'warning' | 'critical',
                });
            }
        });

        return Array.from(patientMap.values());
    };

    const allPatientsFromVitals = createPatientsFromVitals();

    // Create separate lists for heart rate and breathing rate displays
    const patientsFromHeartRate = allPatientsFromVitals.filter(p => (p.heartRate || 0) > 0);
    const patientsFromBreathingRate = allPatientsFromVitals.filter(p => (p.breathingRate || 0) > 0);
    // Alert management handlers
    const handleAcknowledgeAlert = (alertId: string, note: string) => {
        const targetAlert = alerts.find(a => a.id === alertId);
        if (targetAlert) {
            appendNotificationLog(createLogFromAlert(targetAlert as any, 'acknowledged'));
        }

        dispatch(updateAlert({
            id: alertId,
            updates: {
                status: 'acknowledged',
                acknowledgedAt: new Date().toISOString(),
                acknowledgedBy: 'Admin',
                notes: note
            }
        }));
    };

    const handleResolveAlert = (alertId: string) => {
        const targetAlert = alerts.find(a => a.id === alertId);
        if (targetAlert) {
            appendNotificationLog(createLogFromAlert(targetAlert as any, 'resolved'));
        }

        dispatch(updateAlert({
            id: alertId,
            updates: {
                status: 'resolved',
                resolvedAt: new Date().toISOString(),
                resolvedBy: 'Admin'
            }
        }));
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

    // Helper function to calculate urgency score
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

    // Sort patients by heart rate emergency level
    const patientsByHeartRate = [...patientsFromHeartRate].sort((a, b) => {
        const aUrgency = getHeartRateUrgency(a.heartRate);
        const bUrgency = getHeartRateUrgency(b.heartRate);
        if (bUrgency !== aUrgency) {
            return bUrgency - aUrgency;
        }
        const severityOrder = { critical: 0, warning: 1, caution: 2, normal: 3 };
        const aSeverity = getHeartRateSeverity(a.heartRate);
        const bSeverity = getHeartRateSeverity(b.heartRate);
        return (severityOrder[aSeverity] ?? 3) - (severityOrder[bSeverity] ?? 3);
    });

    // Sort patients by breathing rate emergency level
    const patientsByBreathingRate = [...patientsFromBreathingRate].sort((a, b) => {
        const aUrgency = getBreathingRateUrgency(a.breathingRate);
        const bUrgency = getBreathingRateUrgency(b.breathingRate);
        if (bUrgency !== aUrgency) {
            return bUrgency - aUrgency;
        }

        const severityOrder = { critical: 0, warning: 1, caution: 2, normal: 3 };
        const aSeverity = getBreathingRateSeverity(a.breathingRate);
        const bSeverity = getBreathingRateSeverity(b.breathingRate);
        return (severityOrder[aSeverity] ?? 3) - (severityOrder[bSeverity] ?? 3);
    });


    // Unified Alert Sorting Logic
    const getAlertUrgencyScore = (alert: { type?: string; severity?: string }) => {
        let score = 0;

        // Fall detection gets highest priority
        if (alert.type === '낙상 감지') score += 100;

        // Severity scoring
        if (alert.severity === 'critical' || alert.severity === 'CRITICAL' || alert.severity === 'HIGH') score += 1000;
        if (alert.severity === 'warning' || alert.severity === 'MEDIUM') score += 500;
        if (alert.severity === 'caution' || alert.severity === 'LOW') score += 100;

        return score;
    };

    const sortedActiveAlerts = [...activeAlerts].sort((a, b) =>
        getAlertUrgencyScore(b) - getAlertUrgencyScore(a)
    );

    // Show loading state
    if (loading && alerts.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    // Show error state
    if (error && alerts.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100 max-w-md">
                    <p className="text-red-600 font-bold mb-2">{t('error.loadingData')}</p>
                    <p className="text-red-500 text-xs mb-6 font-medium bg-white/50 p-3 rounded-lg border border-red-50">
                        {typeof error === 'string' ? error : JSON.stringify(error)}
                    </p>
                    <button
                        onClick={() => dispatch(fetchOverviewAsync())}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                    >
                        {t('common.reset')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">

            <SummaryCards
                totalPatients={totalPatients}
                activeAlertsCount={activeAlerts.length}
                criticalCount={criticalCount}
                connectedDevices={connectedDevices}
                totalDevices={totalDevices}
                t={t}
            />

            {sortedActiveAlerts.length > 0 && (
                <EmergencyAlerts
                    alerts={sortedActiveAlerts as any}
                    onViewPatientDetails={onViewPatientDetails}
                    onAcknowledge={handleAcknowledgeAlert}
                    onResolve={handleResolveAlert}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <HeartRateColumn
                    patients={patientsByHeartRate as any}
                    language={language}
                    t={t}
                    onViewPatientDetails={onViewPatientDetails}
                    getHeartRateSeverity={getHeartRateSeverity}
                />

                <BreathingRateColumn
                    patients={patientsByBreathingRate as any}
                    language={language}
                    t={t}
                    onViewPatientDetails={onViewPatientDetails}
                    getBreathingRateSeverity={getBreathingRateSeverity}
                />
            </div>
        </div>
    );
}
