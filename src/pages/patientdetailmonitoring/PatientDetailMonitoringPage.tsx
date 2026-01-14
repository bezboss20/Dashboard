import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { mockPatients, mockAlerts } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import {
    deriveHealthStatus,
    DeviceHealthStatus
} from '../../utils/statusLabels';
import { PatientInfoCard } from '../../components/patientdetailmonitoring/PatientInfoCard';
import { AlertsSection } from '../../components/patientdetailmonitoring/AlertsSection';
import { VitalMetrics } from '../../components/patientdetailmonitoring/VitalMetrics';
import { VitalChart } from '../../components/patientdetailmonitoring/VitalChart';
import { SleepAnalysisSection } from '../../components/patientdetailmonitoring/SleepAnalysisSection';

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
    time: string;
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
    patientStatus: 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';
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

const generateMonitoringData = (range: TimeRange, patientId?: string): MonitoringPoint[] => {
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

        return hrHistory.map((h: { time?: string | Date; value: number }, i: number) => ({
            time: String(h.time || ''),
            timestamp: Date.now(),
            hr: h.value,
            rr: rrHistory[i]?.value || 16
        }));
    }

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
            time: formatTime(time),
            timestamp: time.getTime(),
            hr: Math.round(lastHr),
            rr: parseFloat(lastRr.toFixed(1))
        });
    }

    return points;
};

