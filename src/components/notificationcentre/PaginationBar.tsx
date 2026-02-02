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
            <div className="flex items-center gap-1 sm:gap-2 max-[400px]:gap-0.5 order-1 sm:order-2 max-w-full overflow-hidden">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 max-[400px]:p-0.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    <ChevronLeft className="w-3.5 h-3.5 max-[400px]:w-3 max-[400px]:h-3 text-gray-600" />
                </button>
                <div className="flex items-center gap-0.5 max-[400px]:gap-0 sm:gap-1">
                    {(() => {
                        // Show minimal pages on mobile screens
                        const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640;
                        const pages: (number | string)[] = [];

                        if (totalPages <= 3) {
                            // Show all pages if total is 3 or less
                            for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                            }
                        } else if (isSmallScreen) {
                            // Mobile: Show first, current (if different), and last page
                            pages.push(1);

                            // Add current page if it's not first or last
                            if (currentPage !== 1 && currentPage !== totalPages) {
                                pages.push('...');
                                pages.push(currentPage);
                                pages.push('...');
                            } else if (totalPages > 2) {
                                // If on first or last page, just show ellipsis
                                pages.push('...');
                            }

                            // Show last page if it's different from first
                            if (totalPages > 1) {
                                pages.push(totalPages);
                            }
                        } else {
                            // Desktop/tablet: Show more pages
                            pages.push(1);

                            if (currentPage > 3) {
                                pages.push('...');
                            }

                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(totalPages - 1, currentPage + 1);

                            for (let i = start; i <= end; i++) {
                                pages.push(i);
                            }

                            if (currentPage < totalPages - 2) {
                                pages.push('...');
                            }

                            pages.push(totalPages);
                        }

                        return pages.map((page, idx) => {
                            if (page === '...') {
                                return (
                                    <span key={`ellipsis-${idx}`} className="w-3 h-6 max-[400px]:w-2.5 flex items-center justify-center text-gray-400 shrink-0 text-[10px]">
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page as number)}
                                    className={`w-6 h-6 max-[400px]:w-5 max-[400px]:h-5 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-md sm:rounded-lg text-[10px] max-[400px]:text-[9px] sm:text-xs lg:text-sm font-medium transition-colors shrink-0 ${currentPage === page
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
                    className="p-1 max-[400px]:p-0.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                    <ChevronRight className="w-3.5 h-3.5 max-[400px]:w-3 max-[400px]:h-3 text-gray-600" />
                </button>
            </div>
        </div>
    );
}
