import { LayoutDashboard, Users, Bell, UserPlus, MapPin, Settings, X } from 'lucide-react';
import { MenuItem } from '../App';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
    currentPage: MenuItem;
    isOpen: boolean;
    onPageChange: (page: MenuItem) => void;
    onClose?: () => void;
}

export function Sidebar({ currentPage, isOpen, onPageChange, onClose }: SidebarProps) {
    const { t } = useLanguage();

    const menuItems: { icon: any; label: MenuItem; id: string; translationKey: string }[] = [
        { icon: LayoutDashboard, label: '통합 대시보드', id: 'dashboard', translationKey: 'sidebar.dashboard' },
        { icon: Users, label: '환자 목록', id: 'patients', translationKey: 'sidebar.patientList' },
        { icon: Bell, label: '알림 기록', id: 'alerts', translationKey: 'sidebar.alertHistory' },
        { icon: UserPlus, label: '환자 등록', id: 'registration', translationKey: 'sidebar.registration' },
        { icon: MapPin, label: 'GPS 위치 추적', id: 'gps', translationKey: 'sidebar.militaryGps' },
        { icon: Settings, label: '설정', id: 'settings', translationKey: 'sidebar.settings' },
    ];

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 max-[374px]:w-[280px] bg-white border-r border-gray-100 flex flex-col h-screen transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 max-[374px]:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 max-[374px]:gap-2">
                    <div className="w-10 h-10 max-[374px]:w-8 max-[374px]:h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <MapPin className="text-white w-5 h-5 max-[374px]:w-4 max-[374px]:h-4" />
                    </div>
                    <div>
                        <h1 className="text-sm max-[374px]:text-xs font-black text-gray-900 leading-tight tracking-tight">{t('sidebar.brandTitle')}</h1>
                        <p className="text-[10px] max-[374px]:text-[9px] text-gray-400 font-bold uppercase tracking-widest">{t('sidebar.brandSubtitle')}</p>
                    </div>
                </div>
                <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => onPageChange(item.label)}
                        className={`w-full flex items-center gap-3 max-[374px]:gap-2 px-4 py-3 max-[374px]:px-2 max-[374px]:py-2 rounded-xl transition-all duration-200 text-sm max-[374px]:text-xs font-medium min-w-0 ${currentPage === item.label
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${currentPage === item.label ? 'text-white' : 'text-gray-400'}`} />
                        <span className="truncate">{t(item.translationKey)}</span>
                    </button>
                ))}
            </nav>

            <div className="p-6 max-[374px]:p-3 mt-auto">
                <div className="bg-gray-50 rounded-2xl p-4 max-[374px]:p-3">
                    <div className="flex items-center gap-3 max-[374px]:gap-2 mb-1">
                        <div className="w-10 h-10 max-[374px]:w-8 max-[374px]:h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-xs">
                                KM
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-900 truncate tracking-tight">{t('sidebar.userName')}</p>
                            <p className="text-[10px] text-gray-400 font-bold truncate">{t('sidebar.role')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
