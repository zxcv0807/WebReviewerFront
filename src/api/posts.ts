import axiosInstance from './axiosInstance';
import type { Post, PostForm, PostFilters, Review, ReviewForm, PhishingSite, PhishingReportForm, VoteCreate, CommentCreate, CommentUpdate, PhishingCommentResponse, PostCommentResponse, PhishingSiteWithCommentsResponse, PostWithCommentsResponse, PaginatedResponse, ReviewCommentResponse } from '../types';

// 정렬 및 검색 옵션 타입
export interface SortOptions {
  sort_by?: 'created_at' | 'view_count';
  sort_order?: 'asc' | 'desc';
}

export interface SearchOptions extends SortOptions {
  q: string;
  content_type?: 'posts' | 'reviews' | 'phishing';
  tags?: string;
  page?: number;
  limit?: number;
}

// 검색 프리뷰 결과 타입 (경량화된 데이터)
export interface SearchPreviewResult {
  id: number;
  content_type: 'post' | 'review' | 'phishing';
  title: string;
  user_name: string;
  created_at: string;
  view_count: number;
}

// 검색 프리뷰 응답 타입
export interface SearchPreviewResponse {
  results: SearchPreviewResult[];
  total_count: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// 통합 검색 결과 타입 (기존 호환성 유지)
export interface UnifiedSearchResult {
  type: 'post' | 'review' | 'phishing';
  data: Post | Review | PhishingSite;
}

// 통합 검색 응답 타입 (기존 호환성 유지)
export interface SearchResponse {
  results: UnifiedSearchResult[];
  total_count: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// 검색 프리뷰 API (경량화된 검색)
export const searchPreview = async (options: SearchOptions): Promise<SearchPreviewResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('q', options.q);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sort_by) params.append('sort_by', options.sort_by);
    
    const url = `/search/preview?${params.toString()}`;
    console.log('검색 프리뷰 API 호출:', url);
    console.log('검색 파라미터:', Object.fromEntries(params.entries()));
    
    const response = await axiosInstance.get(url);
    console.log('검색 프리뷰 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('검색 프리뷰 중 오류:', error);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('요청이 전송되지 않음:', error.request);
    } else {
      console.error('오류 메시지:', error.message);
    }
    throw error;
  }
};

// 통합 검색 API (기존 호환성 유지)
export const searchUnified = async (options: SearchOptions): Promise<SearchResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('q', options.q);
    if (options.content_type) params.append('content_type', options.content_type);
    if (options.sort_by) params.append('sort_by', options.sort_by);
    if (options.sort_order) params.append('sort_order', options.sort_order);
    if (options.tags) params.append('tags', options.tags);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    
    const url = `/search/?${params.toString()}`;
    console.log('검색 API 호출:', url);
    console.log('검색 파라미터:', Object.fromEntries(params.entries()));
    
    const response = await axiosInstance.get(url);
    console.log('검색 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('통합 검색 중 오류:', error);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('요청이 전송되지 않음:', error.request);
    } else {
      console.error('오류 메시지:', error.message);
    }
    throw error;
  }
};

// 게시글 목록 조회 (페이지네이션)
export const getPosts = async (filters?: PostFilters & SortOptions): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    const url = `/posts/posts?${params.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.error('게시글 목록 조회 중 오류:', error);
    throw error;
  }
};

// 게시글 상세 조회
export const getPost = async (id: number): Promise<Post> => {
  try {
    const response = await axiosInstance.get(`/posts/posts/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('게시글 상세 조회 중 오류:', error);
    throw error;
  }
};

// 게시글 상세 + 댓글 조회 (조회수 증가)
export const getPostWithComments = async (id: number): Promise<PostWithCommentsResponse> => {
  try {
    const response = await axiosInstance.get(`/posts/posts/${id}/with-comments`);
    return response.data;
  } catch (error: any) {
    console.error('게시글 상세 + 댓글 조회 중 오류:', error);
    throw error;
  }
};

// 게시글 생성
export const createPost = async (postData: PostForm): Promise<Post> => {
  try {
    const response = await axiosInstance.post('/posts/posts', postData);
    return response.data;
  } catch (error: any) {
    console.error('게시글 생성 중 오류:', error);
    throw error;
  }
};

// 게시글 수정
export const updatePost = async (id: number, postData: PostForm): Promise<Post> => {
  try {
    const response = await axiosInstance.put(`/posts/posts/${id}`, postData);
    return response.data;
  } catch (error: any) {
    console.error('게시글 수정 중 오류:', error);
    throw error;
  }
};

