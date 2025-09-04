import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post, TabType, Review, PhishingSite, PaginationInfo } from '../types';
import { getPosts, getReviews, getPhishingSites, type SortOptions } from '../api/posts';
import TabNavigation from '../components/TabNavigation';
import PostCard from '../components/PostCard';
import WriteButton from '../components/WriteButton';
import ReviewCard from '../components/ReviewCard';
import PhishingSiteList from '../components/PhishingSiteList';
import Pagination from '../components/Pagination';

export default function HomePage() {
  const [freePosts, setFreePosts] = useState<Post[]>([]);
  const [websiteReviews, setWebsiteReviews] = useState<Review[]>([]);
  const [phishingSites, setPhishingSites] = useState<PhishingSite[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [loading, setLoading] = useState(false);
  
  // 페이지네이션 상태
  const [reviewsPagination, setReviewsPagination] = useState<PaginationInfo | null>(null);
  const [freePostsPagination, setFreePostsPagination] = useState<PaginationInfo | null>(null);
  const [phishingPagination, setPhishingPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 정렬 상태
  const [sortBy, setSortBy] = useState<SortOptions['sort_by']>('created_at');
  
  // sortBy에 따라 자동으로 적절한 sortOrder 결정
  const getSortOrder = (): SortOptions['sort_order'] => {
    // 모든 경우에 desc (높은 것부터, 최신순)가 자연스러움
    return 'desc';
  };

  const handleWriteClick = () => {};


  // 자유게시판 데이터 가져오기
  useEffect(() => {
    const fetchFreePosts = async () => {
      if (activeTab !== 'free') return;
      
      try {
        setLoading(true);
        const response = await getPosts({ 
          type: 'free', 
          category: '자유게시판', 
          page: currentPage, 
          limit: 10,
          sort_by: sortBy,
          sort_order: getSortOrder()
        });
        setFreePosts(response.data);
        setFreePostsPagination(response.pagination);
      } catch (error) {
        console.error('자유게시판 로딩 중 오류:', error);
        setFreePosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFreePosts();
  }, [activeTab, currentPage, sortBy]);

  // 웹사이트 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchWebsiteReviews = async () => {
      if (activeTab !== 'reviews') return;
      
      try {
        setLoading(true);
        const response = await getReviews(currentPage, 10, undefined, {
          sort_by: sortBy,
          sort_order: getSortOrder()
        });
        setWebsiteReviews(response.data);
        setReviewsPagination(response.pagination);
      } catch (error) {
        console.error('웹사이트 리뷰 로딩 중 오류:', error);
        setWebsiteReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteReviews();
  }, [activeTab, currentPage, sortBy]);

  // 피싱 사이트 데이터 가져오기
  useEffect(() => {
    const fetchPhishingSites = async () => {
      if (activeTab !== 'phishing') return;
      
      try {
        setLoading(true);
        const response = await getPhishingSites(currentPage, 10, undefined, {
          sort_by: sortBy,
          sort_order: getSortOrder()
        });
        setPhishingSites(response.data);
        setPhishingPagination(response.pagination);
      } catch (error) {
        console.error('피싱 사이트 로딩 중 오류:', error);
        setPhishingSites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhishingSites();
  }, [activeTab, currentPage, sortBy]);

  // 탭 변경시 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* 정렬 옵션 */}
      <div className="flex justify-end items-center mb-6">
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as SortOptions['sort_by']);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="created_at">최신순</option>
          <option value="view_count">조회순</option>
        </select>
      </div>

      {/* 웹사이트 리뷰 탭 */}
      {activeTab === 'reviews' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">웹사이트 리뷰</h2>
            <Link
              to="/review/write"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition text-sm sm:text-base"
            >
              리뷰 작성
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">로딩 중...</div>
          ) : websiteReviews.length > 0 ? (
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
                {websiteReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                  />
                ))}
              </div>
              
              {reviewsPagination && (
                <Pagination 
                  pagination={reviewsPagination} 
                  onPageChange={handlePageChange} 
                />
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              아직 작성된 리뷰가 없습니다.
              <br />
              <Link
                to="/review/write"
                className="text-blue-600 hover:underline"
              >
                첫 번째 리뷰를 작성해보세요!
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 자유게시판 탭 */}
      {activeTab === 'free' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">자유게시판</h2>
            <WriteButton activeTab={activeTab} onClick={handleWriteClick} />
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">로딩 중...</div>
          ) : freePosts.length > 0 ? (
          <>
            {/* 테이블 헤더 */}
            <div className="bg-gray-100 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 py-3 px-4 text-sm font-medium text-gray-700">
                <div className="col-span-6 sm:col-span-7">제목</div>
                <div className="col-span-2 sm:col-span-2">작성자</div>
                <div className="col-span-2 sm:col-span-2">작성일</div>
                <div className="col-span-2 sm:col-span-1 text-right">조회수</div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-b-lg">
              {freePosts.map((post) => (
                <PostCard key={post.id} post={post} titleColor="text-green-600" />
              ))}
            </div>
            
            {freePostsPagination && (
              <Pagination 
                pagination={freePostsPagination} 
                onPageChange={handlePageChange} 
              />
            )}
          </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              아직 작성된 게시글이 없습니다.
              <br />
              <Link to="/write?type=free" className="text-blue-600 hover:underline">
                첫 번째 게시글을 작성해보세요!
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 피싱사이트 신고 탭 */}
      {activeTab === 'phishing' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">피싱사이트 신고</h2>
            <Link
              to="/phishing/report"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded shadow transition text-sm sm:text-base"
            >
              피싱 사이트 신고
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">로딩 중...</div>
          ) : phishingSites.length > 0 ? (
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
                <PhishingSiteList sites={phishingSites} />
              </div>
              
              {phishingPagination && (
                <Pagination 
                  pagination={phishingPagination} 
                  onPageChange={handlePageChange} 
                />
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              아직 신고된 피싱사이트가 없습니다.
              <br />
              <Link
                to="/phishing/report"
                className="text-red-600 hover:underline"
              >
                첫 번째 피싱사이트를 신고해보세요!
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 