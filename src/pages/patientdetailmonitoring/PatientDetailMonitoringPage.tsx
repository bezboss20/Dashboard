import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDispatch } from 'react-redux';
import { updatePatientStatusLocal } from '../../store/slices/monitoringSlice';
import type { AppDispatch } from '../../store/store';
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
    mongoId: string;
    id: string;
    patientCode: string;
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

const generateMonitoringData = (range: TimeRange, _patientId?: string): MonitoringPoint[] => {
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
    const response = await fetch(
        `https://kaleidoscopically-prorailroad-kris.ngrok-free.dev/getPatient/${patientId}`,
        {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        }
    );

    if (!response.ok) {
        throw new Error('API request failed');
    }

    const json = await response.json();

    if (!json.success || !json.data) {
        throw new Error('Invalid API response');
    }

    const apiData = json.data;
    const patient = apiData.patient;
    const currentVitals = apiData.currentVitals;
    const sleepRecord = apiData.sleepRecord;
    const recentAlerts = apiData.recentAlerts || [];
    const deviceStatus = apiData.deviceStatus;

    // Determine status from vitals
    let status: 'STABLE' | 'WARNING' | 'CRITICAL' = 'STABLE';
    if (currentVitals.heartRate?.status?.includes('CRITICAL') || currentVitals.respiratory?.status?.includes('CRITICAL')) {
        status = 'CRITICAL';
    } else if (currentVitals.heartRate?.status?.includes('WARNING') || currentVitals.respiratory?.status?.includes('WARNING')) {
        status = 'WARNING';
    }

    // Map alert severity
    const mapSeverity = (severity: string): 'high' | 'medium' | 'low' => {
        if (severity === 'CRITICAL' || severity === 'HIGH') return 'high';
        if (severity === 'MEDIUM' || severity === 'WARNING') return 'medium';
        return 'low';
    };

    // Map vital status to translation key
    const mapVitalStatus = (apiStatus: string): string => {
        if (apiStatus?.includes('CRITICAL')) return 'status.critical';
        if (apiStatus?.includes('WARNING')) return 'status.warning';
        if (apiStatus?.includes('CAUTION')) return 'status.caution';
        return 'status.normal';
    };

    // Calculate admission day
    const admissionDate = new Date(); // API doesn't provide this, default to today
    const admissionDay = 1;

    return {
        mongoId: patient._id || patient.id,
        id: patient._id || patient.id,
        patientCode: patient.patientCode || 'N/A',
        name: patient.fullName?.ko || patient.patientCode,
        englishName: patient.fullName?.en || patient.patientCode,
        age: patient.age || 0,
        gender: patient.gender === 'FEMALE' ? '여' : '남',
        room: `${patient.ward?.roomNumber || 0}호`,
        status,
        statusLabel: status.toLowerCase(),
        lastUpdated: 'time.justNow',
        bloodType: 'A+', // API doesn't provide blood type
        deviceId: deviceStatus?.deviceCode || 'N/A',
        doctor: '김의사', // API doesn't provide doctor info
        doctorEnglish: 'Dr. Kim',
        nurse: '이간호사',
        nurseEnglish: 'Nurse Lee',
        admissionDate: admissionDate.toISOString().split('T')[0].replace(/-/g, '.'),
        admissionDay,
        diagnosis: 'detail.observe',
        patientStatus: patient.status === 'ACTIVE' ? 'ACTIVE' : 'DISCHARGED',
        vitals: {
            hr: {
                value: currentVitals.heartRate?.value || 0,
                status: mapVitalStatus(currentVitals.heartRate?.status),
                isNormal: currentVitals.heartRate?.status === 'NORMAL'
            },
            stressIndex: {
                value: currentVitals.stressIndex?.value || 0,
                status: 'status.normal',
                isNormal: true
            },
            rr: {
                value: currentVitals.respiratory?.value || 0,
                status: mapVitalStatus(currentVitals.respiratory?.status),
                isNormal: currentVitals.respiratory?.status === 'NORMAL'
            },
            sleepIndex: {
                value: sleepRecord?.score || 0,
                status: sleepRecord?.score < 50 ? 'status.critical' : sleepRecord?.score < 70 ? 'status.warning' : 'status.normal',
                isNormal: (sleepRecord?.score || 0) >= 70
            },
            connection: {
                value: deviceStatus?.isConnected ? 'header.systemOnline' : 'header.systemOffline',
                status: deviceStatus?.isConnected ? 'status.normal' : 'status.warning',
                isNormal: deviceStatus?.isConnected || false,
                healthStatus: deriveHealthStatus({
                    connectionStatus: deviceStatus?.isConnected ? 'online' : 'offline',
                    deviceStatus: deviceStatus?.isConnected ? 'normal' : 'error'
                })
            }
        },
        alerts: recentAlerts.slice(0, 5).map((a: any) => {
            // Map Korean messages to translation keys
            const rawMsg = a.message?.ko || a.message?.en || a.message || '';
            let messageKey = rawMsg;
            if (rawMsg.includes('심박수가 임계치를 초과') || rawMsg.includes('Heart rate exceeded')) {
                messageKey = 'alerts.msg.hrExceeded';
            } else if (rawMsg.includes('호흡수가 정상 범위를 벗어') || rawMsg.includes('Respiratory rate out of normal')) {
                messageKey = 'alerts.msg.rrOutOfRange';
            } else if (rawMsg.includes('낙상') || rawMsg.includes('fall') || rawMsg.includes('Fall')) {
                messageKey = 'alerts.msg.fallDetected';
            } else if (rawMsg.includes('심박수가 위험 기준치 이하') || rawMsg.includes('Heart rate below')) {
                messageKey = 'alerts.msg.hrLow';
            } else if (rawMsg.includes('호흡수가 위험 기준치를 초과') || rawMsg.includes('Respiratory rate exceeded')) {
                messageKey = 'alerts.msg.rrHigh';
            }
            return {
                id: a.id,
                type: a.type || 'ALERT',
                message: messageKey,
                time: new Date(a.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                severity: mapSeverity(a.severity)
            };
        }),
        sleepRecord: {
            totalDuration: sleepRecord?.totalSleep?.formatted || '0h 0m',
            deep: {
                label: 'detail.deepSleep',
                duration: `${Math.floor((sleepRecord?.deepSleep?.duration || 0) / 60)}h ${(sleepRecord?.deepSleep?.duration || 0) % 60}m`,
                pct: Math.round(((sleepRecord?.deepSleep?.duration || 0) / (sleepRecord?.totalSleep?.duration || 1)) * 100)
            },
            light: {
                label: 'detail.lightSleep',
                duration: `${Math.floor((sleepRecord?.lightSleep?.duration || 0) / 60)}h ${(sleepRecord?.lightSleep?.duration || 0) % 60}m`,
                pct: Math.round(((sleepRecord?.lightSleep?.duration || 0) / (sleepRecord?.totalSleep?.duration || 1)) * 100)
            },
            rem: {
                label: 'detail.remSleep',
                duration: `${Math.floor((sleepRecord?.remSleep?.duration || 0) / 60)}h ${(sleepRecord?.remSleep?.duration || 0) % 60}m`,
                pct: Math.round(((sleepRecord?.remSleep?.duration || 0) / (sleepRecord?.totalSleep?.duration || 1)) * 100)
            },
            awake: {
                label: 'detail.awake',
                duration: `${Math.floor((sleepRecord?.awake?.duration || 0) / 60)}h ${(sleepRecord?.awake?.duration || 0) % 60}m`,
                pct: Math.round(((sleepRecord?.awake?.duration || 0) / (sleepRecord?.totalSleep?.duration || 1)) * 100)
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
    const dispatch = useDispatch<AppDispatch>();
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
            <div className="mx-auto w-full max-w-[1440px] min-[2500px]:max-w-none px-0.5 sm:px-4 lg:px-6 xl:px-8">
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
                    <div className="space-y-4 sm:space-y-6 min-w-0">
                        <PatientInfoCard
                            data={data}
                            language={language}
                            t={t}
                            onStatusChange={async (newStatus) => {
                                try {
                                    const response = await fetch(
                                        `https://kaleidoscopically-prorailroad-kris.ngrok-free.dev/update-patient`,
                                        {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'ngrok-skip-browser-warning': 'true'
                                            },
                                            body: JSON.stringify({
                                                _id: data.mongoId,
                                                status: newStatus
                                            })
                                        }
                                    );

                                    if (!response.ok) {
                                        throw new Error('Failed to update status');
                                    }

                                    // Update local monitoring state in Redux
                                    dispatch(updatePatientStatusLocal({ id: data.id, status: newStatus }));

                                    setData(prev => prev ? { ...prev, patientStatus: newStatus } : null);

                                    // Optional: show a success message? Language Context has 'patientStatus.updateSuccess'
                                    alert(t('patientStatus.updateSuccess'));
                                } catch (err) {
                                    console.error('Error updating patient status:', err);
                                    alert(t('status.error'));
                                }
                            }}
                        />
                        <AlertsSection alerts={data.alerts} t={t} />
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4 sm:space-y-6 min-w-0">
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
