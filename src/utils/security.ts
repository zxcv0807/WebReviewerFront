// 보안 관련 유틸리티 함수들

// 일반적인 에러 메시지 (구체적인 정보 노출 방지)
export const getGenericErrorMessage = (action: 'login' | 'signup'): string => {
  return `${action === 'login' ? '로그인' : '회원가입'}에 실패했습니다. 입력 정보를 확인해주세요.`;
};

// 요청 제한 (Rate Limiting) 시뮬레이션
export const checkRateLimit = (action: string, userId?: string): boolean => {
  // 실제로는 서버에서 처리해야 함
  const key = `rate_limit_${action}_${userId || 'anonymous'}`;
  const lastAttempt = localStorage.getItem(key);
  const now = Date.now();
  
  if (lastAttempt && now - parseInt(lastAttempt) < 5000) { // 5초 제한
    return false;
  }
  
  localStorage.setItem(key, now.toString());
  return true;
};

// 입력값 정제 (XSS 방지)
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // 기본적인 HTML 태그 제거
    .slice(0, 100); // 최대 길이 제한
};

// 비밀번호 강도 검사
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('8자 이상이어야 합니다');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('소문자를 포함해야 합니다');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('대문자를 포함해야 합니다');

  if (/\d/.test(password)) score += 1;
  else feedback.push('숫자를 포함해야 합니다');

  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('특수문자를 포함해야 합니다');

  return { score, feedback };
}; 