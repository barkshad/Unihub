import React, { useEffect, useState } from 'react';
import { getSiteSettings, getProperties } from '@/services/firestore';
import { SiteSettings, Property } from '@/types';
import { Link } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import { ArrowRight, Search } from 'lucide-react';

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsData, propertiesData] = await Promise.all([
          getSiteSettings(),
          getProperties('available')
        ]);
        
        setSettings(settingsData);

        if (settingsData?.featuredProperties && settingsData.featuredProperties.length > 0) {
           const featured = propertiesData.filter(p => settingsData.featuredProperties.includes(p.id!));
           setFeaturedProperties(featured.slice(0, 6));
        } else {
           setFeaturedProperties(propertiesData.slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching home data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-indigo-900 text-white py-20 lg:py-32 overflow-hidden">
        {settings?.heroImage && (
          <div className="absolute inset-0 z-0 opacity-20">
            <img src={settings.heroImage} alt="Hero" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {settings?.heroTitle || "Find Your Perfect Student Home"}
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            {settings?.heroSubtitle || "Verified listings, direct agent contact, no hidden fees."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/listings" 
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 md:text-lg transition-all"
            >
              {settings?.ctaText || "Browse Listings"}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
              <p className="mt-2 text-gray-600">Hand-picked verified listings for you</p>
            </div>
            <Link to="/listings" className="hidden sm:flex items-center text-indigo-600 font-medium hover:text-indigo-700">
              View all <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-8 sm:hidden text-center">
            <Link to="/listings" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700">
              View all properties <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust/Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Listings</h3>
              <p className="text-gray-600">Every property is manually verified by our team to ensure safety and quality.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Direct Contact</h3>
              <p className="text-gray-600">Connect directly with agents via WhatsApp. No middlemen, no hidden fees.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Student Focused</h3>
              <p className="text-gray-600">Tailored specifically for university students looking for off-campus accommodation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
