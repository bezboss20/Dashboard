import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchPatients } from '../../services/patientService';

export type PatientStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';

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

// Patient interface matching API response
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
    };
}

interface MonitoringState {
    patients: Patient[];
    total: number;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

const initialState: MonitoringState = {
    patients: [],
    total: 0,
    loading: false,
    error: null,
    lastUpdated: null,
};

// Async thunk for fetching patients with query parameters
export const fetchPatientsAsync = createAsyncThunk(
    'monitoring/fetchPatientsAsync',
    async (params: {
        page?: number;
        limit?: number;
        patientStatus?: string;
        search?: string;
        date?: string;
    } = {}, { rejectWithValue }) => {
        try {
            // console.log('Monitoring API - Calling with params:', params);
            const { patients, total } = await fetchPatients(params);

            // console.log('Monitoring API - Returned:', { patientsCount: patients.length, total });
            return { patients, total };
        } catch (error) {
            console.error('Monitoring API - Error caught:', error);
            return rejectWithValue(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    }
);

const monitoringSlice = createSlice({
    name: 'monitoring',
    initialState,
    reducers: {
        setPatients: (state, action: PayloadAction<Patient[]>) => {
            state.patients = action.payload;
        },
        updatePatientStatusLocal: (state, action: PayloadAction<{ id: string; status: PatientStatus }>) => {
            const { id, status } = action.payload;
            const patient = state.patients.find(p => p.id === id || (p as any)._id === id);
            if (patient) {
                patient.status = status;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPatientsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPatientsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.patients = action.payload.patients;
                state.total = action.payload.total;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchPatientsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setPatients, updatePatientStatusLocal, clearError } = monitoringSlice.actions;

export default monitoringSlice.reducer;
