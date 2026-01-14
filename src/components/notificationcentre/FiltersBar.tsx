import { Search, Filter } from 'lucide-react';

interface FiltersBarProps {
    dateFrom: string;
    dateTo: string;
    searchTerm: string;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    t: (key: string) => string;
}

export function FiltersBar({
    dateFrom,
    dateTo,
    searchTerm,
    onDateFromChange,
    onDateToChange,
    onSearchChange,
    t
}: FiltersBarProps) {
    return (
        // ✅ Expand this whole block left/right (md+), without breaking mobile
        <div className="md:-mx-3 lg:-mx-6 xl:-mx-10">
            {/* ✅ Optional: add a little inner padding so expanded area feels intentional */}
            <div className="px-0 md:px-3 lg:px-6 xl:px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4 mb-6">
                    {/* Date Range */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 w-full min-w-0">
                            {/* Date inputs row */}
                            <div className="flex flex-row items-center gap-2 w-full min-w-0">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => onDateFromChange(e.target.value)}
                                    className="px-2 py-2 border border-gray-300 rounded-lg text-xs lg:text-sm w-full flex-1 min-w-0 outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <span className="text-gray-400 flex-shrink-0 w-3 text-center">
                                    -
                                </span>

                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => onDateToChange(e.target.value)}
                                    className="px-2 py-2 border border-gray-300 rounded-lg text-xs lg:text-sm w-full flex-1 min-w-0 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                        <input
                            type="text"
                            placeholder={t('table.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="flex-1 outline-none text-xs lg:text-sm"
                        />
                    </div>

                    {/* Filter Button */}
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-xs lg:text-sm font-medium text-gray-700">
                            {t('dashboard.activeAlerts')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
