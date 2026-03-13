import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle,
  History,
  User as UserIcon,
  Calendar,
  Clock,
  CreditCard,
  Smartphone,
  BookOpen,
  Heart,
  Quote,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---
type Role = 'Visiteur' | 'Administrateur' | 'Technicien' | 'Pasteur';

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface FinanceEntry {
  id: number;
  type: string;
  amount: number;
  currency: 'CDF' | 'USD';
  date: string;
  status: string;
}

interface Programme {
  id: number;
  title: string;
  description: string;
  date_start: string;
  date_end: string;
  type: 'Hebdomadaire' | 'Spécial' | 'Séminaire';
}

interface Meditation {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
}

// --- Utils ---
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const d = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const t = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${d} à ${t}`;
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-church-blue/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-church-blue">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmer", 
  cancelText = "Annuler",
  type = 'danger'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'success';
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
          type === 'danger' ? "bg-red-50 text-red-500" : 
          type === 'success' ? "bg-green-50 text-green-500" : 
          "bg-blue-50 text-blue-500"
        )}>
          {type === 'danger' ? <AlertTriangle size={32} /> : 
           type === 'success' ? <CheckCircle2 size={32} /> : 
           <PlusCircle size={32} />}
        </div>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "flex-1 px-6 py-3 text-white rounded-xl font-bold transition-all",
              type === 'danger' ? "bg-red-600 hover:bg-red-700" : 
              type === 'success' ? "bg-green-600 hover:bg-green-700" : 
              "bg-church-blue hover:bg-opacity-90"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const Navbar = ({ user, onLogout, currentView }: { user: User | null; onLogout: () => void; currentView: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Accueil', href: '#', view: 'home' },
    { name: 'Cultes', href: '#programmes', view: 'programmes' },
    { name: 'Méditations', href: '#meditations', view: 'meditations' },
    { name: 'Contact', href: '#contact', view: 'home' },
    { name: 'Profil', href: '#profile', protected: true, view: 'profile' },
    { name: 'Administration', href: '#admin', protected: true, view: 'admin' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-church-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-church-gold rounded-full flex items-center justify-center text-church-blue font-bold text-xl">
                R
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-tight">Rehoboth</h1>
                <p className="text-[10px] uppercase tracking-widest text-church-gold">Centre Missionnaire</p>
              </div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              if (item.protected && !user) return null;
              const isActive = currentView === item.view && (window.location.hash === item.href || (item.href === '#' && window.location.hash === ''));
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (window.location.hash === item.href) {
                      // Force scroll if already on the hash
                      const id = item.href.substring(1);
                      const element = id ? document.getElementById(id) : null;
                      if (element) {
                        e.preventDefault();
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else if (item.href === '#') {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    isActive 
                      ? "bg-church-gold text-church-blue shadow-md" 
                      : "hover:text-church-gold text-white/80"
                  )}
                >
                  {item.name}
                </a>
              );
            })}
            <div className="h-6 w-px bg-white/10 mx-2" />
            {user ? (
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-all"
              >
                <LogOut size={16} /> Quitter
              </button>
            ) : (
              <a 
                href="#auth-choice"
                className={cn(
                  "px-6 py-1.5 rounded-full text-sm font-bold transition-all",
                  currentView === 'auth-choice' || currentView === 'login' || currentView === 'register'
                    ? "bg-church-gold text-church-blue"
                    : "bg-church-gold/90 text-church-blue hover:bg-church-gold"
                )}
              >
                Connexion
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-church-gold focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-church-blue border-t border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item) => {
                if (item.protected && !user) return null;
                const isActive = currentView === item.view && (window.location.hash === item.href || (item.href === '#' && window.location.hash === ''));
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setIsOpen(false);
                      if (window.location.hash === item.href) {
                        const id = item.href.substring(1);
                        const element = id ? document.getElementById(id) : null;
                        if (element) {
                          e.preventDefault();
                          element.scrollIntoView({ behavior: 'smooth' });
                        } else if (item.href === '#') {
                          e.preventDefault();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }
                    }}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                      isActive ? "bg-church-gold text-church-blue" : "hover:bg-white/10 text-white"
                    )}
                  >
                    {item.name}
                  </a>
                );
              })}
              {user && (
                <button
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-church-gold hover:bg-white/10"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AuthChoice = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 text-center"
      >
        <div className="w-16 h-16 bg-church-gold rounded-full flex items-center justify-center text-church-blue mx-auto mb-6">
          <UserIcon size={32} />
        </div>
        <h2 className="text-2xl font-bold text-church-blue mb-2">Bienvenue</h2>
        <p className="text-gray-500 mb-8">Comment souhaitez-vous continuer ?</p>
        
        <div className="space-y-4">
          <a 
            href="#login"
            className="block w-full bg-church-blue text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all"
          >
            Utilisateur existant
          </a>
          <a 
            href="#register"
            className="block w-full border-2 border-church-blue text-church-blue py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            Nouvel utilisateur
          </a>
        </div>
        
        <p className="mt-8 text-xs text-gray-400">
          En vous connectant, vous pourrez sauvegarder vos interactions et grandir avec nous.
        </p>
      </motion.div>
    </div>
  );
};

const RegisterForm = ({ onRegister }: { onRegister: (data: any) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onRegister(data);
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-church-blue">Créer un compte</h2>
          <p className="text-gray-500 text-sm mt-2">Rejoignez la communauté Rehoboth</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-church-blue outline-none transition-all"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-church-blue outline-none transition-all"
              placeholder="jean@email.cd"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-church-blue outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-church-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Création...' : 'S\'inscrire'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Déjà un compte ? <a href="#login" className="text-church-blue font-bold">Se connecter</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const DonationView = ({ token }: { token: string | null }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CDF' | 'USD'>('CDF');
  const [provider, setProvider] = useState<'M-Pesa' | 'Orange Money' | 'Airtel Money'>('M-Pesa');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      window.location.hash = '#auth-choice';
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/donations/mobile-money', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount), currency, provider, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setAmount('');
        setPhone('');
      } else {
        setMessage(data.error || 'Erreur');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-church-gold rounded-full flex items-center justify-center text-church-blue mx-auto mb-4">
            <CreditCard size={32} />
          </div>
          <h2 className="text-3xl font-bold text-church-blue">Soutenir l'Église</h2>
          <p className="text-gray-500 mt-2">Faites un don via Mobile Money</p>
        </div>

        {!token ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">Veuillez vous connecter pour faire un don en ligne.</p>
            <a href="#auth-choice" className="bg-church-blue text-white px-8 py-3 rounded-xl font-bold">Se connecter</a>
          </div>
        ) : (
          <form onSubmit={handleDonation} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
                >
                  <option>CDF</option>
                  <option>USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opérateur</label>
              <div className="grid grid-cols-3 gap-2">
                {['M-Pesa', 'Orange Money', 'Airtel Money'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p as any)}
                    className={cn(
                      "py-3 rounded-xl text-xs font-bold border-2 transition-all",
                      provider === p ? "border-church-blue bg-church-blue text-white" : "border-gray-100 text-gray-500 hover:border-gray-200"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
                  placeholder="0812345678"
                />
              </div>
            </div>

            {message && (
              <div className={cn(
                "p-4 rounded-xl text-sm font-medium text-center",
                message.includes('Succès') || message.includes('envoyée') ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-church-blue text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Traitement...' : 'Confirmer le don'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const MeditationsView = () => {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/meditations')
      .then(res => res.json())
      .then(data => {
        setMeditations(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-12">
        <BookOpen className="text-church-gold" size={40} />
        <h2 className="text-4xl font-bold text-church-blue">Méditations Quotidiennes</h2>
      </div>

      <div className="space-y-8">
        {meditations.map((m) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={m.id} 
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-church-gold" />
            <Quote className="text-church-gold/10 absolute top-4 right-4" size={64} />
            <div className="relative z-10">
              <span className="text-xs font-bold text-church-gold uppercase tracking-widest mb-2 block">
                {formatDate(m.date)}
              </span>
              <h3 className="text-2xl font-bold text-church-blue mb-4">{m.title}</h3>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {m.content}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-2">
                <Heart className="text-red-400" size={16} />
                <span className="text-xs font-medium text-gray-400">Par {m.author}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {meditations.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Aucune méditation publiée pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MeditationManagement = ({ token }: { token: string }) => {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchMeditations = async () => {
    const res = await fetch('/api/meditations');
    const data = await res.json();
    setMeditations(data);
  };

  useEffect(() => {
    fetchMeditations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/meditations/${editingId}` : '/api/meditations';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        setEditingId(null);
        fetchMeditations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m: Meditation) => {
    setEditingId(m.id);
    setTitle(m.title);
    setContent(m.content);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/meditations/${deleteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchMeditations();
    setDeleteId(null);
  };

  return (
    <div className="space-y-8">
      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer la méditation"
        message="Êtes-vous sûr de vouloir supprimer cette méditation ? Cette action est irréversible."
        confirmText="Supprimer"
      />
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h3 className="text-xl font-bold text-church-blue mb-6">{editingId ? 'Modifier la méditation' : 'Publier une nouvelle méditation'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Titre de la méditation"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
            required
          />
          <textarea
            placeholder="Contenu de la méditation (Sanctification, exhortation...)"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue min-h-[200px]"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-church-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all"
            >
              {loading ? 'Traitement...' : editingId ? 'Mettre à jour' : 'Publier'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setContent('');
                }}
                className="px-6 bg-gray-200 text-gray-600 rounded-xl font-bold"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-church-blue">Méditations publiées</h3>
        {meditations.map(m => (
          <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex-1 mr-4">
              <h4 className="font-bold text-church-blue truncate">{m.title}</h4>
              <p className="text-xs text-gray-400">{formatDate(m.date)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
              <button onClick={() => setDeleteId(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgrammesView = ({ token }: { token: string | null }) => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [interests, setInterests] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'Tous' | 'Hebdomadaire' | 'Spécial' | 'Séminaire'>('Tous');

  const fetchInterests = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/programmes/interests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInterests(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch('/api/programmes')
      .then(res => res.json())
      .then(data => {
        setProgrammes(data);
        setLoading(false);
      });
    fetchInterests();
  }, [token]);

  const toggleInterest = async (id: number) => {
    if (!token) {
      window.location.hash = '#auth-choice';
      return;
    }

    const isInterested = interests.includes(id);
    const method = isInterested ? 'DELETE' : 'POST';
    try {
      const res = await fetch(`/api/programmes/${id}/interest`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchInterests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProgrammes = programmes.filter(p => filter === 'Tous' || p.type === filter);
  const weekly = filteredProgrammes.filter(p => p.type === 'Hebdomadaire');
  const special = filteredProgrammes.filter(p => p.type === 'Spécial' || p.type === 'Séminaire');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
          <Calendar className="text-church-gold" size={40} />
          <h2 className="text-4xl font-bold text-church-blue">Cultes et Programmes</h2>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          {(['Tous', 'Hebdomadaire', 'Spécial', 'Séminaire'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                filter === t ? "bg-white text-church-blue shadow-sm" : "text-gray-500 hover:text-church-blue"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Weekly Services */}
        <section>
          <h3 className="text-2xl font-bold text-church-blue mb-6 flex items-center gap-2">
            <Clock className="text-church-gold" size={24} /> Horaires Hebdomadaires
          </h3>
          <div className="space-y-4">
            {weekly.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-xl font-bold text-church-blue">{p.title}</h4>
                <p className="text-gray-500 text-sm mt-1">{p.description}</p>
                <div className="mt-4 flex items-center gap-4 text-sm font-bold text-church-gold">
                   <span>{formatTime(p.date_start)}</span>
                </div>
              </div>
            ))}
            {weekly.length === 0 && <p className="text-gray-400 italic">Aucun horaire hebdomadaire enregistré.</p>}
          </div>
        </section>

        {/* Special Programs */}
        <section>
          <h3 className="text-2xl font-bold text-church-blue mb-6 flex items-center gap-2">
            <PlusCircle className="text-church-gold" size={24} /> Programmes Spéciaux
          </h3>
          <div className="space-y-4">
            {special.map(p => (
              <div key={p.id} className="bg-church-blue text-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-bold text-church-gold">{p.title}</h4>
                  <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase">{p.type}</span>
                </div>
                <p className="text-white/70 text-sm mt-2">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-bold text-white/50">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(p.date_start)}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(p.date_start)}</span>
                  </div>
                  <button 
                    onClick={() => toggleInterest(p.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1",
                      interests.includes(p.id) 
                        ? "bg-church-gold text-church-blue" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    <Heart size={12} fill={interests.includes(p.id) ? "currentColor" : "none"} />
                    {interests.includes(p.id) ? "Je m'y intéresse" : "S'intéresser"}
                  </button>
                </div>
              </div>
            ))}
            {special.length === 0 && <p className="text-gray-400 italic">Aucun programme spécial prévu.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

const ProgramManagement = ({ token }: { token: string }) => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'Tous' | 'Hebdomadaire' | 'Spécial' | 'Séminaire'>('Tous');
  const [notifyingId, setNotifyingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string; type: 'success' | 'info' | 'danger' } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [type, setType] = useState<'Hebdomadaire' | 'Spécial' | 'Séminaire'>('Hebdomadaire');

  const fetchProgrammes = async () => {
    const res = await fetch('/api/programmes');
    const data = await res.json();
    setProgrammes(data);
  };

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/programmes/${editingId}` : '/api/programmes';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, date_start: dateStart, date_end: dateEnd, type })
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setDateStart('');
        setDateEnd('');
        setType('Hebdomadaire');
        setEditingId(null);
        fetchProgrammes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Programme) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setDateStart(p.date_start.slice(0, 16));
    setDateEnd(p.date_end.slice(0, 16));
    setType(p.type);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/programmes/${deleteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchProgrammes();
    setDeleteId(null);
  };

  const handleNotify = async (id: number) => {
    setNotifyingId(id);
    try {
      const res = await fetch(`/api/programmes/${id}/notify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAlertInfo({
        title: "Notification",
        message: data.message || data.error,
        type: res.ok ? 'success' : 'danger'
      });
    } catch (err) {
      setAlertInfo({
        title: "Erreur",
        message: 'Erreur lors de l\'envoi des notifications',
        type: 'danger'
      });
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le programme"
        message="Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible."
        confirmText="Supprimer"
      />
      <ConfirmationModal
        isOpen={alertInfo !== null}
        onClose={() => setAlertInfo(null)}
        onConfirm={() => setAlertInfo(null)}
        title={alertInfo?.title || ""}
        message={alertInfo?.message || ""}
        type={alertInfo?.type || 'info'}
        confirmText="OK"
        cancelText="Fermer"
      />
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h3 className="text-xl font-bold text-church-blue mb-6">{editingId ? 'Modifier le programme' : 'Ajouter un programme'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titre"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
              required
            />
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
            >
              <option value="Hebdomadaire">Hebdomadaire</option>
              <option value="Spécial">Spécial</option>
              <option value="Séminaire">Séminaire</option>
            </select>
          </div>
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Début</label>
              <input
                type="datetime-local"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Fin</label>
              <input
                type="datetime-local"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-church-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all"
            >
              {loading ? 'Traitement...' : editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setDescription('');
                  setDateStart('');
                  setDateEnd('');
                }}
                className="px-6 bg-gray-200 text-gray-600 rounded-xl font-bold"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-church-blue">Liste des programmes</h3>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-church-blue"
          >
            <option value="Tous">Tous les types</option>
            <option value="Hebdomadaire">Hebdomadaire</option>
            <option value="Spécial">Spécial</option>
            <option value="Séminaire">Séminaire</option>
          </select>
        </div>
        {programmes.filter(p => filter === 'Tous' || p.type === filter).map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
            <div>
              <h4 className="font-bold text-church-blue">{p.title} <span className="text-[10px] text-church-gold uppercase ml-2">{p.type}</span></h4>
              <p className="text-xs text-gray-400">{formatDateTime(p.date_start)}</p>
            </div>
            <div className="flex gap-2">
              {(p.type === 'Spécial' || p.type === 'Séminaire') && (
                <button 
                  onClick={() => handleNotify(p.id)} 
                  disabled={notifyingId === p.id}
                  className="p-2 text-church-gold hover:bg-church-gold/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Notifier les intéressés"
                >
                  <PlusCircle size={18} />
                </button>
              )}
              <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Settings size={18} /></button>
              <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoginForm = ({ onLogin }: { onLogin: (data: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-church-blue rounded-full flex items-center justify-center text-church-gold mx-auto mb-4">
            <UserIcon size={32} />
          </div>
          <h2 className="text-2xl font-bold text-church-blue">Espace Administration</h2>
          <p className="text-gray-500 text-sm mt-2">Connectez-vous pour gérer l'église</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-church-blue focus:border-transparent outline-none transition-all"
              placeholder="votre@email.cd"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-church-blue focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-church-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Accès réservé aux gestionnaires et techniciens du Centre Missionnaire Rehoboth.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const UserProfile = ({ user, token, onUpdateUser }: { user: User; token: string; onUpdateUser: (user: User) => void }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestedRole, setRequestedRole] = useState<Role>(user.role);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        onUpdateUser({ ...user, name, email });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestedRole === user.role) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/user/role-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestedRole })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        if (data.immediate) {
          onUpdateUser({ ...user, role: requestedRole });
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la demande de changement de rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-church-blue p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-church-gold rounded-full flex items-center justify-center text-church-blue text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-church-gold text-sm font-medium uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertTriangle size={18} /> {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium flex items-center gap-2">
              <CheckCircle2 size={18} /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Personal Info */}
            <section>
              <h3 className="text-lg font-bold text-church-blue mb-6 flex items-center gap-2">
                <UserIcon size={20} className="text-church-gold" /> Informations Personnelles
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nom Complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-church-blue text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </button>
              </form>
            </section>

            {/* Role Change Request - Only for Technicien as requested */}
            {user.role === 'Technicien' && (
              <section>
                <h3 className="text-lg font-bold text-church-blue mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-church-gold" /> Changement de Rôle
                </h3>
                <form onSubmit={handleRoleRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nouveau Rôle Souhaité</label>
                    <select
                      value={requestedRole}
                      onChange={(e) => setRequestedRole(e.target.value as Role)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                    >
                      <option value="Visiteur">Visiteur (Immédiat)</option>
                      <option value="Administrateur">Administrateur (Approbation requise)</option>
                      <option value="Technicien">Technicien</option>
                      <option value="Pasteur">Pasteur (Approbation requise)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || requestedRole === user.role}
                    className="w-full bg-white border-2 border-church-blue text-church-blue py-3 rounded-xl font-bold hover:bg-church-blue hover:text-white transition-all disabled:opacity-50"
                  >
                    {loading ? 'Envoi...' : 'Demander le changement'}
                  </button>
                  <p className="text-[10px] text-gray-400 italic">
                    Note: Tout changement vers un rôle autre que 'Visiteur' doit être approuvé par le Pasteur.
                  </p>
                </form>
              </section>
            )}

            {/* Change Password */}
            <section>
              <h3 className="text-lg font-bold text-church-blue mb-6 flex items-center gap-2">
                <Lock size={20} className="text-church-gold" /> Sécurité du Compte
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-church-gold text-church-blue py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ user, token }: { user: User; token: string }) => {
  const [activeTab, setActiveTab] = useState<'finances' | 'history' | 'settings' | 'meditations' | 'search' | 'roles'>('finances');
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // User Creation State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Administrateur');
  const [userActionMessage, setUserActionMessage] = useState('');
  
  // Finance Form State
  const [type, setType] = useState('Dîme');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CDF' | 'USD'>('CDF');
  const [message, setMessage] = useState('');

  // Filter States
  const [filterType, setFilterType] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterDate, setFilterDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchFinances = async () => {
    try {
      const res = await fetch('/api/finances', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProgrammes = async () => {
    try {
      const res = await fetch('/api/programmes');
      const data = await res.json();
      setProgrammes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMeditations = async () => {
    try {
      const res = await fetch('/api/meditations');
      const data = await res.json();
      setMeditations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoleRequests = async () => {
    if (user.role !== 'Pasteur') return;
    try {
      const res = await fetch('/api/admin/role-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRoleRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    if (user.role !== 'Pasteur') return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveRole = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/role-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRoleRequests();
        fetchAllUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRole = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/role-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRoleRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: Role) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        fetchAllUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUserActionMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUserActionMessage('Succès : Utilisateur créé');
        fetchAllUsers();
        setTimeout(() => {
          setIsUserModalOpen(false);
          setNewUserName('');
          setNewUserEmail('');
          setNewUserPassword('');
          setUserActionMessage('');
        }, 1500);
      } else {
        setUserActionMessage(`Erreur : ${data.error}`);
      }
    } catch (err) {
      setUserActionMessage('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesType = filterType === 'Tous' || entry.type === filterType;
    const matchesStatus = filterStatus === 'Tous' || entry.status === filterStatus;
    const matchesDate = !filterDate || new Date(entry.date).toLocaleDateString() === new Date(filterDate).toLocaleDateString();
    return matchesType && matchesStatus && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filterType, filterStatus, filterDate]);

  useEffect(() => {
    fetchFinances();
    fetchProgrammes();
    fetchMeditations();
    if (user.role === 'Pasteur') {
      fetchRoleRequests();
      fetchAllUsers();
    }
  }, []);

  const searchResults = {
    finances: entries.filter(e => 
      e.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.amount.toString().includes(searchQuery) ||
      e.status.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    programmes: programmes.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    meditations: meditations.filter(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  const hasResults = searchResults.finances.length > 0 || searchResults.programmes.length > 0 || searchResults.meditations.length > 0;

  const handleRecordFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, amount: parseFloat(amount), currency, date: new Date().toISOString() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Succès ! Transaction enregistrée.');
        setAmount('');
        fetchFinances();
      } else {
        setMessage(data.error || 'Erreur');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Global Search Bar */}
      <div className="mb-8 relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-church-blue transition-colors" size={20} />
          <input
            type="text"
            placeholder="Rechercher un programme, une transaction, ou une méditation..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length > 0) setActiveTab('search');
              else if (activeTab === 'search') setActiveTab('finances');
            }}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-church-blue focus:border-transparent transition-all text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveTab('finances');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-church-blue"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="p-4 bg-church-blue text-white rounded-2xl mb-6">
            <p className="text-xs text-church-gold uppercase font-bold tracking-wider">Connecté en tant que</p>
            <h3 className="font-bold text-lg">{user.name}</h3>
            <span className="inline-block px-2 py-0.5 bg-church-gold text-church-blue text-[10px] font-black rounded mt-1">
              {user.role.toUpperCase()}
            </span>
          </div>
          
          <button 
            onClick={() => setActiveTab('finances')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              activeTab === 'finances' ? "bg-church-blue text-white" : "hover:bg-gray-100 text-gray-600"
            )}
          >
            <Wallet size={20} /> Finances
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              activeTab === 'history' ? "bg-church-blue text-white" : "hover:bg-gray-100 text-gray-600"
            )}
          >
            <History size={20} /> Historique
          </button>
          {user.role === 'Pasteur' && (
            <button 
              onClick={() => setActiveTab('meditations')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                activeTab === 'meditations' ? "bg-church-blue text-white" : "hover:bg-gray-100 text-gray-600"
              )}
            >
              <BookOpen size={20} /> Méditations
            </button>
          )}
          {user.role === 'Pasteur' && (
            <button 
              onClick={() => setActiveTab('roles')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                activeTab === 'roles' ? "bg-church-blue text-white" : "hover:bg-gray-100 text-gray-600"
              )}
            >
              <Users size={20} /> Rôles
            </button>
          )}
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              activeTab === 'settings' ? "bg-church-blue text-white" : "hover:bg-gray-100 text-gray-600"
            )}
          >
            <Settings size={20} /> Paramètres
          </button>
          {searchQuery && (
            <button 
              onClick={() => setActiveTab('search')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                activeTab === 'search' ? "bg-church-blue text-white" : "hover:bg-gray-100 text-gray-600"
              )}
            >
              <Search size={20} /> Résultats
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed font-medium">
            <LayoutDashboard size={20} /> Ressources (Bientôt)
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'roles' ? (
              <motion.div
                key="roles"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Role Requests */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="text-church-gold" size={24} />
                    <h2 className="text-xl font-bold text-church-blue">Demandes de changement de rôle</h2>
                  </div>
                  
                  {roleRequests.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8 italic">Aucune demande en attente.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                          <tr>
                            <th className="px-4 py-2">Utilisateur</th>
                            <th className="px-4 py-2">Rôle Actuel</th>
                            <th className="px-4 py-2">Rôle Demandé</th>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                          {roleRequests.map(req => (
                            <tr key={req.id}>
                              <td className="px-4 py-3">
                                <div className="font-medium text-church-blue">{req.user_name}</div>
                                <div className="text-xs text-gray-400">{req.user_email}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                                  {req.current_role}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-church-gold/20 text-church-gold rounded text-[10px] font-bold uppercase">
                                  {req.requested_role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-400">{formatDate(req.created_at)}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleApproveRole(req.id)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approuver"
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleRejectRole(req.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Refuser"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* All Users */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Users className="text-church-gold" size={24} />
                      <h2 className="text-xl font-bold text-church-blue">Gestion du Personnel (Admin/Tech)</h2>
                    </div>
                    <button 
                      onClick={() => setIsUserModalOpen(true)}
                      className="flex items-center gap-2 bg-church-blue text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all"
                    >
                      <PlusCircle size={18} /> Créer un utilisateur
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                        <tr>
                          <th className="px-4 py-2">Utilisateur</th>
                          <th className="px-4 py-2">Rôle Actuel</th>
                          <th className="px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-50">
                        {allUsers.filter(u => u.role === 'Administrateur' || u.role === 'Technicien' || u.role === 'Pasteur').map(u => (
                          <tr key={u.id}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-church-blue">{u.name}</div>
                              <div className="text-xs text-gray-400">{u.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                u.role === 'Pasteur' ? "bg-church-blue text-white" : "bg-gray-100 text-gray-600"
                              )}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {u.role !== 'Pasteur' ? (
                                <button 
                                  onClick={() => handleUpdateUserRole(u.id, 'Visiteur')}
                                  className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1"
                                >
                                  <X size={12} /> Réinitialiser
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Rôle protégé</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <Modal 
                  isOpen={isUserModalOpen} 
                  onClose={() => {
                    setIsUserModalOpen(false);
                    setUserActionMessage('');
                  }} 
                  title="Créer un nouvel utilisateur"
                >
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nom Complet</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                        placeholder="Ex: Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Email</label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                        placeholder="email@rehoboth.cd"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Mot de passe</label>
                      <input
                        type="password"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Rôle</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as Role)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-blue transition-all"
                      >
                        <option value="Administrateur">Administrateur (Max 1)</option>
                        <option value="Technicien">Technicien (Max 1)</option>
                      </select>
                    </div>

                    {userActionMessage && (
                      <p className={cn(
                        "text-sm font-medium p-3 rounded-lg text-center",
                        userActionMessage.includes('Succès') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {userActionMessage}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserModalOpen(false);
                          setUserActionMessage('');
                        }}
                        className="flex-1 px-4 py-4 rounded-xl font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-church-blue text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Création...' : 'Créer l\'utilisateur'}
                      </button>
                    </div>
                  </form>
                </Modal>
              </motion.div>
            ) : activeTab === 'finances' ? (
              <motion.div
                key="finances"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <PlusCircle className="text-church-gold" size={28} />
                  <h2 className="text-2xl font-bold text-church-blue">Enregistrer une entrée</h2>
                </div>

                {user.role !== 'Pasteur' ? (
                  <form onSubmit={handleRecordFinance} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type d'entrée</label>
                        <select 
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-church-blue outline-none"
                        >
                          <option>Dîme</option>
                          <option>Offrandes normales</option>
                          <option>Dons</option>
                          <option>Offrandes spéciales</option>
                          <option>Offrandes Ecodim</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-church-blue outline-none"
                            placeholder="0.00"
                          />
                          <div className="absolute right-2 top-2 bottom-2 flex gap-1">
                            <button 
                              type="button"
                              onClick={() => setCurrency('CDF')}
                              className={cn("px-3 rounded-lg text-xs font-bold transition-all", currency === 'CDF' ? "bg-church-blue text-white" : "bg-gray-100 text-gray-500")}
                            >
                              CDF
                            </button>
                            <button 
                              type="button"
                              onClick={() => setCurrency('USD')}
                              className={cn("px-3 rounded-lg text-xs font-bold transition-all", currency === 'USD' ? "bg-church-blue text-white" : "bg-gray-100 text-gray-500")}
                            >
                              USD
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      {message && (
                        <p className={cn("text-sm font-medium mb-4 p-3 rounded-lg text-center", message.includes('Succès') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                          {message}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-church-blue text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Traitement...' : <><PlusCircle size={20} /> Valider l'entrée</>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 italic">Le Pasteur peut consulter les finances mais l'enregistrement est réservé aux Administrateurs et Techniciens.</p>
                  </div>
                )}

                <div className="mt-12">
                  <h3 className="text-lg font-bold text-church-blue mb-4">Dernières transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Type</th>
                          <th className="px-4 py-3">Montant</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 rounded-r-lg">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-100">
                        {entries.slice(0, 5).map((entry) => (
                          <tr key={entry.id}>
                            <td className="px-4 py-3 font-medium">{entry.type}</td>
                            <td className="px-4 py-3 font-bold">
                              {entry.amount.toLocaleString()} <span className="text-xs text-gray-400">{entry.currency}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {formatDate(entry.date)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                                {entry.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'meditations' ? (
              <motion.div
                key="meditations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-church-blue mb-6">Espace Pasteur : Méditations</h2>
                <MeditationManagement token={token} />
              </motion.div>
            ) : activeTab === 'settings' ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-church-blue mb-6">Paramètres de l'Église</h2>
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-bold text-church-gold mb-4 uppercase tracking-wider">Gestion des Programmes</h3>
                    <ProgramManagement token={token} />
                  </section>
                </div>
              </motion.div>
            ) : activeTab === 'search' ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-church-blue mb-2">Résultats de recherche</h2>
                  <p className="text-gray-400 text-sm">Mots-clés : <span className="text-church-blue font-bold">"{searchQuery}"</span></p>
                </div>

                {!hasResults ? (
                  <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <Search className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Aucun résultat trouvé pour votre recherche.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {searchResults.programmes.length > 0 && (
                      <section>
                        <h3 className="text-lg font-bold text-church-blue mb-4 flex items-center gap-2">
                          <Calendar className="text-church-gold" size={20} /> Programmes ({searchResults.programmes.length})
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {searchResults.programmes.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                              <div>
                                <h4 className="font-bold text-church-blue">{p.title}</h4>
                                <p className="text-xs text-gray-400">{formatDateTime(p.date_start)}</p>
                              </div>
                              <button 
                                onClick={() => setActiveTab('settings')}
                                className="text-xs text-church-blue font-bold hover:underline"
                              >
                                Gérer
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {searchResults.finances.length > 0 && (
                      <section>
                        <h3 className="text-lg font-bold text-church-blue mb-4 flex items-center gap-2">
                          <Wallet className="text-church-gold" size={20} /> Transactions ({searchResults.finances.length})
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                              <tr>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Montant</th>
                                <th className="px-4 py-2">Action</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                              {searchResults.finances.map(f => (
                                <tr key={f.id}>
                                  <td className="px-4 py-3 font-medium">{f.type}</td>
                                  <td className="px-4 py-3 font-bold">{f.amount.toLocaleString()} {f.currency}</td>
                                  <td className="px-4 py-3">
                                    <button 
                                      onClick={() => setActiveTab('history')}
                                      className="text-[10px] text-church-blue font-bold hover:underline"
                                    >
                                      Voir
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}

                    {searchResults.meditations.length > 0 && (
                      <section>
                        <h3 className="text-lg font-bold text-church-blue mb-4 flex items-center gap-2">
                          <BookOpen className="text-church-gold" size={20} /> Méditations ({searchResults.meditations.length})
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {searchResults.meditations.map(m => (
                            <div key={m.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                              <div>
                                <h4 className="font-bold text-church-blue">{m.title}</h4>
                                <p className="text-xs text-gray-400">Par {m.author} • {formatDate(m.date)}</p>
                              </div>
                              <button 
                                onClick={() => setActiveTab('meditations')}
                                className="text-xs text-church-blue font-bold hover:underline"
                              >
                                Gérer
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <h2 className="text-2xl font-bold text-church-blue">Transactions Financières</h2>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-church-blue"
                    >
                      <option>Tous</option>
                      <option>Dîme</option>
                      <option>Offrandes normales</option>
                      <option>Dons</option>
                      <option>Offrandes spéciales</option>
                      <option>Offrandes Ecodim</option>
                    </select>

                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-church-blue"
                    >
                      <option>Tous</option>
                      <option>En attente</option>
                      <option>Validé</option>
                      <option>Rejeté</option>
                    </select>

                    <input 
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-church-blue"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                        <th className="pb-4 px-2">Type</th>
                        <th className="pb-4 px-2">Montant</th>
                        <th className="pb-4 px-2">Date</th>
                        <th className="pb-4 px-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2">
                            <p className="font-bold text-church-blue text-sm">{entry.type}</p>
                          </td>
                          <td className="py-4 px-2">
                            <p className="font-black text-church-blue">
                              {entry.amount.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">{entry.currency}</span>
                            </p>
                          </td>
                          <td className="py-4 px-2">
                            <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
                            <p className="text-[10px] text-gray-300">{formatTime(entry.date)}</p>
                          </td>
                          <td className="py-4 px-2">
                            <span className={cn(
                              "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter",
                              entry.status === 'Validé' ? "bg-green-100 text-green-700" :
                              entry.status === 'Rejeté' ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            )}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredEntries.length > 0 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                      <p className="text-xs text-gray-400">
                        Affichage de <span className="font-bold text-church-blue">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-bold text-church-blue">{Math.min(currentPage * itemsPerPage, filteredEntries.length)}</span> sur <span className="font-bold text-church-blue">{filteredEntries.length}</span> transactions
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                          Précédent
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={cn(
                              "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                              currentPage === i + 1 ? "bg-church-blue text-white shadow-md" : "border border-gray-100 text-gray-400 hover:bg-gray-50"
                            )}
                          >
                            {i + 1}
                          </button>
                        )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {filteredEntries.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-sm">Aucune transaction trouvée avec ces filtres.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="space-y-0">
      {/* Hero / Banner */}
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-church-blue/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Church"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-20 px-4 max-w-4xl">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-church-gold font-bold tracking-[0.3em] uppercase mb-4"
          >
            Repentance • Sanctification • Crainte de Dieu
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black mb-6"
          >
            Centre Missionnaire Rehoboth
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 inline-block"
          >
            <p className="text-sm italic">"Car maintenant l'Éternel nous a mis au large, et nous prospérerons dans le pays."</p>
            <p className="text-xs font-bold mt-1 text-church-gold">Genèse 26:22 (Appel Divin)</p>
          </motion.div>
        </div>
      </section>

      {/* Scrolling Info Marquee */}
      <div className="bg-church-gold/10 border-y border-church-gold/20 py-3 marquee-container">
        <div className="animate-marquee inline-block">
          <span className="text-church-blue font-bold text-sm mx-8">
            <span className="text-church-gold uppercase tracking-widest mr-2">Thème de l'année :</span> 
            La Gloire de la Restauration
          </span>
          <span className="text-church-blue font-bold text-sm mx-8">
            <span className="text-church-gold uppercase tracking-widest mr-2">Pensée du mois :</span> 
            La Fidélité de Dieu
          </span>
          {/* Duplicate for seamless loop if needed, but simple marquee is fine for now */}
          <span className="text-church-blue font-bold text-sm mx-8">
            <span className="text-church-gold uppercase tracking-widest mr-2">Thème de l'année :</span> 
            La Gloire de la Restauration
          </span>
          <span className="text-church-blue font-bold text-sm mx-8">
            <span className="text-church-gold uppercase tracking-widest mr-2">Pensée du mois :</span> 
            La Fidélité de Dieu
          </span>
        </div>
      </div>

      {/* Special Program Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-church-blue rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch">
            <div className="md:w-1/2 relative min-h-[300px]">
              <img 
                src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000" 
                alt="Mains levées en prière" 
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-church-blue/60 to-transparent md:bg-gradient-to-l" />
            </div>
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white">
              <div className="inline-block px-4 py-1 bg-church-gold text-church-blue text-xs font-black uppercase tracking-widest rounded-full mb-6">
                Événement Spécial
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-4">Prière des Familles</h3>
              <p className="text-white/70 mb-8 leading-relaxed">
                Rejoignez-nous pour un moment exceptionnel d'intercession et de bénédiction pour tous les foyers. Un temps de restauration et de grâce divine pour votre famille.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Calendar className="text-church-gold" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-church-gold font-bold mb-1">Période</p>
                    <p className="text-sm font-bold">15 Mai - 17 Juin 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Clock className="text-church-gold" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-church-gold font-bold mb-1">Horaire</p>
                    <p className="text-sm font-bold">Mer. & Ven. | 17h - 19h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <section id="info" className="py-16 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-church-blue border-l-4 border-church-gold pl-4">Notre Confession</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            « Nous croyons en Dieu le Père Tout-Puissant, en Jésus-Christ son Fils unique, au Saint-Esprit gage de notre salut. Nous croyons au pardon par le sang de Jésus, à la rémission des péchés, à la résurrection des morts et à la vie éternelle »
          </p>
        </div>
        <div className="bg-church-blue text-white p-8 rounded-3xl shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-church-gold">Programmes</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-white/10 pb-2">
              <span>Dimanche (Culte)</span>
              <span className="font-bold">08:30 - 12:00</span>
            </li>
            <li className="flex justify-between border-b border-white/10 pb-2">
              <span>Mercredi (Enseignement)</span>
              <span className="font-bold">17:00 - 19:00</span>
            </li>
            <li className="flex justify-between border-b border-white/10 pb-2">
              <span>Vendredi (Prière)</span>
              <span className="font-bold">17:00 - 19:00</span>
            </li>
          </ul>
          <div className="mt-6 p-3 bg-white/5 rounded-lg">
            <p className="text-[10px] uppercase font-bold text-church-gold mb-1">Entretien Pastoral</p>
            <p className="text-xs">Mardi, Jeudi, Samedi : 09h - 13h</p>
          </div>
        </div>
        <div id="contact" className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-church-blue border-l-4 border-church-gold pl-4">Contact & Adresse</h3>
          <p className="text-gray-600 text-sm mb-4">
            Avenue du fleuve n°2, Kinsuka Pêcheur, Commune Ngaliema, Kinshasa/RDC
          </p>
        </div>
      </section>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'auth-choice' | 'login' | 'register' | 'admin' | 'programmes' | 'meditations' | 'profile'>('home');

  useEffect(() => {
    // Scroll to hash element if it exists
    const hash = window.location.hash;
    if (hash && hash.startsWith('#') && hash.length > 1) {
      const id = hash.substring(1);
      // Wait a bit for the view to render
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  useEffect(() => {
    const savedToken = localStorage.getItem('rehoboth_token');
    const savedUser = localStorage.getItem('rehoboth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setView('admin');
    }

    // Handle hash navigation
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#auth-choice') setView('auth-choice');
      else if (hash === '#login') setView('login');
      else if (hash === '#register') setView('register');
      else if (hash === '#admin') setView('admin');
      else if (hash === '#programmes') setView('programmes');
      else if (hash === '#meditations') setView('meditations');
      else if (hash === '#profile') setView('profile');
      else if (hash === '#admin-settings') {
        if (savedToken) setView('admin'); // Will default to admin view, user can switch to settings
        else setView('login');
      }
      else setView('home');
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleAuthSuccess = (data: { token: string; user: User }) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('rehoboth_token', data.token);
    localStorage.setItem('rehoboth_user', JSON.stringify(data.user));
    
    // Redirect based on role
    if (data.user.role === 'Administrateur' || data.user.role === 'Technicien') {
      setView('admin');
      window.location.hash = '#admin';
    } else {
      setView('home');
      window.location.hash = '';
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rehoboth_token');
    localStorage.removeItem('rehoboth_user');
    setView('home');
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={handleLogout} currentView={view} />
      
      <main className="flex-grow">
        {view === 'home' && <Home />}
        {view === 'programmes' && <ProgrammesView token={token} />}
        {view === 'meditations' && <MeditationsView />}
        {view === 'profile' && user && token && <UserProfile user={user} token={token} onUpdateUser={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('rehoboth_user', JSON.stringify(updatedUser));
        }} />}
        {view === 'auth-choice' && !user && <AuthChoice />}
        {view === 'login' && !user && <LoginForm onLogin={handleAuthSuccess} />}
        {view === 'register' && !user && <RegisterForm onRegister={handleAuthSuccess} />}
        {view === 'admin' && user && token && <AdminDashboard user={user} token={token} />}
        {view === 'admin' && !user && <LoginForm onLogin={handleAuthSuccess} />}
      </main>

      <footer className="bg-church-blue text-white py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Centre Missionnaire Rehoboth</h2>
            <p className="text-church-gold text-sm font-medium">Repentance - Sanctification - Crainte de Dieu</p>
          </div>
          <div className="md:text-right text-xs text-gray-400">
            <p>© 2024 Centre Missionnaire Rehoboth. Tous droits réservés.</p>
            <p className="mt-1">Kinshasa, République Démocratique du Congo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
