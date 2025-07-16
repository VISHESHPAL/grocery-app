import React from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../contexts/AppContext';

const BestSeller = () => {
  const { products } = useAppContext();

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium">Best Sellers</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  mt-6 gap-3">
        {products
          .filter((product) => product.inStock) // ✅ Step 1: Filter only in-stock items
          .slice(0, 5) // ✅ Step 2: Pick top 5
          .map((product, index) => (
            <ProductCard key={index} product={product} /> // ✅ Step 3: Render
          ))}
      </div>
    </div>
  );
};

export default BestSeller;
