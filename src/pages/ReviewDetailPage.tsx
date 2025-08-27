import { useState, useEffect, useId } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getReview } from '../api/posts';
import type { Review, Comment } from '../types';
// CommentSection 컴포넌트 대신 직접 구현
// import { useAppSelector } from '../redux/hooks'; // 현재 사용하지 않음

// 별점 표시 컴포넌트
function StarRating({ rating, onChange, size = 20, readOnly = true }: { rating: number; onChange?: (r: number) => void; size?: number; readOnly?: boolean }) {
  const uniqueId = useId();
  return (
    <span className={`flex items-center gap-1 ${!readOnly ? 'cursor-pointer' : ''}`}> 
      {[1, 2, 3, 4, 5].map((star) => {
        const fill =
          rating >= star
            ? '100%'
            : rating >= star - 1 && rating < star
            ? `${((rating - (star - 1)) * 100).toFixed(0)}%`
            : '0%';
        const gradId = `starGrad-${uniqueId}-${star}-${String(rating).replace('.', '-')}`;
        return (
          <span key={gradId} style={{ position: 'relative', display: 'inline-block' }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 20 20"
              style={{ position: 'absolute', top: 0, left: 0 }}
              onClick={onChange && !readOnly ? () => onChange(star) : undefined}
            >
              <defs>
                <linearGradient id={gradId}>
                  <stop offset={fill} stopColor="#facc15" />
                  <stop offset={fill} stopColor="#e5e7eb" />
                </linearGradient>
              </defs>
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                fill={`url(#${gradId})`}
              />
            </svg>
            <svg
              width={size}
              height={size}
              viewBox="0 0 20 20"
              style={{ visibility: 'hidden' }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        );
      })}
      <span className="ml-1 text-xs text-gray-600">({rating}/5)</span>
    </span>
  );
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  // const { isAuthenticated } = useAppSelector((state) => state.auth); // 현재 사용하지 않음

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const reviewData = await getReview(parseInt(id));
        setReview(reviewData);
        setComments(reviewData.comments || []);
      } catch (error) {
        console.error('리뷰 조회 실패:', error);
        alert('리뷰를 불러올 수 없습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">
          리뷰를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            웹사이트 리뷰
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{review.site_name}</h1>
        <a
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-lg break-all mb-4 inline-block"
        >
          {review.url}
        </a>
        
        {/* 평균 별점과 날짜/조회수를 한 줄에 배치 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {typeof review.average_rating === 'number' && review.average_rating > 0 ? (
              <>
                <span className="text-sm text-gray-700 font-semibold">평균 별점:</span>
                <StarRating rating={review.average_rating} size={20} />
                <span className="text-gray-700">({review.average_rating.toFixed(1)})</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">별점 없음</span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-3">
            <span>{formatDate(review.created_at)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              조회 {review.view_count || 0}회
            </span>
          </div>
        </div>
      </div>

      {/* 리뷰 내용 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {/* 요약 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">요약</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{review.summary}</p>
        </div>

        {/* 장점/단점 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3 text-lg">장점</h3>
            <p className="text-green-700 whitespace-pre-line leading-relaxed">{review.pros}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">단점</h3>
            <p className="text-red-700 whitespace-pre-line leading-relaxed">{review.cons}</p>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">댓글 {comments.length}개</h3>
        
        {/* 댓글 목록 */}
        <div className="space-y-4 mb-6">
          {comments.length > 0 ? (
            comments
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex flex-col gap-2">
                    {typeof comment.rating === 'number' && comment.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">별점:</span>
                        <StarRating rating={comment.rating} size={16} />
                      </div>
                    )}
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-center text-gray-500 py-8">아직 댓글이 없습니다.</p>
          )}
        </div>

        {/* 댓글 작성 폼 */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-3">댓글 작성</h4>
          <p className="text-sm text-gray-600 mb-4">로그인 후 댓글을 작성할 수 있습니다. <Link to="/login" className="text-blue-600 hover:underline">로그인</Link></p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-6 flex justify-between">
        <Link
          to="/"
          className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          목록으로
        </Link>
        
        <div className="flex space-x-2">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            이전
          </button>
        </div>
      </div>
    </div>
  );
}