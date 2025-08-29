import { useState } from 'react';
import { useAppSelector } from '../redux/hooks';

interface VoteButtonsProps {
  likeCount: number;
  dislikeCount: number;
  onVote: (voteData: { vote_type: 'like' | 'dislike' }) => Promise<any>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VoteButtons({
  likeCount,
  dislikeCount,
  onVote,
  disabled = false,
  size = 'md',
}: VoteButtonsProps) {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!isAuthenticated || loading || disabled) {
      if (!isAuthenticated) {
        alert('로그인이 필요합니다.');
      }
      return;
    }

    // 토큰 확인
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      return;
    }

    setLoading(true);
    try {
      await onVote({ vote_type: voteType });
      // 투표 성공 시 사용자에게 피드백 제공
      alert(`${voteType === 'like' ? '좋아요' : '싫어요'} 투표가 완료되었습니다.`);
    } catch (error: any) {
      console.error('투표 실패:', error);
      
      if (error?.response?.status === 403) {
        alert('이미 투표하신 항목입니다. 중복 투표는 불가능합니다.');
      } else if (error?.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else if (error?.response?.status === 404) {
        alert('투표 대상을 찾을 수 없습니다.');
      } else if (error?.response?.status === 422) {
        alert('잘못된 투표 요청입니다.');
      } else {
        alert('투표에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>{likeCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10H5a2 2 0 00-2 2v6a2 2 0 002 2h2.5" />
          </svg>
          <span>{dislikeCount}</span>
        </div>
        <span className="text-xs text-gray-400">로그인 후 투표 가능</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1'
    },
    md: {
      button: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1'
    },
    lg: {
      button: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center ${currentSize.gap}`}>
      <button
        onClick={() => handleVote('like')}
        disabled={loading || disabled}
        className={`flex items-center ${currentSize.gap} ${currentSize.button} font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-300 rounded-md ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg className={`${currentSize.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{likeCount}</span>
      </button>
      
      <button
        onClick={() => handleVote('dislike')}
        disabled={loading || disabled}
        className={`flex items-center ${currentSize.gap} ${currentSize.button} font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-300 rounded-md ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg className={`${currentSize.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10H5a2 2 0 00-2 2v6a2 2 0 002 2h2.5" />
        </svg>
        <span>{dislikeCount}</span>
      </button>
      
      {loading && <span className="text-xs text-gray-500">처리 중...</span>}
    </div>
  );
}