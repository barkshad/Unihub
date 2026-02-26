import React, { useState } from 'react';
import { createCategory, createAgent, createProperty, updateSiteSettings } from '@/services/firestore';
import { Category, Agent, Property, SiteSettings } from '@/types';
import { serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function SeederPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const seedData = async () => {
    if (!window.confirm("This will add sample data to your database. Continue?")) return;
    
    setLoading(true);
    setLogs([]);
    addLog("Starting seed process...");

    try {
      // 1. Seed Settings
      addLog("Seeding Settings...");
      const settings: SiteSettings = {
        heroTitle: "Find Your Perfect Student Home",
        heroSubtitle: "Verified listings, direct agent contact, no hidden fees.",
        heroImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
        ctaText: "Browse Listings",
        featuredProperties: []
      };
      await updateSiteSettings(settings);
      addLog("Settings seeded.");

      // 2. Seed Categories
      addLog("Seeding Categories...");
      const categoriesData = [
        { name: "Apartment", slug: "apartment", isActive: true, order: 0 },
        { name: "Studio", slug: "studio", isActive: true, order: 1 },
        { name: "Shared Room", slug: "shared-room", isActive: true, order: 2 },
        { name: "Duplex", slug: "duplex", isActive: true, order: 3 },
      ];
      
      const categoryIds: Record<string, string> = {};
      for (const cat of categoriesData) {
        const docRef = await createCategory(cat);
        categoryIds[cat.slug] = docRef.id;
        addLog(`Category created: ${cat.name}`);
      }

      // 3. Seed Agents
      addLog("Seeding Agents...");
      const agentsData = [
        { 
          name: "John Doe", 
          phone: "+2348012345678", 
          whatsappNumber: "2348012345678", 
          profilePhotoURL: "https://randomuser.me/api/portraits/men/32.jpg",
          isActive: true 
        },
        { 
          name: "Jane Smith", 
          phone: "+2348098765432", 
          whatsappNumber: "2348098765432", 
          profilePhotoURL: "https://randomuser.me/api/portraits/women/44.jpg",
          isActive: true 
        },
      ];

      const agentIds: string[] = [];
      for (const agent of agentsData) {
        const docRef = await createAgent(agent);
        agentIds.push(docRef.id);
        addLog(`Agent created: ${agent.name}`);
      }

      // 4. Seed Properties
      addLog("Seeding Properties...");
      const propertiesData: Omit<Property, "id" | "createdAt" | "updatedAt">[] = [
        {
          title: "Modern 2-Bedroom Apartment in Yaba",
          categoryId: categoryIds['apartment'],
          price: 1500000,
          deposit: 150000,
          location: "Yaba, Lagos",
          description: "A newly built 2-bedroom apartment with modern finishing. Features include a spacious living room, fitted kitchen, and en-suite bedrooms. Located in a secure environment with good road access.",
          features: ["24/7 Power", "Security", "Parking", "Water Treatment"],
          agentId: agentIds[0],
          status: 'available',
          media: [
            {
              public_id: "sample1",
              secure_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              resource_type: "image",
              format: "jpg",
              order: 0
            },
            {
              public_id: "sample2",
              secure_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2360&q=80",
              resource_type: "image",
              format: "jpg",
              order: 1
            }
          ]
        },
        {
          title: "Cozy Studio near UNILAG",
          categoryId: categoryIds['studio'],
          price: 800000,
          deposit: 80000,
          location: "Akoka, Yaba",
          description: "Perfect for students! This cozy studio apartment is just a 5-minute walk from the UNILAG gate. Comes with a kitchenette and bathroom.",
          features: ["Close to Campus", "Water", "Fenced"],
          agentId: agentIds[1],
          status: 'available',
          media: [
            {
              public_id: "sample3",
              secure_url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              resource_type: "image",
              format: "jpg",
              order: 0
            }
          ]
        },
        {
          title: "Luxury 3-Bedroom Duplex in Lekki",
          categoryId: categoryIds['duplex'],
          price: 4500000,
          deposit: 450000,
          location: "Lekki Phase 1, Lagos",
          description: "Experience luxury living in this exquisite 3-bedroom duplex. All rooms en-suite, BQ attached, swimming pool and gym access.",
          features: ["Swimming Pool", "Gym", "BQ", "24/7 Power", "Security"],
          agentId: agentIds[0],
          status: 'available',
          media: [
            {
              public_id: "sample4",
              secure_url: "https://images.unsplash.com/photo-1600596542815-2a4d9f010dbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2350&q=80",
              resource_type: "image",
              format: "jpg",
              order: 0
            },
            {
              public_id: "sample5",
              secure_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2353&q=80",
              resource_type: "image",
              format: "jpg",
              order: 1
            }
          ]
        },
        {
          title: "Affordable Shared Room in Akoka",
          categoryId: categoryIds['shared-room'],
          price: 300000,
          deposit: 30000,
          location: "Bariga, Lagos",
          description: "Shared room opportunity for male student. Spacious room with wardrobe. Kitchen and bathroom shared with one other person.",
          features: ["Wardrobe", "Water", "Electricity"],
          agentId: agentIds[1],
          status: 'available',
          media: [
            {
              public_id: "sample6",
              secure_url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              resource_type: "image",
              format: "jpg",
              order: 0
            }
          ]
        },
        {
          title: "Serviced 1-Bedroom Mini Flat",
          categoryId: categoryIds['apartment'],
          price: 1200000,
          deposit: 120000,
          location: "Surulere, Lagos",
          description: "Clean and serviced mini-flat in a quiet neighborhood. Generator services available 7pm-7am.",
          features: ["Serviced", "Generator", "Security", "Parking"],
          agentId: agentIds[0],
          status: 'occupied',
          media: [
            {
              public_id: "sample7",
              secure_url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
              resource_type: "image",
              format: "jpg",
              order: 0
            }
          ]
        }
      ];

      for (const prop of propertiesData) {
        await createProperty(prop);
        addLog(`Property created: ${prop.title}`);
      }

      addLog("Seeding Complete!");
      toast.success("Database seeded successfully!");
    } catch (error) {
      console.error(error);
      addLog(`Error: ${error}`);
      toast.error("Seeding failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
      <p className="mb-6 text-gray-600">
        Click the button below to populate the database with sample data (Categories, Agents, Properties, Settings).
      </p>
      
      <button
        onClick={seedData}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Seeding...' : 'Seed Database'}
      </button>

      <div className="mt-8 bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <span className="text-gray-400">Logs will appear here...</span>
        ) : (
          logs.map((log, i) => <div key={i}>{log}</div>)
        )}
      </div>
    </div>
  );
}
