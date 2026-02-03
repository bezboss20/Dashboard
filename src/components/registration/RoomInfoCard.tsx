import { Home } from 'lucide-react';

interface RoomInfoCardProps {
    formData: {
        wardId: string;
        roomNumber: string;
        bedNumber: string;
    };
    t: (key: string) => string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RoomInfoCard({ formData, t, onInputChange }: RoomInfoCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 min-[2500px]:p-10 min-[2500px]:rounded-[24px]">
            <h3 className="mb-2 flex items-center gap-2 min-w-0 min-[2500px]:mb-8 min-[2500px]:gap-4">
                <Home className="w-3 h-3 text-blue-600 shrink-0 min-[2500px]:w-6 min-[2500px]:h-6" />
                <span className="text-[11px] sm:text-[12px] font-semibold text-gray-900 whitespace-nowrap truncate min-w-0 min-[2500px]:text-2xl">
                    {t('registration.roomWard')}
                </span>
            </h3>

            <div className="min-[2500px]:bg-gray-50 min-[2500px]:border min-[2500px]:border-gray-200 min-[2500px]:rounded-[20px] min-[2500px]:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-[2500px]:gap-10">
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
                            {t('registration.wardId')}
                        </label>
                        <input
                            type="text"
                            name="wardId"
                            value={formData.wardId}
                            onChange={onInputChange}
                            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
                            placeholder="W-101"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
                            {t('registration.roomNumber')}
                        </label>
                        <input
                            type="text"
                            name="roomNumber"
                            value={formData.roomNumber}
                            onChange={onInputChange}
                            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
                            placeholder="301"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-0.5 min-[2500px]:text-[14px] min-[2500px]:mb-3 font-semibold">
                            {t('registration.bedNumber')}
                        </label>
                        <input
                            type="text"
                            name="bedNumber"
                            value={formData.bedNumber}
                            onChange={onInputChange}
                            className="w-full px-2 py-1 text-[13px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-[2500px]:px-5 min-[2500px]:py-4 min-[2500px]:text-xl min-[2500px]:rounded-xl"
                            placeholder="A"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
