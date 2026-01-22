import { Search, ChevronDown, UserCheck, UserMinus, UserX, Calendar } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PatientStatus } from '../../store/slices/monitoringSlice';

interface PatientFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: PatientStatus | 'ALL';
  onStatusChange: (status: PatientStatus | 'ALL') => void;
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  patientCounts: {
    active: number;
    discharged: number;
    transferred: number;
  };
  t: (key: string) => string;
}

export function PatientFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedDate,
  onDateChange,
  patientCounts,
  t
}: PatientFilterBarProps) {
  const { language } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // States for calendar navigation
  const [viewDate, setViewDate] = useState(new Date());

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions: { value: PatientStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: t('filter.allStatus') },
    { value: 'ACTIVE', label: t('filter.active') },
    { value: 'DISCHARGED', label: t('filter.discharged') },
    { value: 'TRANSFERRED', label: t('filter.transferred') }
  ];

  const getStatusLabel = (status: PatientStatus | 'ALL') => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.label || t('filter.allStatus');
  };

  // Calendar helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const days = [];
  const totalDays = daysInMonth(currentYear, currentMonth);
  const firstDay = firstDayOfMonth(currentYear, currentMonth);

  // Full localized dynamic weekdays
  const weekDays = useMemo(() => {
    const baseDate = new Date(2024, 0, 7); // Jan 7, 2024 is Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      return d.toLocaleDateString(language === 'ko' ? 'ko-KR' : language === 'ch' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' });
    });
  }, [language]);

  // Pad empty days at the start
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateChange(dateStr);
    setIsCalendarOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left Section: Search + Status Dropdown + Calendar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-0 sm:max-w-xs flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('filter.searchPlaceholder')}
              className="w-full pl-8 pr-1 py-2.5 bg-gray-50 text-gray-900 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all min-w-[140px]"
            >
              <span>{getStatusLabel(statusFilter)}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onStatusChange(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${statusFilter === option.value
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700'
                      }`}
                  >
                    <span>{option.label}</span>
                    {statusFilter === option.value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Dropdown */}
          <div className="relative" ref={calendarRef}>
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all min-w-[140px]"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{selectedDate || t('registration.registrationDate')}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isCalendarOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {isCalendarOpen && (
              <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl w-[280px] max-[374px]:w-[250px] sm:w-[300px] animate-in fade-in slide-in-from-top-2 overflow-hidden right-0 max-[374px]:left-0 max-[374px]:mx-auto sm:left-0">
                {/* Header - Month/Year Navigation */}
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90 text-gray-600" />
                  </button>
                  <span className="text-sm font-bold text-gray-900">
                    {monthName} {currentYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90 text-gray-600" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-0 px-2 pt-2">
                  {weekDays.map((day, i) => (
                    <div
                      key={i}
                      className={`text-center text-[10px] sm:text-xs font-bold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-0 p-2">
                  {days.map((day, i) => {
                    const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const isSelected = selectedDate === dateStr;
                    const isToday = day &&
                      new Date().getDate() === day &&
                      new Date().getMonth() === currentMonth &&
                      new Date().getFullYear() === currentYear;
                    const isSunday = i % 7 === 0;
                    const isSaturday = i % 7 === 6;

                    return (
                      <button
                        key={i}
                        onClick={() => day && handleDateClick(day)}
                        disabled={!day}
                        className={`text-center text-xs sm:text-sm py-1.5 sm:py-2 rounded-lg transition-all ${!day ? 'invisible' :
                          isSelected ? 'bg-blue-600 text-white font-bold' :
                            isToday ? 'bg-blue-100 text-blue-600 font-bold' :
                              isSunday ? 'text-red-500 hover:bg-red-50' :
                                isSaturday ? 'text-blue-500 hover:bg-blue-50' :
                                  'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Footer with Today and Clear */}
                <div className="border-t border-gray-100 px-2 py-2 flex justify-between gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                      setViewDate(today);
                      onDateChange(dateStr);
                      setIsCalendarOpen(false);
                    }}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                  >
                    {t('common.today')}
                  </button>
                  <button
                    onClick={() => {
                      onDateChange(null);
                      setIsCalendarOpen(false);
                    }}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-center"
                  >
                    {t('common.reset')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Status Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          {/* Active */}
          <button
            onClick={() => onStatusChange(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
            className={`group min-w-0 w-full sm:w-auto sm:min-w-[90px] bg-green-50 border transition-all rounded-lg text-left ${statusFilter === 'ACTIVE'
              ? 'border-green-500 ring-2 ring-green-200 bg-green-100 shadow-sm'
              : 'border-green-200 hover:border-green-400 hover:bg-green-100 hover:shadow-xs'
              }`}
          >
            <div className="flex flex-col items-center justify-center text-center px-0.5 py-1 max-[374px]:py-0 sm:flex-row sm:text-left sm:justify-start sm:gap-2 sm:px-3 sm:py-2">
              <UserCheck className={`w-3 h-3 max-[374px]:w-2.5 max-[374px]:h-2.5 sm:w-4 sm:h-4 transition-colors ${statusFilter === 'ACTIVE' ? 'text-green-700' : 'text-green-600'}`} />
              <div className="min-w-0">
                <div className={`text-[9px] max-[374px]:text-[7px] max-[374px]:leading-[1] max-[374px]:tracking-tight sm:text-[10px] font-bold tracking-wider leading-tight truncate max-[374px]:whitespace-normal max-[374px]:overflow-visible uppercase transition-colors ${statusFilter === 'ACTIVE' ? 'text-green-700' : 'text-green-600'}`}>
                  <span className="hidden max-[425px]:inline">{t('filter.active.mobile')}</span>
                  <span className="max-[425px]:hidden">{t('filter.active')}</span>
                </div>
                <div className={`text-[12px] max-[374px]:text-[10px] sm:text-[13px] font-black leading-tight transition-colors ${statusFilter === 'ACTIVE' ? 'text-green-800' : 'text-green-700'}`}>
                  {patientCounts.active}
                </div>
              </div>
            </div>
          </button>

          {/* Discharged */}
          <button
            onClick={() => onStatusChange(statusFilter === 'DISCHARGED' ? 'ALL' : 'DISCHARGED')}
            className={`group min-w-0 w-full sm:w-auto sm:min-w-[90px] bg-blue-50 border transition-all rounded-lg text-left ${statusFilter === 'DISCHARGED'
              ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-100 shadow-sm'
              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-100 hover:shadow-xs'
              }`}
          >
            <div className="flex flex-col items-center justify-center text-center px-0.5 py-1 max-[374px]:py-0 sm:flex-row sm:text-left sm:justify-start sm:gap-2 sm:px-3 sm:py-2">
              <UserMinus className={`w-3 h-3 max-[374px]:w-2.5 max-[374px]:h-2.5 sm:w-4 sm:h-4 transition-colors ${statusFilter === 'DISCHARGED' ? 'text-blue-700' : 'text-blue-600'}`} />
              <div className="min-w-0">
                <div className={`text-[9px] max-[374px]:text-[7px] max-[374px]:leading-[1] max-[374px]:tracking-tight sm:text-[10px] font-bold tracking-wider leading-tight truncate max-[374px]:whitespace-normal max-[374px]:overflow-visible uppercase transition-colors ${statusFilter === 'DISCHARGED' ? 'text-blue-700' : 'text-blue-600'}`}>
                  <span className="hidden max-[425px]:inline">{t('filter.discharged.mobile')}</span>
                  <span className="max-[425px]:hidden">{t('filter.discharged')}</span>
                </div>
                <div className={`text-[12px] max-[374px]:text-[10px] sm:text-[13px] font-black leading-tight transition-colors ${statusFilter === 'DISCHARGED' ? 'text-blue-800' : 'text-blue-700'}`}>
                  {patientCounts.discharged}
                </div>
              </div>
            </div>
          </button>

          {/* Transferred */}
          <button
            onClick={() => onStatusChange(statusFilter === 'TRANSFERRED' ? 'ALL' : 'TRANSFERRED')}
            className={`group min-w-0 w-full sm:w-auto sm:min-w-[90px] bg-orange-50 border transition-all rounded-lg text-left ${statusFilter === 'TRANSFERRED'
              ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-100 shadow-sm'
              : 'border-orange-200 hover:border-orange-400 hover:bg-orange-100 hover:shadow-xs'
              }`}
          >
            <div className="flex flex-col items-center justify-center text-center px-0.5 py-1 max-[374px]:py-0 sm:flex-row sm:text-left sm:justify-start sm:gap-2 sm:px-3 sm:py-2">
              <UserX className={`w-3 h-3 max-[374px]:w-2.5 max-[374px]:h-2.5 sm:w-4 sm:h-4 transition-colors ${statusFilter === 'TRANSFERRED' ? 'text-orange-700' : 'text-orange-600'}`} />
              <div className="min-w-0">
                <div className={`text-[9px] max-[374px]:text-[7px] max-[374px]:leading-[1] max-[374px]:tracking-tight sm:text-[10px] font-bold tracking-wider leading-tight truncate max-[374px]:whitespace-normal max-[374px]:overflow-visible uppercase transition-colors ${statusFilter === 'TRANSFERRED' ? 'text-orange-700' : 'text-orange-600'}`}>
                  <span className="hidden max-[425px]:inline">{t('filter.transferred')}</span>
                  <span className="max-[425px]:hidden">{t('filter.transferred')}</span>
                </div>
                <div className={`text-[12px] max-[374px]:text-[10px] sm:text-[13px] font-black leading-tight transition-colors ${statusFilter === 'TRANSFERRED' ? 'text-orange-800' : 'text-orange-700'}`}>
                  {patientCounts.transferred}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
