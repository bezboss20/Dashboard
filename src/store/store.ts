import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import monitoringReducer from './slices/monitoringSlice';
import alertsReducer from './slices/alertsSlice';
import sleepReducer from './slices/sleepSlice';

export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        monitoring: monitoringReducer,
        alerts: alertsReducer,
        sleep: sleepReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serializable check (dates might be used)
                ignoredActions: [
                    'dashboard/fetchOverviewAsync/fulfilled',
                    'monitoring/fetchPatientsAsync/fulfilled',
                    'alerts/fetchAlertsAsync/fulfilled',
                    'sleep/fetchSleepAnalyticsAsync/fulfilled'
                ],
            },
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
