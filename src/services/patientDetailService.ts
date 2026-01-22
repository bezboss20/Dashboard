import { apiClient } from './apiClient';
import { deriveHealthStatus, DeviceHealthStatus } from '../utils/statusLabels';
import { PatientDetail, AlertEntry } from '../types/patientDetail';

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

export const fetchPatientDetail = async (patientId: string, lang: string): Promise<PatientDetail> => {
    const response = await apiClient.get<any>(`/getPatient/${patientId}`) as any;

    if (!response || !response.success || !response.data) {
        throw new Error('Invalid API response');
    }

    const apiData = response.data;
    const patient = apiData.patient;
    const currentVitals = apiData.currentVitals;
    const sleepRecord = apiData.sleepRecord;
    const recentAlerts = apiData.recentAlerts || [];
    const deviceStatus = apiData.deviceStatus;

    // Determine status from vitals
    let status: 'STABLE' | 'WARNING' | 'CRITICAL' = 'STABLE';
    if (currentVitals.heartRate?.status?.includes('CRITICAL') || currentVitals.respiratory?.status?.includes('CRITICAL')) {
        status = 'CRITICAL';
    } else if (currentVitals.heartRate?.status?.includes('WARNING') || currentVitals.respiratory?.status?.includes('WARNING')) {
        status = 'WARNING';
    }

    const mapSeverity = (severity: string): 'high' | 'medium' | 'low' => {
        if (severity === 'CRITICAL' || severity === 'HIGH') return 'high';
        if (severity === 'MEDIUM' || severity === 'WARNING') return 'medium';
        return 'low';
    };

    const mapVitalStatus = (apiStatus: string): string => {
        if (apiStatus?.includes('CRITICAL')) return 'status.critical';
        if (apiStatus?.includes('WARNING')) return 'status.warning';
        if (apiStatus?.includes('CAUTION')) return 'status.caution';
        return 'status.normal';
    };

    const admissionDate = new Date(); // API default fallback

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
        lastUpdated: 'time.justNow',
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
                value: currentVitals.heartRate?.value || 0,
                status: mapVitalStatus(currentVitals.heartRate?.status),
                isNormal: currentVitals.heartRate?.status === 'NORMAL'
            },
            stressIndex: {
                value: currentVitals.stressIndex?.value || 0,
                status: 'status.normal',
                isNormal: true
            },
            rr: {
                value: currentVitals.respiratory?.value || 0,
                status: mapVitalStatus(currentVitals.respiratory?.status),
                isNormal: currentVitals.respiratory?.status === 'NORMAL'
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

            // Note: Message translation key logic is kept in component/hook 
            // or we return the raw key here and translate in UI.
            // For now, returning raw or key is fine, translation layer usually handles mapping.
            // We'll return the rawMsg here to be key-mapped in the hook or component if needed.
            // Actually, better to map to keys here if we want the service to be pure data.
            // But strict translation logic depends on `t` which is in hook.
            // Let's return rawMsg and let hook handle mapping to `t` keys if standard strings.
            // OR replicate the mapping logic here as "backend data prep".

            // Let's simple return raw and let the hook map it, 
            // OR duplicate the mapping logic for keys.
            // The original code did mapping inside `getPatientDetail`.
            // We will do it here to keep the object clean.

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
