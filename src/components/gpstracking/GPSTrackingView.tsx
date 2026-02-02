import { useState } from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StatusCards } from './StatusCards';
import { GPSMap } from './GPSMap';
import { GPSSearch } from './GPSSearch';
import { useGPSTracking } from '../../hooks/useGPSTracking';
import { DeviceLocation } from '../../types/gps';

interface GPSTrackingViewProps {
    model: ReturnType<typeof useGPSTracking>;
}

export function GPSTrackingView({ model }: GPSTrackingViewProps) {
    const { t } = useLanguage();
    const [showInfo, setShowInfo] = useState(false);
    const {
        userLocation,
        userLocMeta,
        isAutoTracking,
        setIsAutoTracking,
        locError,
        searchQuery,
        setSearchQuery,
        focusedLocation,
        focusTrigger,
        selectedDeviceId,
        // Computed
        activeDevices,
        filteredResults,
        // Methods
        handleGetLocation,
        handleSelectDevice,
        setFocusedLocation,
        setFocusTrigger
    } = model;

    const initialCenter: [number, number] = activeDevices.length > 0
        ? [activeDevices[0].lat, activeDevices[0].lng]
        : [37.5665, 126.9780];

    return (
        <div className="flex flex-col flex-1 min-h-[calc(100dvh-100px)] sm:min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-120px)] gap-2 md:gap-6 animate-in fade-in duration-500">
            {/* Page Header - shrink-0 */}
            <div className="flex flex-col gap-0.5 md:gap-1 shrink-0 px-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 leading-tight">
                        {t('gps.title')}
                    </h1>

                    {/* Info Tooltip for Mobile */}
                    <div className="md:hidden flex items-center">
                        <div className="relative inline-block">
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors active:scale-95 flex"
                                aria-label="Info"
                            >
                                <Info className="w-4 h-4" />
                            </button>

                            {showInfo && (
                                <>
                                    <div
                                        className="fixed inset-0 z-1009 bg-black/5"
                                        onClick={() => setShowInfo(false)}
                                    />
                                    <div className="absolute left-0 top-full mt-2 w-[230px] xs:w-[280px] p-2.5 bg-white border border-gray-200 rounded-xl shadow-2xl z-1010 animate-in fade-in zoom-in-95 duration-200">
                                        <p className="text-[10px] sm:text-[11px] text-gray-600 font-bold leading-relaxed wrap-break-word">
                                            {t('gps.description')}
                                        </p>
                                        <div className="absolute -top-1 left-2 w-2 h-2 bg-white border-t border-l border-gray-200 rotate-45" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Full Subtitle for Desktop/Tablet */}
                <p className="hidden md:block text-xs lg:text-sm text-gray-500 font-medium">
                    {t('gps.description')}
                </p>
            </div>

            {/* Map Main Card - fills viewport on mobile */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-[calc(100dvh-190px)] sm:min-h-[calc(100dvh-200px)] md:min-h-[520px] relative">
                {/* Search Bar - Back in normal flow */}
                <div className="relative border-b border-gray-100 bg-white shrink-0">
                    <GPSSearch
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        filteredResults={filteredResults}
                        isAutoTracking={isAutoTracking}
                        setIsAutoTracking={setIsAutoTracking}
                        locError={locError}
                        onSelectDevice={handleSelectDevice}
                        onGetLocation={handleGetLocation}
                        t={t}
                    />
                </div>

                <div className="flex-1 w-full relative min-h-0">
                    <GPSMap
                        initialCenter={initialCenter}
                        activeDevices={activeDevices}
                        userLocation={userLocation}
                        userLocMeta={userLocMeta}
                        isAutoTracking={isAutoTracking}
                        focusedLocation={focusedLocation}
                        focusTrigger={focusTrigger}
                        selectedDeviceId={selectedDeviceId}
                        setFocusedLocation={setFocusedLocation}
                        setFocusTrigger={setFocusTrigger}
                        setIsAutoTracking={setIsAutoTracking}
                        t={t}
                    />
                </div>
            </div>

            {/* Status Cards - shrink-0 */}
            <div className="shrink-0 pb-2 sm:pb-0">
                <StatusCards
                    totalDevices={activeDevices.length}
                    onlineDevices={activeDevices.filter((d: DeviceLocation) => d.status === 'online').length}
                    offlineDevices={activeDevices.filter((d: DeviceLocation) => d.status === 'offline').length}
                    t={t}
                />
            </div>

            <style>{`
                /* Map container styling */
                .leaflet-container {
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
                
                /* Ensure tiles are always visible after loading */
                .leaflet-tile-loaded {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
}
