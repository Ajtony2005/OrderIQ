import { motion } from "framer-motion";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className="relative px-6 py-3 rounded-xl whitespace-nowrap transition-colors touch-none min-h-[56px]"
          style={{
            backgroundColor: activeCategory === category ? "#f3f4f6" : "transparent",
            color: activeCategory === category ? "#030213" : "#6b7280",
          }}
        >
          {activeCategory === category && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 bg-gray-100 rounded-xl"
              style={{ zIndex: -1 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{category}</span>
        </button>
      ))}
    </div>
  );
}
