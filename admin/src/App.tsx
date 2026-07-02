import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import AdminLogin from './components/Admin/AdminLogin';
import AdminPanel from './components/Admin/AdminPanel';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1250] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/10 p-2 animate-pulse">
          <img src="https://i.ibb.co/bYGc84w/image.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mb-4"></div>
        <p className="text-amber-400 font-medium tracking-wide">சுமக்கப்படும்...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={() => {}} />;
  }

  return (
    <AdminPanel onLogout={handleLogout} />
  );
}
