import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import type { JSX } from 'react';

export interface ImagePayload {
  altText: string;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  src: string;
  width?: number;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ altText, src, width, height });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    height?: number;
    maxWidth?: number;
    src: string;
    width?: number;
    type: 'image';
    version: 1;
  },
  {}
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __maxWidth: number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  // ImageNode.tsx의 importJSON 메서드 수정
  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const {
      altText = '',
      height = 0,
      width = 0,
      maxWidth = 500,
      src = '',
    } = serializedNode;
    
    try {
      const node = $createImageNode({
        altText,
        height,
        maxWidth,
        src,
        width,
      });
      return node;
    } catch (error) {
      throw error;
    }
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setWidthAndHeight(
    width: 'inherit' | number,
    height: 'inherit' | number,
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      div.className = className;
    }
    div.style.display = 'inline-block';
    return div;
  }

  decorate(): JSX.Element {
    try {
      if (!this.__src) {
        return <span style={{ color: 'red' }}>이미지 경로 없음</span>;
      }
      const backendUrl = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const realSrc = this.__src.startsWith('/uploads/')
        ? `${backendUrl}${this.__src}`
        : this.__src;
      return (
        <img
          src={realSrc}
          alt={this.__altText || '이미지'}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          style={{
            maxWidth: this.__maxWidth || 500,
            width: this.__width === 'inherit' ? 'auto' : this.__width,
            height: this.__height === 'inherit' ? 'auto' : this.__height,
            display: 'block',
            margin: '0.5em 0',
          }}
        />
      );
    } catch (error) {
      return <span style={{ color: 'red' }}>이미지 렌더링 오류</span>;
    }
  }
}

export function $createImageNode({
  altText = '',
  height = 0,
  maxWidth = 500,
  src = '',
  width = 0,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(
    src,
    altText,
    maxWidth,
    width,
    height,
    key,
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}