import { useState, useEffect } from 'react';
import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import ExampleTheme from '../plugins/ExampleTheme';
import { ImageNode } from '../plugins/ImageNode';
import ImagePlugin from '../plugins/ImagePlugin';
import ToolbarPlugin from '../plugins/ToolbarPlugin';
import { createPost } from '../api/posts';
import { useAppSelector } from '../redux/hooks';

// CATEGORIES, setCategory, category 관련 select UI 등 제거

// Lexical 에디터 컴포넌트 (자유게시판용)
function LexicalEditor() {
  return (
    <div className="p-2 min-h-[120px] bg-gray-50">
      <RichTextPlugin
        contentEditable={<ContentEditable className="min-h-[100px] outline-none" />}
        placeholder={<div className="text-gray-400">내용을 입력하세요...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <ImagePlugin />
    </div>
  );
}

// 일반 textarea 에디터 컴포넌트 (다른 탭용)
function SimpleEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded px-3 py-2 min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="내용을 입력하세요..."
    />
  );
}

export default function WritePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  // category 상태는 'free'로 고정
  const [category] = useState<string>('free');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [lexicalState, setLexicalState] = useState<any>(null); // Lexical JSON 객체
  const [simpleContent, setSimpleContent] = useState(''); // 일반 텍스트 내용

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // URL 파라미터에서 탭 타입과 수정 모드 가져오기
  useEffect(() => {
    const editId = searchParams.get('edit');
    // 수정 모드인 경우 기존 데이터 로드
    if (editId) {
      // TODO: 기존 게시글 데이터 로드
    }
  }, [searchParams]);

  // 로그인하지 않은 경우 로그인 페이지로 이동 또는 안내
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">글쓰기</h2>
        <p className="mb-6 text-gray-600">글쓰기는 로그인 후에만 가능합니다.</p>
        <a
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition"
        >
          로그인하러 가기
        </a>
      </div>
    );
  }

  // Lexical 설정
  const initialConfig = {
    namespace: 'WriteEditor',
    theme: ExampleTheme,
    nodes: [ListNode, ListItemNode, HeadingNode, ImageNode],
    onError(error: Error) {
      console.error('Lexical error:', error);
    },
  };

  const handleChange = (editorStateObj: any) => {
    editorStateObj.read(() => {
      // Lexical JSON 객체 저장
      setLexicalState(editorStateObj.toJSON());
    });
  };

  const addTag = () => {
    const cleanTag = tagInput.trim().replace(/[^\w가-힣ㄱ-ㅎㅏ-ㅣ\-]/g, '');
    if (cleanTag && tags.length < 5 && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return;
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const handleTagBlur = () => {
    if (tagInput.trim() && !isComposing) {
      addTag();
    }
  };

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => setIsComposing(false);

  const handleTagRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let content;
      if (category === 'free') {
        // 자유게시판은 Lexical JSON 사용
        content = lexicalState;
      } else {
        // 다른 탭은 일반 텍스트 사용
        content = simpleContent;
      }
      const postData = {
        title,
        content,
        category: category, // category는 'free'로 고정
        tags,
      };
      await createPost(postData);
      alert('게시글이 작성되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('게시글 작성 중 오류:', error);
      alert('게시글 작성에 실패했습니다.');
    }
  };

  const isEditMode = searchParams.get('edit') !== null;
  const pageTitle = isEditMode ? '게시글 수정' : '글쓰기';
  const isFreeBoard = category === 'free';

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{pageTitle}</h2>
      <form onSubmit={handleSubmit}>
        {/* 제목 */}
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        {/* 태그 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm flex items-center">
                #{tag}
                <button type="button" className="ml-1 text-blue-500 hover:text-red-500" onClick={() => handleTagRemove(tag)}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="태그를 입력 후 Enter 또는 ,를 누르세요 (최대 5개)"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleTagBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            disabled={tags.length >= 5}
          />
        </div>
        {/* 에디터 */}
        {isFreeBoard ? (
          // 자유게시판: Lexical 에디터 사용
          <LexicalComposer initialConfig={initialConfig}>
            <div className="border border-gray-300 rounded mb-4">
              <ToolbarPlugin />
              <LexicalEditor />
              <OnChangePlugin onChange={handleChange} />
            </div>
          </LexicalComposer>
        ) : (
          // 다른 탭: 일반 textarea 사용
          <div className="mb-4">
            <SimpleEditor 
              value={simpleContent} 
              onChange={setSimpleContent} 
            />
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition"
        >
          등록
        </button>
      </form>
    </div>
  );
} 