import React, { useEffect, useState } from 'react';
import { getProperties, getAgents, seedData } from '@/services/firestore';
import { Property, Agent } from '@/types';
import { Home, Users, CheckCircle, XCircle, Database, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    occupiedProperties: 0,
    totalAgents: 0
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [properties, agents] = await Promise.all([
        getProperties(),
        getAgents()
      ]);

      setStats({
        totalProperties: properties.length,
        availableProperties: properties.filter(p => p.status === 'available').length,
        occupiedProperties: properties.filter(p => p.status === 'occupied').length,
        totalAgents: agents.length
      });
    } catch (error) {
      console.error("Error fetching stats", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSeedData = async () => {
    if (!window.confirm('This will add sample data to your database. Continue?')) return;
    
    setSeeding(true);
    try {
      await seedData();
      toast.success('Data seeded successfully');
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error seeding data", error);
      toast.error('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Properties', value: stats.totalProperties, icon: Home },
    { label: 'Available', value: stats.availableProperties, icon: CheckCircle },
    { label: 'Occupied', value: stats.occupiedProperties, icon: XCircle },
    { label: 'Total Agents', value: stats.totalAgents, icon: Users },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-500 mt-1 text-sm">Welcome back to the control panel.</p>
        </div>
        <button 
          onClick={handleSeedData}
          disabled={seeding}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          {seeding ? 'Seeding...' : 'Seed Data'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">{card.label}</p>
                <p className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">{card.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 text-zinc-900">
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
