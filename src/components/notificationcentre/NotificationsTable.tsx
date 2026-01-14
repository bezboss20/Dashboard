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

                  {/* ================= System (SMALL) ================= */}
                  <td className="block px-2 py-3 border-b">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] font-bold text-gray-400 shrink-0">
                        {t('notifications.table.system')}
                      </span>
                      <span className="text-[12px] text-gray-700 text-right truncate max-w-[75%]">
                        {log.system}
                      </span>
                    </div>
                  </td>

                  {/* ================= Patient (SMALL) ================= */}
                  <td className="block px-2 py-3 border-b">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] font-bold text-gray-400 shrink-0">
                        {t('notifications.table.patientId')}
                      </span>

                      <div className="text-right max-w-[75%] truncate">
                        {log.patientId !== 'N/A' && onViewPatientDetails ? (
                          <button
                            onClick={() => onViewPatientDetails(log.patientId)}
                            className="text-[12px] text-blue-600 font-bold hover:underline truncate"
                            title={log.patientId}
                          >
                            {log.patientId}
                          </button>
                        ) : (
                          <span className="text-[12px] text-gray-900 truncate">
                            {log.patientId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ================= Category (SMALL) ================= */}
                  <td className="block px-2 py-3 border-b">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] font-bold text-gray-400 shrink-0">
                        {t('notifications.table.category')}
                      </span>
                      <span className="text-[1px] text-gray-700 truncate max-w-[75%] text-right">
                        {log.category}
                      </span>
                    </div>
                  </td>

                  {/* ================= Type (SMALL) ================= */}
                  <td className="block px-4 py-3 border-b">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] font-bold text-gray-400 shrink-0">
                        {t('notifications.table.type')}
                      </span>
                      <span className="text-[12px] font-mono text-gray-700 truncate max-w-[75%] text-right">
                        {log.type}
                      </span>
                    </div>
                  </td>

                  {/* ================= Details (SMALL) ================= */}
                  <td className="block py-3 px-4">
                    <span className="text-[11px] font-bold text-gray-400 block mb-1">
                      {t('notifications.table.details')}
                    </span>
                    <div className="text-[12px] text-gray-600 leading-relaxed bg-gray-50 p-3 rounded break-words">
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
                    className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap"
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
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">
                      {log.system}
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {log.patientId !== 'N/A' && onViewPatientDetails ? (
                        <button
                          onClick={() => onViewPatientDetails(log.patientId)}
                          className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                        >
                          {log.patientId}
                        </button>
                      ) : (
                        <span className="text-gray-900">{log.patientId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                      {log.category}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap font-mono">
                      {log.type}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    <td className="py-3 px-4 text-sm text-gray-600 min-w-[260px]">
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
