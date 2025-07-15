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
    <li className="bg-white p-4 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
      <Link to={`/post/${post.id}?type=${post.type}`} className="block">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-bold ${titleColor} hover:underline`}>{post.title}</span>
        </div>
        <p className="text-gray-700 mb-2 line-clamp-2">{getPreviewText(post.content, post.type)}</p>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{post.category}</span>
          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
      </Link>
    </li>
  );
} 