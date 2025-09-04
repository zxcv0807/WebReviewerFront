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
      <span className="ml-1 text-xs text-gray-600">{rating}</span>
    </span>
  );
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 py-3 px-4 text-sm items-center">
        {/* 제목 */}
        <div className="col-span-6 sm:col-span-7">
          <Link 
            to={`/review/${review.id}`} 
            className="text-blue-600 hover:underline font-medium break-words block"
          >
            {review.site_name} ({review.url})
          </Link>
          <div className="flex items-center mt-1">
            <StarRating rating={review.rating} size={12} />
          </div>
        </div>
        
        {/* 작성자 */}
        <div className="col-span-2 sm:col-span-2 text-gray-600 truncate">
          {review.user_name || '익명'}
        </div>
        
        {/* 작성일 */}
        <div className="col-span-2 sm:col-span-2 text-gray-500 text-xs sm:text-sm">
          {new Date(review.created_at).toLocaleDateString('ko-KR', {
            year: '2-digit',
            month: '2-digit', 
            day: '2-digit'
          })}
        </div>
        
        {/* 조회수 */}
        <div className="col-span-2 sm:col-span-1 text-gray-500 text-right">
          {review.view_count || 0}
        </div>
      </div>
    </div>
  );
} 