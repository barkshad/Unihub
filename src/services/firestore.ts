import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property, Agent, Category, SiteSettings } from "@/types";

// --- Properties ---

export const getProperties = async (status?: string) => {
  let q;
  if (status) {
    // Remove orderBy to avoid index requirement
    q = query(collection(db, "properties"), where("status", "==", status));
  } else {
    q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
  }
  
  const snapshot = await getDocs(q);
  const properties = snapshot.docs.map(doc => {
    const data = doc.data();
    return { id: doc.id, ...(data as any) } as Property;
  });
  
  // Client-side sort if filtered by status (since we removed the orderBy clause)
  if (status) {
    properties.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }
  
  return properties;
};

export const getProperty = async (id: string) => {
  const docRef = doc(db, "properties", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Property;
};

export const createProperty = async (data: Omit<Property, "id" | "createdAt" | "updatedAt">) => {
  return await addDoc(collection(db, "properties"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateProperty = async (id: string, data: Partial<Property>) => {
  const docRef = doc(db, "properties", id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteProperty = async (id: string) => {
  return await deleteDoc(doc(db, "properties", id));
};

// --- Agents ---

export const getAgents = async () => {
  const snapshot = await getDocs(collection(db, "agents"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
};

export const getAgent = async (id: string) => {
  const docRef = doc(db, "agents", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Agent;
};

export const createAgent = async (data: Omit<Agent, "id">) => {
  return await addDoc(collection(db, "agents"), data);
};

export const updateAgent = async (id: string, data: Partial<Agent>) => {
  return await updateDoc(doc(db, "agents", id), data);
};

export const deleteAgent = async (id: string) => {
  return await deleteDoc(doc(db, "agents", id));
};

// --- Categories ---

export const getCategories = async () => {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const createCategory = async (data: Omit<Category, "id">) => {
  return await addDoc(collection(db, "categories"), data);
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  return await updateDoc(doc(db, "categories", id), data);
};

export const deleteCategory = async (id: string) => {
  return await deleteDoc(doc(db, "categories", id));
};

// --- Settings ---

export const getSiteSettings = async () => {
  const docRef = doc(db, "settings", "general");
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as SiteSettings;
};

export const updateSiteSettings = async (data: SiteSettings) => {
  const docRef = doc(db, "settings", "general");
  // Use set with merge true to create if not exists
  const { setDoc } = await import("firebase/firestore"); 
  return await setDoc(docRef, data, { merge: true });
};

export const seedData = async () => {
  const { writeBatch } = await import("firebase/firestore");
  const batch = writeBatch(db);

  // 1. Create Categories
  const categories = [
    { name: "Bedsitter", slug: "bedsitter", isActive: true, order: 0 },
    { name: "Single Room", slug: "single-room", isActive: true, order: 1 },
    { name: "One Bedroom", slug: "one-bedroom", isActive: true, order: 2 },
    { name: "Two Bedroom", slug: "two-bedroom", isActive: true, order: 3 }
  ];

  const categoryIds: string[] = [];
  for (const cat of categories) {
    const ref = doc(collection(db, "categories"));
    batch.set(ref, cat);
    categoryIds.push(ref.id);
  }

  // 2. Create Agent
  const agentRef = doc(collection(db, "agents"));
  const agentId = agentRef.id;
  batch.set(agentRef, {
    name: "UniHub Agent",
    phone: "+254 113 562686",
    whatsappNumber: "+254 113 562686",
    isActive: true,
    profilePhotoURL: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256"
  });

  // 3. Create Properties
  const properties = [
    {
      title: "Modern Studio Apartment near Campus",
      categoryId: categoryIds[2], // Bedsitter/Studio
      price: 15000,
      deposit: 15000,
      location: "Juja, Gate C",
      description: "A spacious modern studio apartment located just 5 minutes from the main campus gate. Features include tiled floors, instant shower, and secure biometric access.",
      features: ["WiFi", "Water 24/7", "Security", "Tiled Floors"],
      agentId: agentId,
      status: "available",
      media: [
        {
          public_id: "sample1",
          secure_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000",
          resource_type: "image",
          format: "jpg",
          order: 0
        },
        {
          public_id: "sample2",
          secure_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000",
          resource_type: "image",
          format: "jpg",
          order: 1
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      title: "Premium 1 Bedroom Apartment",
      categoryId: categoryIds[0], // Apartment
      price: 25000,
      deposit: 25000,
      location: "Ruiru, Kimbo",
      description: "Luxury 1 bedroom apartment with balcony, ample parking, and CCTV surveillance. Ideal for students who want privacy and comfort.",
      features: ["Balcony", "Parking", "CCTV", "Fiber Internet"],
      agentId: agentId,
      status: "available",
      media: [
        {
          public_id: "sample3",
          secure_url: "https://images.unsplash.com/photo-1502005229766-528352261275?auto=format&fit=crop&q=80&w=1000",
          resource_type: "image",
          format: "jpg",
          order: 0
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      title: "Affordable Hostel for Ladies",
      categoryId: categoryIds[1], // Hostel
      price: 8000,
      deposit: 8000,
      location: "Juja, Gachororo",
      description: "Safe and clean hostel for ladies. Shared amenities but very well maintained. Matron available 24/7.",
      features: ["Matron", "Study Area", "Hot Shower"],
      agentId: agentId,
      status: "available",
      media: [
        {
          public_id: "sample4",
          secure_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000",
          resource_type: "image",
          format: "jpg",
          order: 0
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ];

  for (const prop of properties) {
    const ref = doc(collection(db, "properties"));
    batch.set(ref, prop);
  }

  // 4. Update Settings
  const settingsRef = doc(db, "settings", "general");
  batch.set(settingsRef, {
    heroTitle: "Find your perfect home",
    heroSubtitle: "Discover premium student accommodation near you. Safe, affordable, and convenient.",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000",
    ctaText: "Browse Listings",
    featuredProperties: []
  }, { merge: true });

  await batch.commit();
};
