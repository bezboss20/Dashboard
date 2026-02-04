import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchOverviewAsync, updateAlert } from '../store/slices/dashboardSlice';
import { appendNotificationLog, createLogFromAlert } from '../data/notificationLogStore';
import { useLanguage } from '../context/LanguageContext';
import { getBestPatientId, getHeartRateSeverity, getBreathingRateSeverity } from '../utils/dashboardUtils';

export function useDashboardData() {
    const dispatch = useDispatch<AppDispatch>();
    const { summary, alerts, vitals, loading, error, lastUpdated } = useSelector((state: RootState) => state.dashboard);
    const { getLocalizedText } = useLanguage();

    useEffect(() => {
        dispatch(fetchOverviewAsync());
        const interval = setInterval(() => {
            dispatch(fetchOverviewAsync());
        }, 10000);
        return () => clearInterval(interval);
    }, [dispatch]);

    // Data Mapping Logic
    const patientIdMap = new Map<string, string>();
    const allVitals = [...(vitals?.heartRate || []), ...(vitals?.respiratoryRate || [])];
    allVitals.forEach(v => {
        if (v?.patientCode && v?.patientId && String(v.patientId).length > 20) {
            patientIdMap.set(v.patientCode, String(v.patientId));
        }
    });

    const displayAlerts = (alerts || []).slice(0, 50).map((a, idx) => {
        try {
            let pId = getBestPatientId(a);
            if (!pId && a.patientCode && patientIdMap.has(a.patientCode)) {
                pId = patientIdMap.get(a.patientCode)!;
            }

            const patientObj = (a.patient || {}) as any;
            const rawPatientName = (a as any).patientName;
            const isPatientNameObject = rawPatientName && typeof rawPatientName === 'object' && (rawPatientName.ko || rawPatientName.en);
            const patientNameData = isPatientNameObject ? rawPatientName : (a.patientNameData || (a as any).fullNameData || (a as any).fullName || patientObj.fullName || patientObj.fullNameData);

            const nameEn = patientNameData?.en || a.patientNameEnglish || (a as any).nameEnglish || patientObj.nameEnglish || '';
            const nameKo = patientNameData?.ko || (typeof rawPatientName === 'string' ? rawPatientName : '') || (a as any).nameKorean || patientObj.nameKorean || patientObj.name || '';

            return {
                ...a,
                patientId: pId,
                patientName: getLocalizedText(
                    patientNameData || { ko: nameKo, en: nameEn },
                    nameKo || a.patientCode || ''
                ),
                patientNameEnglish: nameEn,
                type: a.message?.ko || a.type || '',
                timestamp: a.createdAt ? new Date(a.createdAt) : (a.timestamp ? new Date(a.timestamp) : new Date()),
                severity: a.severity?.toLowerCase() || 'caution',
                status: a.status === 'NEW' ? 'active' : (a.status || 'active'),
                value: a.currentValue || (a as any).value || '',
            };
        } catch (e) {
            return null;
        }
    }).filter(Boolean) as any[];

    const activeAlerts = displayAlerts.filter(alert => alert.status === 'active');

    // Sorting Alerts
    const getAlertUrgencyScore = (alert: { type?: string; severity?: string }) => {
        let score = 0;
        if (alert.type === '낙상 감지') score += 100;
        if (alert.severity === 'critical' || alert.severity === 'CRITICAL' || alert.severity === 'HIGH') score += 1000;
        if (alert.severity === 'warning' || alert.severity === 'MEDIUM') score += 500;
        if (alert.severity === 'caution' || alert.severity === 'LOW') score += 100;
        return score;
    };

    const sortedActiveAlerts = [...activeAlerts].sort((a, b) =>
        getAlertUrgencyScore(b) - getAlertUrgencyScore(a)
    );

    // Vitals Logic
    const createPatientsFromVitals = () => {
        const patientMap = new Map();
        const hrVitals = vitals?.heartRate || [];
        const rrVitals = vitals?.respiratoryRate || [];

        let maxVitalTimestamp: Date | null = null;

        const processVital = (vital: any, type: 'hr' | 'rr') => {
            if (!vital) return;
            const pId = getBestPatientId(vital);
            if (!pId) return;

            const vitalsObj = vital as any;
            const nameData = vitalsObj.name || vitalsObj.fullNameData || vitalsObj.fullName || vitalsObj.nameData || vitalsObj.patientNameData;
            const isNameObject = nameData && typeof nameData === 'object' && (nameData.ko || nameData.en);
            const nameKo = isNameObject ? nameData.ko : (vital.patientName || vitalsObj.nameKorean || '');
            const nameEn = isNameObject ? nameData.en : (vital.patientNameEnglish || vitalsObj.nameEnglish || '');

            const existing = patientMap.get(pId) || {
                id: pId,
                patientId: pId,
                patientCode: vital.patientCode || '',
                name: getLocalizedText(isNameObject ? nameData : { ko: nameKo, en: nameEn }, nameKo || vital.patientCode || ''),
                heartRate: 0,
                breathingRate: 0,
                hrLastUpdated: null as Date | null,
                rrLastUpdated: null as Date | null,
                alertStatus: 'normal' as 'normal' | 'caution' | 'warning' | 'critical',
            };

            const vitalTimestamp = vital.timestamp || vital.createdAt || vital.updatedAt || vitalsObj.updated_at || (type === 'hr' ? vitalsObj.latestHeartRate?.timestamp : vitalsObj.latestRespiratoryRate?.timestamp);
            const currentVitalDate = vitalTimestamp ? new Date(vitalTimestamp) : null;

            if (currentVitalDate && (!maxVitalTimestamp || currentVitalDate > maxVitalTimestamp)) {
                maxVitalTimestamp = currentVitalDate;
            }

            if (type === 'hr') {
                existing.heartRate = vital.value || 0;
                if (currentVitalDate) existing.hrLastUpdated = currentVitalDate;
            } else if (type === 'rr') {
                existing.breathingRate = vital.value || 0;
                if (currentVitalDate) existing.rrLastUpdated = currentVitalDate;
            }

            // Re-calculate alertStatus based on updated vitals
            const hrSev = getHeartRateSeverity(existing.heartRate);
            const rrSev = getBreathingRateSeverity(existing.breathingRate);
            const severityOrder: Record<string, number> = { 'critical': 3, 'warning': 2, 'caution': 1, 'normal': 0 };

            let currentSev = existing.alertStatus;
            if (severityOrder[hrSev] > severityOrder[currentSev]) currentSev = hrSev;
            if (severityOrder[rrSev] > severityOrder[currentSev]) currentSev = rrSev;
            existing.alertStatus = currentSev;

            patientMap.set(pId, existing);
        };

        hrVitals.forEach(hr => processVital(hr, 'hr'));
        rrVitals.forEach(rr => processVital(rr, 'rr'));

        return { patients: Array.from(patientMap.values()), latestBatchTime: maxVitalTimestamp as Date | null };
    };

    const { patients: allPatientsFromVitals, latestBatchTime: dataMaxTime } = createPatientsFromVitals();

    // Use the newest timestamp from the actual data records to drive the header,
    // matching the Monitoring View's "Truthful" logic.
    const calculatedLastUpdated = dataMaxTime
        ? dataMaxTime.toISOString()
        : (lastUpdated || new Date().toISOString());

    const patientsFromHeartRate = allPatientsFromVitals
        .filter((p: any) => (p.heartRate || 0) > 0)
        .map((p: any) => ({ ...p, lastUpdated: p.hrLastUpdated || dataMaxTime || calculatedLastUpdated }));
    const patientsFromBreathingRate = allPatientsFromVitals
        .filter((p: any) => (p.breathingRate || 0) > 0)
        .map((p: any) => ({ ...p, lastUpdated: p.rrLastUpdated || dataMaxTime || calculatedLastUpdated }));

    const severityScore: Record<string, number> = { 'critical': 3, 'warning': 2, 'caution': 1, 'normal': 0 };

    const getHeartRateUrgency = (hr: number) => {
        const sev = getHeartRateSeverity(hr);
        const tierBase = severityScore[sev] * 1000;
        let distance = 0;
        if (hr > 85) distance = hr - 85;
        else if (hr < 65) distance = 65 - hr;
        return tierBase + distance;
    };

    const getBreathingRateUrgency = (br: number) => {
        const sev = getBreathingRateSeverity(br);
        const tierBase = severityScore[sev] * 1000;
        let distance = 0;
        if (br > 20) distance = br - 20;
        else if (br < 14) distance = 14 - br;
        return tierBase + distance;
    };

    const patientsByHeartRate = [...patientsFromHeartRate].sort((a: any, b: any) => {
        return getHeartRateUrgency(b.heartRate) - getHeartRateUrgency(a.heartRate);
    });

    const patientsByBreathingRate = [...patientsFromBreathingRate].sort((a: any, b: any) => {
        return getBreathingRateUrgency(b.breathingRate) - getBreathingRateUrgency(a.breathingRate);
    });

    const handleAcknowledgeAlert = (alertId: string, note: string) => {
        const targetAlert = alerts.find(a => a.id === alertId);
        if (targetAlert) {
            appendNotificationLog(createLogFromAlert(targetAlert as any, 'acknowledged'));
        }
        dispatch(updateAlert({
            id: alertId,
            updates: { status: 'acknowledged', acknowledgedAt: new Date().toISOString(), acknowledgedBy: 'Admin', notes: note }
        }));
    };

    const handleResolveAlert = (alertId: string) => {
        const targetAlert = alerts.find(a => a.id === alertId);
        if (targetAlert) {
            appendNotificationLog(createLogFromAlert(targetAlert as any, 'resolved'));
        }
        dispatch(updateAlert({
            id: alertId,
            updates: { status: 'resolved', resolvedAt: new Date().toISOString(), resolvedBy: 'Admin' }
        }));
    };

    return {
        summary,
        loading,
        error,
        sortedActiveAlerts,
        patientsByHeartRate,
        patientsByBreathingRate,
        handleAcknowledgeAlert,
        handleResolveAlert,
        lastUpdated: calculatedLastUpdated,
        refetch: () => dispatch(fetchOverviewAsync())
    };
}
