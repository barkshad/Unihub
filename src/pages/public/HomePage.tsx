import React, { useEffect, useState } from 'react';
import { getSiteSettings, getProperties } from '@/services/firestore';
import { SiteSettings, Property } from '@/types';
import { Link } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import { ArrowRight, ShieldCheck, MessageSquare, GraduationCap } from 'lucide-react';

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-neutral-900 text-white py-32 lg:py-48 overflow-hidden">
        {settings?.heroImage && (
          <div className="absolute inset-0 z-0">
            <img src={settings.heroImage} alt="Hero" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white">
            {settings?.heroTitle || "Find Your Perfect Home"}
          </h1>
          <p className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            {settings?.heroSubtitle || "Verified listings, direct agent contact, no hidden fees."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/listings" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-900 text-base font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {settings?.ctaText || "Browse Listings"}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Featured Properties</h2>
              <p className="mt-3 text-neutral-500 text-lg">Hand-picked verified listings for you</p>
            </div>
            <Link to="/listings" className="hidden sm:flex items-center text-neutral-900 font-medium hover:text-neutral-600 transition-colors">
              View all <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-12 sm:hidden text-center">
            <Link to="/listings" className="inline-flex items-center text-neutral-900 font-medium hover:text-neutral-600">
              View all properties <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust/Info Section */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-white border border-neutral-200 text-neutral-900 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-neutral-900">Verified Listings</h3>
              <p className="text-neutral-500 leading-relaxed">Every property is manually verified by our team to ensure safety and quality.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-white border border-neutral-200 text-neutral-900 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-neutral-900">Direct Contact</h3>
              <p className="text-neutral-500 leading-relaxed">Connect directly with agents via WhatsApp. No middlemen, no hidden fees.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-white border border-neutral-200 text-neutral-900 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-neutral-900">Student Focused</h3>
              <p className="text-neutral-500 leading-relaxed">Tailored specifically for university students looking for off-campus accommodation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
