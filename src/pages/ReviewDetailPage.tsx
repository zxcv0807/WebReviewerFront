import { useState, useEffect, useId } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getReview, deleteReview, voteReview, createReviewComment, updateReviewComment, deleteReviewComment, getMyReviewVote } from '../api/posts';
import type { Review, ReviewCommentResponse } from '../types';
import EditDeleteButtons from '../components/EditDeleteButtons';
import VoteButtons from '../components/VoteButtons';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { restoreUser } from '../redux/slices/authSlice';
import { UserDropdown } from '../components/UserDropdown';

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
      <span className="ml-1 text-xs text-gray-600">{rating}</span>
    </span>
  );
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<ReviewCommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // 로그인 상태이지만 user 정보가 없을 때 복구 시도
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(restoreUser());
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const reviewData = await getReview(parseInt(id));
        setReview(reviewData);
        setComments(reviewData.comments || []);
        
        // 로그인된 사용자의 투표 상태 확인
        if (isAuthenticated) {
          try {
            await getMyReviewVote(parseInt(id));
          } catch {
            // 투표하지 않은 상태일 수 있음
          }
        }
      } catch (error) {
        console.error('리뷰 조회 실패:', error);
        alert('리뷰를 불러올 수 없습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id, navigate, isAuthenticated]);

  const handleEdit = () => {
    if (!review) return;
    navigate(`/review/write?edit=${review.id}`);
  };

  const handleDelete = async () => {
    if (!review) return;
    
    try {
      await deleteReview(review.id);
      alert('리뷰가 삭제되었습니다.');
      navigate('/');
    } catch (error) {
      alert('리뷰 삭제에 실패했습니다.');
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

  // 댓글 관련 함수들
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review || !newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await createReviewComment(review.id, { content: newComment.trim() });
      
      // 댓글 목록 새로고침
      const updatedReview = await getReview(review.id);
      setComments(updatedReview.comments || []);
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditingComment = (comment: ReviewCommentResponse) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!review || !editingContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      await updateReviewComment(commentId, { content: editingContent.trim() });
      
      // 댓글 목록 새로고침
      const updatedReview = await getReview(review.id);
      setComments(updatedReview.comments || []);
      
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!review || !window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
      setSubmitting(true);
      await deleteReviewComment(commentId);
      
      // 댓글 목록 새로고침
      const updatedReview = await getReview(review.id);
      setComments(updatedReview.comments || []);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
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
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 flex-1">{review.site_name}</h1>
          {review.user_id && (
            <EditDeleteButtons
              authorId={review.user_id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemType="리뷰"
            />
          )}
        </div>
        <a
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-lg break-all mb-3 inline-block"
        >
          {review.url}
        </a>
        
        {/* 작성자 정보 */}
        {(review as any).user_name && (review as any).user_name !== '알수없음' && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">작성자</span>
              <UserDropdown username={(review as any).user_name} className="text-green-700 font-semibold" />
            </div>
          </div>
        )}
        
        {/* 별점과 메타 정보 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 font-semibold">작성자 별점:</span>
            <StarRating rating={review.rating} size={20} />
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-4">
            <span>{formatDate(review.created_at)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {review.view_count || 0}회
            </span>
            <VoteButtons
              likeCount={review.like_count || 0}
              dislikeCount={review.dislike_count || 0}
              onVote={async (voteData) => {
                try {
                  await voteReview(review.id, voteData);
                  // 투표 후 리뷰 데이터 새로고침
                  const updatedReview = await getReview(review.id);
                  setReview(updatedReview);
                } catch (error: any) {
                  console.error('리뷰 투표 실패:', error);
                  // VoteButtons 컴포넌트가 이미 에러 처리를 하므로, 여기서는 다시 throw
                  throw error;
                }
              }}
              size="sm"
            />
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
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {comment.user_name && comment.user_name !== '알수없음' ? (
                          <UserDropdown username={comment.user_name} className="text-blue-600 font-semibold" />
                        ) : (
                          `사용자 #${comment.user_id || '익명'}`
                        )}
                        {user && comment.user_id === user.id && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">내 댓글</span>
                        )}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-xs text-gray-400">(수정됨)</span>
                      )}
                    </div>
                    
                    {/* 수정/삭제 버튼 */}
                    {editingCommentId !== comment.id && comment.user_id && user && comment.user_id === user.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditingComment(comment)}
                          className="px-3 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* 댓글 내용 또는 수정 폼 */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        disabled={submitting}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={!editingContent.trim() || submitting}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? '저장 중...' : '저장'}
                        </button>
                        <button
                          onClick={cancelEditingComment}
                          disabled={submitting}
                          className="px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 disabled:opacity-50"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>
              ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>아직 댓글이 없습니다.</p>
              <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요!</p>
            </div>
          )}
        </div>

        {/* 댓글 작성 폼 */}
        {isAuthenticated ? (
          <div className="border-t pt-6">
            <form onSubmit={handleAddComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                disabled={submitting}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-t pt-6 text-center text-gray-500">
            <div className="bg-gray-50 rounded-lg p-6">
              <svg className="w-8 h-8 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
              <Link to="/login" className="text-blue-600 hover:underline font-medium">로그인하기</Link>
            </div>
          </div>
        )}
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