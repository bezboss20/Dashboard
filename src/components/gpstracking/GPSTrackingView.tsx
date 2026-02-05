import { useState } from 'react';
import { Info, X, Wifi, WifiOff } from 'lucide-react';
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
    const [showSignalModal, setShowSignalModal] = useState(false);
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
        popupTrigger,
        fitBoundsTrigger,
        selectedDeviceId,
        healthStatusFilter,
        setHealthStatusFilter,
        // Computed
        activeDevices,
        allDevices,
        filteredResults,
        criticalDevices,
        systemUptime,
        // Methods
        handleGetLocation,
        handleSelectDevice,
        clearSelection,
        setFocusedLocation,
        setFocusTrigger,
        setFitBoundsTrigger
    } = model;

    const initialCenter: [number, number] = allDevices.length > 0
        ? [allDevices[0].lat, allDevices[0].lng]
        : [37.5665, 126.9780];

    const selectedDevice = allDevices.find(d => d.deviceId === selectedDeviceId);

    return (
        <div className="flex flex-col flex-1 min-h-[calc(100dvh-100px)] sm:min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-120px)] gap-2 md:gap-6 animate-in fade-in duration-500">
            {/* Modal: Signal Information Details */}
            {showSignalModal && (
                <div className="fixed inset-0 z-1050 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowSignalModal(false)} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden relative z-10 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">{t('gps.signalDetailsTitle') || 'Network Diagnostics'}</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">{allDevices.length} {t('gps.connectedNodes') || 'Active Nodes'}</p>
                            </div>
                            <button onClick={() => setShowSignalModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                            {allDevices.map((device) => (
                                <div key={device.deviceId} className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${device.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                            {device.status === 'online' ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-sm tracking-tight">{device.patientName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{device.deviceId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                            {[1, 2, 3, 4].map((bar) => {
                                                const strength = Math.abs(device.rssi || -100);
                                                const isActive = device.status === 'online' && (
                                                    (bar === 1 && strength < 95) ||
                                                    (bar === 2 && strength < 80) ||
                                                    (bar === 3 && strength < 65) ||
                                                    (bar === 4 && strength < 50)
                                                );
                                                return (
                                                    <div key={bar} className={`w-1 rounded-full transition-all ${bar === 1 ? 'h-2' : bar === 2 ? 'h-3' : bar === 3 ? 'h-4' : 'h-5'} ${isActive ? 'bg-green-500' : 'bg-gray-200'}`} />
                                                );
                                            })}
                                        </div>
                                        <p className={`text-[11px] font-black mt-1 ${device.status === 'online' ? 'text-green-600' : 'text-gray-400'}`}>
                                            {device.status === 'online' ? `${device.rssi} dBm` : 'OFFLINE'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={() => setShowSignalModal(false)}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-colors"
                            >
                                {t('common.close') || 'Close View'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header - shrink-0 */}
            <div className="flex flex-col gap-0.5 md:gap-1 shrink-0 px-1">
                <div className="flex items-center justify-between gap-2 px-1">
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
                                    <div className="absolute right-0 top-full mt-2 w-[240px] xs:w-[280px] max-w-[calc(100vw-32px)] p-3 bg-white border border-gray-200 rounded-xl shadow-2xl z-1010 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <p className="text-[11px] text-gray-600 font-bold leading-relaxed wrap-break-word">
                                            {t('gps.description')}
                                        </p>
                                        <div className="absolute -top-1 right-[12px] w-2 h-2 bg-white border-t border-l border-gray-200 rotate-45" />
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
                {/* Filter Bar & Summary Cards */}
                <div className="relative bg-white shrink-0 border-b border-gray-100 p-2 sm:p-3 md:p-4">
                    <div className="flex flex-col gap-3">
                        <GPSSearch
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            filteredResults={filteredResults}
                            isAutoTracking={isAutoTracking}
                            setIsAutoTracking={setIsAutoTracking}
                            locError={locError}
                            onSelectDevice={handleSelectDevice}
                            onGetLocation={handleGetLocation}
                            healthStatusFilter={healthStatusFilter}
                            onHealthStatusFilterChange={setHealthStatusFilter}
                            t={t}
                        />

                        {/* Summary Cards Grid (2x2 on Mobile) */}
                        <div className="grid grid-cols-2 lg:flex lg:flex-nowrap items-center gap-1.5 sm:gap-2 py-2">
                            {[
                                { status: 'critical', count: allDevices.filter(d => d.healthStatus === 'critical').length, color: 'bg-red-50 text-red-600 border-red-100' },
                                { status: 'warning', count: allDevices.filter(d => d.healthStatus === 'warning').length, color: 'bg-orange-50 text-orange-600 border-orange-100' },
                                { status: 'caution', count: allDevices.filter(d => d.healthStatus === 'caution').length, color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
                                { status: 'normal', count: allDevices.filter(d => d.healthStatus === 'normal').length, color: 'bg-green-50 text-green-600 border-green-100' }
                            ].map((item) => (
                                <button
                                    key={item.status}
                                    onClick={() => setHealthStatusFilter(prev => prev === item.status ? 'ALL' : item.status as any)}
                                    className={`flex items-center justify-between lg:justify-start gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-lg border focus:outline-none transition-all w-full lg:w-auto lg:shrink-0 ${item.color} ${healthStatusFilter === item.status ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md z-10' : 'opacity-80 hover:opacity-100 hover:shadow-xs'}`}
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status === 'critical' ? 'bg-red-600 animate-pulse' : item.status === 'warning' ? 'bg-orange-500' : item.status === 'caution' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight whitespace-nowrap truncate">{t(`status.${item.status}`)}</span>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-black shrink-0">{item.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
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
                        fitBoundsTrigger={fitBoundsTrigger}
                        popupTrigger={popupTrigger}
                        selectedDeviceId={selectedDeviceId}
                        setFocusedLocation={setFocusedLocation}
                        setFocusTrigger={setFocusTrigger}
                        setIsAutoTracking={setIsAutoTracking}
                        onSelectDevice={handleSelectDevice}
                        clearSelection={clearSelection}
                        t={t}
                    />
                </div>
            </div>

            {/* Status Cards - shrink-0 */}
            <div className="shrink-0 pb-2 sm:pb-0">
                <StatusCards
                    activeDevices={activeDevices.filter(d => d.status === 'online').length}
                    totalDevices={allDevices.length}
                    uptime={systemUptime}
                    selectedDeviceAccuracy={selectedDevice?.accuracy}
                    selectedDeviceName={selectedDevice?.patientName}
                    onSignalClick={() => setShowSignalModal(true)}
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
