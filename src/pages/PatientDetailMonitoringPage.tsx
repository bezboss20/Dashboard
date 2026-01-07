import React, { useState, useEffect, useMemo } from 'react';
import {
    Heart,
    Activity,
    Wind,
    Moon,
    Link2,
    AlertTriangle,
    User,
    ArrowLeft
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine
} from 'recharts';
import { mockPatients, mockAlerts, Patient as MockPatient, Alert as MockAlert } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { deriveHealthStatus, getHealthStatusLabel, getHealthStatusClasses, DeviceHealthStatus } from '../utils/statusLabels';

/**
 * ================================
 * DATA ARCHITECTURE & TYPES
 * ================================
 */

type TimeRange = '5분' | '15분' | '30분' | '1시간' | '6시간' | '24시간';

interface VitalMetric {
    value: number | string;
    status: string;
    isNormal: boolean;
}

interface AlertEntry {
    id: string;
    type: string;
    message: string;
    time: string;
    severity: 'high' | 'medium' | 'low';
}

interface MonitoringPoint {
    time: string; // Formatted time string
    timestamp: number;
    hr: number;
    rr: number;
}

interface PatientDetail {
    id: string;
    name: string;
    englishName: string;
    age: number;
    gender: string;
    room: string;
    status: 'STABLE' | 'WARNING' | 'CRITICAL';
    statusLabel: string;
    lastUpdated: string;
    bloodType: string;
    deviceId: string;
    doctor: string;
    doctorEnglish: string;
    nurse: string;
    nurseEnglish: string;
    admissionDate: string;
    admissionDay: number;
    diagnosis: string;
    vitals: {
        hr: VitalMetric;
        stressIndex: VitalMetric;
        rr: VitalMetric;
        sleepIndex: VitalMetric;
        connection: VitalMetric & { healthStatus: DeviceHealthStatus };
    };
    alerts: AlertEntry[];
    sleepRecord: {
        totalDuration: string;
        deep: { label: string; duration: string; pct: number };
        light: { label: string; duration: string; pct: number };
        rem: { label: string; duration: string; pct: number };
        awake: { label: string; duration: string; pct: number };
    };
}

/**
 * UTILS
 */

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * GENERATE MOCK TIME-SERIES DATA
 */
const generateMonitoringData = (range: TimeRange, patientId?: string): MonitoringPoint[] => {
    // If we have a patient ID, try to find them in mock data to use their real history
    const mockPatient = patientId ? mockPatients.find(p => p.id === patientId) : null;

    if (mockPatient) {
        const rangeMap: Record<string, string> = {
            '5분': 'fiveMin',
            '15분': 'fifteenMin',
            '30분': 'thirtyMin',
            '1시간': 'oneHour',
            '6시간': 'sixHours',
            '24시간': 'twentyFourHours'
        };
        const rangeKey = rangeMap[range] as keyof typeof mockPatient.heartRateHistory;
        const hrHistory = mockPatient.heartRateHistory[rangeKey] || [];
        const rrHistory = mockPatient.breathingRateHistory[rangeKey] || [];

        // Merge histories
        return hrHistory.map((h: any, i: number) => ({
            time: h.time,
            timestamp: Date.now(), // Approximation
            hr: h.value,
            rr: rrHistory[i]?.value || 16
        }));
    }

    // Fallback to random walk if patient not found or for generic display
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

    // Baseline values
    let lastHr = 72;
    let lastRr = 16;

    for (let i = count - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * intervalMs);

        // Random walk for realistic data
        lastHr = Math.max(60, Math.min(100, lastHr + (Math.random() - 0.5) * 4));
        lastRr = Math.max(12, Math.min(22, lastRr + (Math.random() - 0.5) * 1));

        points.push({
            time: formatTime(time),
            timestamp: time.getTime(),
            hr: Math.round(lastHr),
            rr: parseFloat(lastRr.toFixed(1))
        });
    }

    return points;
};

/**
 * MOCK DATA PROVIDER
 * Syncs with the global mockPatients and mockAlerts.
 */
