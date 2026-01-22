export type PatientStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';

export interface Patient {
    id: string;
    patientCode: string;
    fullName?: {
        ko: string;
        en: string;
    };
    age: number;
    gender: 'MALE' | 'FEMALE';
    status: PatientStatus;
    ward?: {
        roomNumber: string;
    };
    currentVitals?: {
        heartRate?: {
            value: number;
            status: string;
        };
        respiratory?: {
            value: number;
            status: string;
        };
    };
    deviceStatus?: {
        isConnected: boolean;
        deviceCode: string;
    };
    sleepRecord?: {
        stage?: string;
        score?: number;
    };
    registrationDate?: string;
    _id?: string;
}

export interface PatientsResponse {
    success: boolean;
    data: {
        patients: Patient[];
        total: number;
    } | Patient[]; // API might return array directly or object
}

export interface PatientsQueryParams {
    page?: number;
    limit?: number;
    patientStatus?: string;
    search?: string;
    date?: string;
}

// Mapped format for UI consumption (flat structure)
export interface MappedPatient {
    id: string;
    name: string;
    nameKorean: string;
    nameEnglish: string;
    heartRate: number;
    breathingRate: number;
    sleepState: string;
    deviceStatus: string;
    deviceId: string;
    lastUpdated: Date | string;
    patientStatus: PatientStatus;
    sensorConnected: boolean;
    alertStatus: 'normal' | 'caution' | 'warning' | 'critical';
    stressIndex: number;
    sleepScore: number;
    radarDetection: boolean;
    heartRateHistory?: any;
    breathingRateHistory?: any;
    personalInfo?: any;
    registrationDate?: string;
    patientCode?: string;
}
