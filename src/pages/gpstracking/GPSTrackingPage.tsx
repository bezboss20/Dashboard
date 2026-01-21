import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Signal, Target, Radio, Activity, Navigation, Search as SearchIcon, X, Crosshair, MapPin } from 'lucide-react';
import { StatusCards } from '../../components/gpstracking/StatusCards';

// Custom Icons for Status
const createStatusIcon = (status: 'online' | 'offline') => {
    const color = status === 'online' ? '#10b981' : '#94a3b8'; // green-500 : slate-400
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
};

const userLocationIcon = L.divIcon({
    className: 'user-location-icon',
    html: `<div class="relative">
            <div class="absolute -inset-2 bg-blue-500 bg-opacity-20 rounded-full animate-ping"></div>
            <div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); position: relative; z-index: 10;"></div>
          </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

type DeviceLocation = {
    deviceId: string;
    lat: number;
    lng: number;
    status: 'online' | 'offline';
    lastUpdated: Date;
    patientId?: string;
    patientName?: string;
};

const mockDevices: DeviceLocation[] = [
    { deviceId: 'RADAR-60G-001', lat: 37.5665, lng: 126.9780, status: 'online', lastUpdated: new Date(), patientId: 'P-1001', patientName: '김철수' },
    { deviceId: 'RADAR-60G-002', lat: 37.5651, lng: 126.9895, status: 'online', lastUpdated: new Date(Date.now() - 120000), patientId: 'P-1002', patientName: '이영희' },
    { deviceId: 'RADAR-60G-003', lat: 37.5700, lng: 126.9760, status: 'offline', lastUpdated: new Date(Date.now() - 900000), patientId: 'P-1003', patientName: '박지성' },
    { deviceId: 'RADAR-60G-004', lat: 37.5630, lng: 126.9700, status: 'online', lastUpdated: new Date(), patientId: 'P-1004', patientName: '최미숙' },
    { deviceId: 'RADAR-60G-005', lat: 37.5610, lng: 126.9820, status: 'online', lastUpdated: new Date(Date.now() - 300000), patientId: 'P-1005', patientName: '정우성' },
    { deviceId: 'RADAR-60G-006', lat: 37.5580, lng: 126.9750, status: 'online', lastUpdated: new Date(), patientId: 'P-1006', patientName: '강호동' },
];

function MapController({
    focusedLocation,
    userLocation,
    isAutoTracking,
    focusTrigger
}: {
    focusedLocation: [number, number] | null,
    userLocation: [number, number] | null,
    isAutoTracking: boolean,
    focusTrigger: number
}) {
    const map = useMap();

    // Initial invalidateSize on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize({ animate: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [map]);

    // Handle auto tracking
    useEffect(() => {
        if (isAutoTracking && userLocation) {
            map.setView(userLocation, map.getZoom());
        }
    }, [isAutoTracking, userLocation, map]);

    // Handle focused location changes
    useEffect(() => {
        if (focusedLocation && focusTrigger > 0) {
            // Close any open popups first
            map.closePopup();
            // Use setView with a slight delay for reliable centering
            setTimeout(() => {
                map.setView(focusedLocation, 16, { animate: true });
            }, 100);
        }
    }, [focusedLocation, focusTrigger, map]);

    return null;
}

export function GPSTrackingPage() {
    const { t } = useLanguage();
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [userLocMeta, setUserLocMeta] = useState<{ lat: number; lng: number; time: string } | null>(null);
    const [isAutoTracking, setIsAutoTracking] = useState(false);
    const [locError, setLocError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null);
    const [focusTrigger, setFocusTrigger] = useState(0);

    const initialCenter = useMemo(() => {
        if (mockDevices.length > 0) {
            return [mockDevices[0].lat, mockDevices[0].lng] as [number, number];
        }
        return [37.5665, 126.9780] as [number, number];
    }, []);

    const watchId = useRef<number | null>(null);
    const markerRefs = useRef<Record<string, L.Marker>>({});

    useEffect(() => {
        // Simple mount/unmount cleanup
        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, []);

    const handleGetLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocError(t('gps.errorSupport'));
            return;
        }

        setLocError(null); // Clear any previous error

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const coords: [number, number] = [latitude, longitude];
                setUserLocation(coords);
                setUserLocMeta({
                    lat: latitude,
                    lng: longitude,
                    time: new Date().toLocaleTimeString()
                });
                setFocusedLocation(coords);
                setFocusTrigger(prev => prev + 1);
                setLocError(null);
            },
            (error) => {
                let msg = t('gps.errorFetch');
                if (error.code === error.PERMISSION_DENIED) {
                    msg = t('gps.errorPermission');
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = t('gps.errorUnavailable');
                } else if (error.code === error.TIMEOUT) {
                    msg = t('gps.errorTimeout');
                }
                setLocError(msg);
                setTimeout(() => setLocError(null), 5000);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, [t]);

    useEffect(() => {
        if (isAutoTracking) {
            if (!navigator.geolocation) {
                setLocError(t('gps.errorSupport'));
                setIsAutoTracking(false);
                return;
            }

            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const coords: [number, number] = [latitude, longitude];
                    setUserLocation(coords);
                    setUserLocMeta({
                        lat: latitude,
                        lng: longitude,
                        time: new Date().toLocaleTimeString()
                    });
                    setLocError(null);
                },
                (error) => {
                    setLocError(t('gps.errorTracking'));
                    setIsAutoTracking(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
        }
    }, [isAutoTracking]);

    const filteredResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return mockDevices.filter(d =>
            d.deviceId.toLowerCase().includes(lowerQuery) ||
            d.patientId?.toLowerCase().includes(lowerQuery) ||
            d.patientName?.toLowerCase().includes(lowerQuery)
        ).slice(0, 8);
    }, [searchQuery]);

    const handleSelectDevice = (device: DeviceLocation) => {
        const coords: [number, number] = [device.lat, device.lng];
        setIsAutoTracking(false);
        setFocusedLocation(coords);
        setFocusTrigger(prev => prev + 1);
        setSearchQuery('');
        setIsSearchFocused(false);

        const marker = markerRefs.current[device.deviceId];
        if (marker) {
            marker.openPopup();
            // Highlight effect using CSS class on the icon element
            const iconElem = marker.getElement();
            if (iconElem) {
                iconElem.classList.add('marker-highlight');
                setTimeout(() => iconElem.classList.remove('marker-highlight'), 3000);
            }
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight">
                    {t('gps.title')}
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 font-medium">{t('gps.description')}</p>
            </div>

            {/* Map Main Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {/* Card Header with Controls */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Search Component */}
                    <div className="relative flex-1 max-w-md">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('gps.searchPlaceholder')}
                                className="w-full pl-9 pr-4 max-[374px]:pl-8 max-[374px]:pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm max-[374px]:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
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
                                        onClick={() => handleSelectDevice(result)}
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
                                <p className="text-xs text-gray-400 font-bold uppercase">{t('common.noResults') || 'No results found'}</p>
                            </div>
                        )}
                        {isSearchFocused && (
                            <div
                                className="fixed inset-0 z-[999]"
                                onClick={() => setIsSearchFocused(false)}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-1 min-[319px]:gap-2 min-[319px]:justify-center min-[319px]:w-full">
                        {/* Error Message */}
                        {locError && (
                            <div className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-100 animate-in slide-in-from-right-2">
                                {locError}
                            </div>
                        )}

                        {/* Auto Track Toggle */}
                        <label className="flex items-center justify-center gap-2 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group">
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isAutoTracking}
                                onChange={(e) => {
                                    setIsAutoTracking(e.target.checked);
                                }}
                            />
                            <Target className={`w-4 h-4 transition-colors ${isAutoTracking ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${isAutoTracking ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${isAutoTracking ? 'right-1' : 'left-1'}`} />
                            </div>
                        </label>

                        {/* My Location Button */}
                        <button
                            onClick={handleGetLocation}
                            className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <Navigation className="w-3.5 h-3.5 text-blue-600" />
                            <span className="tracking-tight">{t('gps.myLocation.mobile')}</span>
                        </button>
                    </div>
                </div>

                {/* Map Wrapper */}
                <div className="h-[500px] max-[375px]:h-[320px] lg:h-[600px] 3xl:h-[720px] w-full relative">
                    <MapContainer
                        center={initialCenter}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <ZoomControl position="bottomright" />

                        <MapController
                            focusedLocation={focusedLocation}
                            userLocation={userLocation}
                            isAutoTracking={isAutoTracking}
                            focusTrigger={focusTrigger}
                        />

                        {/* User Location Marker */}
                        {userLocation && (
                            <Marker position={userLocation} icon={userLocationIcon}>
                                <Popup className="custom-popup">
                                    <div className="p-1">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{t('gps.userLocation')}</p>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-gray-700">Lat: {userLocMeta?.lat.toFixed(6)}</p>
                                            <p className="text-[11px] font-bold text-gray-700">Lng: {userLocMeta?.lng.toFixed(6)}</p>
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase">Updated at {userLocMeta?.time}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Device Markers */}
                        {mockDevices.map((device) => (
                            <Marker
                                key={device.deviceId}
                                position={[device.lat, device.lng]}
                                icon={createStatusIcon(device.status)}
                                ref={(ref) => {
                                    if (ref) markerRefs.current[device.deviceId] = ref;
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-0 max-w-[200px]">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Device ID</p>
                                                <p className="text-sm font-black text-gray-900">{device.deviceId}</p>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${device.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                                {device.status}
                                            </div>
                                        </div>

                                        {device.patientName && (
                                            <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">{t('gps.assignedPatient')}</p>
                                                <p className="text-[11px] font-black text-gray-900">{device.patientName} ({device.patientId})</p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between gap-2 mt-4">
                                            <div className="text-[9px] text-gray-400 font-bold uppercase">
                                                Update: {device.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setFocusedLocation([device.lat, device.lng]);
                                                    setFocusTrigger(prev => prev + 1);
                                                    setIsAutoTracking(false);
                                                }}
                                                className="flex items-center gap-1.5 px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-colors uppercase"
                                            >
                                                <Crosshair className="w-3 h-3" />
                                                {t('gps.fixLocation')}
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Status Cards */}
            <StatusCards
                totalDevices={mockDevices.length}
                onlineDevices={mockDevices.filter(d => d.status === 'online').length}
                offlineDevices={mockDevices.filter(d => d.status === 'offline').length}
                t={t}
            />

            <style>{`
                .leaflet-container {
                    border-radius: 0 0 1rem 1rem;
                    z-index: 1;
                }
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    padding: 4px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 15px -10px rgba(0, 0, 0, 0.2);
                }
                .custom-popup .leaflet-popup-tip {
                    background: white;
                    border: 1px solid #e2e8f0;
                }
                .marker-highlight {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
                    z-index: 1000 !important;
                }
                @keyframes marker-glow {
                   0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                   70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                   100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}</style>
        </div>
    );
}
