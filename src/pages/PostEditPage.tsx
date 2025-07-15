import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, updatePost, getCategories, getTags } from '../api/posts';
import type { Post, PostForm } from '../types';
import PostEditor from '../components/PostEditor';

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [postData, categoriesResponse, tagsResponse] = await Promise.all([
          getPost(parseInt(id)),
          getCategories(),
          getTags(),
        ]);
        
        setPost(postData);
        setCategories(categoriesResponse as string[]);
        setTags(tagsResponse as string[]);
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
        alert('게시글을 불러올 수 없습니다.');
        navigate('/posts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (data: PostForm) => {
    if (!post) return;

    try {
      setSubmitting(true);
      await updatePost(post.id, data);
      navigate(`/posts/${post.id}`);
    } catch (error) {
      console.error('게시글 수정 중 오류:', error);
      alert('게시글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (post) {
      navigate(`/posts/${post.id}`);
    } else {
      navigate('/posts');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">
          게시글을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  // PostForm 형태로 변환
  const initialData: PostForm = {
    title: post.title,
    content: post.content,
    category: post.category,
    tags: post.tags || [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">게시글 수정</h1>
        </div>
        
        <PostEditor
          initialData={initialData}
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={submitting}
          submitText="수정 완료"
        />
      </div>
    </div>
  );
} 