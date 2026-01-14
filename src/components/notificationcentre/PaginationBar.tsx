import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    startIndex: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    t: (key: string) => string;
}

export function PaginationBar({
    totalItems,
    currentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    onPageChange,
    t
}: PaginationBarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-xs lg:text-sm text-gray-600 order-2 sm:order-1">
                {t('table.total')} {totalItems} {t('table.of')} {totalItems > 0 ? startIndex + 1 : 0}-
                {Math.min(startIndex + itemsPerPage, totalItems)} {t('table.showing')}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg text-xs lg:text-sm font-medium transition-colors ${currentPage === page
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
                        ),
                    )}
                </div>
                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
            </div>
        </div>
    );
}
