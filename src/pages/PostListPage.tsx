import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, getCategories, getTags } from '../api/posts';
import type { Post, Category, Tag, PostFilters } from '../types';

export default function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  // 카테고리/태그는 string[]으로만 사용
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PostFilters>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0); // total은 실제로 사용하지 않음
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('useEffect 실행, filters:', filters);
    const fetchData = async () => {
      console.log('fetchData 실행');
      try {
        setLoading(true);
        // 자유게시판만 보이도록 type/category를 강제 지정
        const filtersWithFree = {
          ...filters,
          type: 'free' as const,           // 타입 단언으로 'free'로 고정
          category: '자유게시판', // DB와 일치하는 값으로 고정
        };
        const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all([
          getPosts(filtersWithFree),
          getCategories(),
          getTags(),
        ]);
        console.log('자유게시판 API 응답:', postsResponse);
        if (!Array.isArray(postsResponse)) {
          console.error('API 응답이 배열이 아닙니다:', postsResponse);
        }
        setPosts(postsResponse); // postsResponse는 Post[]
        setCategories(categoriesResponse); // string[]
        setTags(tagsResponse); // string[]
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1, // 검색 시 첫 페이지로
    }));
  };

  const handleCategoryChange = (categoryId: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      categoryId,
      page: 1,
    }));
  };

  const handleTagChange = (tagIds: number[]) => {
    setFilters(prev => ({
      ...prev,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">게시글 목록</h1>
        <Link
          to="/posts/write"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          글쓰기
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="제목 또는 내용 검색"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                검색
              </button>
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={filters.category || ''}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value || undefined, page: 1 }))}
            >
              <option value="">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태그
            </label>
            <select
              multiple
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={filters.tagIds?.map(String) || []}
              onChange={e => {
                // Convert selected values to number[]
                const selected = Array.from(e.target.selectedOptions).map(opt => Number(opt.value)).filter(v => !isNaN(v));
                setFilters(prev => ({ ...prev, tagIds: selected.length > 0 ? selected : undefined, page: 1 }));
              }}
            >
              {tags.map((tag, idx) => (
                <option key={idx} value={idx}>{tag}</option>
              ))}
            </select>
          </div>

          {/* 필터 초기화 */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ page: 1, limit: 10 });
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            게시글이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link
                      to={`/posts/${post.id}`}
                      className="block group"
                    >
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>{post.user_name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.created_at)}</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">{post.category}</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {total > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
              disabled={(filters.page || 1) <= 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {Array.from({ length: Math.ceil(total / (filters.limit || 10)) }, (_, i) => i + 1)
              .filter(page => {
                const current = filters.page || 1;
                return page === 1 || page === Math.ceil(total / (filters.limit || 10)) || 
                       (page >= current - 2 && page <= current + 2);
              })
              .map((page, index, array) => {
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-3 py-2 text-sm text-gray-500">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      page === (filters.page || 1)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            
            <button
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={(filters.page || 1) >= Math.ceil(total / (filters.limit || 10))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 