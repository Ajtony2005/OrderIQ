import { motion } from "framer-motion";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  onAdd: (id: string, name: string, price: number) => void;
}

export function ProductCard({ id, name, price, image, onAdd }: ProductCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onAdd(id, name, price)}
      className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all active:shadow-sm touch-none"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col gap-1">
        <h3 className="text-left">{name}</h3>
        <p className="text-left text-gray-600">${price.toFixed(2)}</p>
      </div>
    </motion.button>
  );
}
