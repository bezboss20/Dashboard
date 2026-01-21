import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PatientOverviewTable } from '../../components/monitoring/PatientOverviewTable';
import { PatientFilterBar } from '../../components/monitoring/PatientFilterBar';
import { useLanguage } from '../../context/LanguageContext';
import { fetchPatientsAsync, Patient, MappedPatient } from '../../store/slices/monitoringSlice';
import type { RootState, AppDispatch } from '../../store/store';

type PatientStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';

interface MonitoringPageProps {
    onViewPatientDetails: (patientId: string) => void;
    onViewSleepPage?: (patientId: string) => void;
}

// Helper function to map API patient to display format
const mapPatientToDisplay = (patient: Patient): MappedPatient => {
    console.log('Mapping patient:', patient);

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
            admissionDate: patient.registrationDate || new Date().toISOString(),
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
        registrationDate: patient.registrationDate || new Date().toISOString(),
        patientCode: patient.patientCode || 'N/A'
    };
};

export function MonitoringPage({ onViewPatientDetails, onViewSleepPage }: MonitoringPageProps) {
    const { t, getLocalizedText } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();

    // Get data from Redux store
    const { patients: apiPatients, loading, error } = useSelector((state: RootState) => state.monitoring);

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PatientStatus | 'ALL'>('ALL');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Fetch patients on mount and when filters change
    useEffect(() => {
        const params = {
            page: 1,
            limit: 100,
            patientStatus: statusFilter !== 'ALL' ? statusFilter : undefined,
            search: searchQuery || undefined,
            date: selectedDate || undefined
        };

        console.log('MonitoringPage - Fetching with params:', params);
        console.log('MonitoringPage - Status filter:', statusFilter);

        dispatch(fetchPatientsAsync(params));

        // Set up polling every 15 seconds with current filters
        const interval = setInterval(() => {
            dispatch(fetchPatientsAsync(params));
        }, 15000);

        return () => clearInterval(interval);
    }, [dispatch, statusFilter, searchQuery, selectedDate]);

    // Map API patients to display format once
    const allMappedPatients = useMemo(() => {
        if (!Array.isArray(apiPatients)) return [];
        return apiPatients.map(patient => mapPatientToDisplay(patient));
    }, [apiPatients]);

    // Apply filters locally (Single Source of Truth)
    const displayPatients = useMemo(() => {
        let filtered = [...allMappedPatients];

        // 1. Status Filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(p => p.patientStatus === statusFilter);
        }

        // 2. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.nameKorean?.toLowerCase().includes(query) ||
                p.nameEnglish?.toLowerCase().includes(query) ||
                p.id?.toLowerCase().includes(query)
            );
        }

        // 3. Date Filter (YYYY-MM-DD vs registrationDate timestamp)
        if (selectedDate) {
            filtered = filtered.filter(p => {
                if (!p.registrationDate) return false;
                // Normalize both to YYYY-MM-DD for comparison
                const regDate = p.registrationDate.split('T')[0];
                return regDate === selectedDate;
            });
        }

        return filtered;
    }, [allMappedPatients, statusFilter, searchQuery, selectedDate]);

    // Calculate patient counts based COMPLETELY on the displayed patients list
    // This ensures chips/dropdown/table are always in perfect sync
    const patientCounts = useMemo(() => {
        return {
            active: displayPatients.filter(p => p.patientStatus === 'ACTIVE').length,
            discharged: displayPatients.filter(p => p.patientStatus === 'DISCHARGED').length,
            transferred: displayPatients.filter(p => p.patientStatus === 'TRANSFERRED').length,
        };
    }, [displayPatients]);

    // Show loading state
    if (loading && allMappedPatients.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    // Show error state
    if (error && allMappedPatients.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-medium mb-2">{t('error.loadingData')}</p>
                    <button
                        onClick={() => dispatch(fetchPatientsAsync({}))}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                        {t('common.reset')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Patient Filter Bar */}
            <PatientFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={(status) => {
                    setStatusFilter(status);
                }}
                selectedDate={selectedDate}
                onDateChange={(date) => {
                    setSelectedDate(date);
                }}
                patientCounts={patientCounts}
                t={t}
            />

            {/* Empty state when no patients */}
            {displayPatients.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    {t('common.noResults') || 'No patients found'}
                </div>
            )}

            {/* Patient Overview Table */}
            {displayPatients.length > 0 && (
                <PatientOverviewTable
                    patients={displayPatients}
                    selectedPatientId={selectedPatientId}
                    onSelectPatient={setSelectedPatientId}
                    onViewPatientDetails={onViewPatientDetails}
                    onViewSleepPage={onViewSleepPage}
                    searchQuery={searchQuery}
                />
            )}
        </div>
    );
}
