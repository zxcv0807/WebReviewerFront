import type { LoginForm, SignupForm, FormErrors } from '../types';

// 정규표현식 패턴
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// 백엔드 에러 메시지 추출 함수
export const extractErrorMessage = (error: any): string => {
  if (!error) {
    return '알 수 없는 오류가 발생했습니다.';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  // 새로운 백엔드 응답 구조: error.message 먼저 확인
  if (error.message) {
    return error.message;
  }
  
  // 기존 구조: response.data.detail 확인
  const detail = error?.response?.data?.detail;
  
  if (detail) {
    if (typeof detail === 'string') {
      return detail;
    }
    
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join(', ');
    }
    
    if (typeof detail === 'object' && detail.msg) {
      return detail.msg;
    }
    
    return JSON.stringify(detail);
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

// 이메일 유효성 검사
export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return '이메일을 입력해주세요.';
  }
  if (!EMAIL_REGEX.test(email)) {
    return '올바른 이메일 형식을 입력해주세요.';
  }
  return undefined;
};

// 비밀번호 유효성 검사
export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return '비밀번호를 입력해주세요.';
  }
  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return '비밀번호는 문자, 숫자, 특수문자를 모두 포함해야 합니다.';
  }
  return undefined;
};

// 비밀번호 확인 검사
export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return '비밀번호 확인을 입력해주세요.';
  }
  if (password !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다.';
  }
  return undefined;
};

// 이름 유효성 검사
export const validateName = (name: string): string | undefined => {
  if (!name) {
    return '이름을 입력해주세요.';
  }
  if (name.length < 2) {
    return '이름은 2자 이상이어야 합니다.';
  }
  return undefined;
};

// 로그인 폼 유효성 검사
export const validateLoginForm = (form: LoginForm): FormErrors => {
  const errors: FormErrors = {};
  
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;
  
  return errors;
};

// 회원가입 폼 유효성 검사
export const validateSignupForm = (form: SignupForm): FormErrors => {
  const errors: FormErrors = {};
  
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;
  
  return errors;
}; 