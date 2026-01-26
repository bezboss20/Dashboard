import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair } from 'lucide-react';
import { DeviceLocation } from '../../types/gps';

// Custom Icons logic
const createStatusIcon = (status: 'online' | 'offline', isSelected: boolean = false) => {
    const color = status === 'online' ? '#f97316' : '#6b7280';
    const shadowColor = status === 'online' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(107, 114, 128, 0.4)';
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

    const handleInvalidateSize = useCallback(() => {
        map.invalidateSize({ animate: false, pan: false });
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                map.invalidateSize({ animate: false, pan: false });
            });
        });
    }, [map]);

    const forceTileRedraw = useCallback(() => {
        const tilePane = map.getPane('tilePane');
        if (tilePane) {
            tilePane.style.visibility = 'hidden';
            tilePane.offsetHeight; // Force reflow
            tilePane.style.visibility = 'visible';
        }
    }, [map]);

    useEffect(() => {
        handleInvalidateSize();
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

    useEffect(() => {
        const onMoveEnd = () => {
            handleInvalidateSize();
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

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(() => {
            handleInvalidateSize();
            setTimeout(forceTileRedraw, 100);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef, handleInvalidateSize, forceTileRedraw]);

    useEffect(() => {
        if (isAutoTracking && userLocation) {
            map.setView(userLocation, map.getZoom(), { animate: false });
        }
    }, [isAutoTracking, userLocation, map]);

    useEffect(() => {
        if (focusedLocation && focusTrigger > 0) {
            map.closePopup();
            setTimeout(() => {
                map.setView(focusedLocation, 16, { animate: true });
            }, 100);
        }
    }, [focusedLocation, focusTrigger, map]);

    return null;
}

interface GPSMapProps {
    initialCenter: [number, number];
    activeDevices: DeviceLocation[];
    userLocation: [number, number] | null;
    userLocMeta: { lat: number; lng: number; time: string } | null;
    isAutoTracking: boolean;
    focusedLocation: [number, number] | null;
    focusTrigger: number;
    selectedDeviceId: string | null;
    setFocusedLocation: (loc: [number, number]) => void;
    setFocusTrigger: (cb: (prev: number) => number) => void;
    setIsAutoTracking: (val: boolean) => void;
    t: (key: string) => string;
}

export function GPSMap({
    initialCenter,
    activeDevices,
    userLocation,
    userLocMeta,
    isAutoTracking,
    focusedLocation,
    focusTrigger,
    selectedDeviceId,
    setFocusedLocation,
    setFocusTrigger,
    setIsAutoTracking,
    t
}: GPSMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markerRefs = useRef<Record<string, L.Marker>>({});

    // Handle marker popup opening when selected from external logic
    useEffect(() => {
        if (selectedDeviceId && markerRefs.current[selectedDeviceId]) {
            // We might need to expose this via prop or context if strictly needed, 
            // but the parent logic usually just sets focus. 
            // If we need to open the popup, we can do it here if selectedDeviceId changes.
            const marker = markerRefs.current[selectedDeviceId];
            if (marker) setTimeout(() => marker.openPopup(), 300);
        }
    }, [selectedDeviceId]);

    return (
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
                                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap shrink-0 ${device.status === 'online' ? 'bg-orange-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                                        {device.status}
                                    </div>
                                </div>

                                {device.patientName && (
                                    <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">{t('gps.assignedPatient')}</p>
                                        <p className="text-[11px] font-black text-gray-900 wrap-break-word">
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
                                            setFocusTrigger((prev: number) => prev + 1);
                                            setIsAutoTracking(false);
                                        }}
                                        className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <Crosshair className="w-3 h-3 shrink-0" />
                                        <span>{t('gps.fixLocation')}</span>
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
