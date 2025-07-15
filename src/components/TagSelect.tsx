import React, { useState } from 'react';
import type { Tag } from '../types';

interface TagSelectProps {
  tags: Tag[];
  selectedTagIds: number[];
  onTagChange: (tagIds: number[]) => void;
  placeholder?: string;
  className?: string;
}

export default function TagSelect({
  tags,
  selectedTagIds,
  onTagChange,
  placeholder = "태그 선택",
  className = ""
}: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tagId: number) => {
    const newSelectedTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onTagChange(newSelectedTagIds);
  };

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  return (
    <div className={`relative ${className}`}>
      <div
        className="px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagToggle(tag.id);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {tags.map(tag => (
            <label
              key={tag.id}
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => handleTagToggle(tag.id)}
                className="mr-2"
              />
              <span className="text-sm">{tag.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
} 