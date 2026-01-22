export interface VitalData {
    patientId?: string;
    patientCode?: string;
    name?: string;
    patientName?: string;
    patientNameEnglish?: string;
    nameData?: Record<string, string>;
    value: number | null;
    unit?: string;
    timestamp?: string;
    status?: 'normal' | 'caution' | 'warning' | 'critical';
}

export interface AlertData {
    id: string;
    patientId?: string;
    patientCode?: string;
    patientName: string;
    patientNameEnglish?: string;
    patientNameData?: Record<string, string>;
    type?: string;
    severity: 'critical' | 'warning' | 'caution' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    message?: {
        ko: string;
        en: string;
    };
    timestamp?: string;
    createdAt?: string;
    status?: 'active' | 'acknowledged' | 'resolved' | 'NEW';
    value?: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    resolvedAt?: string;
    resolvedBy?: string;
    notes?: string;
    patient?: {
        id: string;
        fullName?: { ko: string; en: string };
        fullNameData?: { ko: string; en: string };
        name?: string;
        nameKorean?: string;
        nameEnglish?: string;
    };
}

export interface ConnectedDevicesData {
    connected: number;
    total: number;
}

export interface SummaryData {
    totalPatients?: number;
    activeAlerts?: number;
    criticalPatients?: number;
    connectedDevices?: ConnectedDevicesData | number;
    totalDevices?: number;
}

export interface OverviewResponse {
    success: boolean;
    data: {
        summary: SummaryData;
        alerts: AlertData[];
        vitals: {
            heartRate: VitalData[];
            respiratoryRate: VitalData[];
        };
    };
}
