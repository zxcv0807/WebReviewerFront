import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { authAPI, type UserMemoListItem } from '../api/auth';
import { UserMemoModal } from '../components/UserMemoModal';

export const UserMemosPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [memos, setMemos] = useState<UserMemoListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemo, setSelectedMemo] = useState<UserMemoListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMemos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.getAllUserMemos();
      setMemos(response.memos);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '메모를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMemos();
    }
  }, [isAuthenticated]);

  const handleDeleteMemo = async (targetUsername: string) => {
    try {
      await authAPI.deleteUserMemo(targetUsername);
      setMemos(prev => prev.filter(memo => memo.target_username !== targetUsername));
      if (selectedMemo && selectedMemo.target_username === targetUsername) {
        setSelectedMemo(null);
        setIsModalOpen(false);
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '메모 삭제에 실패했습니다.');
    }
  };

  const handleMemoClick = (memo: UserMemoListItem) => {
    setSelectedMemo(memo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMemo(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMemos = memos.filter(memo =>
    memo.target_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memo.memo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600">메모 목록에 접근하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">내 메모</h1>
            <p className="text-gray-600 mt-1">다른 사용자들에 대해 작성한 개인 메모입니다.</p>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* 검색 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="사용자명 또는 메모 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* 메모 목록 */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">로딩 중...</div>
              </div>
            ) : filteredMemos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다.' : '작성한 메모가 없습니다.'}
                </div>
                {!searchTerm && (
                  <p className="text-gray-400 mt-2">
                    게시글이나 댓글의 사용자명을 클릭하여 메모를 작성해보세요.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMemos.map((memo) => (
                  <div
                    key={memo.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleMemoClick(memo)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-blue-600">
                          {memo.target_username}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`${memo.target_username}에 대한 메모를 삭제하시겠습니까?`)) {
                            handleDeleteMemo(memo.target_username);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                        title="메모 삭제"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-800 text-sm leading-relaxed line-clamp-1">
                        {memo.memo}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(memo.updated_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 통계 정보 */}
          {!loading && memos.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>총 {memos.length}개의 메모</span>
                {searchTerm && (
                  <span>검색 결과: {filteredMemos.length}개</span>
                )}
              </div>
            </div>
          )}

          {/* 메모 보기 모달 */}
          <UserMemoModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            targetUsername={selectedMemo?.target_username || ''}
          />
        </div>
      </div>
    </div>
  );
};