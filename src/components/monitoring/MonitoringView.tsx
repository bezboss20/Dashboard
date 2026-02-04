import { PatientOverviewTable } from './PatientOverviewTable';
import { PatientFilterBar } from './PatientFilterBar';
import { useMonitoringViewModel } from '../../hooks/useMonitoringViewModel';

interface MonitoringViewProps {
    model: ReturnType<typeof useMonitoringViewModel>;
    onViewPatientDetails: (patientId: string) => void;
    onViewSleepPage?: (patientId: string) => void;
}

export function MonitoringView({ model, onViewPatientDetails, onViewSleepPage }: MonitoringViewProps) {
    const {
        loading,
        error,
        displayPatients,
        patientCounts,
        selectedPatientId,
        setSelectedPatientId,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        selectedDate,
        setSelectedDate,
        refresh,
        lastUpdated,
        t
    } = model;





    return (
        <div className="space-y-4">
            {/* Patient Filter Bar */}
            <PatientFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                patientCounts={patientCounts}
                t={t}
            />

            {/* Loading state */}
            {loading && displayPatients.length === 0 && (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
                </div>
            )}

            {/* Error state */}
            {error && displayPatients.length === 0 && !loading && (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 font-medium mb-2">{t('error.loadingData')}</p>
                        <button
                            onClick={refresh}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                            {t('common.reset')}
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state when no patients and NO error */}
            {displayPatients.length === 0 && !loading && !error && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    {t('common.noResults') || 'No patients found'}
                </div>
            )}

            {/* Patient Overview Table */}
            {displayPatients.length > 0 && (
                <PatientOverviewTable
                    patients={displayPatients}
                    globalLastUpdated={lastUpdated || undefined}
                    selectedPatientId={selectedPatientId}
                    onSelectPatient={setSelectedPatientId}
                    onViewPatientDetails={onViewPatientDetails}
                    onViewSleepPage={onViewSleepPage}
                    searchQuery={searchQuery}
                />
            )}
        </div>
    );
}
