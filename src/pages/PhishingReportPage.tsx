import { useNavigate, useLocation } from 'react-router-dom';
import PhishingReportForm from '../components/PhishingReportForm';
import { createPhishingReport, updatePhishingSite, getPhishingSiteWithComments } from '../api/posts';
import type { PhishingReportForm as PhishingReportFormType, PhishingSiteWithCommentsResponse } from '../types';
import { useAppSelector } from '../redux/hooks';
import { useState, useEffect } from 'react';

export default function PhishingReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [existingPhishingSite, setExistingPhishingSite] = useState<PhishingSiteWithCommentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  // 수정 모드일 때 기존 피싱사이트 데이터 가져오기
  useEffect(() => {
    const fetchExistingPhishingSite = async () => {
      if (!isEditing || !editId) return;
      
      try {
        setLoading(true);
        const phishingSite = await getPhishingSiteWithComments(parseInt(editId));
        setExistingPhishingSite(phishingSite);
      } catch (error) {
        console.error('피싱사이트 조회 실패:', error);
        alert('피싱사이트 정보를 불러올 수 없습니다.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExistingPhishingSite();
  }, [isEditing, editId, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{isEditing ? '피싱 사이트 수정' : '피싱 사이트 신고'}</h2>
          <p className="mb-6 text-gray-600">피싱 사이트 {isEditing ? '수정' : '신고'}는 로그인 후에만 가능합니다.</p>
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

  const handlePhishingReportSubmit = async (reportData: PhishingReportFormType) => {
    try {
      if (isEditing && editId) {
        await updatePhishingSite(parseInt(editId), reportData);
        alert('피싱 사이트 신고가 성공적으로 수정되었습니다!');
        navigate(`/phishing/${editId}`);
      } else {
        await createPhishingReport(reportData);
        alert('피싱 사이트 신고가 성공적으로 접수되었습니다!');
        navigate('/');
      }
    } catch (error) {
      console.error(isEditing ? '피싱 사이트 수정 실패:' : '피싱 사이트 신고 실패:', error);
      alert(isEditing ? '수정에 실패했습니다.' : '신고에 실패했습니다.');
      throw error;
    }
  };

  const handleCancel = () => {
    if (isEditing && editId) {
      navigate(`/phishing/${editId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{isEditing ? '피싱 사이트 수정' : '피싱 사이트 신고'}</h1>
          <p className="text-gray-600 mt-2">
            {isEditing 
              ? '피싱 사이트 신고 내용을 수정하세요.' 
              : '의심스러운 피싱 사이트를 신고하여 다른 사용자들을 보호해주세요.'
            }
          </p>
        </div>
        
        <PhishingReportForm
          onSubmit={handlePhishingReportSubmit}
          onCancel={handleCancel}
          initialData={existingPhishingSite}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
} 