import { Link } from 'react-router-dom';
import type { TabType } from '../types';
import { useAppSelector } from '../redux/hooks';

interface WriteButtonProps {
  activeTab: TabType;
  onClick?: () => void;
}

export default function WriteButton({ activeTab }: WriteButtonProps) {
  // 자유게시판에서만 글쓰기 버튼 표시
  if (activeTab !== 'free') {
    return null;
  }

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-end">
        <a
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition"
        >
          로그인 후 글쓰기
        </a>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Link
        to={`/write?type=${activeTab}`}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition"
      >
        글쓰기
      </Link>
    </div>
  );
} 