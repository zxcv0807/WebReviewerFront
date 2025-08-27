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
    <div className="space-y-4">
      {sites.map((site) => {
        return (
          <Link key={site.id} to={`/phishing/${site.id}`} className="block">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 w-full">
                    <h3 className="text-base sm:text-lg font-bold text-red-600 mb-2 break-all hover:text-red-700 transition-colors">
                      {site.url}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getReasonColor(site.reason)}`}>
                        {getReasonLabel(site.reason)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {site.view_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 