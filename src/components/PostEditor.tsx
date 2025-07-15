import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $getSelection } from 'lexical';
import type { EditorState } from 'lexical';
import ToolbarPlugin from '../plugins/ToolbarPlugin';
import ImagePlugin from '../plugins/ImagePlugin';
import type { PostForm, Category, Tag } from '../types';
import CategorySelect from './CategorySelect';
import TagSelect from './TagSelect';

interface PostEditorProps {
  initialData?: PostForm;
  categories: Category[];
  tags: Tag[];
  onSubmit: (data: PostForm) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
}

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  image: 'editor-image',
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
  },
  code: 'editor-code',
  codeHighlight: {
    atrule: 'editor-tokenAttr',
    attr: 'editor-tokenAttr',
    boolean: 'editor-tokenProperty',
    builtin: 'editor-tokenSelector',
    cdata: 'editor-tokenComment',
    char: 'editor-tokenSelector',
    class: 'editor-tokenFunction',
    'class-name': 'editor-tokenFunction',
    comment: 'editor-tokenComment',
    constant: 'editor-tokenProperty',
    deleted: 'editor-tokenProperty',
    doctype: 'editor-tokenComment',
    entity: 'editor-tokenOperator',
    function: 'editor-tokenFunction',
    important: 'editor-tokenVariable',
    keyword: 'editor-tokenAttr',
    namespace: 'editor-tokenVariable',
    number: 'editor-tokenProperty',
    operator: 'editor-tokenOperator',
    prolog: 'editor-tokenComment',
    property: 'editor-tokenProperty',
    punctuation: 'editor-tokenPunctuation',
    regex: 'editor-tokenVariable',
    selector: 'editor-tokenSelector',
    string: 'editor-tokenSelector',
    symbol: 'editor-tokenProperty',
    tag: 'editor-tokenProperty',
    url: 'editor-tokenOperator',
    variable: 'editor-tokenVariable',
  },
};

export default function PostEditor({
  initialData,
  categories,
  tags,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = "저장"
}: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(initialData?.categoryId);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialData?.tagIds || []);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      tagIds: selectedTagIds,
    });
  };

  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      setContent(textContent);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 입력 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="제목을 입력하세요"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <CategorySelect
            categories={categories}
            selectedCategoryId={categoryId}
            onCategoryChange={setCategoryId}
            className="w-full"
          />
        </div>

        {/* 태그 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그
          </label>
          <TagSelect
            tags={tags}
            selectedTagIds={selectedTagIds}
            onTagChange={setSelectedTagIds}
            className="w-full"
          />
        </div>

        {/* 내용 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <div className={`border rounded-md ${errors.content ? 'border-red-500' : 'border-gray-300'}`}>
            <LexicalComposer
              initialConfig={{
                namespace: 'PostEditor',
                theme,
                onError: (error) => {
                  console.error(error);
                },
              }}
            >
              <div className="relative">
                <ToolbarPlugin />
                <div className="relative">
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable className="min-h-[400px] px-4 py-3 focus:outline-none" />
                    }
                    placeholder={
                      <div className="absolute top-3 left-4 text-gray-400 pointer-events-none">
                        내용을 입력하세요...
                      </div>
                    }
                    ErrorBoundary={() => <div>Something went wrong!</div>}
                  />
                  <HistoryPlugin />
                  <AutoFocusPlugin />
                  <ListPlugin />
                  <LinkPlugin />
                  <MarkdownShortcutPlugin />
                  <ImagePlugin />
                  <OnChangePlugin onChange={handleEditorChange} />
                </div>
              </div>
            </LexicalComposer>
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : submitText}
          </button>
        </div>
      </form>
    </div>
  );
} 