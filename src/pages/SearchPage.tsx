import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { PaginationInfo } from '../types';
import { searchPreview, type SearchPreviewResult, type SortOptions } from '../api/posts';
import Pagination from '../components/Pagination';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchPreviewResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sortBy, setSortBy] = useState<SortOptions['sort_by']>('created_at');

  const RESULTS_PER_PAGE = 10;

  // 검색 실행
  const performSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const searchOptions: any = {
        q: query,
        page: currentPage,
        limit: RESULTS_PER_PAGE,
        sort_by: sortBy
      };

      const response = await searchPreview(searchOptions);
      
      console.log('검색 프리뷰 응답:', response);
      console.log('결과 배열:', response.results);
      console.log('결과 개수:', response.results?.length);
      
      setSearchResults(response.results || []);
      setPagination({
        total_count: response.total_count,
        current_page: response.current_page,
        total_pages: response.total_pages,
        has_next: response.has_next,
        has_previous: response.has_prev
      });
      
    } catch (error) {
      console.error('검색 중 오류:', error);
      setSearchResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [query, currentPage, sortBy]);

  // 검색어가 변경될 때 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // 검색 실행
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [performSearch, query]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getContentTypeInfo = (type: string) => {
    switch (type) {
      case 'review':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          tagColor: 'bg-blue-100 text-blue-800',
          label: '리뷰'
        };
      case 'post':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          tagColor: 'bg-green-100 text-green-800',
          label: '자유게시판'
        };
      case 'phishing':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          tagColor: 'bg-red-100 text-red-800',
          label: '피싱사이트 신고'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          tagColor: 'bg-gray-100 text-gray-800',
          label: '기타'
        };
    }
  };

  const renderSearchResult = (result: SearchPreviewResult) => {
    console.log('렌더링 중인 결과:', result);
    console.log('결과 타입:', result.content_type);
    
    const typeInfo = getContentTypeInfo(result.content_type);
    
    const getLink = () => {
      switch (result.content_type) {
        case 'review':
          return `/review/${result.id}`;
        case 'post':
          return `/post/${result.id}`;
        case 'phishing':
          return `/phishing/${result.id}`;
        default:
          return `/post/${result.id}`;
      }
    };
    
    return (
      <div key={`${result.content_type}-${result.id}`} className={`border-b border-gray-200 hover:${typeInfo.bgColor} transition-colors`}>
        <div className="grid grid-cols-12 gap-4 py-3 px-4 text-sm items-center">
          {/* 제목 */}
          <div className="col-span-6 sm:col-span-7">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={getLink()} 
                className={`${typeInfo.color} hover:underline font-medium break-all`}
              >
                {result.title}
              </Link>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${typeInfo.tagColor}`}>
                {typeInfo.label}
              </span>
            </div>
          </div>
          
          {/* 작성자 */}
          <div className="col-span-2 sm:col-span-2 text-gray-600 truncate">
            {result.user_name || '익명'}
          </div>
          
          {/* 작성일 */}
          <div className="col-span-2 sm:col-span-2 text-gray-500 text-xs sm:text-sm">
            {new Date(result.created_at).toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit', 
              day: '2-digit'
            })}
          </div>
          
          {/* 조회수 */}
          <div className="col-span-2 sm:col-span-1 text-gray-500 text-right">
            {result.view_count || 0}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          검색 결과
        </h1>
        <p className="text-gray-600 mb-4">
          "{query}"에 대한 검색 결과 ({pagination?.total_count || 0}개)
        </p>
        
        {/* 컨텐츠 타입별 통계 */}
        {searchResults && searchResults.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { type: 'review', label: '리뷰', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
              { type: 'post', label: '자유게시판', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
              { type: 'phishing', label: '피싱신고', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
            ].map(({ type, label, color, bgColor, borderColor }) => {
              const count = searchResults.filter(result => result.content_type === type).length;
              if (count === 0) return null;
              return (
                <span key={type} className={`inline-flex items-center px-3 py-1 rounded-full border ${bgColor} ${borderColor} ${color} font-medium`}>
                  {label}: {count}개
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 정렬 옵션 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">정렬:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOptions['sort_by'])}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">최신순</option>
            <option value="view_count">조회순</option>
          </select>
        </div>
      </div>

      {/* 검색 결과 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">검색 중...</div>
      ) : searchResults && searchResults.length > 0 ? (
        <>
          {console.log('검색 결과 렌더링 시작 - 총', searchResults.length, '개')}
          {/* 테이블 헤더 */}
          <div className="bg-gray-100 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 py-3 px-4 text-sm font-medium text-gray-700">
              <div className="col-span-6 sm:col-span-7">제목</div>
              <div className="col-span-2 sm:col-span-2">작성자</div>
              <div className="col-span-2 sm:col-span-2">작성일</div>
              <div className="col-span-2 sm:col-span-1 text-right">조회</div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-b-lg">
            {searchResults.map((result, index) => {
              console.log(`렌더링 ${index + 1}번째 결과:`, result);
              return renderSearchResult(result);
            })}
          </div>
          
          {pagination && (
            <Pagination 
              pagination={pagination} 
              onPageChange={handlePageChange} 
            />
          )}
        </>
      ) : (
        <>
          {console.log('검색 결과 없음 상태')}
          {console.log('searchResults:', searchResults)}
          {console.log('searchResults 길이:', searchResults?.length)}
          {console.log('loading 상태:', loading)}
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              "{query}"에 대한 검색 결과를 찾을 수 없습니다.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto">
              <h4 className="font-medium text-gray-700 mb-3">검색 팁:</h4>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• 다른 키워드로 검색해보세요</li>
                <li>• 검색어의 맞춤법을 확인해보세요</li>
                <li>• 필터 조건을 줄여보세요</li>
                <li>• 더 일반적인 용어를 사용해보세요</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}