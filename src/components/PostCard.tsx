import { Link } from 'react-router-dom';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  titleColor?: string;
}


export default function PostCard({ post, titleColor = 'text-green-600' }: PostCardProps) {
  return (
    <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 py-3 px-4 text-sm">
        {/* 제목 */}
        <div className="col-span-6 sm:col-span-7">
          <Link 
            to={`/post/${post.id}`} 
            className={`${titleColor} hover:underline font-medium break-words`}
          >
            {post.title}
          </Link>
        </div>
        
        {/* 작성자 */}
        <div className="col-span-2 sm:col-span-2 text-gray-600 truncate">
          {post.user_name || '익명'}
        </div>
        
        {/* 작성일 */}
        <div className="col-span-2 sm:col-span-2 text-gray-500 text-xs sm:text-sm">
          {new Date(post.created_at).toLocaleDateString('ko-KR', {
            year: '2-digit',
            month: '2-digit', 
            day: '2-digit'
          })}
        </div>
        
        {/* 조회수 */}
        <div className="col-span-2 sm:col-span-1 text-gray-500 text-right">
          {post.view_count || 0}
        </div>
      </div>
    </div>
  );
} 