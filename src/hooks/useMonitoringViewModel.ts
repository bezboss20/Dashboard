import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPatientsAsync, Patient, MappedPatient, PatientStatus } from '../store/slices/monitoringSlice';
import { useLanguage } from '../context/LanguageContext';

const mapPatientToDisplay = (patient: Patient): MappedPatient => {
    // API returns fullNameData, not fullName
    const fullNameKo = (patient as any).fullNameData?.ko || (patient as any).fullName?.ko || (patient as any).nameKorean || (patient as any).name || patient.patientCode || 'N/A';
    const fullNameEn = (patient as any).fullNameData?.en || (patient as any).fullName?.en || (patient as any).nameEnglish || patient.patientCode || 'N/A';

    // API uses latestHeartRate, latestRespiratoryRate, latestSleepRecord
    const heartRateValue = (patient as any).latestHeartRate?.value || (patient as any).heartRate || patient.currentVitals?.heartRate?.value || 0;
    const breathingRateValue = (patient as any).latestRespiratoryRate?.value || (patient as any).breathingRate || patient.currentVitals?.respiratory?.value || 0;

    // Get current sleep stage from latestSleepRecord
    const sleepRecordStages = (patient as any).latestSleepRecord?.stages || [];
    const currentSleepStage = sleepRecordStages.length > 0
        ? sleepRecordStages[sleepRecordStages.length - 1].type
        : ((patient as any).sleepState || patient.sleepRecord?.stage || 'Unknown');

    const patientMongoId = ((patient as any)._id && (patient as any)._id.length > 20) ? (patient as any)._id :
        (patient.id && patient.id.length > 20) ? patient.id :
            (patient as any)._id || patient.id || 'N/A';

    const foundRegistrationDate = (patient as any).registrationDate ||
        (patient as any).createdAt ||
        (patient as any).created_at ||
        patient.registrationDate;

    return {
        id: patientMongoId as string,
        name: fullNameKo,
        nameKorean: fullNameKo,
        nameEnglish: fullNameEn,
        // Use the extracted values
        heartRate: heartRateValue,
        breathingRate: breathingRateValue,
        sleepState: currentSleepStage,
        deviceStatus: (patient as any).deviceStatus || ((patient as any).devices?.[0]?.status?.toLowerCase() || 'offline'),
        deviceId: (patient as any).deviceId || (patient as any).devices?.[0]?.serialNumber || patient.deviceStatus?.deviceCode || 'N/A',
        lastUpdated: new Date().toISOString(),
        patientStatus: patient.status,
        sensorConnected: (patient as any).sensorConnected !== undefined ? (patient as any).sensorConnected : ((patient as any).devices?.[0]?.status === 'ONLINE' || patient.deviceStatus?.isConnected || false),
        alertStatus: ((patient as any).alertStatus || patient.currentVitals?.heartRate?.status?.toLowerCase() || 'normal') as 'normal' | 'caution' | 'warning' | 'critical',
        stressIndex: (patient as any).stressIndex || 0,
        sleepScore: (patient as any).sleepScore || (patient as any).latestSleepRecord?.score || patient.sleepRecord?.score || 0,
        radarDetection: true,
        heartRateHistory: (patient as any).heartRateHistory || {
            oneMin: [{ value: heartRateValue }],
            fiveMin: [{ value: heartRateValue }],
            fifteenMin: [{ value: heartRateValue }],
            thirtyMin: [{ value: heartRateValue }],
            oneHour: [{ value: heartRateValue }],
            sixHours: [{ value: heartRateValue }],
            twentyFourHours: [{ value: heartRateValue }]
        },
        breathingRateHistory: (patient as any).breathingRateHistory || {
            oneMin: [{ value: breathingRateValue }],
            fiveMin: [{ value: breathingRateValue }],
            fifteenMin: [{ value: breathingRateValue }],
            thirtyMin: [{ value: breathingRateValue }],
            oneHour: [{ value: breathingRateValue }],
            sixHours: [{ value: breathingRateValue }],
            twentyFourHours: [{ value: breathingRateValue }]
        },
        personalInfo: {
            age: patient.age,
            gender: patient.gender === 'FEMALE' ? '여' : '남',
            roomNumber: patient.ward?.roomNumber || 'N/A',
            dateOfBirth: '',
            bloodType: '',
            height: 0,
            weight: 0,
            bedNumber: '',
            admissionDate: foundRegistrationDate || '',
            contactNumber: '',
            doctorName: '',
            nurseName: '',
            doctorNameEnglish: '',
            nurseNameEnglish: '',
            hospital: '',
            hospitalEnglish: '',
            emergencyContact: {
                name: '',
                nameEnglish: '',
                relationship: '',
                relationshipEnglish: '',
                phone: ''
            }
        },
        registrationDate: foundRegistrationDate, // No fallback
        patientCode: patient.patientCode || 'N/A'
    };
};

