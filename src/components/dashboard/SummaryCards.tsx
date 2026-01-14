import { Users, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
    totalPatients: number;
    activeAlertsCount: number;
    criticalCount: number;
    connectedDevices: number;
    totalDevices: number;
    t: (key: string) => string;
}

export function SummaryCards({
    totalPatients,
    activeAlertsCount,
    criticalCount,
    connectedDevices,
    totalDevices,
    t
}: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
                { label: t('dashboard.totalPatients'), value: totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: t('dashboard.activeAlerts'), value: activeAlertsCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                { label: t('dashboard.criticalPatients'), value: criticalCount, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: t('dashboard.devicesConnected'), value: `${connectedDevices}/${totalDevices}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-teal-50' }
            ].map((card, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6 min-w-0 flex flex-col justify-between group hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] lg:text-[25px] font-black text-gray-600 uppercase tracking-widest mb-1 truncate">{card.label}</p>
                            <p className={`text-xl sm:text-2xl lg:text-3xl font-black ${card.color} tracking-tight`}>{card.value}</p>
                        </div>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${card.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${card.color}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
