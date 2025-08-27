import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, deletePost, votePost, cancelPostVote, getMyPostVote, createPostComment, getPostComments, updatePostComment, deletePostComment } from '../api/posts';
import type { Post, TabType, PostCommentResponse } from '../types';
import LexicalViewer from '../components/LexicalViewer';
import VoteButtons from '../components/VoteButtons';
import SimpleCommentSection from '../components/SimpleCommentSection';
import { useAppSelector } from '../redux/hooks';

// 별점 표시 컴포넌트 (간단 버전)
function StarRating({ rating, size = 5 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill =
          rating >= star
            ? '100%'
            : rating >= star - 1 && rating < star
            ? `${((rating - (star - 1)) * 100).toFixed(0)}%`
            : '0%';
        // 고유 id 생성 (예: starGrad-idx-점수)
        const gradId = `starGrad-${star}-${String(rating).replace('.', '-')}`;
        return (
          <span key={gradId} style={{ position: 'relative', display: 'inline-block' }}>
            <svg
              className={`w-${size} h-${size}`}
              viewBox="0 0 20 20"
              style={{ position: 'absolute', top: 0, left: 0 }}
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
              className={`w-${size} h-${size}`}
              viewBox="0 0 20 20"
              style={{ visibility: 'hidden' }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        );
      })}
    </span>
  );
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState<PostCommentResponse[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  // typeParam 변수 삭제

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const postData = await getPost(parseInt(id));
        setPost(postData);
        
        // 모든 게시글 타입에 대해 댓글 로드 시도
        try {
          const commentData = await getPostComments(postData.id);
          setComments(commentData);
        } catch (error) {
          console.error('댓글 로딩 실패:', error);
          // 댓글이 없거나 오류가 발생해도 게시글은 표시되도록 함
          setComments([]);
        }
      } catch (error) {
        alert('게시글을 불러올 수 없습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!post || !window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      await deletePost(post.id);
      navigate('/');
    } catch (error) {
      alert('게시글 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
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

  const getTabLabel = (type: TabType) => {
    switch (type) {
      case 'reviews': return '웹사이트 리뷰';
      case 'free': return '자유게시판';
      case 'phishing': return '피싱사이트 신고';
      default: return '게시글';
    }
  };

  // 내용을 텍스트로 변환하는 함수
  const getContentText = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (content && typeof content === 'object') {
      // Lexical JSON인 경우 텍스트 추출
      try {
        if (content.root && content.root.children) {
          return content.root.children
            .map((node: any) => {
              if (node.type === 'paragraph' && node.children) {
                return node.children
                  .map((child: any) => child.text || '')
                  .join('');
              }
              return '';
            })
            .join('\n');
        }
      } catch (error) {
        console.error('Content parsing error:', error);
      }
    }
    return '';
  };

  // 댓글 관련 함수들
  const loadComments = async () => {
    if (!post) return;
    
    try {
      setCommentsLoading(true);
      const commentData = await getPostComments(post.id);
      setComments(commentData);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (data: { content: string }) => {
    if (!post) return;
    await createPostComment(post.id, data);
    // 댓글 추가 후 새로고침
    await loadComments();
  };

  const handleUpdateComment = async (commentId: number, data: { content: string }) => {
    if (!post) return;
    await updatePostComment(post.id, commentId, data);
    // 댓글 수정 후 새로고침
    await loadComments();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!post) return;
    await deletePostComment(post.id, commentId);
    // 댓글 삭제 후 새로고침
    await loadComments();
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

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">
          게시글을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const isFreeBoard = post.type === 'free';
  const isAuthor = user && post.user_id === user.id;
  const review = post.type === 'reviews' ? (post as unknown as import('../types').Review) : undefined;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {getTabLabel(post.type as TabType)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
          
          {/* 리뷰 타입인 경우 별점과 날짜/조회수를 한 줄에, 자유게시판은 카테고리/태그와 날짜/조회수를 한 줄에 배치 */}
          {post.type === 'reviews' ? (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-semibold">평균 별점:</span>
                {typeof review?.average_rating === 'number' && review.average_rating > 0 ? (
                  <>
                    <StarRating rating={review.average_rating} size={20} />
                    <span className="text-gray-700">{review.average_rating.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-gray-400">별점 없음</span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600 gap-3">
                <span>{formatDate(post.created_at)}</span>
                {post.updated_at !== post.created_at && (
                  <span>수정됨: {formatDate(post.updated_at)}</span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  조회 {post.view_count || 0}회
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {post.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {post.category}
                  </span>
                )}
                {post.tags && post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center text-sm text-gray-600 gap-3">
                <span>{formatDate(post.created_at)}</span>
                {post.updated_at !== post.created_at && (
                  <span>수정됨: {formatDate(post.updated_at)}</span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  조회 {post.view_count || 0}회
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        {isFreeBoard && isAuthor && (
          <div className="flex space-x-2 ml-4">
            <Link
              to={`/write?edit=${post.id}`}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="prose max-w-none whitespace-pre-wrap">
          {isFreeBoard ? (
            // 자유게시판: LexicalViewer 사용
            <LexicalViewer content={post.content} />
          ) : (
            // 다른 탭: 일반 텍스트로 표시
            <div className="text-gray-800 leading-relaxed">
              {getContentText(post.content)}
            </div>
          )}
        </div>
      </div>

      {/* 자유게시판인 경우 추천/비추천 버튼 표시 */}
      {post.type === 'free' && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">이 게시글이 도움이 되었나요?</h3>
          <VoteButtons
            likeCount={post.like_count || 0}
            dislikeCount={post.dislike_count || 0}
            onVote={async (voteType) => { await votePost(post.id, { vote_type: voteType }); }}
            onCancelVote={() => cancelPostVote(post.id)}
            getCurrentVote={() => getMyPostVote(post.id)}
          />
        </div>
      )}

      {/* 댓글 섹션 - 모든 게시글 타입에 표시 */}
      <div className="mt-6">
        <SimpleCommentSection
          comments={comments}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          loading={commentsLoading}
          title="댓글"
        />
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