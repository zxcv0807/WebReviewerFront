import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import WebReviewerLogo from '../assets/WebReviewerLogo-removebg-preview.png';
import { useState } from 'react';

export default function Header() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogoutClick = () => {
    dispatch(logout());
    setShowDropdown(false);
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
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition"
                >
                  <span>{user?.username || user?.name || user?.email || '사용자'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <Link
                      to="/account"
                      onClick={() => setShowDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      계정 관리
                    </Link>
                    <hr className="border-gray-200" />
                    <Link
                      to="/messages"
                      onClick={() => setShowDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      쪽지함
                    </Link>
                    <Link
                      to="/memos"
                      onClick={() => setShowDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      내 메모
                    </Link>
                    <hr className="border-gray-200" />
                    <button
                      onClick={handleLogoutClick}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
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
      
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
} 