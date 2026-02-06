import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface SleepSummary {
    totalDuration: string;
    totalDurationMinutes: number;
    efficiency: number;
    interruptions: number;
    latency: number;
}

export interface SleepTimeInfo {
    bedIn: string;
    sleepStart: string;
    wakeUp: string;
    bedOut: string;
}

export interface SleepStagePoint {
    time: string;
    awake: number;
    light: number;
    deep: number;
    rem: number;
}

export interface StagePercentages {
    awake: number;
    light: number;
    deep: number;
    rem: number;
}

export interface WeeklyTrend {
    day: string;
    duration: number;
    durationFormatted: string;
}

export interface VitalCorrelation {
    type: string;
    value: number;
    unit: string;
}

export interface SleepAnalyticsData {
    summary: SleepSummary;
    timeInfo: SleepTimeInfo;
    stageGraph: SleepStagePoint[];
    stagePercentages: StagePercentages;
    weeklyTrend: WeeklyTrend[];
    vitalCorrelations: VitalCorrelation[];
}

export interface SleepAnalyticsResponse {
    success: boolean;
    data: SleepAnalyticsData;
}

interface SleepState {
    analytics: SleepAnalyticsData | null;
    loading: boolean;
    error: string | null;
    currentPatientId: string | null;
}

const initialState: SleepState = {
    analytics: null,
    loading: false,
    error: null,
    currentPatientId: null,
};

// Async thunk for fetching sleep analytics
export const fetchSleepAnalyticsAsync = createAsyncThunk(
    'sleep/fetchSleepAnalyticsAsync',
    async (patientId: string, { rejectWithValue }) => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kaleidoscopically-prorailroad-kris.ngrok-free.dev';
            const apiUrl = `${baseUrl}/analytics/${patientId}`;

            const response = await axios.get<SleepAnalyticsResponse>(
                apiUrl,
                {
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                }
            );

            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue('API returned unsuccessful response');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data?.message || error.message);
            }
            return rejectWithValue('An unexpected error occurred');
        }

    }
);

const sleepSlice = createSlice({
    name: 'sleep',
    initialState,
    reducers: {
        setCurrentPatientId: (state, action: PayloadAction<string>) => {
            state.currentPatientId = action.payload;
        },
        clearSleepAnalytics: (state) => {
            state.analytics = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSleepAnalyticsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSleepAnalyticsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(fetchSleepAnalyticsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setCurrentPatientId, clearSleepAnalytics } = sleepSlice.actions;

export default sleepSlice.reducer;
