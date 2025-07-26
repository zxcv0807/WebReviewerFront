import React from 'react';
import type { PhishingSite } from '../types';
import { PHISHING_REASONS } from '../types';

interface PhishingSiteListProps {
  sites: PhishingSite[];
}

export default function PhishingSiteList({ sites }: PhishingSiteListProps) {
  const [expandedSites, setExpandedSites] = React.useState<Set<number>>(new Set());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const toggleExpanded = (siteId: number) => {
    const newExpanded = new Set(expandedSites);
    if (newExpanded.has(siteId)) {
      newExpanded.delete(siteId);
    } else {
      newExpanded.add(siteId);
    }
    setExpandedSites(newExpanded);
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
        const isExpanded = expandedSites.has(site.id);
        
        return (
          <div key={site.id} className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* 간단한 카드 형태 (접힌 상태) */}
            <div className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 w-full">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-words">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 break-all text-sm sm:text-base"
                    >
                      {site.url}
                    </a>
                  </h3>
                  <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getReasonColor(site.reason)}`}>
                    {getReasonLabel(site.reason)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div className="text-xs text-gray-500">
                    {formatDate(site.created_at)}
                  </div>
                  <button
                    onClick={() => toggleExpanded(site.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs sm:text-sm p-2 rounded hover:bg-gray-100"
                  >
                    {isExpanded ? '접기' : '자세히 보기'}
                    <svg
                      className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 상세 정보 (펼쳐진 상태) */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50">
                <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">신고 사유 및 설명</h4>
                  <p className="text-red-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {site.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 