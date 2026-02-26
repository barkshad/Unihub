import React, { useEffect, useState } from 'react';
import { getProperties, deleteProperty, updateProperty } from '@/services/firestore';
import { Property } from '@/types';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
      toast.success("Property deleted");
    } catch (error) {
      toast.error("Failed to delete property");
    }
  };

  const toggleStatus = async (property: Property) => {
    const newStatus = property.status === 'available' ? 'occupied' : 'available';
    try {
      await updateProperty(property.id!, { status: newStatus });
      setProperties(properties.map(p => p.id === property.id ? { ...p, status: newStatus } : p));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Properties</h1>
          <p className="text-zinc-500 mt-1 text-sm">Manage your property listings.</p>
        </div>
        <Link 
          to="/admin/properties/new" 
          className="bg-zinc-900 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium">Property</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100">
                        {property.media[0] && (
                          <img src={property.media[0].secure_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900">{property.title}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">{property.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {formatCurrency(property.price)}
                    <span className="text-zinc-400 font-normal text-xs ml-1">/yr</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(property)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        property.status === 'available' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                          : property.status === 'occupied' 
                            ? 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200' 
                            : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                      }`}
                    >
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/admin/properties/${property.id}`} 
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(property.id!)} 
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No properties found. Click "Add Property" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