// 게시글 삭제
export const deletePost = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/posts/posts/${id}`);
  } catch (error: any) {
    console.error('게시글 삭제 중 오류:', error);
    throw error;
  }
};

// 카테고리 목록 조회 (백엔드에서 지원하지 않으므로 임시로 하드코딩)
export const getCategories = async (): Promise<string[]> => {
  return ['자유게시판', '웹사이트 리뷰', '피싱사이트 신고'];
};

// 태그 목록 조회 (백엔드에서 지원하지 않으므로 임시로 빈 배열 반환)
export const getTags = async (): Promise<string[]> => {
  return [];
};

// 리뷰 관련 API 함수들 (페이지네이션)
export const getReviews = async (page: number = 1, limit: number = 10, search?: string, sortOptions?: SortOptions): Promise<PaginatedResponse<Review>> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (sortOptions?.sort_by) params.append('sort_by', sortOptions.sort_by);
    if (sortOptions?.sort_order) params.append('sort_order', sortOptions.sort_order);
    const response = await axiosInstance.get(`/api/reviews?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('리뷰 목록 조회 실패:', error);
    throw error;
  }
};

export const getReview = async (id: number): Promise<Review> => {
  try {
    const response = await axiosInstance.get(`/api/reviews/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('리뷰 조회 실패:', error);
    throw error;
  }
};

export const createReview = async (reviewData: ReviewForm): Promise<Review> => {
  try {
    const response = await axiosInstance.post('/api/reviews', reviewData);
    return response.data;
  } catch (error: any) {
    console.error('리뷰 작성 실패:', error);
    throw error;
  }
};

export const updateReview = async (id: number, reviewData: ReviewForm): Promise<Review> => {
  try {
    const response = await axiosInstance.put(`/api/reviews/${id}`, reviewData);
    return response.data;
  } catch (error: any) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
};

export const deleteReview = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/reviews/${id}`);
  } catch (error: any) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
};

// 리뷰 댓글 작성
export const createReviewComment = async (reviewId: number, commentData: CommentCreate): Promise<ReviewCommentResponse> => {
  try {
    const response = await axiosInstance.post(`/api/reviews/${reviewId}/comments`, commentData);
    return response.data;
  } catch (error: any) {
    console.error('리뷰 댓글 작성 실패:', error);
    throw error;
  }
};

// 리뷰 댓글 수정
export const updateReviewComment = async (commentId: number, commentData: CommentUpdate): Promise<ReviewCommentResponse> => {
  try {
    const response = await axiosInstance.put(`/api/comments/${commentId}`, commentData);
    return response.data;
  } catch (error: any) {
    console.error('리뷰 댓글 수정 실패:', error);
    throw error;
  }
};

// 리뷰 댓글 삭제
export const deleteReviewComment = async (commentId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/comments/${commentId}`);
  } catch (error: any) {
    console.error('리뷰 댓글 삭제 실패:', error);
    throw error;
  }
};

// 피싱 사이트 관련 API 함수들 (페이지네이션)
export const getPhishingSites = async (page: number = 1, limit: number = 10, search?: string, sortOptions?: SortOptions): Promise<PaginatedResponse<PhishingSite>> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (sortOptions?.sort_by) params.append('sort_by', sortOptions.sort_by);
    if (sortOptions?.sort_order) params.append('sort_order', sortOptions.sort_order);
    const response = await axiosInstance.get(`/api/phishing-sites?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('피싱 사이트 목록 조회 실패:', error);
    throw error;
  }
};

export const createPhishingReport = async (reportData: PhishingReportForm): Promise<PhishingSite> => {
  try {
    const response = await axiosInstance.post('/api/phishing-sites', reportData);
    return response.data;
  } catch (error: any) {
    console.error('피싱 사이트 신고 실패:', error);
    throw error;
  }
};

export const updatePhishingSite = async (id: number, reportData: PhishingReportForm): Promise<PhishingSite> => {
  try {
    const response = await axiosInstance.put(`/api/phishing-sites/${id}`, reportData);
    return response.data;
  } catch (error: any) {
    console.error('피싱 사이트 수정 실패:', error);
    throw error;
  }
};

export const deletePhishingSite = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/phishing-sites/${id}`);
  } catch (error: any) {
    console.error('피싱 사이트 삭제 실패:', error);
    throw error;
  }
};

// 피싱 사이트 상세 + 댓글 조회 (조회수 증가)
export const getPhishingSiteWithComments = async (id: number): Promise<PhishingSiteWithCommentsResponse> => {
  try {
    const response = await axiosInstance.get(`/api/phishing-sites/${id}/with-comments`);
    return response.data;
  } catch (error: any) {
    console.error('피싱 사이트 상세 + 댓글 조회 실패:', error);
    throw error;
  }
};

// 투표 관련 API 함수들
// 피싱사이트 추천/비추천 투표
export const votePhishingSite = async (siteId: number, voteData: VoteCreate): Promise<void> => {
  try {
    await axiosInstance.post(`/api/phishing-sites/${siteId}/vote`, voteData);
  } catch (error: any) {
    console.error('피싱사이트 투표 실패:', error);
    throw error;
  }
};

// 피싱사이트 내 투표 상태 확인
export const getMyPhishingSiteVote = async (siteId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/api/phishing-sites/${siteId}/my-vote`);
    return response.data;
  } catch (error: any) {
    console.error('피싱사이트 투표 상태 조회 실패:', error);
    throw error;
  }
};

