import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, getCategories, getTags } from '../api/posts';
import type { PostForm, Category, Tag } from '../types';
import PostEditor from '../components/PostEditor';

export default function PostWritePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, tagsResponse] = await Promise.all([
          getCategories(),
          getTags(),
        ]);
        setCategories(categoriesResponse);
        setTags(tagsResponse);
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: PostForm) => {
    try {
      setSubmitting(true);
      await createPost(data);
      navigate('/posts');
    } catch (error) {
      console.error('게시글 작성 중 오류:', error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/posts');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">게시글 작성</h1>
        </div>
        
        <PostEditor
          categories={categories}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={submitting}
          submitText="작성 완료"
        />
      </div>
    </div>
  );
} 