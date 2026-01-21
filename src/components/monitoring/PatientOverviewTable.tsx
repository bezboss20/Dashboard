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
  ChevronRight
} from 'lucide-react';
import { MappedPatient } from '../../store/slices/monitoringSlice';
import { useState, useEffect } from 'react';
import { Sparkline } from './Sparkline';
import { useLanguage } from '../../context/LanguageContext';
import { deriveHealthStatus, getHealthStatusLabel, getHealthStatusClasses } from '../../utils/statusLabels';

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

  // Reset to page 1 when search query or patients change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, patients]);

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getAlertStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return { text: t('status.critical'), color: 'text-red-600', bg: 'bg-red-50' };
      case 'warning':
        return { text: t('status.warning'), color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'normal':
        return { text: t('status.normal'), color: 'text-green-600', bg: 'bg-green-50' };
      default:
        return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50' };
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
    if (hr < 60 || hr > 100) return 'text-red-600';
    if (hr < 65 || hr > 85) return 'text-orange-500';
    return 'text-gray-900';
  };

  const getBreathingRateColor = (br: number) => {
    if (br < 12 || br > 22) return 'text-red-600';
    if (br < 14 || br > 20) return 'text-orange-500';
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
        day: '2-digit'
      };

      const localeMap: Record<string, string> = {
        'ko': 'ko-KR',
        'en': 'en-US',
        'ja': 'ja-JP',
        'ch': 'zh-CN',
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
          <div>
            <h2 className="text-gray-900 font-bold">{t('table.overview')}</h2>
            <p className="text-xs lg:text-sm text-gray-500">{t('table.realTime')}</p>
          </div>
        </div>
      </div>

      {/* ================= SMALL ONLY (320–425): card list ================= */}
      <div className="block sm:hidden">
        <div className="p-3 space-y-3">
          {currentPatients.map((patient) => {
            const alertStatus = getAlertStatusText(patient.alertStatus);
            const deviceStatus = getDeviceStatusInfo(patient);
            const isSelected = patient.id === selectedPatientId;
            const DeviceIcon = deviceStatus.icon;

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
                    <div className="text-sm font-bold text-gray-900 truncate max-[374px]:whitespace-normal max-[374px]:overflow-visible">
                      {getLocalizedText({ ko: patient.nameKorean, en: patient.nameEnglish }, patient.nameKorean)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{patient.patientCode}</div>
                  </div>

                  <div className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full ${alertStatus.bg}`}>
                    {getAlertIcon(patient.alertStatus)}
                    <span className={`text-[11px] font-semibold ${alertStatus.color}`}>{alertStatus.text}</span>
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
                            patient.heartRate < 60 || patient.heartRate > 100
                              ? '#dc2626'
                              : patient.heartRate < 65 || patient.heartRate > 95
                                ? '#f97316'
                                : '#9ca3af'
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
                            patient.breathingRate < 12 || patient.breathingRate > 20
                              ? '#dc2626'
                              : patient.breathingRate < 14 || patient.breathingRate > 18
                                ? '#f97316'
                                : '#9ca3af'
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
                      <Clock className="w-4 h-4 text-gray-400" />
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left text-[10px] lg:text-xs uppercase tracking-wider text-gray-600">
                  {t('table.patientId')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-[10px] lg:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {t('table.heartRate')}
                  </div>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-[10px] lg:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {t('table.breathingRate')}
                  </div>
                </th>
                <th className="hidden sm:table-cell px-3 lg:px-6 py-3 text-left text-[10px] lg:text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {t('table.sleepState')}
                  </div>
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-[10px] lg:text-xs uppercase tracking-wider text-gray-600">
                  {t('table.alertStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">
                  {t('table.deviceStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {t('table.registrationDate')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('table.sleep')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('table.viewDetails')}</span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {currentPatients.map((patient) => {
                const alertStatus = getAlertStatusText(patient.alertStatus);
                const deviceStatus = getDeviceStatusInfo(patient);
                const isSelected = patient.id === selectedPatientId;
                const DeviceIcon = deviceStatus.icon;
                console.log("patientdata", patient);

                return (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-8 rounded ${isSelected ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {getLocalizedText({ ko: patient.nameKorean, en: patient.nameEnglish }, patient.nameKorean)}
                          </span>
                          <span className="text-sm text-gray-500">{patient.patientCode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[70px]">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className={`${getHeartRateColor(patient.heartRate)} font-medium`}>{patient.heartRate}</span>
                        </div>
                        {patient.heartRateHistory?.oneMin && (
                          <Sparkline
                            data={patient.heartRateHistory.oneMin.slice(-10).map((d: any) => d.value)}
                            color={
                              patient.heartRate < 60 || patient.heartRate > 100
                                ? '#dc2626'
                                : patient.heartRate < 65 || patient.heartRate > 95
                                  ? '#f97316'
                                  : '#9ca3af'
                            }
                            width={60}
                            height={20}
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[70px]">
                          <Wind className="w-4 h-4 text-blue-500" />
                          <span className={`${getBreathingRateColor(patient.breathingRate)} font-medium`}>
                            {patient.breathingRate}
                          </span>
                        </div>
                        {patient.breathingRateHistory?.oneMin && (
                          <Sparkline
                            data={patient.breathingRateHistory.oneMin.slice(-10).map((d: any) => d.value)}
                            color={
                              patient.breathingRate < 12 || patient.breathingRate > 20
                                ? '#dc2626'
                                : patient.breathingRate < 14 || patient.breathingRate > 18
                                  ? '#f97316'
                                  : '#9ca3af'
                            }
                            width={60}
                            height={20}
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-gray-700">{getSleepStateText(patient.sleepState)}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${alertStatus.bg}`}>
                        {getAlertIcon(patient.alertStatus)}
                        <span className={`text-sm ${alertStatus.color}`}>{alertStatus.text}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${deviceStatus.bg}`}>
                        <DeviceIcon className={`w-4 h-4 ${deviceStatus.iconColor}`} />
                        <span className={`text-sm ${deviceStatus.color}`}>{deviceStatus.text}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{formatDate(patient.personalInfo.admissionDate)}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
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
