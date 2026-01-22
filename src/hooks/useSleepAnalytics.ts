import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchSleepAnalyticsAsync } from '../store/slices/sleepSlice';
import { fetchPatientsAsync } from '../store/slices/monitoringSlice';
import { useLanguage } from '../context/LanguageContext';
import { appendNotificationLog, formatTimestamp } from '../data/notificationLogStore';

export function useSleepAnalytics(initialPatientId?: string | null) {
    const { t, getLocalizedText } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();

    const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
    const [trendView, setTrendView] = useState<'Day' | 'Weekly' | 'Monthly'>('Weekly');
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    const { analytics, loading, error } = useSelector((state: RootState) => state.sleep);
    const { patients: allPatients } = useSelector((state: RootState) => state.monitoring);

    // Initial fetch of patients if we don't have them
    useEffect(() => {
        if (allPatients.length === 0) {
            dispatch(fetchPatientsAsync({}));
        }
    }, [dispatch, allPatients.length]);

    // Set initial patient from patients list if not provided
    useEffect(() => {
        if (!initialPatientId && !selectedPatientId && allPatients.length > 0) {
            setSelectedPatientId(allPatients[0].id);
        }
    }, [allPatients, selectedPatientId, initialPatientId]);

    // Fetch sleep analytics when patient changes
    useEffect(() => {
        if (selectedPatientId) {
            dispatch(fetchSleepAnalyticsAsync(selectedPatientId));
        }
    }, [dispatch, selectedPatientId]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mq = window.matchMedia('(max-width: 480px)');
        const updateSmall = () => setIsSmallScreen(mq.matches);
        updateSmall();

        const onResize = () => setViewportWidth(window.innerWidth);
        onResize();

        if (mq.addEventListener) mq.addEventListener('change', updateSmall);
        else mq.addListener(updateSmall);

        window.addEventListener('resize', onResize);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener('change', updateSmall);
            else mq.removeListener(updateSmall);

            window.removeEventListener('resize', onResize);
        };
    }, []);

    const useScaledDesktopLayout = useMemo(() => {
        return !isSmallScreen && viewportWidth >= 1440 && viewportWidth < 2560;
    }, [isSmallScreen, viewportWidth]);

    // Map API stageGraph to component format
    const hypnogramData = useMemo(() => {
        if (!analytics?.stageGraph) return [];

        return analytics.stageGraph.map(point => {
            // Map stage bits to numbers 1-4
            let stage = 2; // Default light
            if (point.awake === 1) stage = 4;
            else if (point.rem === 1) stage = 3;
            else if (point.light === 1) stage = 2;
            else if (point.deep === 1) stage = 1;

            return {
                time: point.time,
                stage: stage
            };
        });
    }, [analytics]);

    const trendData = useMemo(() => {
        if (!analytics?.weeklyTrend) return [];
        return analytics.weeklyTrend.map(item => ({
            label: item.day,
            hours: item.duration
        }));
    }, [analytics]);

    const trendMinWidth = useMemo(() => {
        const count = trendData?.length ?? 0;
        const slot = trendView === 'Monthly' ? (isSmallScreen ? 44 : 52) : isSmallScreen ? 46 : 60;
        const base = isSmallScreen ? 420 : 520;
        return Math.max(base, count * slot);
    }, [trendData, trendView, isSmallScreen]);

    const selectedPatient = useMemo(() =>
        allPatients.find(p => p.id === selectedPatientId),
        [allPatients, selectedPatientId]
    );

    const patientName = useMemo(() => {
        if (selectedPatient) {
            return getLocalizedText(selectedPatient.fullName, selectedPatient.fullName?.ko || '');
        }
        // Fallback: If not found in loaded patient list, try to get name from sleep analytics API response if available
        if (analytics && (analytics as any).patientName) {
            return (analytics as any).patientName;
        }
        return '';
    }, [selectedPatient, getLocalizedText, analytics]);

    useEffect(() => {
        if (selectedPatientId && analytics && selectedPatient) {
            appendNotificationLog({
                id: `SLEEP-ANALYSIS-${selectedPatientId}-${Date.now()}`,
                timestamp: formatTimestamp(new Date()),
                system: '수면 관리',
                patientId: selectedPatientId,
                category: '수면 관리/품질 분석',
                type: '수면_품질_분석',
                status: '성공',
                details: '수면 품질 분석 완료',
                patientName: patientName,
                fullName: selectedPatient.fullName
            });
        }
    }, [selectedPatientId, analytics, selectedPatient, patientName]);

    const refresh = () => selectedPatientId && dispatch(fetchSleepAnalyticsAsync(selectedPatientId));

    return {
        analytics,
        loading,
        error,
        selectedPatientId,
        setSelectedPatientId,
        trendView,
        setTrendView,
        isSmallScreen,
        useScaledDesktopLayout,
        hypnogramData,
        trendData,
        trendMinWidth,
        patientName,
        t,
        refresh
    };
}
