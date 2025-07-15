interface TagSelectProps {
  tags: string[];
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

const TagSelect = ({ tags, selectedTags, onTagChange, placeholder, className }: TagSelectProps) => (
  <select
    multiple
    className={className}
    value={selectedTags}
    onChange={e => {
      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
      onTagChange(selected);
    }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {tags.map((tag) => (
      <option key={tag} value={tag}>{tag}</option>
    ))}
  </select>
);

export default TagSelect; 