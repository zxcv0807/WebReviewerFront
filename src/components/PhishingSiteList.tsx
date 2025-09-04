import { Link } from 'react-router-dom';
import type { PhishingSite } from '../types';
import { PHISHING_REASONS } from '../types';

interface PhishingSiteListProps {
  sites: PhishingSite[];
}

export default function PhishingSiteList({ sites }: PhishingSiteListProps) {


  const getReasonLabel = (reasonValue: string) => {
    const reason = PHISHING_REASONS.find(r => r.value === reasonValue);
    return reason ? reason.label : reasonValue;
  };

  const getReasonColor = (reasonValue: string) => {
    switch (reasonValue) {
      case 'fake_login':
        return 'bg-red-100 text-red-800';
      case 'payment_fraud':
        return 'bg-orange-100 text-orange-800';
      case 'spam_email':
        return 'bg-yellow-100 text-yellow-800';
      case 'personal_info':
        return 'bg-purple-100 text-purple-800';
      case 'malware':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (sites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 신고된 피싱 사이트가 없습니다.
      </div>
    );
  }

  return (
    <div>
      {sites.map((site) => (
        <div key={site.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="grid grid-cols-12 gap-4 py-3 px-4 text-sm items-center">
            {/* 제목 */}
            <div className="col-span-6 sm:col-span-7">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  to={`/phishing/${site.id}`} 
                  className="text-red-600 hover:underline font-medium break-all"
                >
                  {site.url}
                </Link>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(site.reason)}`}>
                  {getReasonLabel(site.reason)}
                </span>
              </div>
            </div>
            
            {/* 작성자 */}
            <div className="col-span-2 sm:col-span-2 text-gray-600 truncate">
              신고자
            </div>
            
            {/* 작성일 */}
            <div className="col-span-2 sm:col-span-2 text-gray-500 text-xs sm:text-sm">
              {new Date(site.created_at).toLocaleDateString('ko-KR', {
                year: '2-digit',
                month: '2-digit', 
                day: '2-digit'
              })}
            </div>
            
            {/* 조회수 */}
            <div className="col-span-2 sm:col-span-1 text-gray-500 text-right">
              {site.view_count || 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 