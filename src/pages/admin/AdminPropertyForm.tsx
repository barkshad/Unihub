import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, updateProperty, getProperty, getAgents, getCategories } from '@/services/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Property, Agent, Category, MediaItem } from '@/types';
import { Trash2, Upload, X, Plus } from 'lucide-react';
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
      <h1 className="text-2xl font-bold mb-8">{id ? 'Edit Property' : 'New Property'}</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input {...register('title', { required: true })} className="w-full rounded-lg border-gray-300" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Yearly)</label>
            <input type="number" {...register('price', { required: true })} className="w-full rounded-lg border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit (Optional)</label>
            <input type="number" {...register('deposit')} className="w-full rounded-lg border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select {...register('categoryId', { required: true })} className="w-full rounded-lg border-gray-300">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select {...register('agentId', { required: true })} className="w-full rounded-lg border-gray-300">
              <option value="">Select Agent</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input {...register('location', { required: true })} className="w-full rounded-lg border-gray-300" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description', { required: true })} rows={4} className="w-full rounded-lg border-gray-300" />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <div className="space-y-2">
            {/* We need a custom way to handle the array of strings since useFieldArray expects objects */}
            {/* For simplicity in this demo, let's just use a comma separated string or simple inputs */}
            {/* Actually, let's do a simple tag input or just multiple inputs */}
             <div className="flex flex-wrap gap-2 mb-2">
               {features.map((feature, index) => (
                 <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                   <span>{feature}</span>
                   <button type="button" onClick={() => {
                     const newFeatures = [...features];
                     newFeatures.splice(index, 1);
                     setValue('features', newFeatures);
                   }}><X className="w-3 h-3" /></button>
                 </div>
               ))}
             </div>
             <div className="flex gap-2">
               <input 
                 id="new-feature" 
                 className="flex-1 rounded-lg border-gray-300" 
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
                 className="bg-gray-100 px-4 rounded-lg hover:bg-gray-200"
               >
                 Add
               </button>
             </div>
          </div>
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos & Videos</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {media.map((item, index) => (
              <div key={item.public_id} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {item.resource_type === 'video' ? (
                  <video src={item.secure_url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.secure_url} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors aspect-square">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">{uploading ? 'Uploading...' : 'Upload Media'}</span>
              <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select {...register('status')} className="w-full rounded-lg border-gray-300">
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/admin/properties')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
