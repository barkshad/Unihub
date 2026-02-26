import React, { useEffect, useState } from 'react';
import { getProperties, deleteProperty, updateProperty } from '@/services/firestore';
import { Property } from '@/types';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <Link 
          to="/admin/properties/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {property.media[0] && (
                          <img src={property.media[0].secure_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-gray-500 text-xs">{property.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(property.price)}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(property)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                        property.status === 'available' ? 'bg-green-100 text-green-700' : 
                        property.status === 'occupied' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {property.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/properties/${property.id}`} className="text-gray-400 hover:text-indigo-600">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(property.id!)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
