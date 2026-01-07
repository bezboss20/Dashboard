import { useState, useEffect } from "react";
import {
    ArrowDownUp,
    Search,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { getNotificationLogs, subscribe, NotificationLog } from "../data/notificationLogStore";

export function NotificationCenterPage({
    onViewPatientDetails,
}: {
    onViewPatientDetails?: (patientId: string) => void;
}) {
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

    return (
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">
                    알림 기록 (Notification History)
                </h1>
            </div>

            {/* Notification Logs Section */}
            <section>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <div className="flex items-center gap-2">
                            <ArrowDownUp className="w-5 h-5 text-blue-600" />
                            <h2 className="text-base lg:text-lg font-bold text-gray-900">
                                로그 (Notification Logs)
                            </h2>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4 mb-6">
                        {/* Date Range */}
                        <div className="md:col-span-2 flex items-center gap-2">
                            <div className="flex items-center gap-2 w-full">
                                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="px-2 py-2 border border-gray-300 rounded-lg text-xs lg:text-sm w-full outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="px-2 py-2 border border-gray-300 rounded-lg text-xs lg:text-sm w-full outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ID, 분류, 유형 검색..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="flex-1 outline-none text-xs lg:text-sm"
                            />
                        </div>

                        {/* Filter Button (Decorative for now) */}
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4 text-gray-600" />
                            <span className="text-xs lg:text-sm font-medium text-gray-700">
                                필터
                            </span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto -mx-4 lg:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            날짜
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            시스템
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            환자ID
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            분류
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            유형
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            상태
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            상세 내용
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {paginatedLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-xs lg:text-sm text-gray-900 whitespace-nowrap">
                                                {log.timestamp}
                                            </td>
                                            <td className="py-3 px-4 text-xs lg:text-sm text-gray-900 whitespace-nowrap">
                                                {log.system}
                                            </td>
                                            <td className="py-3 px-4 text-xs lg:text-sm whitespace-nowrap">
                                                {log.patientId !== "N/A" && onViewPatientDetails ? (
                                                    <button
                                                        onClick={() =>
                                                            onViewPatientDetails(log.patientId)
                                                        }
                                                        className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                                                    >
                                                        {log.patientId}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-900">
                                                        {log.patientId}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-xs lg:text-sm text-gray-600 whitespace-nowrap">
                                                {log.category}
                                            </td>
                                            <td className="py-3 px-4 text-xs lg:text-sm text-gray-600 whitespace-nowrap font-mono">
                                                {log.type}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 rounded text-[10px] lg:text-xs font-bold ${log.status === "성공"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs lg:text-sm text-gray-600 min-w-[200px]">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-10 text-center text-gray-500 text-sm">
                                                표시할 로그가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                        <div className="text-xs lg:text-sm text-gray-600 order-2 sm:order-1">
                            총 {filteredLogs.length}개 중 {filteredLogs.length > 0 ? startIndex + 1 : 0}-
                            {Math.min(startIndex + itemsPerPage, filteredLogs.length)}개 표시
                        </div>
                        <div className="flex items-center gap-2 order-1 sm:order-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg text-xs lg:text-sm font-medium transition-colors ${currentPage === page
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ),
                                )}
                            </div>
                            <button
                                onClick={() =>
                                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                                }
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
}
