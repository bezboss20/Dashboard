import { Activity, Signal, Target, Radio } from 'lucide-react';

interface StatusCardsProps {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    t: (key: string) => string;
}

export function StatusCards({ totalDevices, onlineDevices, offlineDevices, t }: StatusCardsProps) {
    return (
        <>
            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    { label: t('gps.signalStatus'), value: t('status.stable'), sub: 'GPS + GLONASS', color: 'text-green-600', icon: Signal, bg: 'bg-green-50' },
                    { label: t('gps.accuracy'), value: '0.8m', sub: t('gps.horizontalPrecision') || 'Horizontal precision', color: 'text-blue-600', icon: Target, bg: 'bg-blue-50' },
                    { label: t('gps.activeDevices'), value: totalDevices.toString(), sub: '60GHz Nodes', color: 'text-purple-600', icon: Radio, bg: 'bg-purple-50' },
                    { label: t('gps.uptime'), value: '99.9%', sub: t('gps.monitoring247') || '24/7 Monitoring', color: 'text-teal-600', icon: Activity, bg: 'bg-teal-50' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 max-[374px]:p-3 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-blue-200 transition-colors min-w-0">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] max-[374px]:text-[8px] font-black text-gray-400 uppercase tracking-widest max-[374px]:tracking-tight mb-1 truncate">{stat.label}</p>
                            <p className={`text-xl max-[374px]:text-lg font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                            <p className="text-[10px] max-[374px]:text-[8px] text-gray-400 font-bold mt-1 uppercase leading-none truncate">{stat.sub}</p>
                        </div>
                        <div className={`w-10 h-10 max-[374px]:w-8 max-[374px]:h-8 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 ml-2`}>
                            <stat.icon className={`w-5 h-5 max-[374px]:w-4 max-[374px]:h-4 ${stat.color.replace('text-', 'text-opacity-80 text-')}`} />
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .leaflet-container {
                    border-radius: 0 0 1rem 1rem;
                    z-index: 1;
                }
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    padding: 4px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 15px -10px rgba(0, 0, 0, 0.2);
                }
                .custom-popup .leaflet-popup-tip {
                    background: white;
                    border: 1px solid #e2e8f0;
                }
                .marker-highlight {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
                    z-index: 1000 !important;
                }
                @keyframes marker-glow {
                   0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                   70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                   100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}</style>
        </>
    );
}
