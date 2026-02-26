import React, { useEffect, useState } from 'react';
import { getProperties, getAgents } from '@/services/firestore';
import { Property, Agent } from '@/types';
import { Home, Users, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    occupiedProperties: 0,
    totalAgents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const cards = [
    { label: 'Total Properties', value: stats.totalProperties, icon: Home, color: 'bg-blue-500' },
    { label: 'Available', value: stats.availableProperties, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Occupied', value: stats.occupiedProperties, icon: XCircle, color: 'bg-red-500' },
    { label: 'Total Agents', value: stats.totalAgents, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color} text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
