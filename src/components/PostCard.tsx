import { Link } from 'react-router-dom';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  titleColor?: string;
}

function getPreviewText(content: any, postType?: string): string {
  // 자유게시판이 아닌 경우 일반 텍스트 처리
  if (postType !== 'free' && typeof content === 'string') {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  // Lexical JSON 구조에서 첫 번째 paragraph의 text만 추출
  try {
    const children = content?.root?.children;
    if (Array.isArray(children) && children.length > 0) {
      const first = children[0];
      if (Array.isArray(first.children) && first.children.length > 0) {
        const text = first.children.map((c: any) => c.text).join('');
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
      }
    }
  } catch (e) {}
  return '';
}

export default function PostCard({ post, titleColor = 'text-green-600' }: PostCardProps) {
  return (
    <li className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
      <Link to={`/post/${post.id}`} className="block">
        <div className="flex justify-between items-center">
          <span className={`font-bold text-sm sm:text-base ${titleColor} hover:underline break-words flex-1`}>{post.title}</span>
          <div className="flex items-center gap-1 text-xs text-gray-400 ml-3">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.view_count || 0}
          </div>
        </div>
      </Link>
    </li>
  );
} 