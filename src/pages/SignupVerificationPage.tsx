import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api/auth';

interface SignupData {
  username?: string;
  email: string;
  password?: string;
  isExistingUser?: boolean;
}

export const SignupVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state as SignupData;
  
  
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // 데이터가 없으면 에러 표시 (리다이렉트 하지 않음)
    if (!signupData) {
      setError('이메일 인증 페이지에 잘못 접근했습니다. 다시 시도해주세요.');
      return;
    }
    
    // 기존 사용자의 경우 자동으로 인증코드 발송
    if (signupData.isExistingUser) {
      const sendEmail = async () => {
        setSendingEmail(true);
        setError(null);
        setSuccess(null);

        try {
          if (signupData.password) {
            await authAPI.sendVerificationEmail({
              email: signupData.email,
              password: signupData.password
            });
            setSuccess('인증 코드가 발송되었습니다. 이메일을 확인해주세요.');
          } else {
            setError('비밀번호 정보가 없습니다. 로그인 페이지에서 다시 시도해주세요.');
          }
        } catch (err) {
          const error = err as { response?: { data?: { detail?: string } } };
          setError(error?.response?.data?.detail || '인증 코드 발송에 실패했습니다.');
        } finally {
          setSendingEmail(false);
        }
      };
      
      sendEmail();
    } else {
      // 신규 회원가입의 경우 이미 발송되었다고 가정
      setSuccess(`${signupData.email}로 인증 코드가 발송되었습니다.`);
    }
  }, []); // 의존성 배열을 비워서 한 번만 실행


  const sendVerificationEmail = async () => {
    if (!signupData) return;
    
    setSendingEmail(true);
    setError(null);
    setSuccess(null);

    try {
      if (signupData.isExistingUser) {
        // 기존 사용자: 일반 이메일 인증
        if (signupData.password) {
          await authAPI.sendVerificationEmail({
            email: signupData.email,
            password: signupData.password
          });
          setSuccess(`${signupData.email}로 인증 코드가 발송되었습니다.`);
        } else {
          setError('비밀번호 정보가 없습니다. 로그인 페이지에서 다시 시도해주세요.');
        }
      } else {
        // 신규 사용자: 회원가입 인증 코드 재발송
        await authAPI.resendVerificationCode();
        setSuccess(`${signupData.email}로 인증 코드가 재발송되었습니다.`);
      }
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error?.response?.data?.detail || '인증 코드 발송에 실패했습니다.');
    } finally {
      setSendingEmail(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      setError('6자리 인증 코드(숫자+영문)를 입력해주세요.');
      return;
    }

    setVerifyingCode(true);
    setError(null);
    setSuccess(null);

    try {
      if (signupData.isExistingUser) {
        // 기존 사용자: 일반 이메일 인증
        await authAPI.verifyEmailCode(verificationCode);
        setSuccess('🎉 이메일 인증 완료! 이제 로그인할 수 있습니다.');
      } else {
        // 신규 사용자: 회원가입 인증 및 로그인
        const response = await authAPI.verifySignup({
          email: signupData.email,
          code: verificationCode
        });
        
        // 토큰이 반환되면 저장
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
        
        setSuccess('🎉 이메일 인증 완료! 계정이 성공적으로 생성되었습니다.');
      }
      
      // 2초 후 홈페이지로 이동
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
      
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error?.response?.data?.detail || '인증 코드가 잘못되었습니다.');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleResendCode = () => {
    sendVerificationEmail();
  };

  // signupData가 없어도 에러 메시지를 표시할 수 있도록 수정
  // if (!signupData) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {signupData?.isExistingUser ? '이메일 인증' : '이메일 인증 필수'}
          </h1>
          <p className="mt-2 text-gray-600">
            {!signupData ? (
              '이메일 인증 페이지입니다.'
            ) : signupData?.isExistingUser ? (
              '로그인을 위해 이메일 인증을 완료해주세요.'
            ) : (
              <><strong>가짜 계정 방지</strong>를 위해 이메일 인증을 완료해야 계정이 생성됩니다.</>
            )}
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {signupData ? (signupData.isExistingUser ? '이메일 인증' : '계정 생성을 위한 인증') : '이메일 인증'}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {signupData && (
                <>
                  <span className="font-medium">{signupData.email}</span>로<br/>
                  인증 코드를 발송했습니다.<br/>
                  {!signupData.isExistingUser && (
                    <span className="text-red-600 font-medium">인증 완료 전까지는 계정이 생성되지 않습니다.</span>
                  )}
                </>
              )}
              {!signupData && (
                <span className="text-orange-600">이메일 정보가 없습니다. 로그인 페이지에서 다시 시작해주세요.</span>
              )}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {sendingEmail ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">인증 코드 발송 중...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증 코드 (6자리 숫자+영문)
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase())}
                  placeholder="A1B2C3"
                  maxLength={6}
                  className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                />
              </div>
              
              <button
                onClick={verifyCode}
                disabled={verifyingCode || !verificationCode || verificationCode.length < 6 || !signupData}
                className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {verifyingCode ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    계정 생성 중...
                  </span>
                ) : (
                  signupData ? (signupData.isExistingUser ? '이메일 인증 완료하기' : '계정 생성 완료하기') : '이메일 인증하기'
                )}
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  {signupData && signupData.isExistingUser ? (
                    <>💡 <strong>팁:</strong> 인증 코드가 오지 않으면 스팸함을 확인해보세요.</>
                  ) : signupData ? (
                    <>⚠️ <strong>주의:</strong> 브라우저를 닫거나 페이지를 새로고침하면 인증 과정이 초기화됩니다.</>
                  ) : (
                    <>ℹ️ <strong>알림:</strong> 이메일 인증 페이지입니다.</>
                  )}
                </p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  코드를 받지 못하셨나요?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={sendingEmail}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {sendingEmail ? '발송 중...' : '코드 재전송'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  이메일 인증이 완료되면 자동으로 홈페이지로 이동합니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};