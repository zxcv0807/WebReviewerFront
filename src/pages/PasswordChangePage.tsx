import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { authAPI } from '../api/auth';

export const PasswordChangePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.current_password) {
      setError('현재 비밀번호를 입력해주세요.');
      return false;
    }
    if (!formData.new_password) {
      setError('새 비밀번호를 입력해주세요.');
      return false;
    }
    if (formData.new_password.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    if (formData.new_password !== formData.confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (formData.current_password === formData.new_password) {
      setError('현재 비밀번호와 새 비밀번호가 같습니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authAPI.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      });
      
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setFormData({
        current_password: '',
        new_password: '',
        confirmPassword: '',
      });
      
      // 3초 후 계정 페이지로 리다이렉트
      setTimeout(() => {
        navigate('/account');
      }, 3000);
      
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600">비밀번호 변경을 위해서는 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">비밀번호 변경</h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                {success}
                <p className="text-sm mt-2">3초 후 계정 페이지로 이동합니다...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="현재 비밀번호를 입력하세요"
                  disabled={loading || !!success}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                  disabled={loading || !!success}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  disabled={loading || !!success}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !!success}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '변경 중...' : '비밀번호 변경'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/account')}
                  disabled={loading}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};