import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { login, clearError } from '../redux/slices/authSlice';
import { extractErrorMessage } from '../utils/validation';
import GoogleLogo from '../assets/Signinwithgoogle.png';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 컴포넌트 마운트 시 에러 클리어 (단, 이메일 인증 에러는 유지)
  useEffect(() => {
    if (error && !isEmailVerificationError(extractErrorMessage(error), error)) {
      dispatch(clearError());
    }
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (error) {
      dispatch(clearError());
    }
    if (!validateForm()) {
      return;
    }
    try {
      await dispatch(login(formData)).unwrap();
      navigate('/');
    } catch {
      // 에러는 Redux에서 처리됨
    }
  };

  // Google OAuth2 Authorization Code Flow만 남김
  const handleGoogleLogin = async () => {
    if (loading) return;
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
      const scope = encodeURIComponent('openid email profile');
      const responseType = 'code';
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('google_oauth_state', state);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=${responseType}&` +
        `scope=${scope}&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`;
      window.location.href = authUrl;
    } catch {
      alert('Google 로그인에 실패했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 이메일 인증 관련 에러인지 확인
  const isEmailVerificationError = (errorMessage: string, errorObj?: unknown) => {
    // 새로운 백엔드 응답에서 error 필드 확인
    const errorObject = errorObj as { error?: string };
    if (errorObject && errorObject.error === 'email_verification_required') {
      return true;
    }
    
    const emailVerificationKeywords = [
      '이메일 인증', 'email verification', '인증이 필요', '인증을 완료', 
      'verify', 'verification', '인증되지 않음', 'not verified',
      'email not verified', 'unverified', '미인증', '인증하지', 
      'activate', '활성화', 'confirm', '확인', 'required to login'
    ];
    
    return emailVerificationKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleEmailVerificationClick = () => {
    // 에러 객체에서 이메일 가져오기 (백엔드가 제공)
    const errorObj = error as { email?: string };
    const emailFromError = errorObj?.email;
    const emailToUse = emailFromError || formData.email;
    
    if (!emailToUse) {
      setValidationErrors({ email: '이메일을 입력해주세요.' });
      return;
    }

    if (!formData.password) {
      setValidationErrors({ password: '비밀번호를 입력해주세요.' });
      return;
    }

    const navigationData = {
      email: emailToUse,
      password: formData.password,
      isExistingUser: true
    };

    // 에러 클리어 후 이메일 인증 페이지로 이동 (기존 사용자용)
    dispatch(clearError());
    navigate('/signup/verify', {
      state: navigationData
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">WebRating 커뮤니티</h1>
          <p className="mt-2 text-gray-600">웹사이트를 리뷰하고, 다른 사람들의 의견을 확인해보세요!</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">로그인</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="mb-2">{extractErrorMessage(error)}</div>
              {isEmailVerificationError(extractErrorMessage(error), error) && (
                <div className="mt-3 pt-3 border-t border-red-300">
                  <button
                    onClick={handleEmailVerificationClick}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    이메일 인증하기
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@email.com"
                disabled={loading}
                required
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="비밀번호를 입력하세요"
                disabled={loading}
                required
                autoComplete="off"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>
            <button
              type="button"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(e);
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
            {/* Google 로그인 버튼 */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full flex justify-center mt-2 bg-transparent border-none p-0 shadow-none hover:bg-transparent focus:outline-none"
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              aria-label="Google로 로그인"
            >
              <img src={GoogleLogo} alt="Sign in with Google" className="h-10" />
            </button>
          </div>
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => dispatch(clearError())}
              >
                회원가입
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              비밀번호를 잊으셨나요?{' '}
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => dispatch(clearError())}
              >
                비밀번호 찾기
              </Link>
            </p>
            <div className="mt-4">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => dispatch(clearError())}
              >
                ← 홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 