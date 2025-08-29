import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPhishingSiteWithComments, createPhishingSiteComment, updatePhishingSiteComment, deletePhishingSiteComment, votePhishingSite, deletePhishingSite } from '../api/posts';
import type { PhishingSiteWithCommentsResponse, PhishingCommentResponse } from '../types';
import { PHISHING_REASONS } from '../types';
import VoteButtons from '../components/VoteButtons';
import SimpleCommentSection from '../components/SimpleCommentSection';
import EditDeleteButtons from '../components/EditDeleteButtons';

export default function PhishingSiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [phishingSite, setPhishingSite] = useState<PhishingSiteWithCommentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<PhishingCommentResponse[]>([]);

  useEffect(() => {
    const fetchPhishingSite = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const siteData = await getPhishingSiteWithComments(parseInt(id));
        console.log('피싱사이트 데이터:', siteData);
        console.log('user_id 값:', siteData.user_id, typeof siteData.user_id);
        setPhishingSite(siteData);
        setComments(siteData.comments || []);
      } catch (error) {
        console.error('피싱사이트 조회 실패:', error);
        alert('피싱사이트 정보를 불러올 수 없습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPhishingSite();
  }, [id, navigate]);

  const handleEdit = () => {
    if (!phishingSite) return;
    navigate(`/phishing/report?edit=${phishingSite.id}`);
  };

  const handleDelete = async () => {
    if (!phishingSite) return;
    
    try {
      await deletePhishingSite(phishingSite.id);
      alert('피싱 사이트 신고가 삭제되었습니다.');
      navigate('/');
    } catch (error) {
      alert('피싱 사이트 삭제에 실패했습니다.');
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

  const getReasonLabel = (reasonValue: string) => {
    const reason = PHISHING_REASONS.find(r => r.value === reasonValue);
    return reason ? reason.label : reasonValue;
  };

  const getReasonColor = (reasonValue: string) => {
    switch (reasonValue) {
      case 'fake_login':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'payment_fraud':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'spam_email':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'personal_info':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'malware':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 댓글 관련 함수들
  const handleAddComment = async (data: { content: string }) => {
    if (!phishingSite) return;
    await createPhishingSiteComment(phishingSite.id, data);
    // 댓글 추가 후 새로고침
    const updatedSite = await getPhishingSiteWithComments(phishingSite.id);
    setComments(updatedSite.comments || []);
  };

  const handleUpdateComment = async (commentId: number, data: { content: string }) => {
    if (!phishingSite) return;
    await updatePhishingSiteComment(phishingSite.id, commentId, data);
    // 댓글 수정 후 새로고침
    const updatedSite = await getPhishingSiteWithComments(phishingSite.id);
    setComments(updatedSite.comments || []);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!phishingSite) return;
    await deletePhishingSiteComment(phishingSite.id, commentId);
    // 댓글 삭제 후 새로고침
    const updatedSite = await getPhishingSiteWithComments(phishingSite.id);
    setComments(updatedSite.comments || []);
  };

  // 댓글을 CommentSection이 기대하는 형태로 변환
  const convertedComments = comments.map(comment => ({
    id: comment.id,
    user_id: comment.user_id,
    user_name: comment.user_name,
    content: comment.content,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    post_id: 0, // 사용하지 않는 필드
    phishing_site_id: comment.phishing_site_id, // 실제 값
  }));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!phishingSite) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">
          피싱사이트 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
            피싱사이트 신고
          </span>
        </div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold text-red-600 flex-1 break-all">{phishingSite.url}</h1>
          {phishingSite.user_id && (
            <EditDeleteButtons
              authorId={phishingSite.user_id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemType="피싱 사이트 신고"
            />
          )}
        </div>
        
        {/* 신고 사유와 날짜/조회수를 한 줄에 배치 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getReasonColor(phishingSite.reason)}`}>
              {getReasonLabel(phishingSite.reason)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-3">
            <span>{formatDate(phishingSite.created_at)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              조회 {phishingSite.view_count || 0}회
            </span>
          </div>
        </div>
      </div>

      {/* 신고 내용 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h2 className="font-semibold text-red-800 mb-3 text-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            신고 사유 및 설명
          </h2>
          {phishingSite.description ? (
            <p className="text-red-700 leading-relaxed whitespace-pre-wrap">
              {phishingSite.description}
            </p>
          ) : (
            <p className="text-red-600 italic">
              추가 설명이 제공되지 않았습니다.
            </p>
          )}
        </div>
      </div>

      {/* 추천/비추천 버튼 */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">이 신고가 도움이 되었나요?</h3>
        <VoteButtons
          likeCount={phishingSite.like_count || 0}
          dislikeCount={phishingSite.dislike_count || 0}
          onVote={async (voteData) => {
            await votePhishingSite(phishingSite.id, voteData);
            // 투표 후 피싱사이트 데이터 새로고침
            const updatedSite = await getPhishingSiteWithComments(phishingSite.id);
            setPhishingSite(updatedSite);
          }}
        />
      </div>

      {/* 댓글 섹션 */}
      <div className="mb-6">
        <SimpleCommentSection
          comments={convertedComments}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          loading={false}
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