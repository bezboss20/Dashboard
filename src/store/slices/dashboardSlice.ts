import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types based on the API response structure
export interface VitalData {
    patientId?: string;
    patientCode?: string;    // API returns patientCode like "PAT-00006"
    name?: string;           // API uses 'name' not 'patientName'
    patientName?: string;    // Keep for backwards compatibility
    patientNameEnglish?: string;
    value: number | null;    // Can be null in API response
    unit?: string;           // "BPM" or "RPM"
    timestamp?: string;
    status?: 'normal' | 'caution' | 'warning' | 'critical';
}

export interface AlertData {
    id: string;
    patientId?: string;
    patientCode?: string;      // API returns patientCode like "PAT-00018"
    patientName: string;
    patientNameEnglish?: string;
    type?: '심박 위급' | '호흡 위급' | '낙상 감지' | string;
    severity: 'critical' | 'warning' | 'caution' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    message?: {                // API returns message as object with ko/en
        ko: string;
        en: string;
    };
    timestamp?: string;
    createdAt?: string;        // API uses createdAt instead of timestamp
    status?: 'active' | 'acknowledged' | 'resolved' | 'NEW';
    value?: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    resolvedAt?: string;
    resolvedBy?: string;
    notes?: string;
}

export interface ConnectedDevicesData {
    connected: number;
    total: number;
}

export interface SummaryData {
    totalPatients?: number;
    activeAlerts?: number;
    criticalPatients?: number;
    connectedDevices?: ConnectedDevicesData | number; // API returns object, but we handle both
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

interface DashboardState {
    summary: SummaryData;
    alerts: AlertData[];
    vitals: {
        heartRate: VitalData[];
        respiratoryRate: VitalData[];
    };
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

const initialState: DashboardState = {
    summary: {
        totalPatients: 0,
        activeAlerts: 0,
        criticalPatients: 0,
        connectedDevices: 0,
        totalDevices: 0,
    },
    alerts: [],
    vitals: {
        heartRate: [],
        respiratoryRate: [],
    },
    loading: false,
    error: null,
    lastUpdated: null,
};

// Async thunk for fetching overview data
export const fetchOverviewAsync = createAsyncThunk(
    'dashboard/fetchOverviewAsync',
    async (_, { rejectWithValue }) => {
        try {
            const apiUrl = 'https://kaleidoscopically-prorailroad-kris.ngrok-free.dev/overview';
            console.log('Dashboard API - Calling:', apiUrl);

            const response = await axios.get<any>(
                apiUrl,
                {
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                }
            );

            console.log('Dashboard API Raw Response:', response.data);

            const responseData = response.data;
            if (!responseData) {
                return rejectWithValue('Empty response from server');
            }

            // Handle structure: data might be nested under 'data' or top-level
            // If responseData.success is true, look in responseData.data
            // Otherwise check if responseData itself has dashboard properties
            let extractedData = null;

            if (responseData.success === true && responseData.data) {
                extractedData = responseData.data;
            } else if (responseData.summary || responseData.alerts || responseData.vitals) {
                // Probable top-level structure
                extractedData = responseData;
            } else if (responseData.data && (responseData.data.summary || responseData.data.alerts)) {
                // Success flag might be missing but 'data' exists
                extractedData = responseData.data;
            }

            if (extractedData) {
                console.log('Dashboard API - Successfully extracted data:', extractedData);
                return extractedData;
            }

            console.error('Dashboard API - Failed to find data in response:', responseData);
            return rejectWithValue('API returned invalid data format');
        } catch (error) {
            console.error('Dashboard API - Error caught:', error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || error.message;
                return rejectWithValue(errorMessage);
            }
            return rejectWithValue('An unexpected error occurred');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        // Manual setters for local updates
        setSummary: (state, action: PayloadAction<SummaryData>) => {
            state.summary = { ...state.summary, ...action.payload };
        },
        setAlerts: (state, action: PayloadAction<AlertData[]>) => {
            state.alerts = action.payload;
        },
        addAlert: (state, action: PayloadAction<AlertData>) => {
            state.alerts.unshift(action.payload);
        },
        updateAlert: (state, action: PayloadAction<{ id: string; updates: Partial<AlertData> }>) => {
            const index = state.alerts.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
                state.alerts[index] = { ...state.alerts[index], ...action.payload.updates };
            }
        },
        setVitals: (state, action: PayloadAction<{ heartRate: VitalData[]; respiratoryRate: VitalData[] }>) => {
            state.vitals = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOverviewAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOverviewAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.summary = action.payload.summary;
                state.alerts = action.payload.alerts;
                state.vitals = action.payload.vitals;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchOverviewAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setSummary,
    setAlerts,
    addAlert,
    updateAlert,
    setVitals,
    clearError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
