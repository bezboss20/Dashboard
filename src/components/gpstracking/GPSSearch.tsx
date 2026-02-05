import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, X, MapPin, Target, Navigation, ChevronDown } from 'lucide-react';
import { DeviceLocation } from '../../types/gps';

interface GPSSearchProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filteredResults: DeviceLocation[];
    isAutoTracking: boolean;
    setIsAutoTracking: (val: boolean) => void;
    locError: string | null;
    onSelectDevice: (device: DeviceLocation) => void;
    onGetLocation: () => void;
    healthStatusFilter: string;
    onHealthStatusFilterChange: (val: any) => void;
    t: (key: string) => string;
}

export function GPSSearch({
    searchQuery,
    setSearchQuery,
    filteredResults,
    isAutoTracking,
    setIsAutoTracking,
    locError,
    onSelectDevice,
    onGetLocation,
    healthStatusFilter,
    onHealthStatusFilterChange,
    t
}: GPSSearchProps) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 w-full">
            {/* Search Component */}
            <div className="relative flex-1 min-w-0">
                <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500 z-10" />
                    <input
                        type="text"
                        placeholder={t('gps.searchPlaceholder')}
                        className="w-full pl-8 pr-8 py-1.5 bg-white border-2 border-gray-200 rounded-xl text-[11px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all font-medium shadow-sm placeholder:text-gray-400 truncate"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Search Dropdown */}
                {isSearchFocused && filteredResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-1001 overflow-hidden max-h-[250px] overflow-y-auto">
                        {filteredResults.map((result) => (
                            <button
                                key={result.deviceId}
                                className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-blue-50 transition-all text-left border-b border-gray-50 last:border-0 group/item"
                                onClick={() => {
                                    onSelectDevice(result);
                                    setIsSearchFocused(false);
                                }}
                            >
                                <div className="relative shrink-0">
                                    <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-colors ${result.status === 'offline'
                                        ? 'bg-gray-400'
                                        : (() => {
                                            switch (result.healthStatus) {
                                                case 'critical': return 'bg-red-600 animate-pulse';
                                                case 'warning': return 'bg-orange-600';
                                                case 'caution': return 'bg-yellow-600';
                                                default: return 'bg-green-600';
                                            }
                                        })()
                                        }`} />
                                    {result.status === 'online' && result.healthStatus === 'critical' && (
                                        <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-25" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-gray-900 truncate group-hover/item:text-blue-600 transition-colors">
                                        {result.patientName || result.deviceId}
                                    </p>
                                    <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-tight truncate">
                                        {result.patientId ? `${result.patientId} • ` : ''}{result.deviceId}
                                    </p>
                                </div>
                                <MapPin className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover/item:opacity-100 transition-all shrink-0 -translate-x-1 group-hover/item:translate-x-0" />
                            </button>
                        ))}
                    </div>
                )}
                {isSearchFocused && searchQuery && filteredResults.length === 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-1001 p-3 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{t('common.noResults') || 'No results found'}</p>
                    </div>
                )}
            </div>

            {/* Clickaway overlay */}
            {
                isSearchFocused && (
                    <div
                        className="fixed inset-0 z-1000 bg-transparent"
                        onClick={() => setIsSearchFocused(false)}
                    />
                )
            }

            <div className="flex flex-wrap items-center gap-1.5 justify-between sm:justify-end shrink-0 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                    {/* Auto Track Toggle */}
                    <label className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={isAutoTracking}
                            onChange={(e) => {
                                setIsAutoTracking(e.target.checked);
                            }}
                        />
                        <Target className={`w-3.5 h-3.5 transition-colors ${isAutoTracking ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className={`w-6 h-3.5 rounded-full relative transition-colors ${isAutoTracking ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all shadow-sm ${isAutoTracking ? 'right-0.5' : 'left-0.5'}`} />
                        </div>
                    </label>

                    {/* My Location Button */}
                    <button
                        onClick={onGetLocation}
                        className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border-2 border-gray-200 rounded-xl text-[9.5px] font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        title={t('gps.myLocation.mobile')}
                    >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden m425:inline whitespace-nowrap">{t('gps.myLocation.mobile')}</span>
                    </button>
                </div>

                {/* Health Status Filter Dropdown */}
                <HealthStatusDropdown
                    filter={healthStatusFilter}
                    onFilterChange={onHealthStatusFilterChange}
                    t={t}
                />
            </div>
        </div>
    );
}

function HealthStatusDropdown({
    filter,
    onFilterChange,
    t
}: {
    filter: string,
    onFilterChange: (val: any) => void,
    t: (key: string) => string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [
        { value: 'ALL', label: t('filter.allStatus') },
        { value: 'critical', label: t('status.critical') },
        { value: 'warning', label: t('status.warning') },
        { value: 'caution', label: t('status.caution') },
        { value: 'normal', label: t('status.normal') }
    ];

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-1.5 px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] sm:text-xs font-black text-gray-700 hover:bg-gray-100 transition-all min-w-[100px] sm:min-w-[120px] shadow-sm uppercase tracking-tight"
            >
                <span className="truncate">{options.find(o => o.value === filter)?.label}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-1002 mt-1 right-0 w-full min-w-[130px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onFilterChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-[10px] sm:text-xs font-black hover:bg-gray-50 transition-colors flex items-center justify-between uppercase tracking-tight ${filter === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                        >
                            <span>{option.label}</span>
                            {filter === option.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
