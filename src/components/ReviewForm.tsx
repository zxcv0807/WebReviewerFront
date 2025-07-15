import React, { useState } from 'react';
import type { ReviewForm } from '../types';

interface ReviewFormProps {
  onSubmit: (data: ReviewForm) => Promise<void>;
  onCancel: () => void;
}

// 별점 선택 컴포넌트
function StarSelector({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <svg
            className={`w-8 h-8 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
            } hover:text-yellow-300 transition-colors`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      <span className="ml-3 text-lg font-semibold text-gray-700">({rating}/5)</span>
    </div>
  );
}

export default function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewForm>({
    site_name: '',
    url: '',
    summary: '',
    rating: 5,
    pros: '',
    cons: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.site_name.trim() || !formData.url.trim() || !formData.summary.trim()) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      alert('리뷰 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ReviewForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">웹사이트 리뷰 작성</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 사이트명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사이트명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.site_name}
            onChange={(e) => handleInputChange('site_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 네이버, 구글, 카카오"
            required
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
            required
          />
        </div>

        {/* 별점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            별점 <span className="text-red-500">*</span>
          </label>
          <StarSelector
            rating={formData.rating}
            onRatingChange={(rating) => handleInputChange('rating', rating)}
          />
        </div>

        {/* 요약 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            요약 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="이 웹사이트에 대한 간단한 설명을 작성해주세요."
            required
          />
        </div>

        {/* 장점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            장점
          </label>
          <textarea
            value={formData.pros}
            onChange={(e) => handleInputChange('pros', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="이 웹사이트의 장점을 작성해주세요."
          />
        </div>

        {/* 단점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            단점
          </label>
          <textarea
            value={formData.cons}
            onChange={(e) => handleInputChange('cons', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="이 웹사이트의 단점을 작성해주세요."
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '작성 중...' : '리뷰 작성'}
          </button>
        </div>
      </form>
    </div>
  );
} 