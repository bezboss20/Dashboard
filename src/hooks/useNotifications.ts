import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlertsAsync } from '../store/slices/alertsSlice';
import { RootState, AppDispatch } from '../store/store';
import { useLanguage } from '../context/LanguageContext';

export function useNotifications() {
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
        // Safely format timestamp - API uses createdAt, not timestamp
        let formattedTimestamp = 'N/A';
        try {
            const date = new Date((alert as any).createdAt);
            if (!isNaN(date.getTime())) {
                formattedTimestamp = date.toISOString().slice(0, 16).replace('T', ' ');
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

    const startIndex = (currentPage - 1) * itemsPerPage;

    const retry = () => dispatch(fetchAlertsAsync({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        startDate: dateFrom,
        endDate: dateTo
    }));

    return {
        // State
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
        // Handlers
        setDateFrom,
        setDateTo,
        handleSearchChange,
        handlePageChange,
        retry,
        // Utils
        t
    };
}
