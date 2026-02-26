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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Filters Sidebar */}
        <div className={cn(
          "md:w-72 flex-shrink-0",
          "fixed inset-0 z-40 bg-white p-6 md:static md:bg-transparent md:p-0 md:block transition-transform duration-300 ease-in-out",
          isFilterOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="flex justify-between items-center mb-8 md:hidden">
            <h2 className="text-xl font-bold text-neutral-900">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)} className="text-neutral-500 hover:text-neutral-900"><X /></button>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">Search</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Search location..."
                    className="w-full rounded-lg border-neutral-200 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 transition-colors"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-8">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">Category</h3>
              <select
                className="w-full rounded-lg border-neutral-200 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 transition-colors"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-neutral-100 pt-8">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">Price Range</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="2000000"
                  step="50000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-neutral-900"
                />
                <div className="flex justify-between text-sm text-neutral-600 font-medium">
                  <span>₦0</span>
                  <span>₦{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {filteredProperties.length} Properties Found
            </h1>
            <button
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-neutral-50 rounded-xl border border-neutral-100 dashed">
              <p className="text-neutral-500 text-lg mb-4">No properties found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange([0, 1000000]);
                  setLocationQuery('');
                }}
                className="text-neutral-900 font-semibold underline hover:text-neutral-600 transition-colors"
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
