import { motion } from "framer-motion";
import { StarIcon } from "lucide-react";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Burger Palace",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    orders: 342,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Fresh Salads",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    orders: 278,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Pizza Express",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    orders: 256,
    rating: 4.6,
  },
  {
    id: 4,
    name: "Sushi Master",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    orders: 201,
    rating: 4.9,
  },
];
const TopProducts = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Top rated Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className="bg-gray-50 rounded-lg overflow-hidden"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1 * index,
            }}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <div className="h-32 w-full overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
            </div>
            <div className="p-4">
              <h4 className="font-medium">{product.name}</h4>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  <StarIcon
                    size={16}
                    className="text-amber-400 mr-1"
                    fill="currentColor"
                  />
                  <span className="text-sm">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {product.orders} orders
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default TopProducts;
