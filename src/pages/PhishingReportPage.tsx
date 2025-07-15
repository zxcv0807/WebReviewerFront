import { useNavigate } from 'react-router-dom';
import PhishingReportForm from '../components/PhishingReportForm';
import { createPhishingReport } from '../api/posts';
import type { PhishingReportForm as PhishingReportFormType } from '../types';
import { useAppSelector } from '../redux/hooks';

export default function PhishingReportPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">피싱 사이트 신고</h2>
          <p className="mb-6 text-gray-600">피싱 사이트 신고는 로그인 후에만 가능합니다.</p>
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

  const handlePhishingReportSubmit = async (reportData: PhishingReportFormType) => {
    try {
      await createPhishingReport(reportData);
      alert('피싱 사이트 신고가 성공적으로 접수되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('피싱 사이트 신고 실패:', error);
      alert('신고에 실패했습니다.');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">피싱 사이트 신고</h1>
          <p className="text-gray-600 mt-2">의심스러운 피싱 사이트를 신고하여 다른 사용자들을 보호해주세요.</p>
        </div>
        
        <PhishingReportForm
          onSubmit={handlePhishingReportSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
} 