import React, { useEffect, useState } from 'react';
import { getCategories, deleteCategory, createCategory, updateCategory } from '@/services/firestore';
import { Category } from '@/types';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm<Category>();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const data = await getCategories();
    setCategories(data);
  }

  const onSubmit = async (data: Category) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id!, data);
        toast.success('Category updated');
      } else {
        await createCategory({ ...data, order: categories.length, isActive: true });
        toast.success('Category created');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
      loadCategories();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('slug', category.slug);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Categories</h1>
          <p className="text-zinc-500 mt-1 text-sm">Organize properties into categories.</p>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); reset(); setIsModalOpen(true); }}
          className="bg-zinc-900 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {categories.map((category) => (
            <div key={category.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4">
                <GripVertical className="text-zinc-300 cursor-move w-5 h-5" />
                <div>
                  <h3 className="font-medium text-zinc-900">{category.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">/{category.slug}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(category)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(category.id!)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="p-12 text-center text-zinc-500 text-sm">No categories found. Create one to get started.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl border border-zinc-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
                <input 
                  {...register('name', { 
                    required: true,
                    onChange: (e) => {
                      if (!editingCategory) {
                        setValue('slug', e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                      }
                    }
                  })} 
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
                  placeholder="e.g. Apartments"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Slug</label>
                <input 
                  {...register('slug', { required: true })} 
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm bg-zinc-50 text-zinc-600"
                  readOnly
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-zinc-900 text-white py-2.5 rounded-md font-medium hover:bg-zinc-800 transition-colors text-sm"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
