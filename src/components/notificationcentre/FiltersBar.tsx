import { Search, ChevronDown, Calendar } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface FiltersBarProps {
    dateFrom: string;
    dateTo: string;
    searchTerm: string;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    t: (key: string) => string;
}

export function FiltersBar({
    dateFrom,
    dateTo,
    searchTerm,
    onDateFromChange,
    onDateToChange,
    onSearchChange,
    t
}: FiltersBarProps) {
    const { language } = useLanguage();

    return (
        // ✅ Expand this whole block left/right (md+), without breaking mobile
        <div className="md:-mx-3 lg:-mx-6 xl:-mx-10">
            {/* ✅ Optional: add a little inner padding so expanded area feels intentional */}
            <div className="px-0 md:px-3 lg:px-6 xl:px-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-6">
                    {/* Date Range */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 w-full min-w-0">
                            {/* Date inputs row */}
                            <div className="flex flex-row items-center gap-2 w-full min-w-0">
                                <CalendarInput
                                    value={dateFrom}
                                    onChange={onDateFromChange}
                                    t={t}
                                    language={language}
                                />

                                <span className="text-gray-400 flex-shrink-0 w-3 text-center">
                                    -
                                </span>

                                <CalendarInput
                                    value={dateTo}
                                    onChange={onDateToChange}
                                    t={t}
                                    language={language}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('table.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="flex-1 outline-none text-xs lg:text-sm max-[374px]:text-[10px] min-w-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Internal reusable Calendar Input Component
function CalendarInput({ value, onChange, t, language }: { value: string; onChange: (val: string) => void; t: (k: string) => string; language: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

    // Update view date when value changes externally
    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    // Calendar logic
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const monthName = viewDate.toLocaleString(language === 'ko' ? 'ko-KR' : language === 'ch' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : language === 'es' ? 'es-ES' : 'en-US', { month: 'long' });

    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const handleDateClick = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    // Full localized dynamic weekdays
    const weekDays = useMemo(() => {
        const baseDate = new Date(2024, 0, 7); // Jan 7, 2024 is Sunday
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            return d.toLocaleDateString(language === 'ko' ? 'ko-KR' : language === 'ch' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' });
        });
    }, [language]);


    return (
        <div className="relative w-full flex-1 min-w-0" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-2 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all text-xs lg:text-sm max-[374px]:text-[10px]"
            >
                <span className="truncate">{value || 'Select Date'}</span>
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <>
                    {/* Mobile Backdrop for Fixed Positioning Center */}
                    <div className="hidden max-[374px]:block fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-[260px] animate-in fade-in slide-in-from-top-2 overflow-hidden left-0 max-[374px]:fixed max-[374px]:top-1/2 max-[374px]:left-1/2 max-[374px]:-translate-x-1/2 max-[374px]:-translate-y-1/2 max-[374px]:w-[280px]">
                        {/* Header */}
                        <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded-lg"><ChevronDown className="w-4 h-4 rotate-90 text-gray-600" /></button>
                            <span className="text-sm font-bold text-gray-900">{monthName} {currentYear}</span>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded-lg"><ChevronDown className="w-4 h-4 -rotate-90 text-gray-600" /></button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 gap-0 px-2 pt-2">
                            {weekDays.map((day, i) => (
                                <div key={i} className={`text-center text-[10px] font-bold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{day}</div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-0 p-2">
                            {days.map((day, i) => {
                                if (!day) return <div key={i} />;
                                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isSelected = value === dateStr;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleDateClick(day)}
                                        className={`text-center text-xs py-1.5 rounded-lg transition-all ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-2 py-2 flex justify-between gap-2">
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                    setViewDate(today);
                                    onChange(dateStr);
                                    setIsOpen(false);
                                }}
                                className="flex-1 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                            >
                                {t('common.today')}
                            </button>
                            <button
                                onClick={() => {
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="flex-1 px-2 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg"
                            >
                                {t('common.reset')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
