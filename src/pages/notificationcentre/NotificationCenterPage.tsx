import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { ArrowDownUp } from "lucide-react";
import { FiltersBar } from "../../components/notificationcentre/FiltersBar";
import { NotificationsTable } from "../../components/notificationcentre/NotificationsTable";
import { PaginationBar } from "../../components/notificationcentre/PaginationBar";
import { useLanguage } from "../../context/LanguageContext";
import { fetchAlertsAsync } from '../../store/slices/alertsSlice';
import type { RootState, AppDispatch } from '../../store/store';

export function NotificationCenterPage({
    onViewPatientDetails,
}: {
    onViewPatientDetails?: (patientId: string) => void;
}) {
    const { t, getLocalizedText } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();

    // Get data from Redux store
    const { alerts, total, page: apiPage, totalPages, loading, error } = useSelector((state: RootState) => state.alerts);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Use dynamic date range based on current date (14 days default)
    const today = new Date();
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const [dateFrom, setDateFrom] = useState(formatDate(fourteenDaysAgo));
    const [dateTo, setDateTo] = useState(formatDate(today));
    const itemsPerPage = 10;

    // Fetch alerts when filters change
    useEffect(() => {
        dispatch(fetchAlertsAsync({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            startDate: dateFrom,
            endDate: dateTo
        }));
    }, [dispatch, searchTerm, dateFrom, dateTo, currentPage]);

    // Map API alerts to display format compatible with NotificationsTable
    const displayAlerts = alerts.map(alert => {
        console.log('Alert createdAt:', (alert as any).createdAt, 'Alert:', alert);

        // Safely format timestamp - API uses createdAt, not timestamp
        let formattedTimestamp = 'N/A';
        try {
            const date = new Date((alert as any).createdAt);
            if (!isNaN(date.getTime())) {
                formattedTimestamp = date.toISOString().slice(0, 16).replace('T', ' ');
            } else {
                console.warn('Invalid date for alert:', alert._id, 'createdAt:', (alert as any).createdAt);
            }
        } catch (e) {
            console.error('Invalid timestamp for alert:', alert._id, (alert as any).createdAt, e);
        }

        // Map category to translation key
        const categoryKey = ((alert as any).category || alert.alertType || 'vital').toUpperCase();
        const categoryTranslationMap: Record<string, string> = {
            'HEART_RATE': 'notifications.category.hr',
            'RESPIRATORY': 'notifications.category.rr',
            'FALL': 'notifications.category.fall',
            'VITAL': 'notifications.category.monitoring'
        };
        const translatedCategory = t(categoryTranslationMap[categoryKey] || 'notifications.category.monitoring');

        // Map alert message to translation key
        const rawMsg = getLocalizedText(alert.message) || '';
        let messageKey = rawMsg;
        if (rawMsg.includes('심박수가 임계치를 초과') || rawMsg.includes('Heart rate exceeded')) {
            messageKey = t('alerts.msg.hrExceeded');
        } else if (rawMsg.includes('호흡수가 정상 범위를 벗어') || rawMsg.includes('Respiratory rate out of normal')) {
            messageKey = t('alerts.msg.rrOutOfRange');
        } else if (rawMsg.includes('낙상') || rawMsg.includes('fall') || rawMsg.includes('Fall')) {
            messageKey = t('alerts.msg.fallDetected');
        } else if (rawMsg.includes('심박수가 위험 기준치 이하') || rawMsg.includes('Heart rate below')) {
            messageKey = t('alerts.msg.hrLow');
        } else if (rawMsg.includes('호흡수가 위험 기준치를 초과') || rawMsg.includes('Respiratory rate exceeded')) {
            messageKey = t('alerts.msg.rrHigh');
        }

        // Translate status
        const statusValue = alert.status === 'ACKNOWLEDGED' ? t('notifications.table.success') : t('notifications.table.fail');

        return {
            id: alert._id,
            timestamp: formattedTimestamp,
            patientId: (alert as any).patient?._id || (alert as any).patient?.patientCode || '',
            patientName: getLocalizedText((alert as any).patient?.fullName) || (alert as any).patient?.patientCode || '',
            fullName: (alert as any).patient?.fullName || { ko: '', en: '' },
            category: translatedCategory,
            type: messageKey,
            severity: alert.severity?.toLowerCase() || 'medium',
            details: `${messageKey} (${t('alerts.currentValue')}: ${(alert as any).currentValue}, ${t('alerts.threshold')}: ${(alert as any).thresholdValue})`,
            status: statusValue as '성공' | '실패',
            system: t('notifications.system.radar'),
            systemName: t('notifications.system.radar')
        };
    });

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Calculate indices for display
    const startIndex = (currentPage - 1) * itemsPerPage;

    console.log('Notification Centre - Pagination:', {
        total,
        currentPage,
        totalPages,
        startIndex,
        itemsPerPage,
        alertsLength: alerts.length,
        displayAlertsLength: displayAlerts.length
    });

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
                                onClick={() => dispatch(fetchAlertsAsync({
                                    page: currentPage,
                                    limit: itemsPerPage,
                                    search: searchTerm,
                                    startDate: dateFrom,
                                    endDate: dateTo
                                }))}
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
