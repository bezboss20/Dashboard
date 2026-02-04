import { apiClient } from './apiClient';
import { deriveHealthStatus, DeviceHealthStatus } from '../utils/statusLabels';
import { PatientDetail, AlertEntry } from '../types/patientDetail';
import { getHeartRateSeverity, getBreathingRateSeverity } from '../utils/dashboardUtils';

const getLocale = (lang: string) => {
    const map: Record<string, string> = {
        'ko': 'ko-KR',
        'en': 'en-US',
        'ja': 'ja-JP',
        'ch': 'zh-CN',
        'es': 'es-ES'
    };
    return map[lang] || 'en-US';
};

export const fetchPatientDetail = async (patientId: string, lang: string, range?: string): Promise<PatientDetail> => {
    const response = await apiClient.get<any>(`/getPatient/${patientId}`, {
        params: { range }
    }) as any;

    if (!response || !response.success || !response.data) {
        throw new Error('Invalid API response');
    }

    const apiData = response.data;
    const patient = apiData.patient;
    const currentVitals = apiData.currentVitals;
    const sleepRecord = apiData.sleepRecord;
    const recentAlerts = apiData.recentAlerts || [];
    const deviceStatus = apiData.deviceStatus;

    // Determine status from vitals using consistent frontend logic
    const hrVal = currentVitals.heartRate?.value || 0;
    const rrVal = currentVitals.respiratory?.value || 0;
    const hrSev = getHeartRateSeverity(hrVal);
    const rrSev = getBreathingRateSeverity(rrVal);

    const severityOrder: Record<string, number> = { 'critical': 3, 'warning': 2, 'caution': 1, 'normal': 0 };
    let highestSev: 'critical' | 'warning' | 'caution' | 'normal' = hrSev;
    if (severityOrder[rrSev] > severityOrder[highestSev]) highestSev = rrSev;

    // Preserve the exact severity string to match statusLabels and translations
    const status = highestSev;
    const statusLabel = highestSev; // 'critical' | 'warning' | 'caution' | 'normal'

    const mapSeverity = (severity: string): 'high' | 'medium' | 'low' => {
        if (severity === 'CRITICAL' || severity === 'HIGH') return 'high';
        if (severity === 'MEDIUM' || severity === 'WARNING') return 'medium';
        return 'low';
    };

    const mapVitalStatus = (severity: string): string => {
        return `status.${severity}`;
    };

    const admissionDate = new Date(); // API default fallback

    // Find latest vital timestamp for lastUpdated
    const lastHrTime = apiData.heartRateMonitoring?.data?.length > 0
        ? apiData.heartRateMonitoring.data[apiData.heartRateMonitoring.data.length - 1].timestamp
        : null;
    const lastRrTime = apiData.respiratoryMonitoring?.data?.length > 0
        ? apiData.respiratoryMonitoring.data[apiData.respiratoryMonitoring.data.length - 1].timestamp
        : null;

    const latestTimestamp = [
        lastHrTime,
        lastRrTime,
        currentVitals.heartRate?.timestamp,
        currentVitals.respiratory?.timestamp,
        apiData.deviceStatus?.updatedAt,
        patient.updatedAt
    ].filter(Boolean).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime())[0];

    const lastUpdated = latestTimestamp ? new Date(latestTimestamp).toISOString() : patient.updatedAt || patient.createdAt || new Date(0).toISOString();

    return {
        mongoId: patient._id || patient.id,
        id: patient._id || patient.id,
        patientCode: patient.patientCode || 'N/A',
        name: patient.fullName?.ko || patient.patientCode,
        englishName: patient.fullName?.en || patient.patientCode,
        age: patient.age || 0,
        gender: patient.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
        room: `${patient.ward?.roomNumber || 0}`,
        status,
        statusLabel: status.toLowerCase(),
        lastUpdated,
        bloodType: 'A+',
        deviceId: deviceStatus?.deviceCode || 'N/A',
        doctor: '김의사',
        doctorEnglish: 'Dr. Kim',
        nurse: '이간호사',
        nurseEnglish: 'Nurse Lee',
        admissionDate: admissionDate.toISOString().split('T')[0].replace(/-/g, '.'),
        admissionDay: 1,
        diagnosis: 'detail.observe',
        patientStatus: patient.status === 'ACTIVE' ? 'ACTIVE' : 'DISCHARGED',
        vitals: {
            hr: {
                value: hrVal,
                status: mapVitalStatus(hrSev),
                isNormal: hrSev === 'normal'
            },
            stressIndex: {
                value: currentVitals.stressIndex?.value || 0,
                status: 'status.normal',
                isNormal: true
            },
            rr: {
                value: rrVal,
                status: mapVitalStatus(rrSev),
                isNormal: rrSev === 'normal'
            },
            sleepIndex: {
                value: sleepRecord?.score || 0,
                status: sleepRecord?.score < 50 ? 'status.critical' : sleepRecord?.score < 70 ? 'status.warning' : 'status.normal',
                isNormal: (sleepRecord?.score || 0) >= 70
            },
            connection: {
                value: deviceStatus?.isConnected ? 'header.systemOnline' : 'header.systemOffline',
                status: deviceStatus?.isConnected ? 'status.normal' : 'status.warning',
                isNormal: deviceStatus?.isConnected || false,
                healthStatus: deriveHealthStatus({
                    connectionStatus: deviceStatus?.isConnected ? 'online' : 'offline',
                    deviceStatus: deviceStatus?.isConnected ? 'normal' : 'error'
                })
            }
        },
        alerts: recentAlerts.slice(0, 5).map((a: any) => {
            const rawMsg = a.message?.ko || a.message?.en || a.message || '';
            let messageKey = rawMsg;
            if (rawMsg.includes('심박수가 임계치를 초과') || rawMsg.includes('Heart rate exceeded')) messageKey = 'alerts.msg.hrExceeded';
            else if (rawMsg.includes('호흡수가 정상 범위를 벗어') || rawMsg.includes('Respiratory rate out of normal')) messageKey = 'alerts.msg.rrOutOfRange';
            else if (rawMsg.includes('낙상') || rawMsg.includes('Fall')) messageKey = 'alerts.msg.fallDetected';
            else if (rawMsg.includes('심박수가 위험 기준치 이하') || rawMsg.includes('Heart rate below')) messageKey = 'alerts.msg.hrLow';
            else if (rawMsg.includes('호흡수가 위험 기준치를 초과') || rawMsg.includes('Respiratory rate exceeded')) messageKey = 'alerts.msg.rrHigh';

            return {
                id: a.id,
                type: a.type || 'ALERT',
                message: messageKey,
                time: new Date(a.createdAt).toLocaleTimeString(getLocale(lang), { hour: '2-digit', minute: '2-digit' }),
                severity: mapSeverity(a.severity)
            } as AlertEntry;
        }),
        hrHistory: (apiData.heartRateMonitoring?.data || []).map((p: any) => ({
            time: new Date(p.timestamp).toLocaleTimeString(getLocale(lang), { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(p.timestamp).getTime(),
            hr: p.value,
            rr: 0
        })),
        rrHistory: (apiData.respiratoryMonitoring?.data || []).map((p: any) => ({
            time: new Date(p.timestamp).toLocaleTimeString(getLocale(lang), { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(p.timestamp).getTime(),
            hr: 0,
            rr: p.value
        })),
        sleepRecord: {
            totalDuration: sleepRecord?.totalSleep?.formatted || '0h 0m',
            deep: {
                label: 'detail.deepSleep',
                duration: `${Math.floor((sleepRecord?.deepSleep?.duration || 0) / 60)}h ${(sleepRecord?.deepSleep?.duration || 0) % 60}m`,
                pct: Math.round(((sleepRecord?.deepSleep?.duration || 0) / (sleepRecord?.totalSleep?.duration || 1)) * 100)
            },
            light: {
                label: 'detail.lightSleep',
                duration: `${Math.floor((sleepRecord?.lightSleep?.duration || 0) / 60)}h ${(sleepRecord?.lightSleep?.duration || 0) % 60}m`,
                pct: Math.round(((sleepRecord?.lightSleep?.duration || 0) / (sleepRecord?.totalSleep?.duration || 1)) * 100)
            },
            rem: {
                label: 'detail.remSleep',
                duration: `${Math.floor((sleepRecord?.remSleep?.duration || 0) / 60)}h ${(sleepRecord?.remSleep?.duration || 0) % 60}m`,
                pct: Math.round(((sleepRecord?.remSleep?.duration || 0) / (sleepRecord?.totalSleep?.duration || 1)) * 100)
            },
            awake: {
                label: 'detail.awake',
                duration: `${Math.floor((sleepRecord?.awake?.duration || 0) / 60)}h ${(sleepRecord?.awake?.duration || 0) % 60}m`,
                pct: Math.round(((sleepRecord?.awake?.duration || 0) / (sleepRecord?.totalSleep?.duration || 1)) * 100)
            }
        }
    };
};

export const updatePatientStatus = async (id: string, status: string) => {
    return apiClient.post('/update-patient', {
        _id: id,
        status: status
    });
};
