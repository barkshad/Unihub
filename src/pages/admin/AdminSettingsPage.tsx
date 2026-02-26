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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Site Settings</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
          <input {...register('heroTitle')} className="w-full rounded-lg border-gray-300" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
          <textarea {...register('heroSubtitle')} rows={3} className="w-full rounded-lg border-gray-300" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
          <input {...register('heroImage')} className="w-full rounded-lg border-gray-300" placeholder="https://..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
          <input {...register('ctaText')} className="w-full rounded-lg border-gray-300" />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