export function useMonitoringViewModel() {
    const { t, getLocalizedText } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();

    // Get data from Redux store
    const { patients: apiPatients, loading, error } = useSelector((state: RootState) => state.monitoring);

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PatientStatus | 'ALL'>('ALL');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Calculate patient counts
    // FIX: Calculate counts from ALL fetched patients (or at least the current batch)
    // Ideally, for accurate global counts, the API should return these stats.
    // But given the current structure, we calculate from available data.
    // If the API returns filtered data, these counts will only reflect the filtered set.
    // This is a common UI pattern limitation unless 'total' counts are returned separately.
    // However, the user issue "requesting data" might be that the local filter
    // shouldn't re-apply if the API did it.

    // Actually, looking at the useEffect, we call API *WITH* params.
    // So `apiPatients` only contains the filtered results. 
    // Applying local `displayPatients` filtering is redundant but harmless.
    // But `patientCounts` derived from `displayPatients` will certainly change when filters change.
    // If the user wants to see "Global Counts" while filtering, the API needs to provide them.
    // Since we don't have that, we'll keep it as is, but maybe the user meant the requests loop?

    // The user said: "issues with requesting data from the Patient Filtering bar"
    // The `useEffect` has `statusFilter`, `searchQuery`, `selectedDate` as dependencies.
    // This looks correct for server-side filtering.
    // But we ALSO implement local filtering in `displayPatients`.
    // If the API returns filtered data, `allMappedPatients` is *already* filtered.
    // Then `displayPatients` filters it *again*.
    // The issue might be debouncing. Every keystroke in `searchQuery` triggers an API call.

    // Let's add debouncing to the search query in the effect.

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch patients on mount and when filters change
    useEffect(() => {
        const params = {
            page: 1,
            limit: 100,
            patientStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
            search: debouncedSearchQuery || undefined,
            date: selectedDate || undefined
        };

        dispatch(fetchPatientsAsync(params));

        const interval = setInterval(() => {
            dispatch(fetchPatientsAsync(params));
        }, 15000);

        return () => clearInterval(interval);
    }, [dispatch, statusFilter, debouncedSearchQuery, selectedDate]);

    // Map API patients to display format once
    const allMappedPatients = useMemo(() => {
        if (!Array.isArray(apiPatients)) return [];
        return apiPatients.map(patient => mapPatientToDisplay(patient));
    }, [apiPatients]);

    // Apply filters locally (Single Source of Truth)
    // FIX: Trust the API response to already be filtered. 
    // Double-filtering locally caused glitches because local 'searchQuery' updated instantly 
    // while 'apiPatients' was still stale (waiting for debounce + network).
    // Apply filters locally (Single Source of Truth)
    // FIX: Re-enable local STATUS filtering only.
    // The API seems to return broad data or default data (e.g. Discharged) even when 'TRANSFERRED' is requested.
    // To ensure the UI matches the selected tab, we must enforce the status filter locally.
    // We do NOT filter by search/date locally to avoid the typing glitch (race condition).
    const displayPatients = useMemo(() => {
        let filtered = allMappedPatients;

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(p => p.patientStatus === statusFilter);
        }

        return filtered;
    }, [allMappedPatients, statusFilter]);

    // Calculate patient counts
    const patientCounts = useMemo(() => {
        return {
            active: displayPatients.filter(p => p.patientStatus === 'ACTIVE').length,
            discharged: displayPatients.filter(p => p.patientStatus === 'DISCHARGED').length,
            transferred: displayPatients.filter(p => p.patientStatus === 'TRANSFERRED').length,
        };
    }, [displayPatients]);

    const refresh = () => dispatch(fetchPatientsAsync({}));

    return {
        loading,
        error,
        displayPatients,
        patientCounts,
        selectedPatientId,
        setSelectedPatientId,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        selectedDate,
        setSelectedDate,
        refresh,
        t
    };
}
