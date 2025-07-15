import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useRef, useState, useCallback, useEffect } from 'react';
import { 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND, 
  FORMAT_ELEMENT_COMMAND, 
  COMMAND_PRIORITY_LOW, 
  SELECTION_CHANGE_COMMAND, 
  CAN_UNDO_COMMAND, 
  CAN_REDO_COMMAND, 
  UNDO_COMMAND, 
  REDO_COMMAND 
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import type { TextFormatType, ElementFormatType } from 'lexical';
import type { HeadingTagType } from '@lexical/rich-text';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  }, []);

  const formatText = useCallback((format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor]);

  const formatHeading = useCallback((headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          const parent = node.getParent();
          if (parent && !$isHeadingNode(parent)) {
            const headingNode = $createHeadingNode(headingSize);
            parent.replace(headingNode);
            headingNode.append(node);
          }
        });
      }
    });
  }, [editor]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (예: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB를 초과할 수 없습니다.');
        return;
      }
      // 이미지 업로드 API 호출
      const formData = new FormData();
      formData.append('file', file);
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${baseURL}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('이미지 업로드 실패');
        const data = await res.json();
        const imageUrl = data.url;
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: imageUrl,
          altText: file.name,
        });
      } catch (err) {
        alert('이미지 업로드에 실패했습니다.');
        console.error(err);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateToolbar]);

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
      {/* 실행 취소/다시 실행 */}
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className={`p-2 rounded text-sm transition-colors ${
          canUndo ? 'hover:bg-gray-200' : 'text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Undo">
        ↶
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className={`p-2 rounded text-sm transition-colors ${
          canRedo ? 'hover:bg-gray-200' : 'text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Redo">
        ↷
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      {/* 텍스트 서식 */}
      <button
        type="button"
        onClick={() => formatText('bold')}
        className={`p-2 rounded text-sm font-bold transition-colors ${
          isBold 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'hover:bg-gray-200'
        }`}
        title="굵게"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => formatText('italic')}
        className={`p-2 rounded text-sm italic transition-colors ${
          isItalic 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'hover:bg-gray-200'
        }`}
        title="기울임"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => formatText('underline')}
        className={`p-2 rounded text-sm underline transition-colors ${
          isUnderline 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'hover:bg-gray-200'
        }`}
        title="밑줄"
      >
        U
      </button>
      <button
        type="button"
        onClick={() => formatText('strikethrough')}
        className={`p-2 rounded text-sm line-through transition-colors ${
          isStrikethrough 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'hover:bg-gray-200'
        }`}
        title="취소선"
      >
        S
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      {/* 정렬 */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left' as ElementFormatType)}
        className="p-2 hover:bg-gray-200 rounded text-sm transition-colors"
        title="왼쪽 정렬"
      >
        ⬅
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center' as ElementFormatType)}
        className="p-2 hover:bg-gray-200 rounded text-sm transition-colors"
        title="가운데 정렬"
      >
        ↔
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right' as ElementFormatType)}
        className="p-2 hover:bg-gray-200 rounded text-sm transition-colors"
        title="오른쪽 정렬"
      >
        ➡
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      {/* 제목 */}
      <button
        type="button"
        onClick={() => formatHeading('h1')}
        className="p-2 hover:bg-gray-200 rounded text-sm font-bold transition-colors"
        title="제목 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => formatHeading('h2')}
        className="p-2 hover:bg-gray-200 rounded text-sm font-bold transition-colors"
        title="제목 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => formatHeading('h3')}
        className="p-2 hover:bg-gray-200 rounded text-sm font-bold transition-colors"
        title="제목 3"
      >
        H3
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      {/* 목록 */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className="p-2 hover:bg-gray-200 rounded text-sm transition-colors"
        title="글머리 기호 목록"
      >
        • 목록
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className="p-2 hover:bg-gray-200 rounded text-sm transition-colors"
        title="번호 매기기 목록"
      >
        1. 목록
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      {/* 이미지 첨부 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 hover:bg-gray-200 rounded text-sm transition-colors"
        title="이미지 첨부"
      >
        📷
      </button>
    </div>
  );
} 