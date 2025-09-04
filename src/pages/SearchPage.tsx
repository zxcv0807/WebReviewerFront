import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Post, Review, PhishingSite, PaginationInfo } from '../types';
import { searchUnified, type UnifiedSearchResult, type SortOptions } from '../api/posts';
import PostCard from '../components/PostCard';
import ReviewCard from '../components/ReviewCard';
import Pagination from '../components/Pagination';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sortBy, setSortBy] = useState<SortOptions['sort_by']>('created_at');
  
  // sortBy에 따라 자동으로 적절한 sortOrder 결정
  const getSortOrder = (): SortOptions['sort_order'] => {
    // 모든 경우에 desc (높은 것부터, 최신순)가 자연스러움
    return 'desc';
  };
  
  const RESULTS_PER_PAGE = 10;

  // 검색 실행
  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await searchUnified({
        q: query,
        page: currentPage,
        limit: RESULTS_PER_PAGE,
        sort_by: sortBy,
        sort_order: getSortOrder()
      });
      
      setSearchResults(response.data);
      setPagination(response.pagination);
      
    } catch (error) {
      console.error('검색 중 오류:', error);
      setSearchResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // 검색어가 변경될 때 페이지를 1로 리셋하고 검색 실행
  useEffect(() => {
    setCurrentPage(1);
    performSearch();
  }, [query]);

  // 페이지나 정렬이 변경될 때 검색 실행
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [currentPage, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderSearchResult = (result: UnifiedSearchResult) => {
    switch (result.type) {
      case 'review':
        return <ReviewCard key={`review-${result.data.id}`} review={result.data as Review} />;
      case 'post':
        return <PostCard key={`post-${result.data.id}`} post={result.data as Post} titleColor="text-green-600" />;
      case 'phishing': {
        const site = result.data as PhishingSite;
        return (
          <div key={`phishing-${site.id}`} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-12 gap-4 py-3 px-4 text-sm items-center">
              {/* 제목 */}
              <div className="col-span-6 sm:col-span-7">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link 
                    to={`/phishing/${site.id}`} 
                    className="text-red-600 hover:underline font-medium break-all"
                  >
                    {site.url}
                  </Link>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    피싱사이트 신고
                  </span>
                </div>
              </div>
              
              {/* 작성자 */}
              <div className="col-span-2 sm:col-span-2 text-gray-600 truncate">
                신고자
              </div>
              
              {/* 작성일 */}
              <div className="col-span-2 sm:col-span-2 text-gray-500 text-xs sm:text-sm">
                {new Date(site.created_at).toLocaleDateString('ko-KR', {
                  year: '2-digit',
                  month: '2-digit', 
                  day: '2-digit'
                })}
              </div>
              
              {/* 조회수 */}
              <div className="col-span-2 sm:col-span-1 text-gray-500 text-right">
                {site.view_count || 0}
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          검색 결과
        </h1>
        <p className="text-gray-600">
          "{query}"에 대한 검색 결과 ({pagination?.total_count || 0}개)
        </p>
      </div>

      {/* 정렬 옵션 */}
      <div className="flex justify-end items-center mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOptions['sort_by'])}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at">최신순</option>
          <option value="view_count">조회순</option>
        </select>
      </div>

      {/* 검색 결과 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">검색 중...</div>
      ) : searchResults.length > 0 ? (
        <>
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
            {searchResults.map((result) => renderSearchResult(result))}
          </div>
          
          {pagination && (
            <Pagination 
              pagination={pagination} 
              onPageChange={handlePageChange} 
            />
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          "{query}"에 대한 검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}