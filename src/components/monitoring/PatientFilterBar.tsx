import { Search, ChevronDown, UserCheck, UserMinus, UserX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PatientStatus } from '../../data/mockData';

interface PatientFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: PatientStatus | 'ALL';
  onStatusChange: (status: PatientStatus | 'ALL') => void;
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
  patientCounts,
  t
}: PatientFilterBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Left Section: Search + Status Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
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
              className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all min-w-[160px]"
            >
              <span>{getStatusLabel(statusFilter)}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
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
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      statusFilter === option.value
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
        </div>

        {/* Right Section: Status Summary Cards */}
        {/* ✅ Small screens: grid + vertical layout so label+count always show */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          {/* Active */}
          <div className="min-w-0 w-full bg-green-50 border border-green-200 rounded-lg">
            <div className="flex flex-col items-center justify-center text-center px-2 py-2 sm:flex-row sm:text-left sm:justify-start sm:gap-2 sm:px-3 sm:py-2">
              <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0 sm:w-4 sm:h-4" />
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-green-600 tracking-wider leading-tight truncate sm:uppercase">
                  {t('filter.active')}
                </div>
                <div className="text-[13px] font-black text-green-700 leading-tight">
                  {patientCounts.active}
                </div>
              </div>
            </div>
          </div>

          {/* Discharged */}
          <div className="min-w-0 w-full bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col items-center justify-center text-center px-2 py-2 sm:flex-row sm:text-left sm:justify-start sm:gap-2 sm:px-3 sm:py-2">
              <UserMinus className="w-4 h-4 text-blue-600 flex-shrink-0 sm:w-4 sm:h-4" />
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-blue-600 tracking-wider leading-tight truncate sm:uppercase">
                  {t('filter.discharged')}
                </div>
                <div className="text-[13px] font-black text-blue-700 leading-tight">
                  {patientCounts.discharged}
                </div>
              </div>
            </div>
          </div>

          {/* Transferred */}
          <div className="min-w-0 w-full bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex flex-col items-center justify-center text-center px-2 py-2 sm:flex-row sm:text-left sm:justify-start sm:gap-2 sm:px-3 sm:py-2">
              <UserX className="w-4 h-4 text-orange-600 flex-shrink-0 sm:w-4 sm:h-4" />
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-orange-600 tracking-wider leading-tight truncate sm:uppercase">
                  {t('filter.transferred')}
                </div>
                <div className="text-[13px] font-black text-orange-700 leading-tight">
                  {patientCounts.transferred}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end cards */}
      </div>
    </div>
  );
}
