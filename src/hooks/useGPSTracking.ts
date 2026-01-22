import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPatientsAsync, Patient } from '../store/slices/monitoringSlice';
import { useLanguage } from '../context/LanguageContext';
import { DeviceLocation } from '../types/gps';

// Deterministic coordinate generation logic (moved from page)
const generateStaticCoords = (id: string): [number, number] => {
    const baseLat = 37.5665;
    const baseLng = 126.9780;

    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }

    let hash2 = 0;
    for (let i = id.length - 1; i >= 0; i--) {
        hash2 = ((hash2 << 7) - hash2) + id.charCodeAt(i) * (i + 1);
        hash2 |= 0;
    }

    const latOffset = ((Math.abs(hash) % 2000) / 2000) * 0.2 - 0.1;
    const lngOffset = ((Math.abs(hash2) % 2000) / 2000) * 0.25 - 0.125;

    return [baseLat + latOffset, baseLng + lngOffset];
};

export function useGPSTracking() {
    const { t, getLocalizedText } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();
    const { patients } = useSelector((state: RootState) => state.monitoring);

    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [userLocMeta, setUserLocMeta] = useState<{ lat: number; lng: number; time: string } | null>(null);
    const [isAutoTracking, setIsAutoTracking] = useState(false);
    const [locError, setLocError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null);
    const [focusTrigger, setFocusTrigger] = useState(0);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const watchId = useRef<number | null>(null);

    // Map real patients to devices
    const activeDevices = useMemo(() => {
        if (!patients) return [];
        return patients.map((p: Patient) => {
            const pId = p.id || (p as any)._id || '0';
            const [lat, lng] = generateStaticCoords(pId);
            const patientName = (p as any).fullName
                ? getLocalizedText((p as any).fullName, (p as any).fullName.ko || p.patientCode || '')
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

    // Initial fetch
    useEffect(() => {
        dispatch(fetchPatientsAsync({ limit: 100 }));
        const interval = setInterval(() => {
            dispatch(fetchPatientsAsync({ limit: 100 }));
        }, 15000);
        return () => clearInterval(interval);
    }, [dispatch]);

    // Cleanup geolocation
    useEffect(() => {
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

        setLocError(null);

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

    // Toggle auto tracking
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
    }, [isAutoTracking, t]);

    const filteredResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return activeDevices.filter((d: DeviceLocation) =>
            d.deviceId.toLowerCase().includes(lowerQuery) ||
            d.patientId?.toLowerCase().includes(lowerQuery) ||
            (d.patientName && d.patientName.toLowerCase().includes(lowerQuery))
        ).slice(0, 8);
    }, [searchQuery, activeDevices]);

    const handleSelectDevice = (device: DeviceLocation) => {
        const coords: [number, number] = [device.lat, device.lng];
        setIsAutoTracking(false);
        setFocusedLocation(coords);
        setFocusTrigger(prev => prev + 1);
        setSearchQuery('');
        setSelectedDeviceId(device.deviceId);
    };

    return {
        // State
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
        setSelectedDeviceId,
        // Computed
        activeDevices,
        filteredResults,
        // Methods
        handleGetLocation,
        handleSelectDevice,
        setFocusedLocation,
        setFocusTrigger
    };
}
