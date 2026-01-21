// Export store and types
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Export dashboard slice and actions
export {
    fetchOverviewAsync,
    setSummary,
    setAlerts,
    addAlert,
    updateAlert,
    setVitals,
    clearError,
} from './slices/dashboardSlice';

export type {
    VitalData,
    AlertData,
    SummaryData,
    OverviewResponse,
} from './slices/dashboardSlice';
