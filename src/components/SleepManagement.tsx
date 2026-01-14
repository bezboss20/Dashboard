import { useMemo } from 'react';
import { Moon, Activity, AlertCircle, Clock } from 'lucide-react';
import { Patient } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface SleepManagementProps {
    patient: Patient;
}

export function SleepManagement({ patient }: SleepManagementProps) {
    const { t } = useLanguage();

    const summaryCards = useMemo(() => [
        { label: 'TOTAL SLEEP', value: `${Math.floor(patient.sleepData.duration)}h ${Math.round((patient.sleepData.duration % 1) * 60)}m`, sub: 'Goal: 8h 00m', icon: Moon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'EFFICIENCY', value: `${patient.sleepSession?.efficiency || 90}%`, sub: 'Normal Range', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'INTERRUPTIONS', value: patient.sleepSession?.interruptions || 2, sub: 'Times woken up', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'LATENCY', value: `${patient.sleepSession?.latency || 25}m`, sub: 'Time to fall asleep', icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' }
    ], [patient, t]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-gray-400">
                            <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                            <span className="text-[10px] font-black tracking-wider uppercase">{card.label}</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-gray-900 tracking-tight">{card.value}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sleep Stages</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Total time in bed: 8h 6m</span>
                </div>

                <div className="h-4 w-full flex rounded-full overflow-hidden">
                    {patient.sleepData.stages.map((s, idx) => {
                        const colors = ['bg-orange-400', 'bg-purple-500', 'bg-blue-400', 'bg-blue-600'];
                        return (
                            <div key={idx} style={{ width: `${s.percentage}%` }} className={colors[idx]}></div>
                        );
                    })}
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                    {patient.sleepData.stages.map((s, idx) => {
                        const colors = ['bg-orange-400', 'bg-purple-500', 'bg-blue-400', 'bg-blue-600'];
                        return (
                            <div key={idx} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${colors[idx]}`}></div>
                                <span className="text-[10px] font-bold text-gray-500">{s.stage} ({s.percentage}%)</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
