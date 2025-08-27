import type { PaginationInfo } from '../types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { current_page, total_pages } = pagination;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const pagesPerGroup = 10;
    
    // 현재 페이지가 속한 그룹 계산 (0부터 시작)
    const currentGroup = Math.floor((current_page - 1) / pagesPerGroup);
    const startPage = currentGroup * pagesPerGroup + 1;
    const endPage = Math.min(startPage + pagesPerGroup - 1, total_pages);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const getGroupInfo = () => {
    const pagesPerGroup = 10;
    const currentGroup = Math.floor((current_page - 1) / pagesPerGroup);
    const totalGroups = Math.ceil(total_pages / pagesPerGroup);
    
    return {
      canGoToPrevGroup: currentGroup > 0,
      canGoToNextGroup: currentGroup < totalGroups - 1,
      prevGroupLastPage: currentGroup > 0 ? currentGroup * pagesPerGroup : 0,
      nextGroupFirstPage: currentGroup < totalGroups - 1 ? (currentGroup + 1) * pagesPerGroup + 1 : 0
    };
  };

  const pages = getPageNumbers();
  const { canGoToPrevGroup, canGoToNextGroup, prevGroupLastPage, nextGroupFirstPage } = getGroupInfo();

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      {/* 이전 10페이지 그룹 */}
      <button
        onClick={() => onPageChange(prevGroupLastPage)}
        disabled={!canGoToPrevGroup}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          canGoToPrevGroup
            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        ‹‹
      </button>

      {/* 페이지 번호들 */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            page === current_page
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* 다음 10페이지 그룹 */}
      <button
        onClick={() => onPageChange(nextGroupFirstPage)}
        disabled={!canGoToNextGroup}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          canGoToNextGroup
            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        ››
      </button>
    </div>
  );
}