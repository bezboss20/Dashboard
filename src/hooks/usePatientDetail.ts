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

// Mock data generator for charts (kept internal as it's UI specific)
const generateMonitoringData = (range: TimeRange, lang: string, _patientId?: string): MonitoringPoint[] => {
    const points: MonitoringPoint[] = [];
    const now = new Date();
    let intervalMs = 0;
    let count = 0;

    switch (range) {
        case '5분': intervalMs = 30 * 1000; count = 11; break;
        case '15분': intervalMs = 60 * 1000; count = 16; break;
        case '30분': intervalMs = 2 * 60 * 1000; count = 16; break;
        case '1시간': intervalMs = 5 * 60 * 1000; count = 13; break;
        case '6시간': intervalMs = 30 * 60 * 1000; count = 13; break;
        case '24시간': intervalMs = 2 * 60 * 60 * 1000; count = 13; break;
    }

    let lastHr = 72;
    let lastRr = 16;

    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * intervalMs);
        lastHr = Math.max(60, Math.min(100, lastHr + (Math.random() - 0.5) * 4));
        lastRr = Math.max(12, Math.min(22, lastRr + (Math.random() - 0.5) * 1));

        points.push({
            time: formatTime(time, lang),
            timestamp: time.getTime(),
            hr: Math.round(lastHr),
            rr: parseFloat(lastRr.toFixed(1))
        });
    }

    return points;
};

export function usePatientDetail(patientId: string) {
    const { t, language } = useLanguage();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PatientDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [hrRange, setHrRange] = useState<TimeRange>('1시간');
    const [rrRange, setRrRange] = useState<TimeRange>('1시간');

    const hrData = useMemo(() => generateMonitoringData(hrRange, language, patientId), [hrRange, language, patientId]);
    const rrData = useMemo(() => generateMonitoringData(rrRange, language, patientId), [rrRange, language, patientId]);

    const hrBaseline = useMemo(() => {
        if (hrData.length === 0) return null;
        const avg = hrData.reduce((acc, curr) => acc + curr.hr, 0) / hrData.length;
        return Math.round(avg);
    }, [hrData]);

    const rrBaseline = useMemo(() => {
        if (rrData.length === 0) return null;
        const avg = rrData.reduce((acc, curr) => acc + curr.rr, 0) / rrData.length;
        return Number(avg.toFixed(1));
    }, [rrData]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const patientData = await fetchPatientDetail(patientId, language);
                setData(patientData);
            } catch (err) {
                setError('error.loadingData');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [patientId, language]);

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
        error,
        hrData,
        rrData,
        hrBaseline,
        rrBaseline,
        hrRange,
        setHrRange,
        rrRange,
        setRrRange,
        handleStatusChange,
        t,
        language
    };
}
