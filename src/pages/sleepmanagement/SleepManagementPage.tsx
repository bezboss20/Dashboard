import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from '../../context/LanguageContext';
import { appendNotificationLog, formatTimestamp } from '../../data/notificationLogStore';
import { SessionSummary } from '../../components/sleepmanagement/SessionSummary';
import { Hypnogram } from '../../components/sleepmanagement/Hypnogram';
import { SleepTimeInfo } from '../../components/sleepmanagement/SleepTimeInfo';
import { WeeklyTrend } from '../../components/sleepmanagement/WeeklyTrend';
import { VitalsCorrelation } from '../../components/sleepmanagement/VitalsCorrelation';
import { fetchSleepAnalyticsAsync } from '../../store/slices/sleepSlice';
import { fetchPatientsAsync } from '../../store/slices/monitoringSlice';
import type { RootState, AppDispatch } from '../../store/store';

interface SleepManagementPageProps {
  initialPatientId?: string | null;
  onBack?: () => void;
}

export function SleepManagementPage({ initialPatientId, onBack }: SleepManagementPageProps) {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();

  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [trendView, setTrendView] = useState<'Day' | 'Weekly' | 'Monthly'>('Weekly');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Redux state
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
    if (!selectedPatientId && allPatients.length > 0) {
      setSelectedPatientId(allPatients[0].id);
    }
  }, [allPatients, selectedPatientId]);

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

  // Map weekly trend data
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

  useEffect(() => {
    if (selectedPatientId && analytics) {
      appendNotificationLog({
        id: `SLEEP-ANALYSIS-${selectedPatientId}-${Date.now()}`,
        timestamp: formatTimestamp(new Date()),
        system: '수면 관리',
        patientId: selectedPatientId,
        category: '수면 관리/품질 분석',
        type: '수면_품질_분석',
        status: '성공',
        details: '수면 품질 분석 완료'
      });
    }
  }, [selectedPatientId, analytics]);

  if (loading && !analytics) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-bold">{t('error.loadingData')}</p>
        <p className="text-xs text-gray-500">{error}</p>
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              {t('detail.back')}
            </button>
          )}
          <button
            onClick={() => selectedPatientId && dispatch(fetchSleepAnalyticsAsync(selectedPatientId))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {t('common.reset')}
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-4 lg:space-y-6">
      <SessionSummary
        summary={analytics.summary}
        stagePercentages={analytics.stagePercentages}
        isSmallScreen={isSmallScreen}
        useScaledDesktopLayout={useScaledDesktopLayout}
        t={t}
        onBack={onBack}
      />

      <div
        className={
          useScaledDesktopLayout
            ? 'grid grid-cols-4 gap-6'
            : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6'
        }
      >
        <Hypnogram data={hypnogramData} isSmallScreen={isSmallScreen} useScaledDesktopLayout={useScaledDesktopLayout} t={t} />
        <SleepTimeInfo timeInfo={analytics.timeInfo} isSmallScreen={isSmallScreen} useScaledDesktopLayout={useScaledDesktopLayout} t={t} />
      </div>

      <div
        className={
          useScaledDesktopLayout
            ? 'grid grid-cols-4 gap-6'
            : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6'
        }
      >
        <WeeklyTrend
          trendData={trendData}
          trendView={trendView}
          trendMinWidth={trendMinWidth}
          isSmallScreen={isSmallScreen}
          useScaledDesktopLayout={useScaledDesktopLayout}
          onTrendViewChange={setTrendView}
          t={t}
        />
        <VitalsCorrelation vitalCorrelations={analytics.vitalCorrelations} isSmallScreen={isSmallScreen} useScaledDesktopLayout={useScaledDesktopLayout} t={t} />
      </div>
    </div>
  );
}
