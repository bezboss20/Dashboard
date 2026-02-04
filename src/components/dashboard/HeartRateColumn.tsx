import { Heart } from 'lucide-react';

// Local interface for patient data used in this component
interface Patient {
    id: string;
    patientId?: string;
    patientCode?: string;
    name: string;
    heartRate: number;
    breathingRate: number;
    alertStatus: 'normal' | 'caution' | 'warning' | 'critical';
    lastUpdated?: string | Date;
}

interface HeartRateColumnProps {
    patients: Patient[];
    globalLastUpdated?: string | Date;
    language: string;
    t: (key: string) => string;
    onViewPatientDetails: (patientId: string) => void;
    getHeartRateSeverity: (hr: number) => 'critical' | 'warning' | 'caution' | 'normal';
}

export function HeartRateColumn({
    patients,
    globalLastUpdated,
    language,
    t,
    onViewPatientDetails,
    getHeartRateSeverity
}: HeartRateColumnProps) {
    const syncTime = globalLastUpdated ? new Date(globalLastUpdated) : new Date();


    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-6 flex flex-col">
            <div className="flex items-center gap-2 lg:gap-3 mb-4">
                <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 lg:w-10 lg:h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
                <div>
                    <h3 className="text-xs lg:text-base font-bold text-gray-900 leading-tight">{t('dashboard.heartRateTitle')}</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('dashboard.sortedByUrgency')}</p>
                </div>
            </div>
            <div className="space-y-1.5 lg:space-y-2 overflow-y-auto" style={{ maxHeight: '500px' }}>
                {patients.map((patient) => {
                    const lastUpdatedDate = (patient.lastUpdated && new Date(patient.lastUpdated).getTime() > 0)
                        ? new Date(patient.lastUpdated)
                        : syncTime;
                    const isStale = (Date.now() - lastUpdatedDate.getTime() > 5 * 60 * 1000);

                    const severity = getHeartRateSeverity(patient.heartRate);
                    const bgColor = severity === 'critical' ? 'bg-red-50 border-red-200' :
                        severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                            severity === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-green-50 border-green-200';
                    const textColor = severity === 'critical' ? 'text-red-600' :
                        severity === 'warning' ? 'text-orange-600' :
                            severity === 'caution' ? 'text-yellow-600' :
                                'text-green-600';
                    const badgeColor = severity === 'critical' ? 'bg-red-100 text-red-600 font-bold' :
                        severity === 'warning' ? 'bg-orange-100 text-orange-600 font-bold' :
                            severity === 'caution' ? 'bg-yellow-100 text-yellow-600 font-bold' :
                                'bg-green-100 text-green-600 font-bold';

                    return (
                        <div
                            key={patient.id}
                            className={`p-2 lg:p-3 rounded-xl border ${bgColor} cursor-pointer hover:shadow-sm transition-shadow ${isStale ? 'opacity-85' : ''}`}
                            onClick={() => onViewPatientDetails(patient.patientId || patient.id)}
                        >
                            <div className="flex items-center justify-between gap-1.5 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs lg:text-sm font-bold text-gray-700 truncate">{patient.name}</span>
                                            {isStale && (
                                                <span
                                                    className="text-[6px] lg:text-[7px] bg-red-100 text-red-600 px-1 rounded font-black uppercase tracking-tighter"
                                                    title={t('dashboard.usingCachedData')}
                                                >
                                                    DELAY
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] md:text-[8px] lg:text-[11px] text-gray-400 font-bold whitespace-nowrap">
                                                {patient.patientCode || 'N/A'}
                                            </span>
                                            <span className="text-[6px] lg:text-[7px] text-gray-400 font-bold uppercase tracking-tight">
                                                {Math.floor((Date.now() - lastUpdatedDate.getTime()) / 60000) === 0
                                                    ? t('time.justNow')
                                                    : `${Math.floor((Date.now() - lastUpdatedDate.getTime()) / 60000)}${t('time.minutesAgo')}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1 shrink-0">
                                    <span className={`text-base lg:text-lg font-black ${textColor}`}>{patient.heartRate}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">{t('common.bpm')}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
