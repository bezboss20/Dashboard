import { Moon, Clock, AlertCircle, Activity } from 'lucide-react';
import { SleepSummary, StagePercentages, SleepTimeInfo } from '../../store/slices/sleepSlice';
import { useLanguage } from '../../context/LanguageContext';

interface SessionSummaryProps {
  summary: SleepSummary;
  stagePercentages: StagePercentages;
  timeInfo: SleepTimeInfo;
  isSmallScreen: boolean;
  useScaledDesktopLayout: boolean;
  t: (key: string) => string;
  patientName: string;
  dateRangeSuffix?: string;
}

export function SessionSummary({
  summary,
  stagePercentages,
  timeInfo,
  isSmallScreen,
  useScaledDesktopLayout,
  t,
  patientName,
  dateRangeSuffix
}: SessionSummaryProps) {
  const { language } = useLanguage();
  const formatDuration = (val: string) => {
    if (!val) return '0h 0m';
    return val
      .replace('h', t('time.hour'))
      .replace('m', t('time.minute'))
      .replace('시간', t('time.hour'))
      .replace('분', t('time.minute'));
  };

  const summaryCards = [
    {
      label: t('sleep.totalSleep'),
      value: formatDuration(summary.totalDuration),
      sub: `${t('sleep.goal')}: 8${t('time.hour')} 00${t('time.minute')}`,
      icon: Moon,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: t('sleep.efficiency'),
      value: `${summary.efficiency || 0}%`,
      sub: t('sleep.normalRange'),
      icon: Activity,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: t('sleep.interruptions'),
      value: summary.interruptions || 0,
      sub: t('sleep.timesWokenUp'),
      icon: AlertCircle,
      color: 'bg-orange-50 text-orange-600'
    },
    {
      label: t('sleep.latency'),
      value: `${summary.latency || 0}${t('time.minute')}`,
      sub: t('sleep.timeToFallAsleep'),
      icon: Clock,
      color: 'bg-teal-50 text-teal-600'
    }
  ];

  const stages = [
    { key: 'awake', label: t('detail.awake'), percentage: stagePercentages.awake, color: 'bg-orange-400' },
    { key: 'rem', label: t('detail.remSleep'), percentage: stagePercentages.rem, color: 'bg-purple-500' },
    { key: 'light', label: t('detail.lightSleep'), percentage: stagePercentages.light, color: 'bg-blue-400' },
    { key: 'deep', label: t('detail.deepSleep'), percentage: stagePercentages.deep, color: 'bg-blue-600' }
  ];

  // ✅ Header layout logic
  const headerPadding = isSmallScreen ? 'mb-3' : 'mb-6';

  return (
    <div
      className={
        useScaledDesktopLayout
          ? 'grid grid-cols-4 gap-6'
          : 'grid grid-cols-1 md:grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6'
      }
    >
      <div
        className={[
          'bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-between',
          useScaledDesktopLayout ? 'col-span-4 p-6' : isSmallScreen ? 'xl:col-span-4 p-2.5 sm:p-4' : 'xl:col-span-4 p-4 md:p-6'
        ].join(' ')}
      >
        <div className={headerPadding}>
          <div className={isSmallScreen ? 'flex flex-col gap-1' : 'flex items-baseline justify-between gap-3'}>
            <h3
              className={[
                isSmallScreen
                  ? 'text-base max-[374px]:text-sm font-bold text-gray-900 whitespace-nowrap leading-tight'
                  : 'text-lg lg:text-xl font-bold text-gray-900'
              ].join(' ')}
            >
              {t('sleep.sessionSummary')}
            </h3>

            <p
              className={[
                isSmallScreen
                  ? 'text-[10px] text-gray-400 font-medium leading-none'
                  : 'text-xs text-gray-400 font-medium whitespace-nowrap'
              ].join(' ')}
            >
              {t('sleep.lastNight')} • {(() => {
                if (dateRangeSuffix) return dateRangeSuffix;
                try {
                  if (!timeInfo?.bedIn || !timeInfo?.wakeUp) {
                    return '--';
                  }

                  // Try to parse the dates
                  const parseDate = (dateStr: string) => {
                    const d = new Date(dateStr.replace(' ', 'T'));
                    if (!isNaN(d.getTime())) return d;
                    const d2 = new Date(dateStr);
                    if (!isNaN(d2.getTime())) return d2;
                    return null;
                  };

                  const bedInDate = parseDate(timeInfo.bedIn);
                  const wakeUpDate = parseDate(timeInfo.wakeUp);

                  if (!bedInDate || !wakeUpDate) {
                    return `${timeInfo.bedIn.split(' ')[0]} - ${timeInfo.wakeUp.split(' ')[0]}` || '--';
                  }

                  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
                  const locale = language === 'ko' ? 'ko-KR' : (language === 'es' ? 'es-ES' : 'en-US');

                  const start = bedInDate.toLocaleDateString(locale, options);
                  const end = wakeUpDate.toLocaleDateString(locale, options);

                  return `${start} - ${end}`;
                } catch (e) {
                  return '--';
                }

              })()}
            </p>
          </div>
        </div>

        <div
          className={
            isSmallScreen
              ? 'grid grid-cols-2 max-[449px]:grid-cols-1 gap-1.5 sm:gap-2 mb-3 sm:mb-8'
              : useScaledDesktopLayout
                ? 'grid grid-cols-4 gap-6 mb-8'
                : 'grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-8'
          }
        >
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              className={
                isSmallScreen
                  ? 'bg-gray-50 rounded-2xl border border-gray-100 px-2 py-2.5 w-full flex flex-col items-center text-center'
                  : 'space-y-1 lg:space-y-3'
              }
            >
              {isSmallScreen ? (
                <>
                  <div className="flex items-start justify-start sm:justify-center gap-1.5 w-full overflow-hidden">
                    <card.icon className={`w-[14px] h-[14px] ${card.color.split(' ')[1]} shrink-0 mt-px`} />
                    <p className="text-[8px] min-[375px]:text-[9px] sm:text-[10px] font-black text-gray-800 leading-tight [word-break:break-word] whitespace-normal">
                      {card.label}
                    </p>
                  </div>
                  <p className="mt-1 text-[14px] font-black text-gray-900 leading-none">{card.value}</p>
                  <p className="mt-1 text-[10px] text-gray-400 font-bold leading-tight wrap-break-word whitespace-normal">{card.sub}</p>
                </>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <card.icon className={`w-3.5 h-3.5 ${card.color.split(' ')[1]} shrink-0`} />
                    <span className="text-[9px] lg:text-[10px] font-black text-gray-400 tracking-wider uppercase">
                      {card.label}
                    </span>
                  </div>
                  <p className="text-lg lg:text-2xl font-black text-gray-900 tracking-tight">{card.value}</p>
                  <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold">{card.sub}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={isSmallScreen ? 'space-y-2 pt-2 sm:pt-3 border-t border-gray-100' : 'space-y-3 pt-6 border-t border-gray-100'}>
          <div className={isSmallScreen ? 'flex flex-col gap-2' : 'flex justify-between items-end'}>
            <div className={isSmallScreen ? 'flex flex-wrap gap-x-4 gap-y-2' : 'flex gap-4'}>
              {stages.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span
                    className={
                      isSmallScreen
                        ? 'text-[10px] font-bold text-gray-500 wrap-break-word whitespace-normal'
                        : 'text-[10px] font-bold text-gray-500'
                    }
                  >
                    {s.label} ({s.percentage}%)
                  </span>
                </div>
              ))}
            </div>

            <p className={isSmallScreen ? 'text-[10px] text-gray-400 font-bold wrap-break-word whitespace-normal' : 'text-[10px] text-gray-400 font-bold'}>
              {t('sleep.totalTimeInBed')}: {formatDuration(summary.totalDuration)}
            </p>
          </div>

          <div className={isSmallScreen ? 'h-3 w-full flex rounded-full overflow-hidden shadow-inner' : 'h-4 w-full flex rounded-full overflow-hidden shadow-inner'}>
            {stages.map((s, idx) => (
              <div key={idx} style={{ width: `${s.percentage}%` }} className={s.color} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
