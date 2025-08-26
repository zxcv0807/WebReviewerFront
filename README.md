# WebRating Frontend

한국어 웹사이트 리뷰 및 피싱 사이트 신고 플랫폼의 프론트엔드 애플리케이션입니다.

## 📖 프로젝트 개요

WebRating은 사용자들이 웹사이트에 대한 리뷰를 작성하고, 피싱 사이트를 신고할 수 있는 커뮤니티 플랫폼입니다. 안전한 인터넷 환경 조성을 위해 사용자들이 웹사이트 정보를 공유하고 악성 사이트를 신고할 수 있습니다.

## ✨ 주요 기능

- **웹사이트 리뷰**: 다양한 웹사이트에 대한 별점 및 상세 리뷰 작성
- **자유게시판**: 일반적인 웹 관련 정보 공유 및 토론
- **피싱 사이트 신고**: 악성 사이트 신고 및 공유로 커뮤니티 보호
- **사용자 인증**: 구글 OAuth 연동 로그인/회원가입
- **반응형 디자인**: 모바일 및 데스크톱 환경 최적화
- **실시간 검색**: 제목 및 내용 기반 게시글 검색

## 🛠 기술 스택

- **Frontend Framework**: React 19.1.0
- **언어**: TypeScript 5.8.3
- **빌드 도구**: Vite 7.0.0
- **상태 관리**: Redux Toolkit 2.8.2
- **라우팅**: React Router DOM 7.6.3
- **스타일링**: TailwindCSS 4.1.11
- **에디터**: Lexical 0.33.0 (리치 텍스트 에디터)
- **HTTP 클라이언트**: Axios 1.10.0
- **보안**: DOMPurify 3.2.6 (XSS 방지)

## 📁 프로젝트 구조

```
src/
├── api/                 # API 통신 관련
│   ├── auth.ts         # 인증 API
│   ├── axiosInstance.ts # Axios 설정
│   └── posts.ts        # 게시글/리뷰 API
├── components/         # 재사용 가능한 컴포넌트
│   ├── CategorySelect.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── LexicalViewer.tsx
│   ├── PhishingReportForm.tsx
│   ├── PhishingSiteList.tsx
│   ├── PostCard.tsx
│   ├── PostEditor.tsx
│   ├── ReviewCard.tsx
│   ├── ReviewForm.tsx
│   ├── TabNavigation.tsx
│   ├── TagSelect.tsx
│   └── WriteButton.tsx
├── pages/              # 페이지 컴포넌트
│   ├── GoogleAuthCallback.tsx
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── PhishingReportPage.tsx
│   ├── PostDetailPage.tsx
│   ├── PostEditPage.tsx
│   ├── PostListPage.tsx
│   ├── PostWritePage.tsx
│   ├── ReviewWritePage.tsx
│   ├── SignupPage.tsx
│   └── WritePage.tsx
├── plugins/            # Lexical 에디터 플러그인
│   ├── ExampleTheme.ts
│   ├── ImageNode.tsx
│   ├── ImagePlugin.tsx
│   └── ToolbarPlugin.tsx
├── redux/              # 상태 관리
│   ├── hooks.ts
│   ├── slices/
│   │   └── authSlice.ts
│   └── store.ts
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── utils/              # 유틸리티 함수
│   ├── security.ts    # 보안 관련 함수
│   └── validation.ts   # 유효성 검사
└── styles/
    └── index.css       # 전역 스타일
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

3. 프로덕션 빌드
```bash
npm run build
```

4. 빌드 미리보기
```bash
npm run preview
```

5. 코드 린팅
```bash
npm run lint
```

## 🔐 보안 기능

- **입력값 정제**: XSS 공격 방지를 위한 DOMPurify 적용
- **요청 제한**: Rate limiting 구현으로 남용 방지
- **비밀번호 강도 검사**: 안전한 비밀번호 정책 적용
- **토큰 기반 인증**: JWT를 통한 안전한 사용자 인증

## 📱 주요 페이지

### 홈페이지 (`/`)
- 웹사이트 리뷰, 자유게시판, 피싱 사이트 신고 탭
- 실시간 검색 기능
- 최신 게시글 및 리뷰 표시

### 리뷰 작성 (`/review/write`)
- 웹사이트 URL, 별점, 장단점 입력
- 리치 텍스트 에디터 지원

### 피싱 사이트 신고 (`/phishing/report`)
- 악성 사이트 URL 및 사유 신고
- 카테고리별 신고 유형 분류

### 게시글 작성 (`/write`)
- Lexical 에디터를 활용한 리치 텍스트 작성
- 카테고리 및 태그 설정

## 🔗 API 연동

백엔드 API와 RESTful 방식으로 통신하며, 다음과 같은 엔드포인트를 사용합니다:

- `/posts/posts` - 게시글 CRUD
- `/api/reviews` - 리뷰 관리
- `/api/phishing-sites` - 피싱 사이트 신고
- `/auth` - 사용자 인증

