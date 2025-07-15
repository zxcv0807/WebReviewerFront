import React from 'react';
import type { Category } from '../types';

interface CategorySelectProps {
  categories: Category[];
  selectedCategoryId?: number;
  onCategoryChange: (categoryId: number | undefined) => void;
  placeholder?: string;
  className?: string;
}

export default function CategorySelect({
  categories,
  selectedCategoryId,
  onCategoryChange,
  placeholder = "카테고리 선택",
  className = ""
}: CategorySelectProps) {
  return (
    <select
      value={selectedCategoryId || ""}
      onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      <option value="">{placeholder}</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
} 