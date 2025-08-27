import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post, TabType, Review, PhishingSite } from '../types';
import { getPosts, getReviews, getPhishingSites } from '../api/posts';
import TabNavigation from '../components/TabNavigation';
import PostCard from '../components/PostCard';
import WriteButton from '../components/WriteButton';
import ReviewCard from '../components/ReviewCard';
import PhishingSiteList from '../components/PhishingSiteList';

export default function HomePage() {
  const [freePosts, setFreePosts] = useState<Post[]>([]);
  const [websiteReviews, setWebsiteReviews] = useState<Review[]>([]);
  const [phishingSites, setPhishingSites] = useState<PhishingSite[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleWriteClick = () => {};

  // API에서 게시글 데이터 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        const [, freeArr, ] = await Promise.all([
          getPosts({ type: 'reviews', category: '웹사이트 리뷰', limit: 10 }),
          getPosts({ type: 'free', category: '자유게시판', limit: 10 }),
          getPosts({ type: 'phishing', category: '피싱사이트 신고', limit: 10 }),
        ]);
        
        // setReviews(reviewsArr); // Removed as per edit hint
        setFreePosts(freeArr);
        // setPhishingPosts(phishingArr); // Removed as per edit hint
      } catch (error) {
        console.error('게시글 로딩 중 오류:', error);
        // API 오류 시 빈 배열 유지
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 웹사이트 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchWebsiteReviews = async () => {
      try {
        const reviewsData = await getReviews();
        setWebsiteReviews(reviewsData);
      } catch (error) {
        console.error('웹사이트 리뷰 로딩 중 오류:', error);
        setWebsiteReviews([]);
      }
    };

    if (activeTab === 'reviews') {
      fetchWebsiteReviews();
    }
  }, [activeTab]);

  // 피싱 사이트 데이터 가져오기
  useEffect(() => {
    const fetchPhishingSites = async () => {
      try {
        const sitesData = await getPhishingSites();
        setPhishingSites(sitesData);
      } catch (error) {
        console.error('피싱 사이트 로딩 중 오류:', error);
        setPhishingSites([]);
      }
    };

    if (activeTab === 'phishing') {
      fetchPhishingSites();
    }
  }, [activeTab]);

  const handleSearch = () => {};


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* 검색 및 글쓰기 버튼 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="제목 또는 내용으로 검색..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={handleSearch}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              검색
            </button>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          {activeTab === 'reviews' ? (
              <Link
              to="/review/write"
                className="block w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition text-sm sm:text-base"
              >
              리뷰 작성
            </Link>
          ) : activeTab === 'phishing' ? (
            <Link
              to="/phishing/report"
              className="block w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded shadow transition text-sm sm:text-base"
            >
              피싱 사이트 신고
              </Link>
          ) : (
            <WriteButton activeTab={activeTab} onClick={handleWriteClick} />
            )}
        </div>
      </div>

      {/* 웹사이트 리뷰 탭 */}
      {activeTab === 'reviews' && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">웹사이트 리뷰</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">로딩 중...</div>
          ) : websiteReviews.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {websiteReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                />
            ))}
            </div>
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
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">자유게시판</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">로딩 중...</div>
          ) : freePosts.length > 0 ? (
          <ul className="space-y-3 sm:space-y-4">
            {freePosts.map((post) => (
              <PostCard key={post.id} post={post} titleColor="text-green-600" />
            ))}
          </ul>
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
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">피싱사이트 신고</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">로딩 중...</div>
          ) : phishingSites.length > 0 ? (
            <PhishingSiteList sites={phishingSites} />
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