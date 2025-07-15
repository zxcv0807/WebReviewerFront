import { useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import { createReview } from '../api/posts';
import type { ReviewForm as ReviewFormType } from '../types';
import { useAppSelector } from '../redux/hooks';

export default function ReviewWritePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">리뷰 작성</h2>
          <p className="mb-6 text-gray-600">리뷰 작성은 로그인 후에만 가능합니다.</p>
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

  const handleReviewSubmit = async (reviewData: ReviewFormType) => {
    try {
      await createReview(reviewData);
      alert('리뷰가 성공적으로 작성되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      alert('리뷰 작성에 실패했습니다.');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <ReviewForm
          onSubmit={handleReviewSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
} 