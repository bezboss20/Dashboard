import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updatePatientStatusLocal } from '../store/slices/monitoringSlice';
import { fetchPatientDetail, updatePatientStatus } from '../services/patientDetailService';
import { PatientDetail, MonitoringPoint, TimeRange } from '../types/patientDetail';
import { useLanguage } from '../context/LanguageContext';

const formatTime = (date: Date, lang: string) => {
    return date.toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: lang === 'en'
    });
};

// Monitoring data should come from the backend. Mock generator removed for production.


export function usePatientDetail(patientId: string) {
    const { t, language } = useLanguage();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [data, setData] = useState<PatientDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [hrRange, setHrRange] = useState<TimeRange>('1시간');
    const [rrRange, setRrRange] = useState<TimeRange>('1시간');
    const [hrRangeSelected, setHrRangeSelected] = useState(false);
    const [rrRangeSelected, setRrRangeSelected] = useState(false);

    const handleHrRangeChange = (range: TimeRange) => {
        if (hrRange === range && hrRangeSelected) {
            setHrRangeSelected(false);
        } else {
            setHrRange(range);
            setHrRangeSelected(true);
        }
    };

    const handleRrRangeChange = (range: TimeRange) => {
        if (rrRange === range && rrRangeSelected) {
            setRrRangeSelected(false);
        } else {
            setRrRange(range);
            setRrRangeSelected(true);
        }
    };

    const hrData = useMemo(() => {
        return data?.hrHistory || [];
    }, [data?.hrHistory]);

    const rrData = useMemo(() => {
        return data?.rrHistory || [];
    }, [data?.rrHistory]);


    const hrBaseline = useMemo(() => {
        if (!hrData || hrData.length === 0) return null;
        const avg = hrData.reduce((acc, curr) => acc + (curr.hr || 0), 0) / hrData.length;
        return Math.round(avg);
    }, [hrData]);

    const rrBaseline = useMemo(() => {
        if (!rrData || rrData.length === 0) return null;
        const avg = rrData.reduce((acc, curr) => acc + (curr.rr || 0), 0) / rrData.length;
        return Number(avg.toFixed(1));
    }, [rrData]);

    useEffect(() => {
        const loadData = async (isInitial: boolean) => {
            try {
                if (isInitial) setLoading(true);
                else setUpdating(true);

                const patientData = await fetchPatientDetail(patientId, language, hrRange);
                setData(patientData);
            } catch (err) {
                if (isInitial) setError('error.loadingData');
            } finally {
                if (isInitial) setLoading(false);
                setUpdating(false);
            }
        };

        loadData(!data); // Only show spinner if data is null

        const interval = setInterval(() => {
            loadData(false);
        }, 10000);

        return () => clearInterval(interval);
    }, [patientId, language, hrRange, rrRange]);

    const handleStatusChange = async (newStatus: any) => {
        if (!data) return;
        try {
            await updatePatientStatus(data.mongoId, newStatus);
            dispatch(updatePatientStatusLocal({ id: data.id, status: newStatus }));
            setData(prev => prev ? { ...prev, patientStatus: newStatus } : null);
            alert(t('patientStatus.updateSuccess'));
        } catch (err) {
            console.error('Error updating patient status:', err);
            alert(t('status.error'));
        }
    };

    return {
        data,
        loading,
        updating,
        error,
        hrData,
        rrData,
        hrBaseline,
        rrBaseline,
        hrRange,
        setHrRange: handleHrRangeChange,
        hrRangeSelected,
        rrRange,
        setRrRange: handleRrRangeChange,
        rrRangeSelected,
        handleStatusChange,
        t,
        language
    };
}
