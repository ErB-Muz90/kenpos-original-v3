import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

const MotionDiv = motion.div;

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => (
    <MotionDiv 
        layout
        className="bg-card dark:bg-dark-card rounded-lg shadow-md overflow-hidden cursor-pointer flex flex-col"
        onClick={() => onAddToCart(product)}
        whileHover={{ y: -4, scale: 1.02, boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.05)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
        <div className="relative">
            <img src={product.imageUrl || `https://placehold.co/300x300/e2e8f0/475569?text=${product.name.charAt(0)}`} alt={product.name} className="w-full h-32 object-cover"/>
            {product.stock <= 0 && product.productType === 'Inventory' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-sm bg-danger px-2 py-1 rounded">OUT OF STOCK</span>
                </div>
            )}
        </div>
        <div className="p-3 flex flex-col flex-grow">
            <h3 className="font-bold text-foreground dark:text-dark-foreground text-sm flex-grow">{product.name}</h3>
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-foreground/70 dark:text-dark-foreground/70">{product.category}</p>
                <p className="text-accent dark:text-dark-accent font-bold">Ksh {product.price.toFixed(2)}</p>
            </div>
        </div>
    </MotionDiv>
);


const ProductListItem = ({ product, onAddToCart }: ProductCardProps) => (
    <MotionDiv
        layout
        className="bg-card dark:bg-dark-card rounded-lg shadow-sm overflow-hidden cursor-pointer flex items-center p-2 space-x-4 w-full"
        onClick={() => onAddToCart(product)}
        whileHover={{ backgroundColor: '#F3F4F6', boxShadow: "0px 4px 10px -2px rgba(0,0,0,0.05)" }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
        <img src={product.imageUrl || `https://placehold.co/100x100/e2e8f0/475569?text=${product.name.charAt(0)}`} alt={product.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0"/>
        <div className="flex-grow overflow-hidden pr-2">
            <p className="font-bold text-foreground dark:text-dark-foreground text-sm truncate" title={product.name}>{product.name}</p>
            <p className="text-xs text-foreground/70 dark:text-dark-foreground/70 font-mono">{product.sku}</p>
        </div>
        <div className="text-center px-4 flex-shrink-0">
             <p className="text-xs text-foreground/70 dark:text-dark-foreground/70">Stock</p>
             <p className={`font-bold text-sm ${product.stock <= 10 && product.stock > 0 ? 'text-warning' : product.stock === 0 ? 'text-danger' : 'text-foreground dark:text-dark-foreground'}`}>{product.stock}</p>
        </div>
        <div className="text-right w-24 flex-shrink-0">
             <p className="text-accent dark:text-dark-accent font-bold">Ksh {product.price.toFixed(2)}</p>
        </div>
    </MotionDiv>
);


interface ProductGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = product.name.toLowerCase().includes(searchTermLower) || 
                                  product.sku.toLowerCase().includes(searchTermLower) ||
                                  (product.ean && product.ean.toLowerCase().includes(searchTermLower));
            return matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, selectedCategory]);
    
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const searchTermTrimmed = searchTerm.trim().toLowerCase();
            // Attempt to find a product by SKU or EAN when enter is pressed
            const foundProduct = products.find(p => 
                p.sku.trim().toLowerCase() === searchTermTrimmed ||
                (p.ean && p.ean.trim().toLowerCase() === searchTermTrimmed)
            );
            if (foundProduct) {
                e.preventDefault(); // Prevent any default form submission behavior
                onAddToCart(foundProduct);
                setSearchTerm(''); // Clear the search bar after adding
            }
        }
    };


    const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;

    return (
        <div>
            <div className="sticky top-0 bg-background dark:bg-dark-background z-10 py-4 mb-4">
                <div className="flex gap-4 items-center">
                    <div className="relative flex-grow">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground/40 dark:text-dark-foreground/40 absolute top-1/2 left-3 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Search products or scan barcode..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border dark:border-dark-border bg-card dark:bg-dark-card text-foreground dark:text-dark-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                     <div className="flex bg-background dark:bg-dark-card p-1 rounded-lg border border-border dark:border-dark-border">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-card dark:bg-dark-border text-primary dark:text-dark-primary shadow-sm' : 'text-foreground/60 dark:text-dark-foreground/60 hover:text-foreground dark:hover:text-dark-foreground'}`}
                            aria-label="List view"
                        >
                           <ListIcon/>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-card dark:bg-dark-border text-primary dark:text-dark-primary shadow-sm' : 'text-foreground/60 dark:text-dark-foreground/60 hover:text-foreground dark:hover:text-dark-foreground'}`}
                            aria-label="Grid view"
                        >
                            <GridIcon/>
                        </button>
                    </div>
                </div>
                 <div className="flex space-x-2 mt-4 overflow-x-auto pb-2 -mx-4 px-4">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors duration-200 ${
                                selectedCategory === category 
                                ? 'bg-primary dark:bg-dark-primary text-white shadow' 
                                : 'bg-card dark:bg-dark-card text-foreground/80 dark:text-dark-foreground/80 hover:bg-border dark:hover:bg-dark-border'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
             {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                     {filteredProducts.map(product => (
                        <ProductListItem key={product.id} product={product} onAddToCart={onAddToCart} />
                    ))}
                </div>
            )}
             {filteredProducts.length === 0 && (
                <div className="text-center py-10 text-foreground/60 dark:text-dark-foreground/60">
                    <p>No products found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;