const getPatientDetail = async (patientId: string): Promise<PatientDetail> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    // Find patient in global mock data
    const mockPatient = mockPatients.find(p => p.id === patientId);

    if (!mockPatient) {
        throw new Error('Patient not found');
    }

    // Find all alerts for this patient to ensure vitals show consistency
    const patientAlerts = mockAlerts.filter(a => a.patientId === patientId);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'critical': return '상태: 위급 (CRITICAL)';
            case 'warning': return '상태: 주의 (WARNING)';
            case 'caution': return '상태: 관심 (CAUTION)';
            default: return '상태: 안정 (STABLE)';
        }
    };

    return {
        id: mockPatient.id,
        name: mockPatient.nameKorean,
        englishName: mockPatient.nameEnglish,
        age: mockPatient.personalInfo.age,
        gender: mockPatient.personalInfo.gender, // Keep raw, translate in component
        room: mockPatient.personalInfo.roomNumber,
        status: mockPatient.alertStatus.toUpperCase() as any,
        statusLabel: mockPatient.alertStatus, // Use as key
        lastUpdated: 'time.justNow', // Use as key
        bloodType: `${mockPatient.personalInfo.bloodType}`,
        doctor: mockPatient.personalInfo.doctorName,
        doctorEnglish: mockPatient.personalInfo.doctorNameEnglish,
        nurse: mockPatient.personalInfo.nurseName,
        nurseEnglish: mockPatient.personalInfo.nurseNameEnglish,
        admissionDate: mockPatient.personalInfo.admissionDate.replace(/-/g, '.'),
        admissionDay: Math.floor((new Date().getTime() - new Date(mockPatient.personalInfo.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        diagnosis: mockPatient.medicalHistory.diagnoses[0] || 'detail.observe',
        deviceId: mockPatient.deviceId,
        vitals: {
            hr: {
                value: mockPatient.heartRate,
                status: mockPatient.heartRate > 100 || mockPatient.heartRate < 50 ? 'status.critical' :
                    mockPatient.heartRate > 90 || mockPatient.heartRate < 60 ? 'status.warning' :
                        mockPatient.heartRate > 85 || mockPatient.heartRate < 65 ? 'status.caution' : 'status.normal',
                isNormal: mockPatient.heartRate <= 85 && mockPatient.heartRate >= 65
            },
            stressIndex: {
                value: mockPatient.stressIndex,
                status: mockPatient.stressIndex > 80 ? 'status.critical' :
                    mockPatient.stressIndex > 65 ? 'status.warning' :
                        mockPatient.stressIndex > 50 ? 'status.caution' : 'status.normal',
                isNormal: mockPatient.stressIndex <= 50
            },
            rr: {
                value: mockPatient.breathingRate,
                status: mockPatient.breathingRate > 25 || mockPatient.breathingRate < 10 ? 'status.critical' :
                    mockPatient.breathingRate > 22 || mockPatient.breathingRate < 12 ? 'status.warning' :
                        mockPatient.breathingRate > 20 || mockPatient.breathingRate < 14 ? 'status.caution' : 'status.normal',
                isNormal: mockPatient.breathingRate <= 20 && mockPatient.breathingRate >= 14
            },
            sleepIndex: {
                value: mockPatient.sleepScore,
                status: mockPatient.sleepScore < 50 ? 'status.critical' :
                    mockPatient.sleepScore < 65 ? 'status.warning' :
                        mockPatient.sleepScore < 80 ? 'status.caution' : 'status.normal',
                isNormal: mockPatient.sleepScore >= 80
            },
            connection: {
                value: mockPatient.deviceStatus === 'online' ? 'header.systemOnline' : 'header.systemOffline',
                status: mockPatient.sensorConnected ? 'status.normal' : 'status.warning',
                isNormal: mockPatient.deviceStatus === 'online',
                healthStatus: deriveHealthStatus({
                    connectionStatus: mockPatient.deviceStatus as any,
                    deviceStatus: mockPatient.sensorConnected ? 'normal' : 'error'
                })
            },
        },
        alerts: patientAlerts.map(a => ({
            id: a.id,
            type: a.type,
            message: `${a.type} (${a.value})`,
            time: a.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            severity: a.severity === 'critical' ? 'high' : a.severity === 'warning' ? 'medium' : 'low'
        })),
        sleepRecord: {
            totalDuration: `${Math.floor(mockPatient.sleepData.duration)}h ${Math.round((mockPatient.sleepData.duration % 1) * 60)}m`, // Simplified, translate in UI
            deep: {
                label: 'detail.deepSleep',
                duration: `${Math.floor(mockPatient.sleepData.stages.find(s => s.stage === 'Deep Sleep')?.duration || 0)}h ${Math.round(((mockPatient.sleepData.stages.find(s => s.stage === 'Deep Sleep')?.duration || 0) % 1) * 60)}m`,
                pct: mockPatient.sleepData.stages.find(s => s.stage === 'Deep Sleep')?.percentage || 0
            },
            light: {
                label: 'detail.lightSleep',
                duration: `${Math.floor(mockPatient.sleepData.stages.find(s => s.stage === 'Light Sleep')?.duration || 0)}h ${Math.round(((mockPatient.sleepData.stages.find(s => s.stage === 'Light Sleep')?.duration || 0) % 1) * 60)}m`,
                pct: mockPatient.sleepData.stages.find(s => s.stage === 'Light Sleep')?.percentage || 0
            },
            rem: {
                label: 'detail.remSleep',
                duration: `${Math.floor(mockPatient.sleepData.stages.find(s => s.stage === 'REM')?.duration || 0)}h ${Math.round(((mockPatient.sleepData.stages.find(s => s.stage === 'REM')?.duration || 0) % 1) * 60)}m`,
                pct: mockPatient.sleepData.stages.find(s => s.stage === 'REM')?.percentage || 0
            },
            awake: {
                label: 'detail.awake',
                duration: `${Math.floor(mockPatient.sleepData.stages.find(s => s.stage === 'Awake')?.duration || 0)}h ${Math.round(((mockPatient.sleepData.stages.find(s => s.stage === 'Awake')?.duration || 0) % 1) * 60)}m`,
                pct: mockPatient.sleepData.stages.find(s => s.stage === 'Awake')?.percentage || 0
            },
        }
    };
};

/**
 * ================================
 * INTERNAL REUSABLE COMPONENTS
 * ================================
 */

const SectionCard = ({ title, children, rightElement, className = "" }: { title: string, children: React.ReactNode, rightElement?: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-[17px] font-bold text-gray-900">{title}</h3>
            {rightElement}
        </div>
        {children}
    </div>
);

const MetricCard = ({ icon: Icon, label, value, unit, status, statusKey, colorClass, progressColor }: { icon: any, label: string, value: string | number, unit?: string, status: string, statusKey?: string, colorClass: string, progressColor: string }) => {
    const getStatusColors = (key?: string) => {
        if (!key) return 'text-green-600 bg-green-50';
        if (key.includes('critical')) return 'text-red-600 bg-red-50';
        if (key.includes('warning')) return 'text-orange-600 bg-orange-50';
        if (key.includes('caution')) return 'text-blue-600 bg-blue-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10`}>
                        <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-')}`} />
                    </div>
                    <span className={`text-[10px] font-bold ${getStatusColors(statusKey)} px-2 py-0.5 rounded-full`}>{status}</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{value}</span>
                    {unit && <span className="text-[11px] text-gray-400 font-medium">{unit}</span>}
                </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${progressColor}`} style={{ width: '65%' }}></div>
            </div>
        </div>
    );
};

const AlertRow = ({ severity, title, time }: { severity: string, title: string, time: string }) => {
    const color = severity === 'high' ? 'bg-red-500' : severity === 'medium' ? 'bg-orange-400' : 'bg-blue-500';
    const bgColor = severity === 'high' ? 'bg-red-50' : severity === 'medium' ? 'bg-orange-50' : 'bg-blue-50';

    return (
        <div className={`flex items-center gap-3 p-3 ${bgColor} rounded-lg mb-2 border-l-4 ${color.replace('bg-', 'border-')}`}>
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            <span className="text-[13px] font-bold text-gray-800 flex-1">{title}</span>
            <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{time}</span>
        </div>
    );
};

const InfoRow = ({ label, value, isRed = false }: { label: string, value: string, isRed?: boolean }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
        <span className="text-[13px] text-gray-500">{label}</span>
        <span className={`text-[13px] font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
    </div>
);

const CustomTooltip = ({ active, payload, label, baseline, unit }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-xl shadow-lg text-[12px] font-bold">
                <p className="text-gray-500 mb-1">시간: {label}</p>
                <p className="text-gray-900">수치: {payload[0].value} {unit}</p>
                {baseline && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-gray-400">
                        Baseline: {baseline} {unit}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const TimeRangeSelector = ({ current, onChange }: { current: TimeRange, onChange: (range: TimeRange) => void }) => {
    const ranges: TimeRange[] = ['5분', '15분', '30분', '1시간', '6시간', '24시간'];
    return (
        <div className="flex items-center gap-1">
            {ranges.map(range => (
                <button
                    key={range}
                    onClick={() => onChange(range)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-200 ${current === range
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                >
                    {range}
                </button>
            ))}
        </div>
    );
};

/**
 * ================================
 * PAGE COMPONENT
 * ================================
 */

export function PatientDetailMonitoringPage({ patientId, onBack }: { patientId: string; onBack: () => void }) {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PatientDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Chart States
    const [hrRange, setHrRange] = useState<TimeRange>('1시간');
    const [rrRange, setRrRange] = useState<TimeRange>('1시간');

    // Chart Data - sync with range and patient
    const hrData = useMemo(() => generateMonitoringData(hrRange, patientId), [hrRange, patientId]);
    const rrData = useMemo(() => generateMonitoringData(rrRange, patientId), [rrRange, patientId]);

    // Baseline Calculations
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
                const patientData = await getPatientDetail(patientId);
                setData(patientData);
            } catch (err) {
                setError(t('error.loadingData'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [patientId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-red-500 font-medium">{error || t('error.patientNotFound')}</p>
                <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">{t('detail.back')}</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-12 font-sans">
            <div className="w-full px-0 xs:px-2 lg:px-10">

                {/* Top Header */}
                <header className="py-6 relative flex items-center justify-center">
                    <button
                        onClick={onBack}
                        className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-[15px] font-semibold">{t('detail.back')}</span>
                    </button>
                    <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">{t('detail.patientInfo')}</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* ================================
              LEFT COLUMN (Summary & Alerts)
              ================================ */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Patient Summary Card */}
                        <SectionCard title={t('detail.patientInfo')}>
                            <div className="text-center mb-8">
                                <p className="text-[10px] text-gray-400 mb-4">
                                    {t('alerts.patient')} ID: {data.id} | {t('table.lastUpdated')}: {t(data.lastUpdated)}
                                </p>
                                <div className="w-[100px] h-[100px] bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
                                    <User className="w-10 h-10 text-teal-600 opacity-40" />
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 mb-3 border border-green-100">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-[11px] font-bold text-green-600">{t('status.labelPrefix')}{t('status.' + data.statusLabel)}</span>
                                </div>
                                <h2 className="text-[20px] font-bold text-gray-900 mb-1">{language === 'ko' ? data.name : data.englishName}</h2>
                                <p className="text-[12px] text-gray-500 font-medium">
                                    🎂 1965.05.20 ({data.age}{t('detail.yearsOld')}) | {language === 'ko' ? (data.gender === '남성' ? '남성' : '여성') : (data.gender === '남성' ? 'Male' : 'Female')} | {data.room}{language === 'ko' ? '호' : ''}
                                </p>
                            </div>

                            <div className="space-y-0 text-gray-700">
                                <InfoRow label={t('table.bloodType') || 'Blood Type'} value={data.bloodType} />
                                <InfoRow label={t('detail.admissionDate')} value={`${data.admissionDate} (${data.admissionDay}${t('detail.days')})`} />
                                <InfoRow label={t('detail.diagnosis')} value={t(data.diagnosis)} />
                            </div>
                        </SectionCard>

                        {/* Recent Alerts Card */}
                        <SectionCard
                            title={t('detail.alerts')}
                            rightElement={<button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">{t('alerts.viewAll') || 'View All'}</button>}
                        >
                            <div className="space-y-1">
                                {data.alerts.map(alert => (
                                    <AlertRow key={alert.id} severity={alert.severity} title={alert.message} time={alert.time} />
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    {/* ================================
              RIGHT COLUMN (Vitals & Details)
              ================================ */}
                    <div className="lg:col-span-9 space-y-6">

                        {/* Metric Cards Row */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <MetricCard
                                icon={Heart}
                                label={t('detail.hr')}
                                value={data.vitals.hr.value}
                                unit="bpm"
                                status={t(data.vitals.hr.status)}
                                statusKey={data.vitals.hr.status}
                                colorClass="bg-red-500"
                                progressColor="bg-red-500"
                            />
                            <MetricCard
                                icon={Activity}
                                label={t('detail.stress')}
                                value={data.vitals.stressIndex.value}
                                status={t(data.vitals.stressIndex.status)}
                                statusKey={data.vitals.stressIndex.status}
                                colorClass="bg-blue-500"
                                progressColor="bg-blue-600"
                            />
                            <MetricCard
                                icon={Wind}
                                label={t('detail.rr')}
                                value={data.vitals.rr.value}
                                unit="rpm"
                                status={t(data.vitals.rr.status)}
                                statusKey={data.vitals.rr.status}
                                colorClass="bg-teal-500"
                                progressColor="bg-teal-500"
                            />
                            <MetricCard
                                icon={Moon}
                                label={t('detail.sleepEfficiency')}
                                value={data.vitals.sleepIndex.value}
                                status={t(data.vitals.sleepIndex.status)}
                                statusKey={data.vitals.sleepIndex.status}
                                colorClass="bg-orange-500"
                                progressColor="bg-orange-500"
                            />
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-1.5 rounded-lg bg-green-500 bg-opacity-10">
                                            <Link2 className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className={`text-[10px] font-bold ${getHealthStatusClasses(data.vitals.connection.healthStatus)} px-2 py-0.5 rounded-full`}>
                                            {getHealthStatusLabel(data.vitals.connection.healthStatus)}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-semibold mb-1">{t('detail.connection')}</p>
                                    <p className="text-[15px] font-bold text-green-600 mb-1">{t(String(data.vitals.connection.value))}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">S/N: {data.deviceId}</p>
                                </div>
                                <div className="mt-4 flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${data.vitals.connection.isNormal ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <span className="text-[10px] text-gray-400 font-medium">{t(data.vitals.connection.isNormal ? 'status.online' : 'status.offline')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Heart Rate Monitoring Chart */}
                        <SectionCard
                            title={t('detail.hrMonitoring')}
                            className="overflow-hidden"
                            rightElement={<TimeRangeSelector current={hrRange} onChange={setHrRange} />}
                        >
                            <div className="h-[280px] w-[calc(100%+24px)] -ml-3">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={hrData} margin={{ top: 10, right: 70, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#F3F4F6" />
                                        <XAxis
                                            dataKey="time"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
                                            label={{ value: 'BPM', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 11, fill: '#9CA3AF', fontWeight: 700 } }}
                                            domain={['dataMin - 10', 'dataMax + 10']}
                                        />
                                        <Tooltip content={<CustomTooltip baseline={hrBaseline} unit="BPM" />} />
                                        {hrBaseline && (
                                            <ReferenceLine
                                                y={hrBaseline}
                                                stroke="#94a3b8"
                                                strokeDasharray="6 6"
                                                label={{
                                                    value: 'Baseline',
                                                    position: 'right',
                                                    fill: '#6b7280',
                                                    fontSize: 12
                                                }}
                                            />
                                        )}
                                        <Area
                                            type="monotone"
                                            dataKey="hr"
                                            stroke="#EF4444"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorHr)"
                                            isAnimationActive={true}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-[12px] text-gray-400 font-bold">최근 {hrRange}</p>
                            </div>
                        </SectionCard>

                        {/* Breathing Rate Monitoring Chart */}
                        <SectionCard
                            title={t('detail.rrMonitoring')}
                            className="overflow-hidden"
                            rightElement={<TimeRangeSelector current={rrRange} onChange={setRrRange} />}
                        >
                            <div className="h-[280px] w-[calc(100%+24px)] -ml-3">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={rrData} margin={{ top: 10, right: 70, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRr" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#F3F4F6" />
                                        <XAxis
                                            dataKey="time"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }}
                                            label={{ value: 'RPM', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 11, fill: '#9CA3AF', fontWeight: 700 } }}
                                            domain={['dataMin - 5', 'dataMax + 5']}
                                        />
                                        <Tooltip content={<CustomTooltip baseline={rrBaseline} unit="RPM" />} />
                                        {rrBaseline && (
                                            <ReferenceLine
                                                y={rrBaseline}
                                                stroke="#94a3b8"
                                                strokeDasharray="6 6"
                                                label={{
                                                    value: 'Baseline',
                                                    position: 'right',
                                                    fill: '#6b7280',
                                                    fontSize: 12
                                                }}
                                            />
                                        )}
                                        <Area
                                            type="monotone"
                                            dataKey="rr"
                                            stroke="#10B981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorRr)"
                                            isAnimationActive={true}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-[12px] text-gray-400 font-bold">최근 {rrRange}</p>
                            </div>
                        </SectionCard>

                        {/* Sleep Record Card */}
                        <SectionCard
                            title={t('detail.sleepAnalysis')}
                            rightElement={
                                <span className="text-[11px] font-extrabold bg-gray-50 px-3 py-1.5 rounded-full text-gray-600 border border-gray-100 shadow-sm">
                                    {data.sleepRecord.totalDuration.replace('h', t('time.hour')).replace('m', t('time.minute'))}
                                </span>
                            }
                        >
                            <div className="space-y-8">
                                <div className="h-10 w-full flex rounded-xl overflow-hidden shadow-inner bg-gray-50">
                                    <div style={{ width: `${data.sleepRecord.deep.pct}%` }} className="bg-gradient-to-r from-purple-700 to-purple-500 transition-all duration-500"></div>
                                    <div style={{ width: `${data.sleepRecord.light.pct}%` }} className="bg-purple-300 transition-all duration-500"></div>
                                    <div style={{ width: `${data.sleepRecord.rem.pct}%` }} className="bg-gray-300 transition-all duration-500"></div>
                                    <div style={{ width: `${data.sleepRecord.awake.pct}%` }} className="bg-orange-400 transition-all duration-500"></div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {[data.sleepRecord.deep, data.sleepRecord.light, data.sleepRecord.rem, data.sleepRecord.awake].map((item, idx) => {
                                        const stageKeys = ['detail.deepSleep', 'detail.lightSleep', 'detail.remSleep', 'detail.awake'];
                                        const colors = [
                                            { bullet: 'bg-purple-600', text: 'text-purple-600' },
                                            { bullet: 'bg-purple-300', text: 'text-purple-400' },
                                            { bullet: 'bg-gray-300', text: 'text-gray-400' },
                                            { bullet: 'bg-orange-400', text: 'text-orange-400' },
                                        ];
                                        return (
                                            <div key={idx} className="flex flex-col gap-1.5 pl-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-3 rounded-full ${colors[idx].bullet}`}></div>
                                                    <span className="text-[11px] text-gray-500 font-bold">{t(stageKeys[idx])}</span>
                                                </div>
                                                <span className="text-[15px] font-black text-gray-900">
                                                    {item.duration.replace('h', t('time.hour')).replace('m', t('time.minute'))}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
