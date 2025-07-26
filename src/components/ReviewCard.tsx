import React, { useState, useId } from 'react';
import type { Review, Comment } from '../types';
import { getReview } from '../api/posts';
import { useAppSelector } from '../redux/hooks';

interface ReviewCardProps {
  review: Review;
  onCommentSubmit?: (reviewId: number, data: { content: string; rating: number }) => void;
}

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

export default function ReviewCard({ review, onCommentSubmit }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [comments, setComments] = React.useState<Comment[]>(review.comments || []);
  const [isLoadingComments, setIsLoadingComments] = React.useState(false);
  const [commentRating, setCommentRating] = useState(0);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // 댓글 섹션이 열릴 때 댓글 데이터 가져오기
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      // 댓글 섹션을 처음 열 때 댓글 데이터 가져오기
      setIsLoadingComments(true);
      try {
        const fullReview = await getReview(review.id);
        setComments(fullReview.comments || []);
      } catch (error) {
        console.error('댓글 로딩 실패:', error);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  // 댓글 작성 후 댓글 목록 새로고침
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !onCommentSubmit || commentRating === 0) return;

    try {
      setIsSubmitting(true);
      await onCommentSubmit(review.id, { content: newComment.trim(), rating: commentRating });
      setNewComment('');
      setCommentRating(0);
      
      // 댓글 작성 후 댓글 목록 새로고침
      const fullReview = await getReview(review.id);
      setComments(fullReview.comments || []);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
      {/* 간단한 카드 형태 (접힌 상태) */}
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 w-full">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 break-words">{review.site_name}</h3>
            <a
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm break-all"
            >
              {review.url}
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-col items-start sm:items-end gap-1">
              {/* <StarRating rating={review.rating} /> */}
              {typeof review.average_rating === 'number' && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <span>평균 별점</span>
                  <StarRating rating={review.average_rating} size={15} />
                  <span>({review.average_rating.toFixed(2)})</span>
                </div>
              )}
              <div className="text-xs text-gray-500">
                {formatDate(review.created_at)}
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs sm:text-sm p-2 rounded hover:bg-gray-100"
            >
              {isExpanded ? '접기' : '자세히 보기'}
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 상세 정보 (펼쳐진 상태) */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50">
          {/* 요약 */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">요약</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">{review.summary}</p>
          </div>

          {/* 장점/단점 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">장점</h4>
              <p className="text-green-700 whitespace-pre-line text-sm sm:text-base">{review.pros}</p>
            </div>
            <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">단점</h4>
              <p className="text-red-700 whitespace-pre-line text-sm sm:text-base">{review.cons}</p>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="border-t pt-4">
            <button
              onClick={handleToggleComments}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              댓글 {comments.length}개
              {isLoadingComments && <span className="text-xs sm:text-sm text-gray-500">(로딩 중...)</span>}
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showComments ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showComments && (
              <div className="space-y-4">
                {/* 댓글 목록 */}
                <div className="space-y-3">
                  {isLoadingComments ? (
                    <p className="text-gray-500 text-center py-4 text-sm sm:text-base">댓글을 불러오는 중...</p>
                  ) : comments.length > 0 ? (
                    comments
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((comment) => (
                        <div key={comment.id} className="bg-white p-3 rounded-lg border">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
                            {typeof comment.rating === 'number' && comment.rating > 0 && (
                              <StarRating rating={comment.rating} size={20} />
                            )}
                            <span className="text-gray-800 text-sm sm:text-base break-words">{comment.content}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 text-center py-4 text-sm sm:text-base">아직 댓글이 없습니다.</p>
                  )}
                </div>

                {/* 댓글 작성 폼 */}
                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} className="border-t pt-4">
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        disabled={isSubmitting}
                      />
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-sm text-gray-700">별점:</span>
                        <StarRating rating={commentRating} onChange={setCommentRating} size={4} readOnly={false} />
                      </div>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting || commentRating === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {isSubmitting ? '작성 중...' : '작성'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="border-t pt-4 text-center text-gray-500 text-sm sm:text-base">
                    <a href="/login" className="text-blue-600 hover:underline">로그인 후 댓글을 작성할 수 있습니다.</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 