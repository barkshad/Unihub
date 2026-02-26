import React, { useEffect, useState } from 'react';
import { getProperties, getCategories } from '@/services/firestore';
import { Property, Category } from '@/types';
import PropertyCard from '@/components/PropertyCard';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [propsData, catsData] = await Promise.all([
          getProperties(), // Get all properties (available and occupied)
          getCategories()
        ]);
        setProperties(propsData);
        setFilteredProperties(propsData);
        setCategories(catsData);
      } catch (error) {
        console.error("Error fetching listings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let result = properties;

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Filter by Location
    if (locationQuery) {
      result = result.filter(p => p.location.toLowerCase().includes(locationQuery.toLowerCase()));
    }

    // Filter by Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProperties(result);
  }, [properties, selectedCategory, locationQuery, priceRange]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={cn(
          "md:w-64 flex-shrink-0",
          "fixed inset-0 z-40 bg-white p-6 md:static md:bg-transparent md:p-0 md:block",
          isFilterOpen ? "block" : "hidden"
        )}>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)}><X /></button>
          </div>

          <div className="space-y-6">
            {/* Search Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="Search location..."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="range"
                min="0"
                max="2000000"
                step="50000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">
                Up to ₦{priceRange[1].toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {filteredProperties.length} Properties Found
            </h1>
            <button
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 1000000]);
                  setLocationQuery('');
                }}
                className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