// 피싱사이트 투표 취소
export const removePhishingSiteVote = async (siteId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/phishing-sites/${siteId}/vote`);
  } catch (error: any) {
    console.error('피싱사이트 투표 취소 실패:', error);
    throw error;
  }
};

// 자유게시판 추천/비추천 투표
export const votePost = async (postId: number, voteData: VoteCreate): Promise<void> => {
  try {
    await axiosInstance.post(`/posts/posts/${postId}/vote`, voteData);
  } catch (error: any) {
    console.error('게시글 투표 실패:', error);
    throw error;
  }
};

// 게시글 내 투표 상태 확인
export const getMyPostVote = async (postId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/posts/posts/${postId}/my-vote`);
    return response.data;
  } catch (error: any) {
    console.error('게시글 투표 상태 조회 실패:', error);
    throw error;
  }
};

// 게시글 투표 취소
export const removePostVote = async (postId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/posts/posts/${postId}/vote`);
  } catch (error: any) {
    console.error('게시글 투표 취소 실패:', error);
    throw error;
  }
};

// 리뷰 추천/비추천 투표
export const voteReview = async (reviewId: number, voteData: VoteCreate): Promise<void> => {
  try {
    await axiosInstance.post(`/api/reviews/${reviewId}/vote`, voteData);
  } catch (error: any) {
    console.error('리뷰 투표 실패:', error);
    throw error;
  }
};

// 리뷰 내 투표 상태 확인
export const getMyReviewVote = async (reviewId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/api/reviews/${reviewId}/my-vote`);
    return response.data;
  } catch (error: any) {
    console.error('리뷰 투표 상태 조회 실패:', error);
    throw error;
  }
};

// 리뷰 투표 취소
export const removeReviewVote = async (reviewId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/reviews/${reviewId}/vote`);
  } catch (error: any) {
    console.error('리뷰 투표 취소 실패:', error);
    throw error;
  }
};

// 댓글 관련 API 함수들
// 피싱사이트 댓글 작성
export const createPhishingSiteComment = async (siteId: number, commentData: CommentCreate): Promise<PhishingCommentResponse> => {
  try {
    const response = await axiosInstance.post(`/api/phishing-sites/${siteId}/comments`, commentData);
    return response.data;
  } catch (error: any) {
    console.error('피싱사이트 댓글 작성 실패:', error);
    throw error;
  }
};

// 피싱사이트 댓글 목록 조회
export const getPhishingSiteComments = async (siteId: number): Promise<PhishingCommentResponse[]> => {
  try {
    const response = await axiosInstance.get(`/api/phishing-sites/${siteId}/comments`);
    return response.data;
  } catch (error: any) {
    console.error('피싱사이트 댓글 조회 실패:', error);
    throw error;
  }
};

// 피싱사이트 댓글 수정
export const updatePhishingSiteComment = async (siteId: number, commentId: number, commentData: CommentUpdate): Promise<PhishingCommentResponse> => {
  try {
    const response = await axiosInstance.put(`/api/phishing-sites/${siteId}/comments/${commentId}`, commentData);
    return response.data;
  } catch (error: any) {
    console.error('피싱사이트 댓글 수정 실패:', error);
    throw error;
  }
};

// 피싱사이트 댓글 삭제
export const deletePhishingSiteComment = async (siteId: number, commentId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/phishing-sites/${siteId}/comments/${commentId}`);
  } catch (error: any) {
    console.error('피싱사이트 댓글 삭제 실패:', error);
    throw error;
  }
};

// 자유게시판 댓글 작성
export const createPostComment = async (postId: number, commentData: CommentCreate): Promise<PostCommentResponse> => {
  try {
    const response = await axiosInstance.post(`/posts/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error: any) {
    console.error('게시글 댓글 작성 실패:', error);
    throw error;
  }
};

// 자유게시판 댓글 목록 조회
export const getPostComments = async (postId: number): Promise<PostCommentResponse[]> => {
  try {
    const response = await axiosInstance.get(`/posts/posts/${postId}/comments`);
    return response.data;
  } catch (error: any) {
    console.error('게시글 댓글 조회 실패:', error);
    throw error;
  }
};

// 자유게시판 댓글 수정
export const updatePostComment = async (postId: number, commentId: number, commentData: CommentUpdate): Promise<PostCommentResponse> => {
  try {
    const response = await axiosInstance.put(`/posts/posts/${postId}/comments/${commentId}`, commentData);
    return response.data;
  } catch (error: any) {
    console.error('게시글 댓글 수정 실패:', error);
    throw error;
  }
};

// 자유게시판 댓글 삭제
export const deletePostComment = async (postId: number, commentId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/posts/posts/${postId}/comments/${commentId}`);
  } catch (error: any) {
    console.error('게시글 댓글 삭제 실패:', error);
    throw error;
  }
}; 