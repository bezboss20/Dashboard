import { Users, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
    totalPatients: number;
    activeAlertsCount: number;
    criticalCount: number;
    connectedDevices: number;
    totalDevices: number;
    lastUpdated: string | null;
    t: (key: string) => string;
}

export function SummaryCards({
    totalPatients,
    activeAlertsCount,
    criticalCount,
    connectedDevices,
    totalDevices,
    lastUpdated,
    t
}: SummaryCardsProps) {
    const formatRefreshTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        try {
            const d = new Date(isoString);
            const diffMinutes = Math.floor((Date.now() - d.getTime()) / 60000);
            if (diffMinutes < 1) return t('time.justNow');
            return `${diffMinutes}${t('time.minutesAgo')}`;
        } catch {
            return '--:--';
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-end px-1">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                    {t('dashboard.lastUpdated')}: {formatRefreshTime(lastUpdated)}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                {[
                    { label: t('dashboard.totalPatients'), value: totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: t('dashboard.activeAlerts'), value: activeAlertsCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: t('dashboard.criticalPatients'), value: criticalCount, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: t('dashboard.devicesConnected'), value: `${connectedDevices}/${totalDevices}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-teal-50' }
                ].map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 max-[374px]:p-3 sm:p-5 lg:p-6 min-w-0 flex flex-col justify-between group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-2 max-[374px]:gap-1">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] max-[374px]:text-[8px] lg:text-xs font-black text-gray-600 uppercase tracking-widest max-[374px]:tracking-tight mb-1 truncate">{card.label}</p>
                                <p className={`text-xl max-[374px]:text-lg sm:text-2xl lg:text-3xl font-black ${card.color} tracking-tight`}>{card.value}</p>
                            </div>
                            <div className={`w-8 h-8 max-[374px]:w-6 max-[374px]:h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${card.bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <card.icon className={`w-4 h-4 max-[374px]:w-3 max-[374px]:h-3 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
