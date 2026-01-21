import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Type definitions matching the API response
export interface Alert {
    _id: string;
    alertType: string;
    category: string;
    severity: string;
    message: {
        ko: string;
        en: string;
    };
    currentValue: string;
    thresholdValue: string;
    status: string;
    createdAt: string;
    patient: {
        _id: string;
        patientCode: string;
        fullName: {
            ko: string;
            en: string;
        };
        dateOfBirth: string;
        gender: string;
        contact: {
            phone: string;
            emergencyPhone: string;
        };
        ward: {
            wardId: string;
            roomNumber: number;
            bedNumber: number;
        };
        status: string;
        facilityName: string;
    };
    device: {
        _id: string;
        deviceCode: string;
        serialNumber: string;
        manufacturer: string;
        status: string;
    };
}

interface AlertsData {
    alerts: Alert[];
    totalCount: number;
    total?: number; // For backward compatibility
    page: number;
    limit: number;
    totalPages: number;
}

interface AlertsResponse {
    success: boolean;
    data: AlertsData;
}

interface AlertsState {
    alerts: Alert[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
}

const initialState: AlertsState = {
    alerts: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    loading: false,
    error: null,
};

// Async thunk for fetching alerts
export const fetchAlertsAsync = createAsyncThunk(
    'alerts/fetchAlertsAsync',
    async (params: {
        page?: number;
        limit?: number;
        search?: string;
        startDate?: string;
        endDate?: string;
    } = {}, { rejectWithValue }) => {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            queryParams.append('page', String(params.page || 1));
            queryParams.append('limit', String(params.limit = 15));
            if (params.search) {
                queryParams.append('search', params.search);
            }
            if (params.startDate) {
                queryParams.append('startDate', params.startDate);
            }
            if (params.endDate) {
                queryParams.append('endDate', params.endDate);
            }

            const apiUrl = `https://kaleidoscopically-prorailroad-kris.ngrok-free.dev/getAll-alerts?${queryParams.toString()}`;
            console.log('Alerts API - Calling:', apiUrl);

            const response = await axios.get<AlertsResponse>(
                apiUrl,
                {
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                }
            );

            console.log('Alerts API Response:', response.data);

            if (response.data.success) {
                const apiData = response.data.data;
                // Map totalCount to total for consistency
                const normalizedData = {
                    alerts: apiData.alerts,
                    total: apiData.totalCount || apiData.total || 0,
                    page: apiData.page,
                    limit: apiData.limit,
                    totalPages: apiData.totalPages
                };
                console.log('Alerts API - Returning:', normalizedData);
                return normalizedData;
            }
            console.error('Alerts API - Success was false');
            return rejectWithValue('API returned unsuccessful response');
        } catch (error) {
            console.error('Alerts API - Error caught:', error);
            if (axios.isAxiosError(error)) {
                console.error('Alerts API - Axios Error:', error.response?.status, error.response?.data);
                return rejectWithValue(error.message);
            }
            console.error('Alerts API - Unknown error:', error);
            return rejectWithValue('An unexpected error occurred');
        }
    }
);

const alertsSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAlertsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAlertsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.alerts = action.payload.alerts;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchAlertsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = alertsSlice.actions;

export default alertsSlice.reducer;
