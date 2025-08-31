import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { authAPI } from '../api/auth';
import { restoreUser } from '../redux/slices/authSlice';

export const AccountPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
      });
      // 이메일 인증 상태 확인
      checkEmailVerificationStatus();
    }
  }, [user]);

  const checkEmailVerificationStatus = async () => {
    try {
      const response = await authAPI.getEmailVerificationStatus();
      setEmailVerified(response.email_verified);
    } catch (err) {
      console.error('이메일 인증 상태 확인 실패:', err);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: { username?: string; email?: string } = {};
      
      if (formData.username && formData.username !== user?.username) {
        updateData.username = formData.username;
      }
      if (formData.email && formData.email !== user?.email) {
        updateData.email = formData.email;
      }

      if (Object.keys(updateData).length === 0) {
        setError('변경된 내용이 없습니다.');
        return;
      }

      await authAPI.updateMe(updateData);
      
      dispatch(restoreUser() as any);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || '프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await authAPI.deleteMe();
      
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } catch (err: any) {
      setError(err?.response?.data?.detail || '계정 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEmailVerificationClick = () => {
    // 이메일 인증 페이지로 이동
    navigate('/signup/verify', {
      state: {
        email: user?.email,
        isExistingUser: true
      }
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600">계정 페이지에 접근하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">계정 관리</h1>
          </div>

          <div className="p-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">프로필 정보</h2>

              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사용자명
                    </label>
                    <div className="p-3 bg-gray-50 rounded border">
                      {user.username || '설정되지 않음'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <div className="p-3 bg-gray-50 rounded border flex items-center justify-between">
                      <span>{user.email}</span>
                      {emailVerified !== null && (
                        <div className="flex items-center space-x-2">
                          {emailVerified ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              인증완료
                            </span>
                          ) : (
                            <button
                              onClick={handleEmailVerificationClick}
                              className="flex items-center text-orange-600 text-sm hover:text-orange-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              인증필요
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                      {success}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사용자명
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="사용자명을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="이메일을 입력하세요"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? '저장 중...' : '저장'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

          {/* Account Actions Section - Outside white section */}
          <div className="px-6 pb-6 space-y-4">
            {!isEditing && (
              <>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    프로필 편집
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  >
                    계정 삭제
                  </button>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">계정 삭제 확인</h3>
            <p className="text-gray-600 mb-6">
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '삭제 중...' : '삭제'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};