import {
    LayoutDashboard,
    Users,
    Bell,
    UserPlus,
    MapPin,
    Settings,
    Menu,
    X,
    Globe,
    Calendar,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { MenuItem } from '../App';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import Logo from '../assets/Logo1.png';
interface NavbarProps {
    currentPage: MenuItem;
    onPageChange: (page: MenuItem) => void;
    systemOnline: boolean;
    onToggleSystem: () => void;
}

export function Navbar({
    currentPage,
    onPageChange,
    systemOnline,
    onToggleSystem
}: NavbarProps) {
    const { t, language, setLanguage } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const isKo = language === 'ko';

    const formattedDate = now.toLocaleDateString(isKo ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const formattedTime = now.toLocaleTimeString(isKo ? 'ko-KR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !isKo
    });

    const menuItems: {
        icon: any;
        label: MenuItem;
        translationKey: string;
    }[] = [
            { icon: LayoutDashboard, label: '통합 대시보드', translationKey: 'sidebar.dashboard' },
            { icon: Users, label: '환자 목록', translationKey: 'sidebar.patientList' },
            { icon: Bell, label: '알림 기록', translationKey: 'sidebar.alertHistory' },
            { icon: UserPlus, label: '환자 등록', translationKey: 'sidebar.registration' },
            { icon: MapPin, label: 'GPS 위치 추적', translationKey: 'sidebar.militaryGps' },
            { icon: Settings, label: '설정', translationKey: 'sidebar.settings' }
        ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
            {/* MAIN BAR */}
            <div className="w-full h-16 flex items-center justify-between px-3 sm:px-4">
                {/* LOGO SECTION */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="mt-2 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28">
                        <img src={Logo} alt="logo" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-1">
                    {menuItems.map(item => (
                        <button
                            key={item.label}
                            onClick={() => onPageChange(item.label)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition
                ${currentPage === item.label
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {t(item.translationKey)}
                        </button>
                    ))}
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* TIME – LARGE DESKTOP ONLY */}
                    <div className="hidden 2xl:flex items-center gap-4 text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {formattedTime}
                        </div>
                    </div>

                    {/* LANGUAGE WRAPPER */}
                    <div className="flex items-center ml-1 sm:ml-0 shrink-0"></div>
                    {/* LANGUAGE */}
                    <div className="flex items-center gap-0 bg-gray-50 rounded-full px-1 py-1 text-xs border">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value as any)}
                            className="bg-transparent outline-none cursor-pointer"
                        >
                            <option value="ko">KO</option>
                            <option value="en">EN</option>
                            <option value="ja">JA</option>
                            <option value="ch">CH</option>
                            <option value="es">ES</option>
                        </select>
                    </div>

                    {/* SYSTEM STATUS */}
                    <button
                        onClick={onToggleSystem}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border
              ${systemOnline
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                            }`}
                    >
                        {systemOnline ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t('header.systemOnline')}</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t('header.systemOffline')}</span>
                            </>
                        )}
                    </button>

                    {/* MOBILE HAMBURGER */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(v => !v)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMobileMenuOpen && (
                <div className="md:hidden w-full bg-white border-t border-gray-100">
                    <div className="px-3 py-3 space-y-1">
                        {menuItems.map(item => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    onPageChange(item.label);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                  ${currentPage === item.label
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {t(item.translationKey)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
