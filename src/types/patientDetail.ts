import { DeviceHealthStatus } from '../utils/statusLabels';

export type TimeRange = '5분' | '15분' | '30분' | '1시간' | '6시간' | '24시간';

export interface VitalMetric {
    value: number | string;
    status: string;
    isNormal: boolean;
}

export interface AlertEntry {
    id: string;
    type: string;
    message: string;
    time: string;
    severity: 'high' | 'medium' | 'low';
}

export interface MonitoringPoint {
    time: string;
    timestamp: number;
    hr: number;
    rr: number;
}

export interface PatientDetail {
    mongoId: string;
    id: string;
    patientCode: string;
    name: string;
    englishName: string;
    age: number;
    gender: string;
    room: string;
    status: 'normal' | 'caution' | 'warning' | 'critical' | 'STABLE' | 'WARNING' | 'CRITICAL';
    statusLabel: string;
    lastUpdated: string;
    bloodType: string;
    deviceId: string;
    doctor: string;
    doctorEnglish: string;
    nurse: string;
    nurseEnglish: string;
    admissionDate: string;
    admissionDay: number;
    diagnosis: string;
    patientStatus: 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';
    vitals: {
        hr: VitalMetric;
        stressIndex: VitalMetric;
        rr: VitalMetric;
        sleepIndex: VitalMetric;
        connection: VitalMetric & { healthStatus: DeviceHealthStatus };
    };
    alerts: AlertEntry[];
    hrHistory: MonitoringPoint[];
    rrHistory: MonitoringPoint[];
    sleepRecord: {
        totalDuration: string;
        deep: { label: string; duration: string; pct: number };
        light: { label: string; duration: string; pct: number };
        rem: { label: string; duration: string; pct: number };
        awake: { label: string; duration: string; pct: number };
    };
}
