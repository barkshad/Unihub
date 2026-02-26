import React, { useEffect, useState } from 'react';
import { getAgents, deleteAgent, createAgent, updateAgent } from '@/services/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Agent } from '@/types';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<Agent>();
  const profilePhotoURL = watch('profilePhotoURL');

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    const data = await getAgents();
    setAgents(data);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const result = await uploadToCloudinary(file, 'unihub/agents');
      setValue('profilePhotoURL', result.secure_url);
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: Agent) => {
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id!, data);
        toast.success('Agent updated');
      } else {
        await createAgent({ ...data, isActive: true });
        toast.success('Agent created');
      }
      setIsModalOpen(false);
      setEditingAgent(null);
      reset();
      loadAgents();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this agent?')) return;
    try {
      await deleteAgent(id);
      setAgents(agents.filter(a => a.id !== id));
      toast.success('Agent deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setValue('name', agent.name);
    setValue('phone', agent.phone);
    setValue('whatsappNumber', agent.whatsappNumber);
    setValue('profilePhotoURL', agent.profilePhotoURL);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
        <button 
          onClick={() => { setEditingAgent(null); reset(); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
              {agent.profilePhotoURL ? (
                <img src={agent.profilePhotoURL} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xl">
                  {agent.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{agent.name}</h3>
              <p className="text-sm text-gray-500 truncate">{agent.phone}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(agent)} className="p-2 text-gray-400 hover:text-indigo-600">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(agent.id!)} className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingAgent ? 'Edit Agent' : 'New Agent'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input {...register('name', { required: true })} className="w-full rounded-lg border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('phone', { required: true })} className="w-full rounded-lg border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <input {...register('whatsappNumber', { required: true })} className="w-full rounded-lg border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                    {profilePhotoURL ? (
                      <img src={profilePhotoURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <label className="flex-1">
                    <div className={`flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      disabled={uploading}
                    />
                  </label>
                </div>
                <input type="hidden" {...register('profilePhotoURL')} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">
                Save Agent
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
