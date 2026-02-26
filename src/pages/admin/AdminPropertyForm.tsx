import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, updateProperty, getProperty, getAgents, getCategories } from '@/services/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Property, Agent, Category, MediaItem } from '@/types';
import { Trash2, Upload, X, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<Property>({
    defaultValues: {
      features: [],
      media: [],
      status: 'available'
    }
  });

  const media = watch('media');
  const features = watch('features') || [];

  useEffect(() => {
    async function init() {
      const [agentsData, catsData] = await Promise.all([getAgents(), getCategories()]);
      setAgents(agentsData);
      setCategories(catsData);

      if (id) {
        const property = await getProperty(id);
        if (property) {
          reset(property);
        }
      }
    }
    init();
  }, [id, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    
    try {
      const files = Array.from(e.target.files as FileList);
      const uploadPromises = files.map(file => uploadToCloudinary(file, `unihub/properties/${id || 'new'}`));
      const results = await Promise.all(uploadPromises);
      
      const newMedia: MediaItem[] = results.map((res, index) => ({
        ...res,
        order: media.length + index
      }));
      
      setValue('media', [...media, ...newMedia]);
      toast.success('Upload complete');
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = [...media];
    newMedia.splice(index, 1);
    setValue('media', newMedia);
  };

  const onSubmit = async (data: Property) => {
    setLoading(true);
    try {
      // Ensure price is number
      data.price = Number(data.price);
      data.deposit = Number(data.deposit);

      if (id) {
        await updateProperty(id, data);
        toast.success('Property updated');
      } else {
        await createProperty(data);
        toast.success('Property created');
      }
      navigate('/admin/properties');
    } catch (error) {
      console.error(error);
      toast.error('Error saving property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">{id ? 'Edit Property' : 'New Property'}</h1>
        <p className="text-zinc-500 mt-1 text-sm">Fill in the details below to {id ? 'update' : 'create'} a property listing.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Title</label>
            <input 
              {...register('title', { required: true })} 
              className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
              placeholder="e.g. Modern Apartment in Westlands"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Price (Yearly)</label>
            <input 
              type="number" 
              {...register('price', { required: true })} 
              className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Deposit (Optional)</label>
            <input 
              type="number" 
              {...register('deposit')} 
              className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Category</label>
            <select 
              {...register('categoryId', { required: true })} 
              className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm bg-white"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Agent</label>
            <select 
              {...register('agentId', { required: true })} 
              className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm bg-white"
            >
              <option value="">Select Agent</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Location</label>
            <input 
              {...register('location', { required: true })} 
              className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
              placeholder="e.g. Kilimani, Nairobi"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Description</label>
            <textarea 
              {...register('description', { required: true })} 
              rows={4} 
              className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
              placeholder="Describe the property..."
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Features</label>
          <div className="space-y-3">
             <div className="flex flex-wrap gap-2">
               {features.map((feature, index) => (
                 <div key={index} className="bg-zinc-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm text-zinc-700 border border-zinc-200">
                   <span>{feature}</span>
                   <button type="button" onClick={() => {
                     const newFeatures = [...features];
                     newFeatures.splice(index, 1);
                     setValue('features', newFeatures);
                   }} className="text-zinc-400 hover:text-zinc-600">
                     <X className="w-3 h-3" />
                   </button>
                 </div>
               ))}
             </div>
             <div className="flex gap-2">
               <input 
                 id="new-feature" 
                 className="flex-1 px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
                 placeholder="Add a feature (e.g. WiFi, Generator)" 
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     e.preventDefault();
                     const val = e.currentTarget.value.trim();
                     if (val) {
                       setValue('features', [...features, val]);
                       e.currentTarget.value = '';
                     }
                   }
                 }}
               />
               <button 
                 type="button"
                 onClick={() => {
                   const input = document.getElementById('new-feature') as HTMLInputElement;
                   if (input.value.trim()) {
                     setValue('features', [...features, input.value.trim()]);
                     input.value = '';
                   }
                 }}
                 className="bg-zinc-100 text-zinc-900 px-4 rounded-md hover:bg-zinc-200 border border-zinc-200 font-medium text-sm transition-colors"
               >
                 Add
               </button>
             </div>
          </div>
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Photos & Videos</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {media.map((item, index) => (
              <div key={item.public_id} className="relative group aspect-square bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200">
                {item.resource_type === 'video' ? (
                  <video src={item.secure_url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.secure_url} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-white/90 text-red-600 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all aspect-square group">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              )}
              <span className="text-sm text-zinc-500 mt-2 font-medium">{uploading ? 'Uploading...' : 'Upload Media'}</span>
              <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
          <select 
            {...register('status')} 
            className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm bg-white"
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => navigate('/admin/properties')}
            className="px-4 py-2 border border-zinc-300 rounded-md hover:bg-zinc-50 text-zinc-700 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 font-medium text-sm transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
