import { useId } from 'react';
import { Link } from 'react-router-dom';
import type { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

// 별점 표시 컴포넌트
function StarRating({ rating, onChange, size = 20, readOnly = true }: { rating: number; onChange?: (r: number) => void; size?: number; readOnly?: boolean }) {
  const uniqueId = useId();
  return (
    <span className={`flex items-center gap-1 ${!readOnly ? 'cursor-pointer' : ''}`}> 
      {[1, 2, 3, 4, 5].map((star) => {
        const fill =
          rating >= star
            ? '100%'
            : rating >= star - 1 && rating < star
            ? `${((rating - (star - 1)) * 100).toFixed(0)}%`
            : '0%';
        const gradId = `starGrad-${uniqueId}-${star}-${String(rating).replace('.', '-')}`;
        return (
          <span key={gradId} style={{ position: 'relative', display: 'inline-block' }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 20 20"
              style={{ position: 'absolute', top: 0, left: 0 }}
              onClick={onChange && !readOnly ? () => onChange(star) : undefined}
            >
              <defs>
                <linearGradient id={gradId}>
                  <stop offset={fill} stopColor="#facc15" />
                  <stop offset={fill} stopColor="#e5e7eb" />
                </linearGradient>
              </defs>
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                fill={`url(#${gradId})`}
              />
            </svg>
            <svg
              width={size}
              height={size}
              viewBox="0 0 20 20"
              style={{ visibility: 'hidden' }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        );
      })}
      <span className="ml-1 text-xs text-gray-600">({rating}/5)</span>
    </span>
  );
}

export default function ReviewCard({ review }: ReviewCardProps) {



  return (
    <Link to={`/review/${review.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-words hover:text-green-600 transition-colors">{review.site_name}</h3>
              <div className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm break-all">
                {review.url}
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2 min-w-0">
              {typeof review.average_rating === 'number' && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span>평균</span>
                  <StarRating rating={review.average_rating} size={15} />
                  <span>({review.average_rating.toFixed(1)})</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>조회 {review.view_count || 0}회</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 