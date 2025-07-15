import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import ExampleTheme from '../plugins/ExampleTheme';
import React from 'react';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import { ImageNode } from '../plugins/ImageNode';
import ImagePlugin from '../plugins/ImagePlugin';

// Props와 State 타입 정의
interface ErrorBoundaryProps {
  children: React.ReactElement;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// 기존 함수형 컴포넌트를 클래스형으로 변경
class LexicalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // onError prop 호출
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          color: 'red', 
          whiteSpace: 'pre-wrap', 
          padding: '10px', 
          border: '1px solid red',
          margin: '10px 0'
        }}>
          <h4>에디터 렌더링 오류</h4>
          <p><strong>에러 타입:</strong> {this.state.error?.name || 'Unknown'}</p>
          <p><strong>에러 메시지:</strong> {this.state.error?.message || 'No message'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function LexicalViewer({ content }: { content: any }) {
  const editorState = (() => {
    try {
      if (typeof content === 'string') {
        // 이미 JSON 문자열인지 확인
        JSON.parse(content);
        return content;
      } else {
        // 객체인 경우 JSON 문자열로 변환
        return JSON.stringify(content);
      }
    } catch (error) {
      // 빈 에디터 상태 반환
      return JSON.stringify({
        root: {
          children: [],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      });
    }
  })();

  const initialConfig = {
    namespace: 'Viewer',
    theme: ExampleTheme,
    editable: false,
    nodes: [ListNode, ListItemNode, HeadingNode, ImageNode],
    editorState,
    onError: (_error: Error) => {
      // do nothing
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="viewer-content" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ImagePlugin />
    </LexicalComposer>
  );
}