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
  view_count: number;   // 조회수
  like_count: number;   // 좋아요 수
  dislike_count: number; // 싫어요 수
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
  tags?: string[]; // 선택 필드
}

// 페이지네이션 정보
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

// 페이지네이션 응답 제네릭
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
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
  rating: number; // 0-5 작성자 별점
  pros: string;
  cons: string;
  created_at: string;
  updated_at: string;
  comments?: ReviewCommentResponse[];
  view_count: number; // 조회수
  like_count: number; // 좋아요 수
  dislike_count: number; // 싫어요 수
  user_id?: number; // 작성자 ID (백엔드에서 제공되는 경우)
  user_name?: string; // 작성자 이름 (백엔드에서 제공되는 경우)
}

export interface Comment {
  id: number;
  review_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id?: number; // 작성자 ID (백엔드에서 제공되는 경우)
  user_name?: string; // 작성자 이름 (백엔드에서 제공되는 경우)
}

// 리뷰 댓글 응답 타입 (API 스펙에 맞춤)
export interface ReviewCommentResponse {
  id: number;
  review_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  user_name: string;
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
  description?: string;
  status: string;
  created_at: string;
  view_count: number;   // 조회수
  like_count: number;   // 좋아요 수
  dislike_count: number; // 싫어요 수
}

export interface PhishingReportForm {
  url: string;
  reason: string;
  description?: string; // 선택 필드
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
  username?: string;
}

export interface UserUpdateForm {
  username?: string;
  email?: string;
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

// 투표 관련 타입
export interface VoteCreate {
  vote_type: "like" | "dislike";
}

export interface VoteResponse {
  id: number;
  phishing_site_id?: number;
  post_id?: number;
  user_id: number;
  vote_type: string;
  created_at: string;
}

// 댓글 관련 타입 업데이트
export interface CommentCreate {
  content: string;
}

export interface CommentUpdate {
  content: string;
}

export interface PhishingCommentResponse {
  id: number;
  phishing_site_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PostCommentResponse {
  id: number;
  post_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// 댓글 포함된 상세 응답
export interface PhishingSiteWithCommentsResponse {
  id: number;
  url: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comments: PhishingCommentResponse[];
  user_id?: number; // 작성자 ID (백엔드에서 제공되는 경우)
  user_name?: string; // 작성자 이름 (백엔드에서 제공되는 경우)
}

export interface PostWithCommentsResponse {
  id: number;
  title: string;
  type: TabType;
  category: string;
  content: any;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: number;
  user_name: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comments: PostCommentResponse[];
} 