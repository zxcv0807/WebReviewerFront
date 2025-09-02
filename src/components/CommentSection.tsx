import React, { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import type { PostCommentResponse, PhishingCommentResponse, CommentCreate } from '../types';
import { UserDropdown } from './UserDropdown';

interface CommentSectionProps {
  comments: PostCommentResponse[] | PhishingCommentResponse[];
  onAddComment: (data: CommentCreate) => Promise<void>;
  onUpdateComment: (commentId: number, data: CommentCreate) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onLoadComments: () => Promise<void>;
  loading?: boolean;
  title?: string;
}

export default function CommentSection({
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onLoadComments,
  loading = false,
  title = "댓글"
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await onAddComment({ content: newComment.trim() });
      setNewComment('');
      await onLoadComments();
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
      await onLoadComments();
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
      await onLoadComments();
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

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      await onLoadComments();
    }
    setShowComments(!showComments);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{title} {comments.length}개</span>
          <svg
            className={`w-4 h-4 transition-transform ${showComments ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {loading && <span className="text-sm text-gray-500">로딩 중...</span>}
      </div>

      {showComments && (
        <div className="space-y-4">
          {/* 댓글 목록 */}
          <div className="space-y-3">
            {comments.length > 0 ? (
              comments
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg p-3 border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600">
                          {comment.user_name ? (
                            <UserDropdown username={comment.user_name} className="text-blue-600 font-semibold" />
                          ) : (
                            `사용자 #${comment.user_id || '익명'}`
                          )}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                        {comment.updated_at !== comment.created_at && (
                          <span className="text-xs text-gray-400">(수정됨)</span>
                        )}
                      </div>
                      
                      {/* 수정/삭제 버튼 */}
                      {user && comment.user_id === user.id && (
                        <div className="flex gap-1">
                          {editingCommentId !== comment.id && (
                            <>
                              <button
                                onClick={() => startEditing(comment)}
                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                                disabled={submitting}
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded"
                                disabled={submitting}
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 댓글 내용 또는 수정 폼 */}
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                          disabled={submitting}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={!editingContent.trim() || submitting}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? '저장 중...' : '저장'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={submitting}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 disabled:opacity-50"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-500 py-8">아직 댓글이 없습니다.</p>
            )}
          </div>

          {/* 댓글 작성 폼 */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="border-t pt-4">
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={submitting}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="border-t pt-4 text-center text-gray-500">
              <p>댓글을 작성하려면 <a href="/login" className="text-blue-600 hover:underline">로그인</a>해주세요.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}