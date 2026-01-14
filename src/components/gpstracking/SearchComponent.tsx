import { Search as SearchIcon, X, MapPin } from 'lucide-react';

interface DeviceLocation {
    deviceId: string;
    lat: number;
    lng: number;
    status: 'online' | 'offline';
    lastUpdated: Date;
    patientId?: string;
    patientName?: string;
}

interface SearchComponentProps {
    searchQuery: string;
    isSearchFocused: boolean;
    filteredResults: DeviceLocation[];
    onSearchChange: (query: string) => void;
    onSearchFocus: () => void;
    onSearchBlur: () => void;
    onSelectDevice: (device: DeviceLocation) => void;
}

export function SearchComponent({
    searchQuery,
    isSearchFocused,
    filteredResults,
    onSearchChange,
    onSearchFocus,
    onSearchBlur,
    onSelectDevice
}: SearchComponentProps) {
    return (
        <div className="relative flex-1 max-w-md">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="환자명 / 환자ID / 장비ID 검색..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={onSearchFocus}
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Search Dropdown */}
            {isSearchFocused && filteredResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[1000] overflow-hidden">
                    {filteredResults.map((result) => (
                        <button
                            key={result.deviceId}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                            onClick={() => onSelectDevice(result)}
                        >
                            <div className={`w-2 h-2 rounded-full ${result.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-gray-900 truncate">
                                    {result.patientName || result.deviceId}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase truncate">
                                    {result.patientId ? `${result.patientId} • ` : ''}{result.deviceId}
                                </p>
                            </div>
                            <MapPin className="w-4 h-4 text-gray-300" />
                        </button>
                    ))}
                </div>
            )}
            {isSearchFocused && searchQuery && filteredResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[1000] p-4 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase">검색 결과가 없습니다</p>
                </div>
            )}
            {isSearchFocused && (
                <div
                    className="fixed inset-0 z-[999]"
                    onClick={onSearchBlur}
                />
            )}
        </div>
    );
}
