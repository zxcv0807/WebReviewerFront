import axiosInstance from './axiosInstance';
import type { Post, PostForm, PostFilters, Category, Tag, Review, ReviewForm, CommentForm, PhishingSite, PhishingReportForm } from '../types';

// 게시글 목록 조회
export const getPosts = async (filters?: PostFilters): Promise<Post[]> => {
  console.log('getPosts 호출됨, filters:', filters);
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category); // category 파라미터 추가
    const url = `/posts/posts?${params.toString()}`;
    console.log('getPosts 요청 URL:', url);
    const response = await axiosInstance.get(url);
    console.log('getPosts 응답:', response.data);
    return response.data; // 배열 반환
  } catch (error) {
    console.error('게시글 목록 조회 중 오류:', error);
    throw error;
  }
};

// 게시글 상세 조회
export const getPost = async (id: number): Promise<Post> => {
  try {
    const response = await axiosInstance.get(`/posts/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('게시글 상세 조회 중 오류:', error);
    throw error;
  }
};

// 게시글 생성
export const createPost = async (postData: PostForm): Promise<Post> => {
  try {
    const response = await axiosInstance.post('/posts/posts', postData);
    return response.data;
  } catch (error) {
    console.error('게시글 생성 중 오류:', error);
    throw error;
  }
};

// 게시글 수정
export const updatePost = async (id: number, postData: PostForm): Promise<Post> => {
  try {
    const response = await axiosInstance.put(`/posts/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    console.error('게시글 수정 중 오류:', error);
    throw error;
  }
};

// 게시글 삭제
export const deletePost = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/posts/posts/${id}`);
  } catch (error) {
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

// 리뷰 관련 API 함수들
export const getReviews = async (): Promise<Review[]> => {
  try {
    const response = await axiosInstance.get('/api/reviews');
    return response.data;
  } catch (error) {
    console.error('리뷰 목록 조회 실패:', error);
    throw error;
  }
};

export const getReview = async (id: number): Promise<Review> => {
  try {
    const response = await axiosInstance.get(`/api/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    throw error;
  }
};

export const createReview = async (reviewData: ReviewForm): Promise<Review> => {
  try {
    const response = await axiosInstance.post('/api/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('리뷰 작성 실패:', error);
    throw error;
  }
};

export const createComment = async (reviewId: number, commentData: CommentForm): Promise<Comment> => {
  try {
    const response = await axiosInstance.post(`/api/reviews/${reviewId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('댓글 작성 실패:', error);
    throw error;
  }
};

// 피싱 사이트 관련 API 함수들
export const getPhishingSites = async (): Promise<PhishingSite[]> => {
  try {
    const response = await axiosInstance.get('/api/phishing-sites');
    return response.data;
  } catch (error) {
    console.error('피싱 사이트 목록 조회 실패:', error);
    throw error;
  }
};

export const createPhishingReport = async (reportData: PhishingReportForm): Promise<PhishingSite> => {
  try {
    const response = await axiosInstance.post('/api/phishing-sites', reportData);
    return response.data;
  } catch (error) {
    console.error('피싱 사이트 신고 실패:', error);
    throw error;
  }
}; 