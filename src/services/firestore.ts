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
  const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
  
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
