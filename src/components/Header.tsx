import { Bell, Search, Globe, Calendar, Clock, CheckCircle, XCircle, Menu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
    systemOnline: boolean;
    onToggleSystem: () => void;
    onToggleSidebar: () => void;
}

export function Header({ systemOnline, onToggleSystem, onToggleSidebar }: HeaderProps) {
    const { language, setLanguage, t } = useLanguage();

    const now = new Date();
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

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 lg:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-1.5 lg:gap-4 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 -ml-1 text-gray-400 hover:text-gray-600 lg:hidden shrink-0"
                >
                    <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
                <div className="truncate hidden sm:block">
                    <h2 className="text-sm lg:text-lg font-bold text-gray-900 truncate">
                        {t('dashboard.headerTitle')}
                    </h2>
                    <span className="hidden md:inline text-xs text-gray-500 truncate">{t('dashboard.headerSubtitle')}</span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 lg:gap-6 shrink-0">
                <div className="hidden lg:flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
                        <Clock className="w-4 h-4" />
                        <span>{formattedTime}</span>
                    </div>
                </div>

                {/* Mobile visible time */}
                <div className="lg:hidden flex items-center gap-1.5 max-[374px]:gap-1 text-[10px] max-[374px]:text-[8px] lg:text-xs text-gray-500 font-medium bg-gray-50 px-2 max-[374px]:px-1 py-1 rounded-lg">
                    <Clock className="w-3 h-3 max-[374px]:w-2.5 max-[374px]:h-2.5" />
                    <span>{formattedTime.split(':').slice(0, 2).join(':')}</span>
                </div>

                <div className="flex items-center gap-1.5 lg:gap-3">
                    <div className="flex items-center gap-1 lg:gap-2 bg-gray-50 rounded-full px-1.5 max-[374px]:px-1 lg:px-3 py-0.5 lg:py-1 text-xs border border-gray-100">
                        <Globe className="w-3 h-3 max-[374px]:w-2.5 max-[374px]:h-2.5 text-gray-400" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="bg-transparent border-none focus:ring-0 cursor-pointer text-[10px] max-[374px]:text-[9px] lg:text-xs p-0 pr-3 max-[374px]:pr-2 lg:pr-4"
                        >
                            <option value="ko">KO</option>
                            <option value="en">EN</option>
                            <option value="ja">JA</option>
                            <option value="ch">CH</option>
                            <option value="es">ES</option>
                        </select>
                    </div>

                    <button
                        onClick={onToggleSystem}
                        className={`flex items-center justify-center lg:gap-2 p-1.5 lg:px-3 lg:py-1.5 rounded-full text-xs font-medium transition-colors ${systemOnline
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                    >
                        {systemOnline ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden lg:inline">{t('header.systemOnline')}</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden lg:inline">{t('header.systemOffline')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
