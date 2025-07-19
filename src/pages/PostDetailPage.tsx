import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, deletePost } from '../api/posts';
import type { Post, TabType } from '../types';
import LexicalViewer from '../components/LexicalViewer';
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
  const { user } = useAppSelector((state) => state.auth);

  // typeParam 변수 삭제

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const postData = await getPost(parseInt(id));
        setPost(postData);
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
          {/* 평균 별점 표시 (리뷰 타입일 때만) */}
          {post.type === 'reviews' && (
            <div className="flex items-center gap-2 mb-2">
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
          )}
          
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span>{post.category}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(post.created_at)}</span>
            {post.updated_at !== post.created_at && (
              <>
                <span className="mx-2">•</span>
                <span>수정됨: {formatDate(post.updated_at)}</span>
              </>
            )}
          </div>

          {/* 카테고리와 태그 */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
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
        </div>

        {/* 액션 버튼 */}
        {isFreeBoard && isAuthor && (
          <div className="flex space-x-2 ml-4">
            <Link
              to={`/write?type=${post.type}&edit=${post.id}`}
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