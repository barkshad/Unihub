import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getSiteSettings, updateSiteSettings } from '@/services/firestore';
import { SiteSettings } from '@/types';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { register, handleSubmit, reset } = useForm<SiteSettings>();

  useEffect(() => {
    async function load() {
      const data = await getSiteSettings();
      if (data) reset(data);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: SiteSettings) => {
    try {
      await updateSiteSettings(data);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Site Settings</h1>
        <p className="text-zinc-500 mt-1 text-sm">Configure global website settings.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Hero Title</label>
          <input 
            {...register('heroTitle')} 
            className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
            placeholder="Find your perfect home"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Hero Subtitle</label>
          <textarea 
            {...register('heroSubtitle')} 
            rows={3} 
            className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
            placeholder="Discover premium student accommodation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Hero Image URL</label>
          <input 
            {...register('heroImage')} 
            className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm" 
            placeholder="https://..." 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">CTA Button Text</label>
          <input 
            {...register('ctaText')} 
            className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
            placeholder="Browse Listings"
          />
        </div>

        <div className="pt-6 border-t border-zinc-100">
          <button 
            type="submit" 
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
