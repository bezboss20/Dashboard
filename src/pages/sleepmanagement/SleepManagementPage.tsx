import { useState, useMemo, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    ArrowLeft
} from 'lucide-react';
import { mockPatients, getAggregatedSleepTrend } from '../../data/mockData';
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
    const { t, language } = useLanguage();
    const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || mockPatients[0]?.id || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [trendView, setTrendView] = useState<'Day' | 'Weekly' | 'Monthly'>('Weekly');
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    // Update selected patient when initialPatientId changes
    useEffect(() => {
        if (initialPatientId) {
            setSelectedPatientId(initialPatientId);
        }
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

    /**
     * ✅ Goal:
     * - 320–425 (<=480): keep current responsive behavior exactly as-is
     * - 768 / 1024 / 1440: force desktop layout classes (scaling is now handled globally)
     * - 2560: normal (already desktop)
     */
    const useScaledDesktopLayout = useMemo(() => {
        // Only enforce the "desktop fixed layout" for larger screens (1440px and up).
        // 768px and 1024px will use the normal responsive Tailwind classes
        // to avoid cramped layouts at those breakpoints.
        return !isSmallScreen && viewportWidth >= 1440 && viewportWidth < 2560;
    }, [isSmallScreen, viewportWidth]);

    const currentPatient = useMemo(
        () => mockPatients.find(p => p.id === selectedPatientId) || mockPatients[0],
        [selectedPatientId]
    );

    const filteredPatients = useMemo(
        () =>
            mockPatients.filter(
                p =>
                    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.nameKorean.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.personalInfo.roomNumber.includes(searchQuery)
            ),
        [searchQuery]
    );

    const hypnogramData = useMemo(() => {
        const data = [];
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
            {/* Patient Selector Row */}
            <div
                className={[
                    // ✅ Force desktop row layout for 768–1440 so it matches 2560
                    useScaledDesktopLayout
                        ? 'flex flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm'
                        : 'flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm'
                ].join(' ')}
            >
                <div className="flex items-center gap-3 w-full lg:max-w-2xl min-w-0">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex-shrink-0 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all shadow-sm"
                            title={t('detail.back')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative flex-1 min-w-0">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 lg:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all overflow-hidden"
                        >
                            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px] lg:text-xs flex-shrink-0">
                                    {(language === 'ko' ? currentPatient.nameKorean : currentPatient.nameEnglish).substring(0, 1)}
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-[11px] lg:text-[13px] font-bold text-gray-900 truncate">
                                        {currentPatient.id.split('-')[1] || currentPatient.id} -{' '}
                                        {language === 'ko' ? currentPatient.nameKorean : currentPatient.nameEnglish}
                                    </p>
                                    <p className="text-[9px] lg:text-[10px] text-gray-500 truncate">
                                        {currentPatient.personalInfo.roomNumber}
                                        {t('detail.roomNumber')} | {currentPatient.personalInfo.age}
                                        {t('detail.yearsOld')}
                                    </p>
                                </div>
                            </div>
                            <ChevronDown
                                className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 border-b border-gray-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder={t('table.searchPlaceholder')}
                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-0"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredPatients.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPatientId(p.id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedPatientId === p.id ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {p.id} - {language === 'ko' ? p.nameKorean : p.nameEnglish}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {p.personalInfo.roomNumber}
                                                    {t('detail.roomNumber')} | {p.personalInfo.age}
                                                    {t('detail.yearsOld')}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className={[
                        useScaledDesktopLayout ? 'w-auto flex items-center gap-3' : 'w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'
                    ].join(' ')}
                >
                    <div className="w-full sm:w-auto flex items-center justify-between sm:flex-col sm:items-end sm:mr-4">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">{t('table.alertStatus')}</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${currentPatient.sensorConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-[12px] sm:text-[13px] font-bold text-gray-700 whitespace-nowrap">
                                {currentPatient.sensorConnected ? t('status.online') : t('status.offline')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Row: Summary */}
            <SessionSummary
                currentPatient={currentPatient}
                isSmallScreen={isSmallScreen}
                useScaledDesktopLayout={useScaledDesktopLayout}
                t={t}
            />

            {/* Middle Row: Hypnogram & Sleep Time Info */}
            <div className={useScaledDesktopLayout ? 'grid grid-cols-4 gap-6' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6'}>
                <Hypnogram
                    data={hypnogramData}
                    isSmallScreen={isSmallScreen}
                    useScaledDesktopLayout={useScaledDesktopLayout}
                    t={t}
                />
                <SleepTimeInfo
                    currentPatient={currentPatient}
                    isSmallScreen={isSmallScreen}
                    useScaledDesktopLayout={useScaledDesktopLayout}
                    t={t}
                />
            </div>

            {/* Bottom Row: Weekly Trend & Vitals Correlation */}
            <div className={useScaledDesktopLayout ? 'grid grid-cols-4 gap-6' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6'}>
                <WeeklyTrend
                    trendData={trendData}
                    trendView={trendView}
                    trendMinWidth={trendMinWidth}
                    isSmallScreen={isSmallScreen}
                    useScaledDesktopLayout={useScaledDesktopLayout}
                    onTrendViewChange={setTrendView}
                    t={t}
                />
                <VitalsCorrelation
                    currentPatient={currentPatient}
                    isSmallScreen={isSmallScreen}
                    useScaledDesktopLayout={useScaledDesktopLayout}
                    t={t}
                />
            </div>
        </div >
    );
}
