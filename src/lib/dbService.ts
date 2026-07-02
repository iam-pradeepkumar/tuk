import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import { supabase } from './supabaseClient';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errStr = error instanceof Error ? error.message : (error && typeof error === 'object' && 'message' in error ? (error as any).message : JSON.stringify(error));
  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {}, 
    operationType,
    path
  };
  
  const isHistory = path?.includes('officer_history');
  const isSchemaCacheError = errStr.includes('schema cache') || errStr.includes('Could not find');
  
  if (isHistory || isSchemaCacheError) {
    console.warn('Database Warning (Non-blocking): ', JSON.stringify(errInfo));
  } else {
    console.error('Database Error: ', JSON.stringify(errInfo));
  }
  
  if (errStr.includes('Could not find the') && errStr.includes('column')) {
    if (!isHistory) {
      alert(`Database Schema Error: ${errStr}\n\nPlease run the SQL commands in 'supabase-fix.sql' in your Supabase SQL Editor to add the missing columns.`);
    }
  } else if (path?.startsWith('media/') && !isHistory) {
    alert(`Supabase Error for ${path}: ${errStr} | Details: ${JSON.stringify(error)}`);
  }
}

function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      cleaned[key] = cleanUndefined(obj[key]);
    }
  }
  return cleaned;
}

export const dbService = {
  subscribeToCollection: (collectionName: string, callback: (data: any[]) => void) => {
    try {
      const cached = localStorage.getItem(`tuk_${collectionName}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          callback(parsed);
        }
      }
    } catch (e) {
      console.warn(`Failed to load ${collectionName} from localStorage`);
    }

    if (supabase) {
      // 1. Initial fetch from Supabase
      supabase.from(collectionName).select('*').then(({ data, error }) => {
        if (data) {
          callback(data);
          localStorage.setItem(`tuk_${collectionName}`, JSON.stringify(data));
        }
      });

      // 2. Realtime subscription
      const channelName = `public:${collectionName}:${Math.random().toString(36).substring(7)}`;
      const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, payload => {
           supabase.from(collectionName).select('*').then(({ data }) => {
             if (data) {
               callback(data);
               localStorage.setItem(`tuk_${collectionName}`, JSON.stringify(data));
             }
           });
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }

    // Fallback to Firebase
    const q = query(collection(db, collectionName));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      try {
        localStorage.setItem(`tuk_${collectionName}`, JSON.stringify(data));
      } catch (e) {}
      
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
      
      try {
        const cached = localStorage.getItem(`tuk_${collectionName}`);
        if (cached) {
          callback(JSON.parse(cached));
        }
      } catch (e) {}
    });
  },

  saveItem: async (collectionName: string, id: string, data: any) => {
    try {
      const cleanedData = { ...cleanUndefined(data) };
      
      if (supabase) {
        // Supabase Upsert
        // We include the ID in the body
        const payload = { id, ...cleanedData };
        const { error } = await supabase.from(collectionName).upsert(payload);
        if (error) throw error;
        return;
      }
      
      // Firebase fallback
      if (collectionName === 'memberships' && 'id' in cleanedData) {
        delete cleanedData.id;
      }
      await setDoc(doc(db, collectionName, id), cleanedData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
      if (collectionName === 'officer_history') {
        return; // Gracefully absorb errors so they are completely non-blocking
      }
      throw error; // Rethrow so UI can show error message
    }
  },

  deleteItem: async (collectionName: string, id: string) => {
    try {
      if (supabase) {
        const { error } = await supabase.from(collectionName).delete().eq('id', id);
        if (error) throw error;
        return;
      }
      
      // Firebase fallback
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
      throw error;
    }
  }
};

