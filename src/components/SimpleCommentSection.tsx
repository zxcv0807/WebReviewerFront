import React, { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import type { PostCommentResponse, PhishingCommentResponse, CommentCreate } from '../types';

interface SimpleCommentSectionProps {
  comments: PostCommentResponse[] | PhishingCommentResponse[];
  onAddComment: (data: CommentCreate) => Promise<void>;
  onUpdateComment: (commentId: number, data: CommentCreate) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  loading?: boolean;
  title?: string;
}

export default function SimpleCommentSection({
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  loading = false,
  title = "댓글"
}: SimpleCommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onAddComment({ content: newComment.trim() });
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onUpdateComment(commentId, { content: editingContent.trim() });
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
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
      setSubmitting(true);
      await onDeleteComment(commentId);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (comment: PostCommentResponse | PhishingCommentResponse) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 헤더 */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {title} {comments.length}개
          </h3>
          {loading && <span className="text-sm text-gray-500">로딩 중...</span>}
        </div>
      </div>

      <div className="p-6">
        {/* 댓글 목록 */}
        <div className="space-y-4 mb-6">
          {comments.length > 0 ? (
            comments
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {comment.user_name || `사용자 #${comment.user_id || '익명'}`}
                        {user && comment.user_id === user.id && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">내 댓글</span>
                        )}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-sm text-gray-400">(수정됨)</span>
                      )}
                    </div>
                    
                    {/* 수정/삭제 버튼 */}
                    {editingCommentId !== comment.id && comment.user_id && user && comment.user_id === user.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(comment)}
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
                          onClick={cancelEditing}
                          disabled={submitting}
                          className="px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 disabled:opacity-50"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
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
              <a href="/login" className="text-blue-600 hover:underline font-medium">로그인하기</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}