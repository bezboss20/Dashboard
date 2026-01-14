import { useState, useEffect } from "react";
import { ArrowDownUp } from "lucide-react";
import { getNotificationLogs, subscribe, NotificationLog } from "../../data/notificationLogStore";
import { FiltersBar } from "../../components/notificationcentre/FiltersBar";
import { NotificationsTable } from "../../components/notificationcentre/NotificationsTable";
import { PaginationBar } from "../../components/notificationcentre/PaginationBar";
import { useLanguage } from "../../context/LanguageContext";

export function NotificationCenterPage({
    onViewPatientDetails,
}: {
    onViewPatientDetails?: (patientId: string) => void;
}) {
    const { t } = useLanguage();
    const [logs, setLogs] = useState<NotificationLog[]>(getNotificationLogs());
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Use dynamic date range based on current date (90 days to match data retention settings)
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const [dateFrom, setDateFrom] = useState(formatDate(ninetyDaysAgo));
    const [dateTo, setDateTo] = useState(formatDate(today));
    const itemsPerPage = 10;

    useEffect(() => {
        const unsub = subscribe(() => {
            setLogs(getNotificationLogs());
        });
        return unsub;
    }, []);

    const filteredLogs = logs.filter((log) => {
        // Search filter
        const matchesSearch =
            log.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());

        // Date filter
        // log.timestamp is "YYYY-MM-DD HH:mm"
        const logDate = log.timestamp.split(' ')[0];
        const matchesDate = (!dateFrom || logDate >= dateFrom) && (!dateTo || logDate <= dateTo);

        return matchesSearch && matchesDate;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

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

                    {/* Table */}
                    <NotificationsTable
                        logs={paginatedLogs}
                        onViewPatientDetails={onViewPatientDetails}
                        t={t}
                    />

                    {/* Pagination */}
                    <PaginationBar
                        totalItems={filteredLogs.length}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        startIndex={startIndex}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        t={t}
                    />
                </div>
            </section >
        </div >
    );
}
