import { useState, useEffect } from 'react';
import { useAppSelector } from '../redux/hooks';

interface VoteButtonsProps {
  likeCount: number;
  dislikeCount: number;
  onVote: (voteType: 'like' | 'dislike') => Promise<any>;
  onCancelVote: () => Promise<void>;
  getCurrentVote: () => Promise<{ vote_type: string } | null>;
  disabled?: boolean;
}

export default function VoteButtons({
  likeCount,
  dislikeCount,
  onVote,
  onCancelVote,
  getCurrentVote,
  disabled = false,
}: VoteButtonsProps) {
  const [currentVote, setCurrentVote] = useState<'like' | 'dislike' | null>(null);
  const [loading, setLoading] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localDislikeCount, setLocalDislikeCount] = useState(dislikeCount);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentVote();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLocalLikeCount(likeCount);
    setLocalDislikeCount(dislikeCount);
  }, [likeCount, dislikeCount]);

  const loadCurrentVote = async () => {
    try {
      const vote = await getCurrentVote();
      setCurrentVote(vote ? vote.vote_type as 'like' | 'dislike' : null);
    } catch (error) {
      console.error('투표 정보 조회 실패:', error);
    }
  };

  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!isAuthenticated || loading || disabled) return;

    setLoading(true);
    try {
      if (currentVote === voteType) {
        await onCancelVote();
        if (voteType === 'like') {
          setLocalLikeCount(prev => prev - 1);
        } else {
          setLocalDislikeCount(prev => prev - 1);
        }
        setCurrentVote(null);
      } else {
        const prevVote = currentVote;
        await onVote(voteType);
        
        if (prevVote === 'like') {
          setLocalLikeCount(prev => prev - 1);
        } else if (prevVote === 'dislike') {
          setLocalDislikeCount(prev => prev - 1);
        }
        
        if (voteType === 'like') {
          setLocalLikeCount(prev => prev + 1);
        } else {
          setLocalDislikeCount(prev => prev + 1);
        }
        
        setCurrentVote(voteType);
      }
    } catch (error) {
      console.error('투표 실패:', error);
      alert('투표에 실패했습니다.');
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
          <span>{localLikeCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10H5a2 2 0 00-2 2v6a2 2 0 002 2h2.5" />
          </svg>
          <span>{localDislikeCount}</span>
        </div>
        <span className="text-xs text-gray-400">로그인 후 투표 가능</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('like')}
        disabled={loading || disabled}
        className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          currentVote === 'like'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-300'
        } ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{localLikeCount}</span>
      </button>
      
      <button
        onClick={() => handleVote('dislike')}
        disabled={loading || disabled}
        className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          currentVote === 'dislike'
            ? 'bg-red-100 text-red-800 border border-red-300'
            : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-300'
        } ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10H5a2 2 0 00-2 2v6a2 2 0 002 2h2.5" />
        </svg>
        <span>{localDislikeCount}</span>
      </button>
      
      {loading && <span className="text-xs text-gray-500">처리 중...</span>}
    </div>
  );
}