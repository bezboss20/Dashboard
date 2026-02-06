import { Activity, Signal, Target, Radio } from 'lucide-react';

interface StatusCardsProps {
    totalDevices: number;
    activeDevices: number;
    uptime: string;
    selectedDeviceAccuracy?: number;
    selectedDeviceName?: string;
    onSignalClick: () => void;
    t: (key: string) => string;
}

export function StatusCards({ totalDevices, activeDevices, uptime, selectedDeviceAccuracy, selectedDeviceName, onSignalClick, t }: StatusCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Signal Status Card - Clickable */}
            <button
                onClick={onSignalClick}
                className="bg-white p-5 max-[374px]:p-3 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-blue-400 hover:ring-4 hover:ring-blue-50 transition-all text-left min-w-0"
            >
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] max-[374px]:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{t('gps.signalStatus')}</p>
                    <p className="text-xl max-[374px]:text-lg font-black text-green-600 tracking-tight">{t('status.stable')}</p>
                    <p className="text-[10px] max-[374px]:text-[8px] text-gray-400 font-bold mt-1 uppercase leading-none truncate">{t('gps.signalDetails') || 'View Device Signals'}</p>
                </div>
                <div className="w-10 h-10 max-[374px]:w-8 max-[374px]:h-8 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ml-2">
                    <Signal className="w-5 h-5 max-[374px]:w-4 max-[374px]:h-4 text-green-600" />
                </div>
            </button>

            {/* Accuracy Card - Context aware */}
            <div className="bg-white p-5 max-[374px]:p-3 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-blue-200 transition-colors min-w-0">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] max-[374px]:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{t('gps.accuracy')}</p>
                    {selectedDeviceAccuracy ? `${selectedDeviceAccuracy.toFixed(1)}m` : '--m'}

                    <p className="text-[10px] max-[374px]:text-[8px] text-gray-400 font-bold mt-1 uppercase leading-none truncate">
                        {selectedDeviceName ? `${selectedDeviceName}` : t('gps.horizontalPrecision')}
                    </p>
                </div>
                <div className="w-10 h-10 max-[374px]:w-8 max-[374px]:h-8 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ml-2">
                    <Target className="w-5 h-5 max-[374px]:w-4 max-[374px]:h-4 text-blue-600" />
                </div>
            </div>

            {/* Active Devices Card */}
            <div className="bg-white p-5 max-[374px]:p-3 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-blue-200 transition-colors min-w-0">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] max-[374px]:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{t('gps.activeDevices')}</p>
                    <p className="text-xl max-[374px]:text-lg font-black text-purple-600 tracking-tight">{activeDevices}</p>
                    <p className="text-[10px] max-[374px]:text-[8px] text-gray-400 font-bold mt-1 uppercase leading-none truncate">60GHz nodes</p>
                </div>
                <div className="w-10 h-10 max-[374px]:w-8 max-[374px]:h-8 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ml-2">
                    <Radio className="w-5 h-5 max-[374px]:w-4 max-[374px]:h-4 text-purple-600" />
                </div>
            </div>

            {/* System Uptime Card */}
            <div className="bg-white p-5 max-[374px]:p-3 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-blue-200 transition-colors min-w-0">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] max-[374px]:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{t('gps.uptime')}</p>
                    <p className="text-xl max-[374px]:text-lg font-black text-teal-600 tracking-tight">{uptime}</p>
                    <p className="text-[10px] max-[374px]:text-[8px] text-gray-400 font-bold mt-1 uppercase leading-none truncate">{t('gps.monitoring247')}</p>
                </div>
                <div className="w-10 h-10 max-[374px]:w-8 max-[374px]:h-8 bg-teal-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ml-2">
                    <Activity className="w-5 h-5 max-[374px]:w-4 max-[374px]:h-4 text-teal-600" />
                </div>
            </div>
        </div>
    );
}
