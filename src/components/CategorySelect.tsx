interface CategorySelectProps {
  categories: string[];
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
  placeholder?: string;
  className?: string;
}

const CategorySelect = ({ categories, selectedCategory, onCategoryChange, placeholder, className }: CategorySelectProps) => (
  <select
    className={className}
    value={selectedCategory || ''}
    onChange={e => onCategoryChange(e.target.value)}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {categories.map((cat) => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
);

export default CategorySelect; 