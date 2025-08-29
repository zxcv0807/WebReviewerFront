import { useAppSelector } from '../redux/hooks';

interface EditDeleteButtonsProps {
  authorId: number; // 작성자 ID (필수)
  onEdit: () => void;
  onDelete: () => void;
  itemType?: string; // '게시물', '리뷰', '댓글' 등
}

export default function EditDeleteButtons({ 
  authorId, 
  onEdit, 
  onDelete, 
  itemType = '항목'
}: EditDeleteButtonsProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // 로그인하지 않은 경우 버튼 숨김
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // 작성자 ID가 없으면 버튼 숨김 (백엔드에서 user_id를 제공해야 함)
  if (!authorId) {
    console.warn('EditDeleteButtons: authorId가 제공되지 않았습니다. 백엔드에서 user_id 필드를 확인하세요.');
    return null;
  }
  
  // 현재 사용자가 작성자인지 확인
  const isAuthor = user.id === authorId;
  
  if (!isAuthor) {
    return null;
  }
  
  const handleDelete = () => {
    if (window.confirm(`정말로 이 ${itemType}을(를) 삭제하시겠습니까?`)) {
      onDelete();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        className="px-3 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors"
      >
        삭제
      </button>
    </div>
  );
}