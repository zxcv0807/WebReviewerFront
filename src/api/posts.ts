import axiosInstance from './axiosInstance';
import type { Post, PostForm, PostFilters, Review, ReviewForm, CommentForm, PhishingSite, PhishingReportForm, VoteCreate, VoteResponse, CommentCreate, CommentUpdate, PhishingCommentResponse, PostCommentResponse, PhishingSiteWithCommentsResponse, PostWithCommentsResponse } from '../types';

// 게시글 목록 조회
export const getPosts = async (filters?: PostFilters): Promise<Post[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category); // category 파라미터 추가
    const url = `/posts/posts?${params.toString()}`;
    const response = await axiosInstance.get(url);
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

// 게시글 상세 + 댓글 조회 (조회수 증가)
export const getPostWithComments = async (id: number): Promise<PostWithCommentsResponse> => {
  try {
    const response = await axiosInstance.get(`/posts/posts/${id}/with-comments`);
    return response.data;
  } catch (error) {
    console.error('게시글 상세 + 댓글 조회 중 오류:', error);
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

// 피싱 사이트 상세 + 댓글 조회 (조회수 증가)
export const getPhishingSiteWithComments = async (id: number): Promise<PhishingSiteWithCommentsResponse> => {
  try {
    const response = await axiosInstance.get(`/api/phishing-sites/${id}/with-comments`);
    return response.data;
  } catch (error) {
    console.error('피싱 사이트 상세 + 댓글 조회 실패:', error);
    throw error;
  }
};

// 투표 관련 API 함수들
// 피싱사이트 추천/비추천 투표
export const votePhishingSite = async (siteId: number, voteData: VoteCreate): Promise<VoteResponse> => {
  try {
    const response = await axiosInstance.post(`/api/phishing-sites/${siteId}/vote`, voteData);
    return response.data;
  } catch (error) {
    console.error('피싱사이트 투표 실패:', error);
    throw error;
  }
};

// 피싱사이트 투표 취소
export const cancelPhishingSiteVote = async (siteId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/phishing-sites/${siteId}/vote`);
  } catch (error) {
    console.error('피싱사이트 투표 취소 실패:', error);
    throw error;
  }
};

// 피싱사이트 내 투표 조회
export const getMyPhishingSiteVote = async (siteId: number): Promise<VoteResponse | null> => {
  try {
    const response = await axiosInstance.get(`/api/phishing-sites/${siteId}/my-vote`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // 투표하지 않은 경우
    }
    console.error('내 투표 조회 실패:', error);
    throw error;
  }
};

// 자유게시판 추천/비추천 투표
export const votePost = async (postId: number, voteData: VoteCreate): Promise<VoteResponse> => {
  try {
    const response = await axiosInstance.post(`/posts/posts/${postId}/vote`, voteData);
    return response.data;
  } catch (error) {
    console.error('게시글 투표 실패:', error);
    throw error;
  }
};

// 자유게시판 투표 취소
export const cancelPostVote = async (postId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/posts/posts/${postId}/vote`);
  } catch (error) {
    console.error('게시글 투표 취소 실패:', error);
    throw error;
  }
};

// 자유게시판 내 투표 조회
export const getMyPostVote = async (postId: number): Promise<VoteResponse | null> => {
  try {
    const response = await axiosInstance.get(`/posts/posts/${postId}/my-vote`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // 투표하지 않은 경우
    }
    console.error('내 투표 조회 실패:', error);
    throw error;
  }
};

// 댓글 관련 API 함수들
// 피싱사이트 댓글 작성
export const createPhishingSiteComment = async (siteId: number, commentData: CommentCreate): Promise<PhishingCommentResponse> => {
  try {
    const response = await axiosInstance.post(`/api/phishing-sites/${siteId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('피싱사이트 댓글 작성 실패:', error);
    throw error;
  }
};

// 피싱사이트 댓글 목록 조회
export const getPhishingSiteComments = async (siteId: number): Promise<PhishingCommentResponse[]> => {
  try {
    const response = await axiosInstance.get(`/api/phishing-sites/${siteId}/comments`);
    return response.data;
  } catch (error) {
    console.error('피싱사이트 댓글 조회 실패:', error);
    throw error;
  }
};

// 피싱사이트 댓글 수정
export const updatePhishingSiteComment = async (siteId: number, commentId: number, commentData: CommentUpdate): Promise<PhishingCommentResponse> => {
  try {
    const response = await axiosInstance.put(`/api/phishing-sites/${siteId}/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('피싱사이트 댓글 수정 실패:', error);
    throw error;
  }
};

// 피싱사이트 댓글 삭제
export const deletePhishingSiteComment = async (siteId: number, commentId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/phishing-sites/${siteId}/comments/${commentId}`);
  } catch (error) {
    console.error('피싱사이트 댓글 삭제 실패:', error);
    throw error;
  }
};

// 자유게시판 댓글 작성
export const createPostComment = async (postId: number, commentData: CommentCreate): Promise<PostCommentResponse> => {
  try {
    const response = await axiosInstance.post(`/posts/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('게시글 댓글 작성 실패:', error);
    throw error;
  }
};

// 자유게시판 댓글 목록 조회
export const getPostComments = async (postId: number): Promise<PostCommentResponse[]> => {
  try {
    const response = await axiosInstance.get(`/posts/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('게시글 댓글 조회 실패:', error);
    throw error;
  }
};

// 자유게시판 댓글 수정
export const updatePostComment = async (postId: number, commentId: number, commentData: CommentUpdate): Promise<PostCommentResponse> => {
  try {
    const response = await axiosInstance.put(`/posts/posts/${postId}/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('게시글 댓글 수정 실패:', error);
    throw error;
  }
};

// 자유게시판 댓글 삭제
export const deletePostComment = async (postId: number, commentId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/posts/posts/${postId}/comments/${commentId}`);
  } catch (error) {
    console.error('게시글 댓글 삭제 실패:', error);
    throw error;
  }
}; 