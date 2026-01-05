import { useState, useMemo, useEffect } from 'react';
import {
    Moon,
    Clock,
    AlertCircle,
    Search,
    ChevronDown,
    Download,
    Activity,
    Heart,
    Wind,
    Activity as SpO2Icon,
    Bed,
    Sun,
    LogOut
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LabelList
} from 'recharts';
import { mockPatients, getAggregatedSleepTrend } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { appendNotificationLog, formatTimestamp } from '../data/notificationLogStore';

export function SleepManagementPage() {
    const { t, language } = useLanguage();
    const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0]?.id || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [trendView, setTrendView] = useState<'Day' | 'Weekly' | 'Monthly'>('Weekly');

    const currentPatient = useMemo(() =>
        mockPatients.find(p => p.id === selectedPatientId) || mockPatients[0]
        , [selectedPatientId]);

    const filteredPatients = useMemo(() =>
        mockPatients.filter(p =>
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.nameKorean.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.personalInfo.roomNumber.includes(searchQuery)
        )
        , [searchQuery]);

    // Generate Hypnogram data based on patientId to keep it deterministic
    const hypnogramData = useMemo(() => {
        const data = [];
        const startTime = new Date();
        startTime.setHours(22, 0, 0, 0);

        // Use a simple hash of patientId for pseudo-randomness
        const seed = currentPatient.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = (i: number) => {
            const x = Math.sin(seed + i) * 10000;
            return x - Math.floor(x);
        };

        for (let i = 0; i <= 48; i++) { // 10 min intervals for 8 hours
            const time = new Date(startTime.getTime() + i * 10 * 60 * 1000);

            // Logic to make it look like a real sleep cycle (Awake=4, REM=3, Light=2, Deep=1)
            let currentStage = 2; // Default to Light
            const cyclePos = i % 9; // 90 min cycles approx

            if (cyclePos === 0) currentStage = 4; // Brief awakening
            else if (cyclePos < 2) currentStage = 2; // Transition to Light
            else if (cyclePos < 5) currentStage = 1; // Deep Sleep
            else if (cyclePos < 7) currentStage = 2; // Back to Light
            else currentStage = 3; // REM

            // Add some jitter
            if (random(i) > 0.8) currentStage = Math.max(1, Math.min(4, currentStage + (random(i) > 0.5 ? 1 : -1)));

            data.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                stage: currentStage
            });
        }
        return data;
    }, [currentPatient.id]);

    const trendData = useMemo(() =>
        getAggregatedSleepTrend(currentPatient.id, trendView)
        , [currentPatient.id, trendView]);

    useEffect(() => {
        if (selectedPatientId) {
            appendNotificationLog({
                id: `SLEEP-ANALYSIS-${selectedPatientId}-${Date.now()}`,
                timestamp: formatTimestamp(new Date()),
                system: "Sleep Management",
                patientId: selectedPatientId,
                category: "수면 관리/품질 분석",
                type: "SLEEP_QUALITY_ANALYSIS",
                status: "성공",
                details: "Sleep quality analysis completed"
            });
        }
    }, [selectedPatientId]);

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Patient Selector Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-full lg:max-w-md min-w-0">
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
                                    {currentPatient.id.split('-')[1] || currentPatient.id} - {language === 'ko' ? currentPatient.nameKorean : currentPatient.nameEnglish}
                                </p>
                                <p className="text-[9px] lg:text-[10px] text-gray-500 truncate">
                                    {currentPatient.personalInfo.roomNumber}{t('detail.roomNumber')} | {currentPatient.personalInfo.age}{t('detail.yearsOld')}
                                </p>
                            </div>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
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
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedPatientId === p.id ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900">{p.id} - {language === 'ko' ? p.nameKorean : p.nameEnglish}</p>
                                            <p className="text-xs text-gray-500">{p.personalInfo.roomNumber}{t('detail.roomNumber')} | {p.personalInfo.age}{t('detail.yearsOld')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-4">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('table.alertStatus')}</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${currentPatient.sensorConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-[13px] font-bold text-gray-700">
                                {currentPatient.sensorConnected ? t('status.online') : t('status.offline')}
                            </span>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" />
                        {t('header.exportReport')}
                    </button>
                    <button className="px-4 py-2 bg-blue-600 rounded-lg text-[13px] font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                        {t('header.liveMonitor')}
                    </button>
                </div>
            </div>

            {/* Top Row: Summary & Score */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sleep Session Summary */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900">{t('sleep.sessionSummary')}</h3>
                            <p className="text-xs text-gray-400 font-medium">{t('sleep.lastNight')} • Oct 12 - Oct 13</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
                            {[
                                { label: t('sleep.totalSleep'), value: `${Math.floor(currentPatient.sleepData.duration)}${t('time.hour')} ${Math.round((currentPatient.sleepData.duration % 1) * 60)}${t('time.minute')}`, sub: `${t('sleep.goal')}: 8${t('time.hour')} 00${t('time.minute')}`, icon: Moon, color: 'bg-blue-50 text-blue-600' },
                                { label: t('sleep.efficiency'), value: `${currentPatient.sleepSession?.efficiency || 90}%`, sub: t('sleep.normalRange'), icon: Activity, color: 'bg-purple-50 text-purple-600' },
                                { label: t('sleep.interruptions'), value: currentPatient.sleepSession?.interruptions || 2, sub: t('sleep.timesWokenUp'), icon: AlertCircle, color: 'bg-orange-50 text-orange-600' },
                                { label: t('sleep.latency'), value: `${currentPatient.sleepSession?.latency || 25}${t('time.minute')}`, sub: t('sleep.timeToFallAsleep'), icon: Clock, color: 'bg-teal-50 text-teal-600' }
                            ].map((card, idx) => (
                                <div key={idx} className="space-y-1 lg:space-y-3">
                                    <div className="flex items-center gap-2">
                                        <card.icon className={`w-3 h-3 lg:w-3.5 lg:h-3.5 ${card.color.split(' ')[1]}`} />
                                        <span className="text-[9px] lg:text-[10px] font-black text-gray-400 tracking-wider uppercase">{card.label}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg lg:text-2xl font-black text-gray-900 tracking-tight">{card.value}</p>
                                        <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold">{card.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sleep Stages Distribution */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-end">
                            <div className="flex gap-4">
                                {currentPatient.sleepData.stages.map((s, idx) => {
                                    const colors = ['bg-orange-400', 'bg-purple-500', 'bg-blue-400', 'bg-blue-600'];
                                    const stageLabels: Record<string, string> = {
                                        'Awake': t('detail.awake'),
                                        'REM': t('detail.remSleep'),
                                        'Light Sleep': t('detail.lightSleep'),
                                        'Deep Sleep': t('detail.deepSleep')
                                    };
                                    return (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${colors[idx]}`}></div>
                                            <span className="text-[10px] font-bold text-gray-500">{stageLabels[s.stage] || s.stage} ({s.percentage}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold">{t('sleep.totalTimeInBed')}: 8{t('time.hour')} 6{t('time.minute')}</p>
                        </div>
                        <div className="h-4 w-full flex rounded-full overflow-hidden shadow-inner">
                            {currentPatient.sleepData.stages.map((s, idx) => {
                                const colors = ['bg-orange-400', 'bg-purple-500', 'bg-blue-400', 'bg-blue-600'];
                                return (
                                    <div key={idx} style={{ width: `${s.percentage}%` }} className={colors[idx]}></div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Overall Sleep Score */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center h-full">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">{t('sleep.overallSleepScore')}</h3>
                    <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background Circle */}
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none" stroke="#f1f5f9" strokeWidth="10"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none" stroke="#f59e0b" strokeWidth="10"
                                strokeDasharray="264"
                                strokeDashoffset={264 - (264 * currentPatient.sleepScore) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-gray-900 leading-none">{currentPatient.sleepScore}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">
                                {currentPatient.sleepScore >= 85 ? t('sleep.excellent') : currentPatient.sleepScore >= 70 ? t('sleep.fair') : t('sleep.poor')}
                            </span>
                        </div>
                    </div>
                    <p className="mt-6 text-[10px] text-gray-500 font-medium leading-relaxed">
                        {t('sleep.avgComparedToUsers')}
                    </p>
                    <div className="mt-5 w-2 h-2 rounded-full bg-yellow-500 shadow-sm shadow-yellow-200"></div>
                </div>
            </div>

            {/* Middle Row: Hypnogram & Sleep Time Info */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sleep Hypnogram */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-900">{t('sleep.hypnogram')}</h3>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hypnogramData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    fontWeight={600}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={6}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    fontWeight={600}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0.2, 4.8]}
                                    ticks={[1, 2, 3, 4]}
                                    tickFormatter={(val) => {
                                        if (val === 4) return t('detail.awake');
                                        if (val === 3) return t('detail.remSleep');
                                        if (val === 2) return t('detail.lightSleep');
                                        if (val === 1) return t('detail.deepSleep');
                                        return '';
                                    }}
                                    width={60}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                                />
                                <Line
                                    type="stepAfter"
                                    dataKey="stage"
                                    stroke="#6366f1"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 수면 시간 정보 */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">{t('sleep.timeInfo')}</h3>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        {[
                            { label: t('sleep.bedIn'), time: currentPatient.sleepSession?.bedInTime || '22:25', icon: Bed, color: 'text-blue-500' },
                            { label: t('sleep.sleep'), time: currentPatient.sleepSession?.sleepTime || '22:55', icon: Moon, color: 'text-purple-500' },
                            { label: t('sleep.wakeUp'), time: currentPatient.sleepSession?.wakeUpTime || '06:13', icon: Sun, color: 'text-orange-500' },
                            { label: t('sleep.bedOut'), time: currentPatient.sleepSession?.bedOutTime || '06:31', icon: LogOut, color: 'text-teal-500' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-2">
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <p className="text-[15px] font-black text-gray-900 tracking-tight">{item.time}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Weekly Trend & Vitals Correlation */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Weekly Trend */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-900">{t('sleep.trend')}</h3>
                        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                            {[
                                { id: 'Day', label: t('sleep.day') },
                                { id: 'Weekly', label: t('sleep.weekly') },
                                { id: 'Monthly', label: t('sleep.monthly') }
                            ].map((view) => (
                                <button
                                    key={view.id}
                                    onClick={() => setTrendView(view.id as any)}
                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${trendView === view.id
                                        ? 'text-blue-600 bg-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 30, right: 30, left: 20, bottom: 10 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="label"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                    domain={[0, 12]}
                                    ticks={[0, 2, 4, 6, 8, 10, 12]}
                                    tickFormatter={(val) => `${val}h`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc', radius: 4 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={trendView === 'Monthly' ? 12 : 44}>
                                    <LabelList
                                        dataKey="hours"
                                        position="top"
                                        offset={8}
                                        style={{ fill: '#64748b', fontSize: '11px', fontWeight: '800' }}
                                        formatter={(val: any) => `${val}h`}
                                    />
                                    {trendData.map((_entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === trendData.length - 1 ? '#2563eb' : '#dbeafe'}
                                            className="transition-all duration-300"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vitals Correlation */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">{t('sleep.vitalsCorrelation')}</h3>
                    <div className="flex-1 flex flex-col justify-between py-2">
                        {[
                            { label: t('sleep.avgHr'), value: currentPatient.heartRate, unit: 'bpm', icon: Heart, color: 'text-red-500', stroke: '#ef4444', spark: [65, 68, 72, 70, 68, 69, 72, 75, 74, 72, 70] },
                            { label: t('sleep.avgResp'), value: currentPatient.breathingRate, unit: 'brm', icon: Wind, color: 'text-blue-400', stroke: '#60a5fa', spark: [14, 15, 14, 13, 13, 14, 15, 14, 14, 13, 13] },
                            { label: t('sleep.avgSpO2'), value: currentPatient.sleepSession?.avgSpO2 || 99, unit: '%', icon: SpO2Icon, color: 'text-teal-500', stroke: '#14b8a6', spark: [98, 99, 99, 98, 99, 99, 98, 99, 99, 99, 99] }
                        ].map((v, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <v.icon className={`w-4 h-4 ${v.color}`} />
                                        <span className="text-[11px] font-bold text-gray-500">{v.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm font-black text-gray-900 tracking-tight">{v.value}</span>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">{v.unit}</span>
                                    </div>
                                </div>
                                <div className="h-10 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={v.spark.map((val, i) => ({ val, i }))}>
                                            <Line
                                                type="monotone"
                                                dataKey="val"
                                                stroke={v.stroke}
                                                strokeWidth={2}
                                                dot={false}
                                                isAnimationActive={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
