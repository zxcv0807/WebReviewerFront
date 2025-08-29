import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReviewForm from '../components/ReviewForm';
import { createReview, updateReview, getReview } from '../api/posts';
import type { ReviewForm as ReviewFormType, Review } from '../types';
import { useAppSelector } from '../redux/hooks';

export default function ReviewWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  // 수정 모드일 때 기존 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchExistingReview = async () => {
      if (!isEditing || !editId) return;
      
      try {
        setLoading(true);
        const review = await getReview(parseInt(editId));
        setExistingReview(review);
      } catch (error) {
        console.error('리뷰 조회 실패:', error);
        alert('리뷰 정보를 불러올 수 없습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExistingReview();
  }, [isEditing, editId, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{isEditing ? '리뷰 수정' : '리뷰 작성'}</h2>
          <p className="mb-6 text-gray-600">리뷰 {isEditing ? '수정' : '작성'}은 로그인 후에만 가능합니다.</p>
          <a
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition"
          >
            로그인하러 가기
          </a>
        </div>
      </div>
    );
  }

  if (isEditing && loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const handleReviewSubmit = async (reviewData: ReviewFormType) => {
    try {
      if (isEditing && editId) {
        await updateReview(parseInt(editId), reviewData);
        alert('리뷰가 성공적으로 수정되었습니다!');
        navigate(`/review/${editId}`);
      } else {
        await createReview(reviewData);
        alert('리뷰가 성공적으로 작성되었습니다!');
        navigate('/');
      }
    } catch (error: any) {
      console.error(isEditing ? '리뷰 수정 실패:' : '리뷰 작성 실패:', error);
      
      if (isEditing) {
        alert('리뷰 수정에 실패했습니다.');
      } else {
        // 중복 리뷰 에러 처리 (작성 모드에서만)
        if (
          error?.response?.status === 400 &&
          (typeof error?.response?.data === 'string'
            ? error.response.data.includes('이미 리뷰가 등록된 사이트입니다.')
            : error?.response?.data?.message?.includes('이미 리뷰가 등록된 사이트입니다.'))
        ) {
          alert('이미 리뷰가 등록된 사이트입니다.\n동일한 사이트에 대한 중복 리뷰는 작성할 수 없습니다.');
        } else {
          alert('리뷰 작성에 실패했습니다.');
        }
      }
    }
  };

  const handleCancel = () => {
    if (isEditing && editId) {
      navigate(`/review/${editId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <ReviewForm
          onSubmit={handleReviewSubmit}
          onCancel={handleCancel}
          initialData={existingReview}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
} 