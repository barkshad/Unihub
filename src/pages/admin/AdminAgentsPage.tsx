import React, { useEffect, useState } from 'react';
import { getAgents, deleteAgent, createAgent, updateAgent } from '@/services/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Agent } from '@/types';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, Upload, Loader2, User } from 'lucide-react';
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
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Agents</h1>
          <p className="text-zinc-500 mt-1 text-sm">Manage real estate agents.</p>
        </div>
        <button 
          onClick={() => { setEditingAgent(null); reset(); setIsModalOpen(true); }}
          className="bg-zinc-900 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full overflow-hidden flex-shrink-0 border border-zinc-100">
              {agent.profilePhotoURL ? (
                <img src={agent.profilePhotoURL} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-zinc-900 truncate">{agent.name}</h3>
              <p className="text-sm text-zinc-500 truncate">{agent.phone}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(agent)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(agent.id!)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl border border-zinc-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">{editingAgent ? 'Edit Agent' : 'New Agent'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
                <input 
                  {...register('name', { required: true })} 
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Phone</label>
                <input 
                  {...register('phone', { required: true })} 
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">WhatsApp Number</label>
                <input 
                  {...register('whatsappNumber', { required: true })} 
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200">
                    {profilePhotoURL ? (
                      <img src={profilePhotoURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <label className="flex-1">
                    <div className={`flex items-center justify-center w-full px-4 py-2 border border-zinc-300 rounded-md cursor-pointer hover:bg-zinc-50 transition-colors text-sm font-medium text-zinc-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
              <button 
                type="submit" 
                className="w-full bg-zinc-900 text-white py-2.5 rounded-md font-medium hover:bg-zinc-800 transition-colors text-sm"
              >
                Save Agent
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
