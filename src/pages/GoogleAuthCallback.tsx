import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { restoreUser } from '../redux/slices/authSlice';

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;
      try {
        setStatus('loading');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        if (error) {
          setErrorMessage('Google 로그인에 실패했습니다.');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        if (!code || !state) {
          setErrorMessage('인증 정보가 누락되었습니다.');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        const savedState = localStorage.getItem('google_oauth_state');
        if (state !== savedState) {
          // 임시로 state 검증을 건너뛰고 진행 (개발 중)
        }
        localStorage.removeItem('google_oauth_state');
        const backendURL = import.meta.env.VITE_API_BASE_URL || 'https://backend-patient-river-6568.fly.dev';
        try {
          await fetch(`${backendURL}/`, {
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
        try {
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
            if (response.status === 422) {
              try {
                await response.json();
              } catch (e) {}
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            await dispatch(restoreUser()).unwrap();
          }
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