const getPatientDetail = async (patientId: string): Promise<PatientDetail> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockPatient = mockPatients.find(p => p.id === patientId);
    if (!mockPatient) throw new Error('Patient not found');

    const patientAlerts = mockAlerts.filter(a => a.patientId === patientId);

    return {
        id: mockPatient.id,
        name: mockPatient.nameKorean,
        englishName: mockPatient.nameEnglish,
        age: mockPatient.personalInfo.age,
        gender: mockPatient.personalInfo.gender,
        room: mockPatient.personalInfo.roomNumber,
        status: mockPatient.alertStatus.toUpperCase() as 'STABLE' | 'WARNING' | 'CRITICAL',
        statusLabel: mockPatient.alertStatus,
        lastUpdated: 'time.justNow',
        bloodType: `${mockPatient.personalInfo.bloodType}`,
        deviceId: mockPatient.deviceId,
        doctor: mockPatient.personalInfo.doctorName,
        doctorEnglish: mockPatient.personalInfo.doctorNameEnglish,
        nurse: mockPatient.personalInfo.nurseName,
        nurseEnglish: mockPatient.personalInfo.nurseNameEnglish,
        admissionDate: mockPatient.personalInfo.admissionDate.replace(/-/g, '.'),
        admissionDay:
            Math.floor(
                (new Date().getTime() - new Date(mockPatient.personalInfo.admissionDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1,
        diagnosis: mockPatient.medicalHistory.diagnoses[0] || 'detail.observe',
        patientStatus: mockPatient.patientStatus,
        vitals: {
            hr: {
                value: mockPatient.heartRate,
                status:
                    mockPatient.heartRate > 100 || mockPatient.heartRate < 50
                        ? 'status.critical'
                        : mockPatient.heartRate > 90 || mockPatient.heartRate < 60
                            ? 'status.warning'
                            : mockPatient.heartRate > 85 || mockPatient.heartRate < 65
                                ? 'status.caution'
                                : 'status.normal',
                isNormal: mockPatient.heartRate <= 85 && mockPatient.heartRate >= 65
            },
            stressIndex: {
                value: mockPatient.stressIndex,
                status:
                    mockPatient.stressIndex > 80
                        ? 'status.critical'
                        : mockPatient.stressIndex > 65
                            ? 'status.warning'
                            : mockPatient.stressIndex > 50
                                ? 'status.caution'
                                : 'status.normal',
                isNormal: mockPatient.stressIndex <= 50
            },
            rr: {
                value: mockPatient.breathingRate,
                status:
                    mockPatient.breathingRate > 25 || mockPatient.breathingRate < 10
                        ? 'status.critical'
                        : mockPatient.breathingRate > 22 || mockPatient.breathingRate < 12
                            ? 'status.warning'
                            : mockPatient.breathingRate > 20 || mockPatient.breathingRate < 14
                                ? 'status.caution'
                                : 'status.normal',
                isNormal: mockPatient.breathingRate <= 20 && mockPatient.breathingRate >= 14
            },
            sleepIndex: {
                value: mockPatient.sleepScore,
                status:
                    mockPatient.sleepScore < 50
                        ? 'status.critical'
                        : mockPatient.sleepScore < 65
                            ? 'status.warning'
                            : mockPatient.sleepScore < 80
                                ? 'status.caution'
                                : 'status.normal',
                isNormal: mockPatient.sleepScore >= 80
            },
            connection: {
                value: mockPatient.deviceStatus === 'online' ? 'header.systemOnline' : 'header.systemOffline',
                status: mockPatient.sensorConnected ? 'status.normal' : 'status.warning',
                isNormal: mockPatient.deviceStatus === 'online',
                healthStatus: deriveHealthStatus({
                    connectionStatus: mockPatient.deviceStatus as 'online' | 'offline',
                    deviceStatus: mockPatient.sensorConnected ? 'normal' : 'error'
                })
            }
        },
        alerts: patientAlerts.map(a => ({
            id: a.id,
            type: a.type,
            message: `${a.type} (${a.value})`,
            time: a.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            severity: a.severity === 'critical' ? 'high' : a.severity === 'warning' ? 'medium' : 'low'
        })),
        sleepRecord: {
            totalDuration: `${Math.floor(mockPatient.sleepData.duration)}h ${Math.round((mockPatient.sleepData.duration % 1) * 60)}m`,
            deep: {
                label: 'detail.deepSleep',
                duration: `${Math.floor(mockPatient.sleepData.stages.find(s => s.stage === 'Deep Sleep')?.duration || 0)}h ${Math.round((((mockPatient.sleepData.stages.find(s => s.stage === 'Deep Sleep')?.duration || 0) % 1) * 60))}m`,
                pct: mockPatient.sleepData.stages.find(s => s.stage === 'Deep Sleep')?.percentage || 0
            },
            light: {
                label: 'detail.lightSleep',
                duration: `${Math.floor(mockPatient.sleepData.stages.find(s => s.stage === 'Light Sleep')?.duration || 0)}h ${Math.round((((mockPatient.sleepData.stages.find(s => s.stage === 'Light Sleep')?.duration || 0) % 1) * 60))}m`,
                pct: mockPatient.sleepData.stages.find(s => s.stage === 'Light Sleep')?.percentage || 0
            },
            rem: {
                label: 'detail.remSleep',
                duration: `${Math.floor(mockPatient.sleepData.stages.find(s => s.stage === 'REM')?.duration || 0)}h ${Math.round((((mockPatient.sleepData.stages.find(s => s.stage === 'REM')?.duration || 0) % 1) * 60))}m`,
                pct: mockPatient.sleepData.stages.find(s => s.stage === 'REM')?.percentage || 0
            },
            awake: {
                label: 'detail.awake',
                duration: `${Math.floor(mockPatient.sleepData.stages.find(s => s.stage === 'Awake')?.duration || 0)}h ${Math.round((((mockPatient.sleepData.stages.find(s => s.stage === 'Awake')?.duration || 0) % 1) * 60))}m`,
                pct: mockPatient.sleepData.stages.find(s => s.stage === 'Awake')?.percentage || 0
            }
        }
    };
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

    const [hrRange, setHrRange] = useState<TimeRange>('1시간');
    const [rrRange, setRrRange] = useState<TimeRange>('1시간');

    const hrData = useMemo(() => generateMonitoringData(hrRange, patientId), [hrRange, patientId]);
    const rrData = useMemo(() => generateMonitoringData(rrRange, patientId), [rrRange, patientId]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <p className="text-red-500 font-medium">{error || t('error.patientNotFound')}</p>
                <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    {t('detail.back')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-10 sm:pb-12 font-sans">
            <div className="mx-auto w-full max-w-[1440px] px-0.5 sm:px-4 lg:px-6 xl:px-8">
                {/* Top Header */}
                <header className="py-3 sm:py-6 relative flex items-center justify-center">
                    <button
                        onClick={onBack}
                        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline text-[15px] font-semibold">{t('detail.back')}</span>
                    </button>
                    <h1 className="text-[18px] sm:text-[22px] font-extrabold text-gray-900 tracking-tight">
                        {t('detail.patientInfo')}
                    </h1>
                </header>

                <div
                    className="
            grid gap-4 sm:gap-6 items-start
            grid-cols-1
            lg:grid-cols-[360px_minmax(0,1fr)]
            xl:grid-cols-[380px_minmax(0,1fr)]
          "
                >
                    {/* LEFT */}
                    <div className="space-y-4 sm:space-y-6">
                        <PatientInfoCard
                            data={data}
                            language={language}
                            t={t}
                            onStatusChange={(newStatus) => {
                                setData(prev => prev ? { ...prev, patientStatus: newStatus } : null);
                            }}
                        />
                        <AlertsSection alerts={data.alerts} t={t} />
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4 sm:space-y-6">
                        <VitalMetrics vitals={data.vitals} deviceId={data.deviceId} t={t} />

                        {/* HR */}
                        <VitalChart
                            title={t('detail.hrMonitoring')}
                            data={hrData}
                            dataKey="hr"
                            baseline={hrBaseline}
                            currentRange={hrRange}
                            onRangeChange={setHrRange}
                            color="#EF4444"
                            unit="BPM"
                            gradientId="colorHr"
                        />

                        {/* RR */}
                        <VitalChart
                            title={t('detail.rrMonitoring')}
                            data={rrData}
                            dataKey="rr"
                            baseline={rrBaseline}
                            currentRange={rrRange}
                            onRangeChange={setRrRange}
                            color="#10B981"
                            unit="RPM"
                            gradientId="colorRr"
                        />

                        {/* Sleep */}
                        <SleepAnalysisSection sleepRecord={data.sleepRecord} t={t} />
                    </div>
                </div>
            </div>
        </div>
    );
}
