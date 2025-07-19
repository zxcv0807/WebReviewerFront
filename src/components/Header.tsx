import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import WebReviewerLogo from '../assets/WebReviewerLogo-removebg-preview.png';

export default function Header() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogoutClick = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-1">
        <div className="flex justify-between items-center">
          {/* 로고 */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={WebReviewerLogo} 
              alt="WebReviewer Logo" 
              className="h-20 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-blue-700">WebReviewer</h1>
              <p className="text-sm text-gray-600">웹사이트 리뷰 커뮤니티</p>
            </div>
          </Link>

          {/* 네비게이션 */}
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogoutClick}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded shadow transition"
              >
                로그아웃
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition"
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 