import { useState } from 'react';
import { Search as SearchIcon, X, MapPin, Target, Navigation } from 'lucide-react';
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
    t
}: GPSSearchProps) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Component */}
            <div className="relative flex-1 sm:flex-initial sm:w-[320px] lg:w-[400px] xl:w-[450px] 2xl:w-[500px]">
                <div className="relative">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 z-10" />
                    <input
                        type="text"
                        placeholder={t('gps.searchPlaceholder')}
                        className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all font-medium shadow-sm placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Search Dropdown */}
                {isSearchFocused && filteredResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[1001] overflow-hidden max-h-[300px] overflow-y-auto">
                        {filteredResults.map((result) => (
                            <button
                                key={result.deviceId}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                onClick={() => {
                                    onSelectDevice(result);
                                    setIsSearchFocused(false);
                                }}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${result.status === 'online' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {result.patientName || result.deviceId}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase truncate">
                                        {result.patientId ? `${result.patientId} • ` : ''}{result.deviceId}
                                    </p>
                                </div>
                                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
                {isSearchFocused && searchQuery && filteredResults.length === 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[1001] p-4 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase">{t('common.noResults') || 'No results found'}</p>
                    </div>
                )}
            </div>

            {/* Clickaway overlay */}
            {isSearchFocused && (
                <div
                    className="fixed inset-0 z-[1000] bg-transparent"
                    onClick={() => setIsSearchFocused(false)}
                />
            )}

            <div className="flex items-center gap-2 min-[319px]:justify-center min-[319px]:w-full">
                {/* Error Message */}
                {locError && (
                    <div className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-100 animate-in slide-in-from-right-2">
                        {locError}
                    </div>
                )}

                {/* Auto Track Toggle */}
                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={isAutoTracking}
                        onChange={(e) => {
                            setIsAutoTracking(e.target.checked);
                        }}
                    />
                    <Target className={`w-4 h-4 transition-colors ${isAutoTracking ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className={`w-9 h-5 rounded-full relative transition-colors ${isAutoTracking ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${isAutoTracking ? 'right-1' : 'left-1'}`} />
                    </div>
                </label>

                {/* My Location Button */}
                <button
                    onClick={onGetLocation}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="whitespace-nowrap">{t('gps.myLocation.mobile')}</span>
                </button>
            </div>
        </div>
    );
}
