import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPatientsAsync, Patient } from '../store/slices/monitoringSlice';
import { useLanguage } from '../context/LanguageContext';
import { DeviceLocation } from '../types/gps';
import { getHeartRateSeverity, getBreathingRateSeverity } from '../utils/dashboardUtils';

// Coordinates should come from the backend. Static generation removed for production.


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
    const [popupTrigger, setPopupTrigger] = useState(0);
    const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [healthStatusFilter, setHealthStatusFilter] = useState<'ALL' | 'normal' | 'caution' | 'warning' | 'critical'>('ALL');
    const watchId = useRef<number | null>(null);

    // Map real patients to devices
    const allDevices = useMemo(() => {
        if (!patients) return [];
        return patients.map((p: Patient) => {
            const pId = p.id || (p as any)._id || '0';
            const lat = (p as any).lat || 0;
            const lng = (p as any).lng || 0;
            const patientName = (p as any).fullName
                ? getLocalizedText((p as any).fullName, (p as any).fullName.ko || p.patientCode || '')
                : p.patientCode || '';

            const hrVal = (p as any).latestHeartRate?.value || (p as any).heartRate || p.currentVitals?.heartRate?.value || 0;
            const brVal = (p as any).latestRespiratoryRate?.value || (p as any).breathingRate || p.currentVitals?.respiratory?.value || 0;

            const status = (p as any).deviceStatus === 'online' || (p as any).devices?.[0]?.status === 'ONLINE' ? 'online' : 'offline';

            // Real values should come from backend. Using fallbacks of 0/default.
            const rssi = (p as any).rssi || (status === 'online' ? -60 : -110);
            const accuracy = (p as any).accuracy || 0;


            return {
                deviceId: (p as any).deviceId || (p as any).devices?.[0]?.serialNumber || p.patientCode || 'NODE-' + pId.slice(-4),
                lat,
                lng,
                status,
                healthStatus: (() => {
                    const hrSev = getHeartRateSeverity(hrVal);
                    const brSev = getBreathingRateSeverity(brVal);
                    const severityOrder: Record<string, number> = { 'critical': 3, 'warning': 2, 'caution': 1, 'normal': 0 };
                    let finalStatus = (((p as any).alertStatus?.toLowerCase() || 'normal') as 'normal' | 'caution' | 'warning' | 'critical');
                    if (severityOrder[hrSev] > severityOrder[finalStatus]) finalStatus = hrSev;
                    if (severityOrder[brSev] > severityOrder[finalStatus]) finalStatus = brSev;
                    return finalStatus;
                })(),
                lastUpdated: new Date(),
                patientId: p.patientCode,
                patientName,
                rssi,
                accuracy
            } as DeviceLocation;
        });
    }, [patients, getLocalizedText]);

    const systemUptime = (patients?.[0] as any)?.systemUptime || "--:--";


    const activeDevices = useMemo(() => {
        if (healthStatusFilter === 'ALL') return allDevices;
        return allDevices.filter(d => d.healthStatus === healthStatusFilter);
    }, [allDevices, healthStatusFilter]);

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

    const criticalDevices = useMemo(() => {
        return allDevices.filter(d => d.healthStatus === 'critical' && d.status === 'online');
    }, [allDevices]);

    const handleSelectDevice = (device: DeviceLocation) => {
        const coords: [number, number] = [device.lat, device.lng];
        setIsAutoTracking(false);
        setFocusedLocation(coords);

        // Batch trigger and selection
        setFocusTrigger(prev => prev + 1);
        setPopupTrigger(prev => prev + 1);
        setSelectedDeviceId(device.deviceId);

        // Reset search
        setSearchQuery('');
    };

    const clearSelection = useCallback(() => {
        setSelectedDeviceId(null);
    }, []);

    // Auto-focus on emergency/critical alerts
    const prevCriticalIds = useRef<string[]>([]);
    useEffect(() => {
        const currentCriticalDevices = allDevices.filter(d => d.healthStatus === 'critical' && d.status === 'online');

        // Check if there are NEW critical IDs that weren't present in the previous batch
        const hasNewCritical = currentCriticalDevices.some(d => !prevCriticalIds.current.includes(d.deviceId));

        // Smart Relocation: 
        // 1. Only trigger if there's actually a NEW emergency ID
        // 2. IMPORTANT: Do NOT relocate if the user is busy inspecting someone (selectedDeviceId is not null)
        // 3. Do NOT relocate if the user is tracking their own location (isAutoTracking is true)
        if (hasNewCritical && selectedDeviceId === null && !isAutoTracking) {
            setFitBoundsTrigger(prev => prev + 1);
        }

        prevCriticalIds.current = currentCriticalDevices.map(d => d.deviceId);
    }, [allDevices, selectedDeviceId, isAutoTracking, setFitBoundsTrigger]);

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
        popupTrigger,
        fitBoundsTrigger,
        selectedDeviceId,
        setSelectedDeviceId,
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
        setPopupTrigger,
        setFitBoundsTrigger
    };
}
