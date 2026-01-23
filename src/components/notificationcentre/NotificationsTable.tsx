import { NotificationLog } from '../../data/notificationLogStore';

interface NotificationsTableProps {
  logs: NotificationLog[];
  onViewPatientDetails?: (patientId: string) => void;
  t: (key: string) => string;
}

export function NotificationsTable({ logs, onViewPatientDetails, t }: NotificationsTableProps) {
  return (
    <div className="w-full">
      {/* ✅ SMALL SCREENS ONLY (320px–425px): card layout */}
      <div className="block sm:hidden">
        <table className="min-w-full block">
          <tbody className="block divide-y divide-gray-100 bg-gray-50">
            {logs.length === 0 ? (
              <tr className="block">
                <td className="block py-8 text-center text-gray-500">
                  {t('notifications.table.noLogs')}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="block bg-white hover:bg-gray-50 transition-colors mb-4 border rounded-xl shadow-sm overflow-hidden"
                >
                  {/* ================= Date + Status (SMALL) ================= */}
                  <td className="block w-full py-3 px-3 bg-gray-50 border-b rounded-t-xl">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400">
                          {t('notifications.table.date')}
                        </span>

                        <span
                          className={`flex-shrink-0 whitespace-nowrap px-2 py-1 rounded-md text-[10px] font-bold ${log.status === '성공'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {log.status === '성공'
                            ? t('notifications.table.success')
                            : t('notifications.table.fail')}
                        </span>
                      </div>

                      <div className="mt-2">
                        <span className="block text-sm font-semibold text-gray-900 whitespace-nowrap truncate">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ================= System (SMALL) - WRAP ON 320px ================= */}
                  <td className="block px-2 py-3 border-b">
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-gray-400 shrink-0 w-16 max-[374px]:w-14 pt-0.5">
                        {t('notifications.table.system')}
                      </span>
                      <span className="text-[12px] text-gray-700 flex-1 min-w-0 whitespace-normal break-words text-right">
                        {log.system}
                      </span>
                    </div>
                  </td>

                  {/* ================= Patient (SMALL) - KEEP ON ONE LINE ================= */}
                  <td className="block px-2 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-400 shrink-0 w-16 max-[374px]:w-14">
                        {t('notifications.table.patientId')}
                      </span>

                      <div className="flex-1 min-w-0 text-right">
                        {log.patientId !== 'N/A' && onViewPatientDetails ? (
                          <button
                            onClick={() => onViewPatientDetails(log.patientId)}
                            className="text-[11px] max-[374px]:text-[10px] text-blue-600 font-bold hover:underline whitespace-nowrap overflow-hidden text-ellipsis block w-full text-right"
                            title={log.patientName}
                          >
                            {log.patientName}
                          </button>
                        ) : (
                          <span className="text-[11px] max-[374px]:text-[10px] text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis block">
                            {log.patientId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ================= Category (SMALL) - WRAP ON 320px ================= */}
                  <td className="block px-2 py-3 border-b">
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-gray-400 shrink-0 w-16 max-[374px]:w-14 pt-0.5">
                        {t('notifications.table.category')}
                      </span>
                      <span className="text-[12px] text-gray-700 flex-1 min-w-0 whitespace-normal break-words text-right">
                        {log.category}
                      </span>
                    </div>
                  </td>

                  {/* ================= Type (SMALL) - WRAP ON 320px ================= */}
                  <td className="block px-2 py-3 border-b">
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-gray-400 shrink-0 w-16 max-[374px]:w-14 pt-0.5">
                        {t('notifications.table.type')}
                      </span>
                      <span className="text-[12px] text-gray-700 flex-1 min-w-0 whitespace-normal break-words text-right">
                        {log.type}
                      </span>
                    </div>
                  </td>

                  {/* ================= Details (SMALL) ================= */}
                  <td className="block py-3 px-3">
                    <span className="text-[11px] font-bold text-gray-400 block mb-1">
                      {t('notifications.table.details')}
                    </span>
                    <div className="text-[11px] max-[374px]:text-[10px] text-gray-600 leading-relaxed bg-gray-50 p-2 rounded break-words">
                      {log.details}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ "LARGER" SCREENS (>= 768px / 1024px / 1440px / 2560px): true table */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  t('notifications.table.date'),
                  t('notifications.table.system'),
                  t('notifications.table.patientId'),
                  t('notifications.table.category'),
                  t('notifications.table.type'),
                  t('notifications.table.status'),
                  t('notifications.table.details')
                ].map((header) => (
                  <th
                    key={header}
                    className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    {t('notifications.table.noLogs')}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap text-center">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap text-center">
                      {log.system}
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap text-center">
                      {log.patientId !== 'N/A' && onViewPatientDetails ? (
                        <button
                          onClick={() => onViewPatientDetails(log.patientId)}
                          className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                        >
                          {log.patientName}
                        </button>
                      ) : (
                        <span className="text-gray-900">{log.patientId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap text-center">
                      {log.category}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap font-mono text-center">
                      {log.type}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${log.status === '성공'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {log.status === '성공'
                          ? t('notifications.table.success')
                          : t('notifications.table.fail')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 min-w-[260px] text-center">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
