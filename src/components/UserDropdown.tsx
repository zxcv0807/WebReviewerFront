import React, { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { SendMessageModal } from './SendMessageModal';
import { UserMemoModal } from './UserMemoModal';

interface UserDropdownProps {
  username: string;
  className?: string;
  children?: React.ReactNode;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ 
  username, 
  className = '', 
  children 
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);

  // 본인 계정인지 확인
  const isOwnAccount = user?.username === username;

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  const handleSendMessage = () => {
    setShowMessageModal(true);
    closeDropdown();
  };

  const handleAddMemo = () => {
    setShowMemoModal(true);
    closeDropdown();
  };

  // 로그인하지 않았거나 본인 계정이면 일반 텍스트로 표시
  if (!isAuthenticated || isOwnAccount) {
    return (
      <span className={`font-medium text-blue-600 ${className}`}>
        {children || username}
      </span>
    );
  }

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={handleUserClick}
          className={`font-medium text-blue-600 hover:text-blue-700 transition-colors ${className}`}
        >
          {children || username}
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <button
              onClick={handleSendMessage}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
            >
              📨 쪽지 보내기
            </button>
            <button
              onClick={handleAddMemo}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              📝 메모 남기기
            </button>
          </div>
        )}
      </div>

      {/* 배경 클릭시 드롭다운 닫기 */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeDropdown}
        />
      )}

      {/* 쪽지 보내기 모달 */}
      <SendMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        recipientUsername={username}
      />

      {/* 메모 작성 모달 */}
      <UserMemoModal
        isOpen={showMemoModal}
        onClose={() => setShowMemoModal(false)}
        targetUsername={username}
      />
    </>
  );
};