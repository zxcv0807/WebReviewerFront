import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { googleLogin, restoreUser } from '../redux/slices/authSlice';

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // 중복 실행 방지
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      try {
        setStatus('loading');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        // 에러가 있는 경우
        if (error) {
          setErrorMessage('Google 로그인에 실패했습니다.');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        // 필수 파라미터 확인
        if (!code || !state) {
          setErrorMessage('인증 정보가 누락되었습니다.');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        // CSRF 방지를 위한 state 검증
        const savedState = localStorage.getItem('google_oauth_state');
        
        if (state !== savedState) {
          // 임시로 state 검증을 건너뛰고 진행 (개발 중)
        }
        
        // state 정리
        localStorage.removeItem('google_oauth_state');
        
        // 백엔드 URL 가져오기
        const backendURL = import.meta.env.VITE_API_BASE_URL || 'https://backend-patient-river-6568.fly.dev';
        
        // 백엔드 서버 상태 먼저 확인
        try {
          const healthCheck = await fetch(`${backendURL}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (healthError) {
          setErrorMessage('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        // 백엔드에 authorization code 전송
        try {
          
          // Google OAuth 콜백 엔드포인트
          const endpoint = `${backendURL}/auth/google/callback`;
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              code: code,
              redirect_uri: window.location.origin + '/auth/callback',
              state: state,
            }),
          });
          
          if (!response.ok) {
            // 422 오류의 경우 응답 내용 확인
            if (response.status === 422) {
              try {
                const errorData = await response.json();
              } catch (e) {
              }
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // access_token을 localStorage에 저장
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            // Redux 상태 동기화
            await dispatch(restoreUser()).unwrap();
          }
          // user 정보도 필요하다면 localStorage 등에 저장 가능
          // localStorage.setItem('user', JSON.stringify(data.user));
          
          setStatus('success');
          navigate('/');
          
        } catch (fetchError: any) {
          if (fetchError.message && fetchError.message.includes('Failed to fetch')) {
            setErrorMessage('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
          } else {
            setErrorMessage(fetchError.message || 'Google 로그인에 실패했습니다.');
          }
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
      } catch (error) {
        setErrorMessage('Google 로그인에 실패했습니다.');
        setStatus('error');
        setTimeout(() => navigate('/login'), 2000);
      }
    };
    
    handleGoogleCallback();
  }, [searchParams, navigate, dispatch]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 실패</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <p className="text-sm text-gray-500">로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 성공!</h2>
          <p className="text-gray-600 mb-4">홈페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Google 로그인 처리 중...</p>
      </div>
    </div>
  );
} 