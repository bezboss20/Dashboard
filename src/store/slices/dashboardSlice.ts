import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchDashboardOverview } from '../../services/dashboardService';
import { SummaryData, AlertData, VitalData } from '../../types/dashboard';

// Re-export types for backward compatibility if needed in components
export type { SummaryData, AlertData, VitalData };

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
            const data = await fetchDashboardOverview();
            return data;
        } catch (error) {
            console.error('Dashboard API - Error caught:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            return rejectWithValue(errorMessage);
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
