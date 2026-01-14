import { useState, useMemo, useEffect } from 'react';
import { mockPatients, getAggregatedSleepTrend, Patient } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { appendNotificationLog, formatTimestamp } from '../../data/notificationLogStore';
import { SessionSummary } from '../../components/sleepmanagement/SessionSummary';
import { Hypnogram } from '../../components/sleepmanagement/Hypnogram';
import { SleepTimeInfo } from '../../components/sleepmanagement/SleepTimeInfo';
import { WeeklyTrend } from '../../components/sleepmanagement/WeeklyTrend';
import { VitalsCorrelation } from '../../components/sleepmanagement/VitalsCorrelation';

interface SleepManagementPageProps {
  initialPatientId?: string | null;
  onBack?: () => void;
}

export function SleepManagementPage({ initialPatientId, onBack }: SleepManagementPageProps) {
  const { t } = useLanguage();

  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || mockPatients[0]?.id || '');
  const [trendView, setTrendView] = useState<'Day' | 'Weekly' | 'Monthly'>('Weekly');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    if (initialPatientId) setSelectedPatientId(initialPatientId);
  }, [initialPatientId]);

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

  const currentPatient: Patient = useMemo(
    () => mockPatients.find((p) => p.id === selectedPatientId) || mockPatients[0],
    [selectedPatientId]
  );

  const hypnogramData = useMemo(() => {
    const data: { time: string; stage: number }[] = [];
    const startTime = new Date();
    startTime.setHours(22, 0, 0, 0);

    const seed = currentPatient.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (i: number) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i <= 48; i++) {
      const time = new Date(startTime.getTime() + i * 10 * 60 * 1000);

      let currentStage = 2;
      const cyclePos = i % 9;

      if (cyclePos === 0) currentStage = 4;
      else if (cyclePos < 2) currentStage = 2;
      else if (cyclePos < 5) currentStage = 1;
      else if (cyclePos < 7) currentStage = 2;
      else currentStage = 3;

      if (random(i) > 0.8) {
        currentStage = Math.max(1, Math.min(4, currentStage + (random(i) > 0.5 ? 1 : -1)));
      }

      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        stage: currentStage
      });
    }

    return data;
  }, [currentPatient.id]);

  const trendData = useMemo(() => getAggregatedSleepTrend(currentPatient.id, trendView), [currentPatient.id, trendView]);

  const trendMinWidth = useMemo(() => {
    const count = trendData?.length ?? 0;
    const slot = trendView === 'Monthly' ? (isSmallScreen ? 44 : 52) : isSmallScreen ? 46 : 60;
    const base = isSmallScreen ? 420 : 520;
    return Math.max(base, count * slot);
  }, [trendData, trendView, isSmallScreen]);

  useEffect(() => {
    if (selectedPatientId) {
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
  }, [selectedPatientId]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ✅ Back button is rendered INSIDE SessionSummary now */}
      <SessionSummary
        currentPatient={currentPatient}
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
        <SleepTimeInfo currentPatient={currentPatient} isSmallScreen={isSmallScreen} useScaledDesktopLayout={useScaledDesktopLayout} t={t} />
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
        <VitalsCorrelation currentPatient={currentPatient} isSmallScreen={isSmallScreen} useScaledDesktopLayout={useScaledDesktopLayout} t={t} />
      </div>
    </div>
  );
}
