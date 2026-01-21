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
            <div className="text-xs lg:text-sm max-[374px]:text-[10px] text-gray-600 order-2 sm:order-1 text-center sm:text-left">
                <span className="max-[374px]:hidden">
                    {totalItems > 0 ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalItems)}` : '0-0'} {t('table.of')} {totalItems} {t('table.showing')}
                </span>
                <span className="hidden max-[374px]:inline font-medium">
                    {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, totalItems)} / {totalItems}
                </span>
            </div>
            <div className="flex items-center gap-2 max-[374px]:gap-1 order-1 sm:order-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 max-[374px]:p-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                    {(() => {
                        // Reduce visible pages on very small screens
                        const isVerySmallScreen = typeof window !== 'undefined' && window.innerWidth < 375;
                        const maxVisiblePages = isVerySmallScreen ? 3 : 7;
                        const pages: (number | string)[] = [];

                        if (totalPages <= maxVisiblePages) {
                            // Show all pages if total is small
                            for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                            }
                        } else {
                            // Always show first page
                            pages.push(1);

                            if (currentPage > 3) {
                                pages.push('...');
                            }

                            // Show pages around current page
                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(totalPages - 1, currentPage + 1);

                            for (let i = start; i <= end; i++) {
                                pages.push(i);
                            }

                            if (currentPage < totalPages - 2) {
                                pages.push('...');
                            }

                            // Always show last page
                            pages.push(totalPages);
                        }

                        return pages.map((page, idx) => {
                            if (page === '...') {
                                return (
                                    <span key={`ellipsis-${idx}`} className="w-6 h-8 max-[374px]:w-5 flex items-center justify-center text-gray-400 flex-shrink-0">
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page as number)}
                                    className={`w-8 h-8 max-[374px]:w-7 max-[374px]:h-7 lg:w-9 lg:h-9 rounded-lg text-xs lg:text-sm font-medium transition-colors flex-shrink-0 ${currentPage === page
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        });
                    })()}
                </div>
                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 max-[374px]:p-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
            </div>
        </div>
    );
}
