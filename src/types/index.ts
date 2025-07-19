export interface Post {
  id: number;
  title: string;
  category: string;
  content: any; // Lexical JSON
  tags: string[];
  created_at: string;
  updated_at: string;
  type?: 'free' | 'reviews' | 'phishing';
  user_id: number;      // 작성자 id
  user_name: string;    // 작성자 이름
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export interface PostForm {
  title: string;
  content: any; // Lexical JSON
  category: string;
  tags: string[];
}

export interface PostListResponse {
  posts: Post[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface PostFilters {
  categoryId?: number;
  tagIds?: number[];
  search?: string;
  page?: number;
  limit?: number;
  type?: 'free' | 'reviews' | 'phishing';
  category?: string; // 추가
}

export type TabType = 'reviews' | 'free' | 'phishing';

// 리뷰 관련 타입
export interface Review {
  id: number;
  site_name: string;
  url: string;
  summary: string;
  rating: number; // 1-5 별점
  pros: string;
  cons: string;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  average_rating?: number; // 댓글 평균 별점
}

export interface Comment {
  id: number;
  review_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  rating?: number; // 댓글 별점
}

export interface ReviewForm {
  site_name: string;
  url: string;
  summary: string;
  rating: number;
  pros: string;
  cons: string;
}

export interface CommentForm {
  content: string;
}

// 피싱 사이트 관련 타입
export interface PhishingSite {
  id: number;
  url: string;
  reason: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PhishingReportForm {
  url: string;
  reason: string;
  description: string;
}

export const PHISHING_REASONS = [
  { value: 'fake_login', label: '가짜 로그인' },
  { value: 'payment_fraud', label: '결제 유도' },
  { value: 'spam_email', label: '스팸메일 유도' },
  { value: 'personal_info', label: '개인정보 수집' },
  { value: 'malware', label: '악성코드 유포' },
  { value: 'other', label: '기타' },
] as const;

export type PhishingReason = typeof PHISHING_REASONS[number]['value'];

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  title?: string;
  content?: string;
} 