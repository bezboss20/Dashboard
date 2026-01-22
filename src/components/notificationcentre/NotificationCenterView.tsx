import { ArrowDownUp } from "lucide-react";
import { FiltersBar } from "./FiltersBar";
import { NotificationsTable } from "./NotificationsTable";
import { PaginationBar } from "./PaginationBar";
import { useNotifications } from "../../hooks/useNotifications";

interface NotificationCenterViewProps {
    model: ReturnType<typeof useNotifications>;
    onViewPatientDetails?: (patientId: string) => void;
}

export function NotificationCenterView({ model, onViewPatientDetails }: NotificationCenterViewProps) {
    const {
        displayAlerts,
        loading,
        error,
        total,
        totalPages,
        currentPage,
        startIndex,
        itemsPerPage,
        dateFrom,
        dateTo,
        searchTerm,
        setDateFrom,
        setDateTo,
        handleSearchChange,
        handlePageChange,
        retry,
        t
    } = model;

    return (
        <div className="p-0 lg:p-6 space-y-4 lg:space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">
                    {t('notifications.history')}
                </h1>
            </div>

            {/* Notification Logs Section */}
            <section>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <div className="flex items-center gap-2">
                            <ArrowDownUp className="w-5 h-5 text-green-600" />
                            <h2 className="text-base lg:text-lg font-bold text-gray-900">
                                {t('notifications.logs')}
                            </h2>
                        </div>
                    </div>

                    {/* Filters */}
                    <FiltersBar
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        searchTerm={searchTerm}
                        onDateFromChange={setDateFrom}
                        onDateToChange={setDateTo}
                        onSearchChange={handleSearchChange}
                        t={t}
                    />

                    {/* Loading State */}
                    {loading && displayAlerts.length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && displayAlerts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-red-500 font-medium mb-2">{t('error.loadingData')}</p>
                            <button
                                onClick={retry}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                                {t('common.retry') || 'Retry'}
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    {!loading && displayAlerts.length > 0 && (
                        <NotificationsTable
                            logs={displayAlerts}
                            onViewPatientDetails={onViewPatientDetails}
                            t={t}
                        />
                    )}

                    {/* Empty State */}
                    {!loading && !error && displayAlerts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {t('common.noResults') || 'No alerts found'}
                        </div>
                    )}

                    {/* Pagination */}
                    {displayAlerts.length > 0 && (
                        <PaginationBar
                            totalItems={total}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            startIndex={startIndex}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            t={t}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
