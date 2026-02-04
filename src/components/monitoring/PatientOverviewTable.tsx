import {
  Heart,
  Wind,
  Moon,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Wifi,
  WifiOff,
  AlertCircle,
  Wrench,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserMinus,
  UserX,
  Calendar,
  Info
} from 'lucide-react';
import { MappedPatient } from '../../store/slices/monitoringSlice';
import { useState, useEffect } from 'react';
import { Sparkline } from './Sparkline';
import { useLanguage } from '../../context/LanguageContext';
import { deriveHealthStatus, getHealthStatusLabel, getHealthStatusClasses } from '../../utils/statusLabels';
import { getHeartRateSeverity, getBreathingRateSeverity } from '../../utils/dashboardUtils';

interface PatientOverviewTableProps {
  patients: MappedPatient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onViewPatientDetails?: (patientId: string) => void;
  onViewSleepPage?: (patientId: string) => void;
  searchQuery?: string;
}

export function PatientOverviewTable({
  patients,
  selectedPatientId,
  onSelectPatient,
  onViewPatientDetails,
  onViewSleepPage,
  searchQuery = ''
}: PatientOverviewTableProps) {
  const { t, language, getLocalizedText } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const itemsPerPage = 10;

  // Filter patients based on search query
  const filteredPatients = patients.filter(
    (patient) =>
      patient.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.nameKorean?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.nameEnglish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Reset to page 1 only when search query changes
  // Background data updates (e.g. vitals every 15s) should NOT reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Ensure current page is valid when patients list changes (e.g. status filter changed in parent)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'caution':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getAlertStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return { text: t('status.critical'), color: 'text-red-600', bg: 'bg-red-50' };
      case 'warning':
        return { text: t('status.warning'), color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'caution':
        return { text: t('status.caution'), color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'normal':
        return { text: t('status.normal'), color: 'text-green-600', bg: 'bg-green-50' };
      default:
        return { text: t('common.unknown'), color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getPatientStatusInfo = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'ACTIVE':
        return {
          text: t('filter.active'),
          color: 'text-green-600',
          bg: 'bg-green-50',
          icon: UserCheck
        };
      case 'DISCHARGED':
        return {
          text: t('filter.discharged'),
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          icon: UserMinus
        };
      case 'TRANSFERRED':
        return {
          text: t('filter.transferred'),
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          icon: UserX
        };
      default:
        return {
          text: status || t('common.unknown'),
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          icon: User
        };
    }
  };

  const getDeviceStatusInfo = (patient: any) => {
    // Directly use the device status from API (already lowercase from mapping)
    const status = patient.deviceStatus?.toLowerCase() || 'offline';

    switch (status) {
      case 'online':
        return {
          icon: Wifi,
          text: t('status.online'),
          color: 'text-green-600',
          bg: 'bg-green-50',
          iconColor: 'text-green-600'
        };
      case 'offline':
        return {
          icon: WifiOff,
          text: t('status.offline'),
          color: 'text-gray-500',
          bg: 'bg-gray-100',
          iconColor: 'text-gray-500'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: t('status.error'),
          color: 'text-red-600',
          bg: 'bg-red-50',
          iconColor: 'text-red-600'
        };
      case 'maintenance':
        return {
          icon: Wrench,
          text: t('status.maintenance'),
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          iconColor: 'text-orange-600'
        };
      default:
        return {
          icon: WifiOff,
          text: t('status.offline'),
          color: 'text-gray-500',
          bg: 'bg-gray-100',
          iconColor: 'text-gray-500'
        };
    }
  };

  const getHeartRateColor = (hr: number) => {
    const severity = getHeartRateSeverity(hr);
    if (severity === 'critical') return 'text-red-600';
    if (severity === 'warning') return 'text-orange-500';
    if (severity === 'caution') return 'text-yellow-600';
    return 'text-gray-900';
  };

  const getBreathingRateColor = (br: number) => {
    const severity = getBreathingRateSeverity(br);
    if (severity === 'critical') return 'text-red-600';
    if (severity === 'warning') return 'text-orange-500';
    if (severity === 'caution') return 'text-yellow-600';
    return 'text-gray-900';
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return t('time.justNow');
    if (seconds < 60) return `${seconds}${t('time.secondsAgo')}`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}${t('time.minutesAgo')}`;
  };

  const getSleepStateText = (state: string) => {
    // Map API sleep stage keys to translation keys
    const mapping: Record<string, string> = {
      'AWAKE': t('detail.awake'),
      'REM': t('detail.remSleep'),
      'LIGHT': t('detail.lightSleep'),
      'DEEP': t('detail.deepSleep'),
      // Legacy Korean keys for backward compatibility
      '정상 수면': t('status.normal'),
      'REM 수면': t('detail.remSleep'),
      '얕은 수면': t('detail.lightSleep'),
      '깊은 수면': t('detail.deepSleep')
    };
    return mapping[state] || t('common.unknown');
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      // Format based on language
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
      };

      const localeMap: Record<string, string> = {
        'ko': 'ko-KR',
        'en': 'en-US',
        'ja': 'ja-JP',
        'ch': 'ch-CN',
        'es': 'es-ES'
      };

      return date.toLocaleDateString(localeMap[language] || 'en-US', options);
    } catch {
      return dateString;
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-gray-900 font-bold">{t('table.overview')}</h2>
              <p className="text-xs lg:text-sm text-gray-500">{t('table.realTime')}</p>
            </div>

            {/* Status Legend Info Tooltip */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
                className={`p-1.5 transition-colors rounded-full ${showInfo ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <Info className="w-4 h-4" />
              </button>

              {showInfo && (
                <>
                  <div
                    className="fixed inset-0 z-50 px-4"
                    onClick={() => setShowInfo(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 sm:w-[480px] lg:w-[600px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-60 p-4 text-[10px] sm:text-[11px] transform transition-all">
                    <p className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 text-xs">{t('common.statusLegend')}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Health Icons - Severity */}
                      <div className="space-y-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">{t('dashboard.vitals') || '생체 신호'}</p>
                        <div className="flex flex-col gap-2 font-semibold">
                          <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
                            <span className="text-gray-600">{t('status.critical')}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                            <span className="text-gray-600">{t('status.warning')}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                            <span className="text-gray-600">{t('status.caution')}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                            <span className="text-gray-600">{t('status.normal')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Header Icons - Context */}
                      <div className="space-y-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">{t('common.headerIcons') || '헤더 아이콘'}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-semibold">
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span className="text-gray-600 truncate">{t('table.heartRate')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-gray-600 truncate">{t('table.breathingRate')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="text-gray-600 truncate">{t('table.sleepState')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            <span className="text-gray-600 truncate">{t('patientStatus.label')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wifi className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-gray-600 truncate">{t('table.deviceStatus')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-600 truncate">{t('table.registrationDate')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= SMALL ONLY (320–425): card list ================= */}
      <div className="block sm:hidden">
        <div className="p-3 space-y-3">
          {currentPatients.map((patient) => {
            const patientStatus = getPatientStatusInfo(patient.patientStatus);
            const deviceStatus = getDeviceStatusInfo(patient);
            const isSelected = patient.id === selectedPatientId;
            const DeviceIcon = deviceStatus.icon;
            const StatusIcon = patientStatus.icon;

            return (
              <button
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className={`w-full text-left border rounded-xl shadow-sm overflow-hidden transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
              >
                {/* Header */}
                <div className="px-4 py-3 bg-gray-50 border-b flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate max-[374px]:whitespace-normal max-[374px]:overflow-visible flex items-center gap-1.5">
                      {getAlertIcon(patient.alertStatus)}
                      {getLocalizedText({ ko: patient.nameKorean, en: patient.nameEnglish }, patient.nameKorean)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{patient.patientCode}</div>
                  </div>

                  <div className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full ${patientStatus.bg}`}>
                    <StatusIcon className={`w-3 h-3 ${patientStatus.color}`} />
                    <span className={`text-[11px] font-semibold ${patientStatus.color}`}>{patientStatus.text}</span>
                  </div>
                </div>

                {/* Body rows */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] max-[374px]:text-[9px] font-bold text-gray-400">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{t('table.heartRate')}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-semibold ${getHeartRateColor(patient.heartRate)}`}>
                        {patient.heartRate}
                      </span>
                      {patient.heartRateHistory?.oneMin && (
                        <Sparkline
                          data={patient.heartRateHistory.oneMin.slice(-10).map((d: any) => d.value)}
                          color={
                            (() => {
                              const s = getHeartRateSeverity(patient.heartRate);
                              return s === 'critical' ? '#dc2626' : s === 'warning' ? '#f97316' : s === 'caution' ? '#eab308' : '#9ca3af';
                            })()
                          }
                          width={60}
                          height={18}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] max-[374px]:text-[9px] font-bold text-gray-400">
                      <Wind className="w-4 h-4 text-blue-500" />
                      <span>{t('table.breathingRate')}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-semibold ${getBreathingRateColor(patient.breathingRate)}`}>
                        {patient.breathingRate}
                      </span>
                      {patient.breathingRateHistory?.oneMin && (
                        <Sparkline
                          data={patient.breathingRateHistory.oneMin.slice(-10).map((d: any) => d.value)}
                          color={
                            (() => {
                              const s = getBreathingRateSeverity(patient.breathingRate);
                              return s === 'critical' ? '#dc2626' : s === 'warning' ? '#f97316' : s === 'caution' ? '#eab308' : '#9ca3af';
                            })()
                          }
                          width={60}
                          height={18}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] max-[374px]:text-[9px] font-bold text-gray-400">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>{t('table.sleepState')}</span>
                    </div>
                    <span className="text-sm max-[374px]:text-xs text-gray-700 truncate max-w-[65%] max-[374px]:max-w-none max-[374px]:whitespace-normal text-right">
                      {getSleepStateText(patient.sleepState)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] max-[374px]:text-[9px] font-bold text-gray-400">
                      <DeviceIcon className={`w-4 h-4 ${deviceStatus.iconColor}`} />
                      <span>{t('table.deviceStatus')}</span>
                    </div>
                    <span className={`text-[12px] max-[374px]:text-[11px] font-semibold ${deviceStatus.color} truncate max-w-[65%] max-[374px]:max-w-none max-[374px]:whitespace-normal text-right`}>
                      {deviceStatus.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 max-[374px]:gap-1">
                    <div className="flex items-center gap-2 text-[11px] max-[374px]:text-[9px] font-bold text-gray-400">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="max-[374px]:hidden">{t('table.registrationDate')}</span>
                      <span className="hidden max-[374px]:hidden">{t('notifications.table.date')}</span>
                    </div>
                    <span className="text-[12px] max-[374px]:text-[11px] text-gray-600 font-medium whitespace-nowrap">{formatDate(patient.personalInfo.admissionDate)}</span>
                  </div>
                </div>

                {(onViewSleepPage || onViewPatientDetails) && (
                  <div className="px-4 py-3 border-t bg-white flex items-center justify-end gap-2">
                    {onViewSleepPage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewSleepPage(patient.id);
                        }}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                        aria-label={t('table.openSleepPage')}
                        title={t('table.openSleepPage')}
                      >
                        <Moon className="w-4 h-4" />
                      </button>
                    )}
                    {onViewPatientDetails && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPatientDetails(patient.id);
                        }}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        aria-label={t('table.viewPatientDetails')}
                        title={t('table.viewPatientDetails')}
                      >
                        <User className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= "LARGER" (>= 768/1024/1440/2560): keep current table ================= */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-full md:table-fixed border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="md:w-[12%] lg:w-[11%] px-1 md:px-0.5 lg:pl-4 xl:pl-6 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-center lg:text-left text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <span className="md:text-[9px] lg:text-[10px] whitespace-nowrap">{t('table.patientId')}</span>
                </th>
                <th className="md:w-[9%] lg:w-[10%] px-1 md:px-0.5 lg:px-1 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-left lg:text-center text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center justify-start lg:justify-center gap-0.5 lg:gap-1 xl:gap-1 2xl:gap-2">
                    <Heart className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 text-red-500" />
                    <span className="inline xl:text-xs whitespace-nowrap">
                      {t('table.heartRate')}
                    </span>
                  </div>
                </th>
                <th className="md:w-[10%] lg:w-[11%] px-1 md:px-0.5 lg:px-1 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-left lg:text-center text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center justify-start lg:justify-center gap-0.5 lg:gap-1 xl:gap-1 2xl:gap-2">
                    <Wind className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 text-blue-500" />
                    <span className="inline xl:text-xs whitespace-nowrap">
                      {t('table.breathingRate')}
                    </span>
                  </div>
                </th>
                <th className="hidden sm:table-cell md:w-[10%] lg:w-[13%] px-1 md:px-0.5 lg:px-1 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-center text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center justify-center">
                    <Moon className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                    <span className="hidden lg:inline lg:whitespace-normal leading-tight">{t('table.sleepState')}</span>
                  </div>
                </th>
                <th className="md:w-[9%] lg:w-[14%] px-1 md:px-0.5 lg:px-1 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-center text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                    <span className="hidden lg:inline lg:whitespace-normal leading-tight">{t('patientStatus.label')}</span>
                  </div>
                </th>
                <th className="md:w-[9%] lg:w-[14%] px-1 md:px-0.5 lg:px-1 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-center text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center justify-center">
                    <Wifi className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                    <span className="hidden lg:inline lg:whitespace-normal leading-tight">{t('table.deviceStatus')}</span>
                  </div>
                </th>
                <th className="md:w-[10%] lg:w-[10%] px-1 md:px-0.5 lg:px-1 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-center text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
                    <span className="hidden lg:inline lg:whitespace-normal leading-tight">{t('table.registrationDate')}</span>
                  </div>
                </th>
                <th className="md:w-[13%] lg:w-[8%] px-1 md:px-0.5 lg:px-1 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-center text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center justify-center">
                    <Moon className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-3.5 2xl:h-3.5 text-indigo-500" />
                    <span className="hidden lg:inline lg:whitespace-normal leading-tight">{t('table.sleep')}</span>
                  </div>
                </th>
                <th className="md:w-[18%] lg:w-[9%] px-1 md:px-0.5 lg:pr-4 xl:pr-6 py-3 lg:py-2.5 xl:py-2.5 2xl:py-3 text-center lg:text-right text-[10px] lg:text-[9px] xl:text-[10px] 2xl:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center justify-center lg:justify-end">
                    <User className="w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-3.5 2xl:h-3.5 text-blue-500" />
                    <span className="hidden lg:inline lg:whitespace-normal leading-tight">{t('table.viewDetails')}</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {currentPatients.map((patient) => {
                const patientStatus = getPatientStatusInfo(patient.patientStatus);
                const deviceStatus = getDeviceStatusInfo(patient);
                const isSelected = patient.id === selectedPatientId;
                const DeviceIcon = deviceStatus.icon;
                const StatusIcon = patientStatus.icon;
                console.log("patientdata", patient);

                return (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-1 md:px-0.5 lg:pl-6 xl:pl-8 py-4 lg:py-3 xl:py-3 2xl:py-4 text-center lg:text-left relative">
                      <div className="flex items-center justify-center lg:justify-start w-full gap-0.5 lg:gap-2">
                        <div className={`w-1 h-8 lg:h-8 rounded shrink-0 lg:absolute lg:left-0 ${isSelected ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                        <div className="flex flex-col text-center lg:text-left min-w-0">
                          <div className="flex items-center justify-center lg:justify-start gap-1.5">
                            {getAlertIcon(patient.alertStatus)}
                            <span className="text-gray-900 font-medium text-xs md:text-[10px] lg:text-xs xl:text-xs 2xl:text-sm whitespace-nowrap truncate px-0.5">
                              {getLocalizedText({ ko: patient.nameKorean, en: patient.nameEnglish }, patient.nameKorean)}
                            </span>
                          </div>
                          <span className="text-[10px] md:text-[8px] lg:text-[11px] xl:text-[11px] 2xl:text-sm text-gray-500 whitespace-nowrap">{patient.patientCode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 md:px-1 lg:px-1.5 xl:px-3 2xl:px-6 py-4 lg:py-3 xl:py-3 2xl:py-4 text-left lg:text-center">
                      <div className="flex items-center justify-start lg:justify-center w-full gap-1 lg:gap-1 xl:gap-1.5 2xl:gap-2">
                        <div className="flex items-center gap-1 lg:gap-1 xl:gap-1 2xl:gap-2">
                          <Heart className="w-4 h-4 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 text-red-500" />
                          <span className={`whitespace-nowrap ${getHeartRateColor(patient.heartRate)} font-medium text-sm lg:text-xs xl:text-xs 2xl:text-sm`}>{patient.heartRate}</span>
                        </div>
                        {patient.heartRateHistory?.oneMin && (
                          <Sparkline
                            data={patient.heartRateHistory.oneMin.slice(-10).map((d: any) => d.value)}
                            color={
                              (() => {
                                const s = getHeartRateSeverity(patient.heartRate);
                                return s === 'critical' ? '#dc2626' : s === 'warning' ? '#f97316' : s === 'caution' ? '#eab308' : '#9ca3af';
                              })()
                            }
                            width={window.innerWidth < 1280 ? 40 : 60}
                            height={20}
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-3 md:px-1 lg:px-1.5 xl:px-3 2xl:px-6 py-4 lg:py-3 xl:py-3 2xl:py-4 text-left lg:text-center">
                      <div className="flex items-center justify-start lg:justify-center w-full gap-1 lg:gap-1 xl:gap-1.5 2xl:gap-2">
                        <div className="flex items-center gap-1 lg:gap-1 xl:gap-1 2xl:gap-2">
                          <Wind className="w-4 h-4 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 text-blue-500" />
                          <span className={`whitespace-nowrap ${getBreathingRateColor(patient.breathingRate)} font-medium text-sm lg:text-xs xl:text-xs 2xl:text-sm`}>
                            {patient.breathingRate}
                          </span>
                        </div>
                        {patient.breathingRateHistory?.oneMin && (
                          <Sparkline
                            data={patient.breathingRateHistory.oneMin.slice(-10).map((d: any) => d.value)}
                            color={
                              (() => {
                                const s = getBreathingRateSeverity(patient.breathingRate);
                                return s === 'critical' ? '#dc2626' : s === 'warning' ? '#f97316' : s === 'caution' ? '#eab308' : '#9ca3af';
                              })()
                            }
                            width={window.innerWidth < 1024 ? 40 : 60}
                            height={20}
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-1 md:px-0.5 lg:px-2.5 xl:px-3 2xl:px-6 py-4 lg:py-3 xl:py-3 2xl:py-4 text-center">
                      <span className="text-gray-700 text-sm md:text-[9px] lg:text-xs xl:text-xs 2xl:text-sm whitespace-nowrap">{getSleepStateText(patient.sleepState)}</span>
                    </td>

                    <td className="px-1 md:px-0.5 lg:px-2.5 xl:px-3 2xl:px-6 py-4 lg:py-3 xl:py-3 2xl:py-4 text-center">
                      <div className={`flex items-center md:justify-center lg:justify-center px-3 md:px-0 py-1 md:py-0 rounded-full md:bg-transparent ${patientStatus.bg}`}>
                        <StatusIcon className={`w-4 h-4 md:w-5 md:h-5 ${patientStatus.color}`} />
                        <span className={`text-sm hidden xl:inline xl:text-[11px] 2xl:text-sm ${patientStatus.color}`}>{patientStatus.text}</span>
                      </div>
                    </td>

                    <td className="px-1 md:px-0.5 lg:px-2.5 xl:px-3 2xl:px-6 py-4 lg:py-3 xl:py-3 2xl:py-4 text-center">
                      <div className={`flex items-center md:justify-center lg:justify-center px-3 md:px-0 py-1 md:py-0 rounded-full md:bg-transparent ${deviceStatus.bg}`}>
                        <DeviceIcon className={`w-4 h-4 md:w-5 md:h-5 ${deviceStatus.iconColor}`} />
                        <span className={`text-sm hidden xl:inline xl:text-[11px] 2xl:text-sm ${deviceStatus.color}`}>{deviceStatus.text}</span>
                      </div>
                    </td>

                    <td className="px-1 md:px-0.5 lg:px-2.5 xl:px-3 2xl:px-6 py-4 lg:py-3 xl:py-3 2xl:py-4 text-center">
                      <span className="text-sm md:text-[9px] lg:text-xs xl:text-xs 2xl:text-sm text-gray-900 font-medium whitespace-nowrap">{formatDate(patient.personalInfo.admissionDate)}</span>
                    </td>

                    <td className="px-1 md:px-0.5 lg:px-2 xl:px-2.5 2xl:px-6 py-4 lg:py-3 xl:py-3 2xl:py-4 text-center">
                      {onViewSleepPage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewSleepPage(patient.id);
                          }}
                          className="p-1.5 md:p-1 lg:p-1.5 xl:p-1.5 2xl:p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                          aria-label={t('table.openSleepPage')}
                          title={t('table.openSleepPage')}
                        >
                          <Moon className="w-4 h-4 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                        </button>
                      )}
                    </td>
                    <td className="px-1 md:px-0.5 lg:pr-6 xl:pr-8 py-4 lg:py-3 xl:py-3 2xl:py-4 text-center lg:text-right">
                      {onViewPatientDetails && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewPatientDetails(patient.id);
                          }}
                          className="p-1.5 md:p-1 lg:p-1.5 xl:p-1.5 2xl:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          aria-label={t('table.viewPatientDetails')}
                          title={t('table.viewPatientDetails')}
                        >
                          <User className="w-4 h-4 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= Pagination Controls (MOBILE-FRIENDLY) ================= */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">

          {/* Centered info text */}
          <div className="text-[11px] sm:text-sm text-gray-600 text-center leading-snug">
            {t('table.showing')}{' '}
            <span className="font-medium">{startIndex + 1}</span> {t('table.to')}{' '}
            <span className="font-medium">{Math.min(endIndex, filteredPatients.length)}</span> {t('table.of')}{' '}
            <span className="font-medium">{filteredPatients.length}</span> {t('table.patients')}
            {searchQuery && (
              <span className="ml-1">
                ({t('table.filteredFrom')} {patients.length} {t('table.total')})
              </span>
            )}
          </div>

          {/* Compact controls */}
          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${currentPage === 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page indicator */}
            <div className="px-2.5 h-8 flex items-center bg-gray-100 rounded-md text-[11px] text-gray-700 whitespace-nowrap">
              {t('table.page')} <span className="font-medium ml-1">{currentPage}</span> {t('table.of')}{' '}
              <span className="font-medium">{totalPages}</span>
            </div>

            {/* Next */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
