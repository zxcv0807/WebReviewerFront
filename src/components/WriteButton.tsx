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
      <div className="w-full sm:w-auto">
        <a
          href="/login"
          className="block w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition text-sm sm:text-base"
        >
          로그인 후 글쓰기
        </a>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-auto">
      <Link
        to={`/write?type=${activeTab}`}
        className="block w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition text-sm sm:text-base"
      >
        글쓰기
      </Link>
    </div>
  );
} 