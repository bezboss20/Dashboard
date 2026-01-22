import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Signal, Target, Radio, Activity, Navigation, Search as SearchIcon, X, Crosshair, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatientsAsync } from '../../store/slices/monitoringSlice';
import { RootState, AppDispatch } from '../../store/store';
import { StatusCards } from '../../components/gpstracking/StatusCards';

// Custom Icons for Status - High contrast colors for map visibility
const createStatusIcon = (status: 'online' | 'offline', isSelected: boolean = false) => {
    // Orange for online (stands out against green/blue map), dark purple-gray for offline
    const color = status === 'online' ? '#f97316' : '#6b7280'; // orange-500 : gray-500
    const shadowColor = status === 'online' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(107, 114, 128, 0.4)';

    // Base marker HTML
    const baseHtml = `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px ${shadowColor}, 0 2px 4px rgba(0,0,0,0.3); position: relative; z-index: 10;"></div>`;

    if (isSelected) {
        return L.divIcon({
            className: 'custom-div-icon selected-marker',
            html: `
                <div class="relative flex items-center justify-center w-full h-full">
                    <div class="absolute w-[50px] h-[50px] bg-blue-500/30 rounded-full animate-ping"></div>
                    <div class="absolute w-[36px] h-[36px] bg-blue-500/50 rounded-full animate-pulse"></div>
                    ${baseHtml}
                </div>
            `,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
    }

    return L.divIcon({
        className: 'custom-div-icon',
        html: baseHtml,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
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

// Deterministic coordinate generation logic (since GPS is not yet in the core API)
const generateStaticCoords = (id: string): [number, number] => {
    // Center area (Seoul area as baseline)
    const baseLat = 37.5665;
    const baseLng = 126.9780;

    // Create a deterministic hash from the numerical/string ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }

    // Create a second hash for more variation
    let hash2 = 0;
    for (let i = id.length - 1; i >= 0; i--) {
        hash2 = ((hash2 << 7) - hash2) + id.charCodeAt(i) * (i + 1);
        hash2 |= 0;
    }

    // Spread markers across ~20km radius (0.2 degrees) for better visibility
    // Use both hashes for more varied distribution
    const latOffset = ((Math.abs(hash) % 2000) / 2000) * 0.2 - 0.1;
    const lngOffset = ((Math.abs(hash2) % 2000) / 2000) * 0.25 - 0.125;

    return [baseLat + latOffset, baseLng + lngOffset];
};

function MapController({
    focusedLocation,
    userLocation,
    isAutoTracking,
    focusTrigger,
    containerRef
}: {
    focusedLocation: [number, number] | null,
    userLocation: [number, number] | null,
    isAutoTracking: boolean,
    focusTrigger: number,
    containerRef: React.RefObject<HTMLDivElement | null>
}) {
    const map = useMap();

    // Robust invalidateSize with multiple fallback timings
    const handleInvalidateSize = useCallback(() => {
        // Immediate invalidation
        map.invalidateSize({ animate: false, pan: false });

        // Double RAF for post-layout invalidation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                map.invalidateSize({ animate: false, pan: false });
            });
        });
    }, [map]);

    // Force tile redraw - used after movements to clear artifacts
    const forceTileRedraw = useCallback(() => {
        const tilePane = map.getPane('tilePane');
        if (tilePane) {
            // Force browser to re-composite the tile layer
            tilePane.style.visibility = 'hidden';
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            tilePane.offsetHeight; // Force reflow
            tilePane.style.visibility = 'visible';
        }
    }, [map]);

    // Initial setup and mount invalidation
    useEffect(() => {
        handleInvalidateSize();

        // Multiple staged invalidations to catch late renders
        const timers = [
            setTimeout(handleInvalidateSize, 100),
            setTimeout(handleInvalidateSize, 300),
            setTimeout(handleInvalidateSize, 500),
            setTimeout(() => {
                handleInvalidateSize();
                forceTileRedraw();
            }, 1000)
        ];

        return () => timers.forEach(clearTimeout);
    }, [handleInvalidateSize, forceTileRedraw]);

    // Listen to map events for tile refresh
    useEffect(() => {
        const onMoveEnd = () => {
            handleInvalidateSize();
            // Delayed tile redraw to catch any artifacts
            setTimeout(forceTileRedraw, 50);
        };

        const onZoomEnd = () => {
            handleInvalidateSize();
            setTimeout(forceTileRedraw, 100);
        };

        map.on('moveend', onMoveEnd);
        map.on('zoomend', onZoomEnd);
        map.on('resize', handleInvalidateSize);

        return () => {
            map.off('moveend', onMoveEnd);
            map.off('zoomend', onZoomEnd);
            map.off('resize', handleInvalidateSize);
        };
    }, [map, handleInvalidateSize, forceTileRedraw]);

    // ResizeObserver for container size changes (scaling wrapper, sidebar, responsive)
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            handleInvalidateSize();
            setTimeout(forceTileRedraw, 100);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef, handleInvalidateSize, forceTileRedraw]);

    // Handle auto tracking
    useEffect(() => {
        if (isAutoTracking && userLocation) {
            map.setView(userLocation, map.getZoom(), { animate: false });
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
    const { t, getLocalizedText } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();
    const { patients, loading } = useSelector((state: RootState) => state.monitoring);

    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [userLocMeta, setUserLocMeta] = useState<{ lat: number; lng: number; time: string } | null>(null);
    const [isAutoTracking, setIsAutoTracking] = useState(false);
    const [locError, setLocError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null);
    const [focusTrigger, setFocusTrigger] = useState(0);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Map real patients to device locations
    const activeDevices = useMemo(() => {
        if (!patients) return [];
        return patients.map(p => {
            const pId = p.id || p._id || '0';
            const [lat, lng] = generateStaticCoords(pId);
            // Use getLocalizedText for proper multilingual name display
            const patientName = p.fullName
                ? getLocalizedText(p.fullName, p.fullName.ko || p.patientCode || '')
                : p.patientCode || '';
            return {
                deviceId: (p as any).deviceId || (p as any).devices?.[0]?.serialNumber || p.patientCode || 'NODE-' + pId.slice(-4),
                lat,
                lng,
                status: (p as any).deviceStatus === 'online' || (p as any).devices?.[0]?.status === 'ONLINE' ? 'online' : 'offline',
                lastUpdated: new Date(),
                patientId: p.patientCode,
                patientName
            } as DeviceLocation;
        });
    }, [patients, getLocalizedText]);

    const initialCenter = useMemo(() => {
        if (activeDevices.length > 0) {
            return [activeDevices[0].lat, activeDevices[0].lng] as [number, number];
        }
        return [37.5665, 126.9780] as [number, number];
    }, [activeDevices]);

    useEffect(() => {
        // Initial fetch and start polling
        dispatch(fetchPatientsAsync({ limit: 100 }));
        const interval = setInterval(() => {
            dispatch(fetchPatientsAsync({ limit: 100 }));
        }, 15000);
        return () => clearInterval(interval);
    }, [dispatch]);

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
        return activeDevices.filter(d =>
            d.deviceId.toLowerCase().includes(lowerQuery) ||
            d.patientId?.toLowerCase().includes(lowerQuery) ||
            d.patientName?.toLowerCase().includes(lowerQuery)
        ).slice(0, 8);
    }, [searchQuery, activeDevices]);

    const handleSelectDevice = (device: DeviceLocation) => {
        const coords: [number, number] = [device.lat, device.lng];
        setIsAutoTracking(false);
        setFocusedLocation(coords);
        setFocusTrigger(prev => prev + 1);
        setSearchQuery('');
        setIsSearchFocused(false);
        setSelectedDeviceId(device.deviceId);

        // Allow time for map to move, then ensure popup is open
        setTimeout(() => {
            const marker = markerRefs.current[device.deviceId];
            if (marker) {
                marker.openPopup();
            }
        }, 300);
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
                                        onClick={() => handleSelectDevice(result)}
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

                    {/* Clickaway overlay - fully transparent */}
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
                            onClick={handleGetLocation}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <Navigation className="w-4 h-4 text-blue-600" />
                            <span className="whitespace-nowrap">{t('gps.myLocation.mobile')}</span>
                        </button>
                    </div>
                </div>

                {/* Map Wrapper - gps-map-wrapper creates independent stacking context */}
                <div ref={mapContainerRef} className="gps-map-wrapper h-[500px] max-[375px]:h-[320px] lg:h-[600px] 3xl:h-[720px] w-full relative bg-gray-100">
                    <MapContainer
                        center={initialCenter}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        fadeAnimation={false}
                        zoomAnimation={false}
                        markerZoomAnimation={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            updateWhenZooming={false}
                            updateWhenIdle={true}
                            keepBuffer={10}
                            className="leaflet-tile-stable"
                        />
                        <ZoomControl position="bottomright" />

                        <MapController
                            focusedLocation={focusedLocation}
                            userLocation={userLocation}
                            isAutoTracking={isAutoTracking}
                            focusTrigger={focusTrigger}
                            containerRef={mapContainerRef}
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
                        {activeDevices.map((device) => (
                            <Marker
                                key={device.deviceId}
                                position={[device.lat, device.lng]}
                                icon={createStatusIcon(device.status, selectedDeviceId === device.deviceId)}
                                ref={(ref) => {
                                    if (ref) markerRefs.current[device.deviceId] = ref;
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-0 w-[210px]">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide leading-none mb-1 whitespace-nowrap">Device ID</p>
                                                <p className="text-xs font-black text-gray-900 whitespace-nowrap">{device.deviceId}</p>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap flex-shrink-0 ${device.status === 'online' ? 'bg-orange-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                                {device.status}
                                            </div>
                                        </div>

                                        {device.patientName && (
                                            <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">{t('gps.assignedPatient')}</p>
                                                <p className="text-[11px] font-black text-gray-900 break-words">
                                                    {device.patientName} ({device.patientId})
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2 mt-3">
                                            <div className="text-[9px] text-gray-400 font-bold uppercase whitespace-nowrap">
                                                Update: {device.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setFocusedLocation([device.lat, device.lng]);
                                                    setFocusTrigger(prev => prev + 1);
                                                    setIsAutoTracking(false);
                                                }}
                                                className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
                                            >
                                                <Crosshair className="w-3 h-3 flex-shrink-0" />
                                                <span>{t('gps.fixLocation')}</span>
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
                totalDevices={activeDevices.length}
                onlineDevices={activeDevices.filter(d => d.status === 'online').length}
                offlineDevices={activeDevices.filter(d => d.status === 'offline').length}
                t={t}
            />

            <style>{`
                /* Map container styling */
                .leaflet-container {
                    border-radius: 0 0 1rem 1rem;
                    z-index: 1;
                }
                
                /* Popup styling */
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    padding: 4px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 15px -10px rgba(0, 0, 0, 0.2);
                    background: white;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 8px;
                }
                .custom-popup .leaflet-popup-tip {
                    background: white;
                    border: 1px solid #e2e8f0;
                }
                
                /* Marker highlight effect */
                .marker-highlight {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
                    z-index: 1000 !important;
                }
                
                /* Marker glow animation */
                @keyframes marker-glow {
                   0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                   70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                   100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
                
                /* Ensure tiles are always visible after loading */
                .leaflet-tile-loaded {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
}
