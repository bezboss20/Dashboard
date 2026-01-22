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

            {/* Status Cards */}
            <StatusCards
                totalDevices={activeDevices.length}
                onlineDevices={activeDevices.filter((d: DeviceLocation) => d.status === 'online').length}
                offlineDevices={activeDevices.filter((d: DeviceLocation) => d.status === 'offline').length}
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
                
                /* Ensure tiles are always visible after loading */
                .leaflet-tile-loaded {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
}
