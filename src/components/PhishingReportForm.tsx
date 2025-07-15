import React, { useState } from 'react';
import type { PhishingReportForm, PhishingReason } from '../types';
import { PHISHING_REASONS } from '../types';

interface PhishingReportFormProps {
  onSubmit: (data: PhishingReportForm) => Promise<void>;
  onCancel: () => void;
}

export default function PhishingReportForm({ onSubmit, onCancel }: PhishingReportFormProps) {
  const [formData, setFormData] = useState<PhishingReportForm>({
    url: '',
    reason: 'fake_login',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url.trim() || !formData.description.trim()) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('피싱 사이트 신고 실패:', error);
      alert('신고에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PhishingReportForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">피싱 사이트 신고</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            피싱 사이트 URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="https://example.com"
            required
          />
        </div>

        {/* 사유 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            신고 사유 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            {PHISHING_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        {/* 추가 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추가 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={4}
            placeholder="피싱 사이트의 구체적인 행위나 의심되는 부분을 설명해주세요."
            required
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
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '신고 중...' : '신고하기'}
          </button>
        </div>
      </form>
    </div>
  );
} 