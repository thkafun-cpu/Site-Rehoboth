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
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---
type Role = 'Visiteur' | 'Gestionnaire' | 'Technicien';

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

// --- Components ---

const Navbar = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Accueil', href: '#' },
    { name: 'Cultes', href: '#' },
    { name: 'Événements', href: '#' },
    { name: 'Croissons en Jésus', href: '#' },
    { name: 'Administration', href: '#admin', protected: true },
    { name: 'Paramètres', href: '#settings', protected: true },
  ];

  return (
    <nav className="sticky-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-church-gold rounded-full flex items-center justify-center text-church-blue font-bold text-xl">
              R
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold leading-tight">Rehoboth</h1>
              <p className="text-[10px] uppercase tracking-widest text-church-gold">Centre Missionnaire</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium hover:text-church-gold transition-colors"
              >
                {item.name}
              </a>
            ))}
            {user ? (
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 bg-church-gold text-church-blue px-4 py-1.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all"
              >
                <LogOut size={16} /> Quitter
              </button>
            ) : (
              <a 
                href="#auth-choice"
                className="bg-church-gold text-church-blue px-6 py-1.5 rounded-full text-sm font-bold hover:bg-opacity-90 transition-all"
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
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/10"
                >
                  {item.name}
                </a>
              ))}
              {user && (
                <button
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-church-gold"
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

const AdminDashboard = ({ user, token }: { user: User; token: string }) => {
  const [activeTab, setActiveTab] = useState<'finances' | 'history'>('finances');
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Finance Form State
  const [type, setType] = useState('Dîme');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CDF' | 'USD'>('CDF');
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchFinances();
  }, []);

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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed font-medium">
            <LayoutDashboard size={20} /> Ressources (Bientôt)
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed font-medium">
            <Settings size={20} /> Paramètres
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'finances' ? (
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
                              {new Date(entry.date).toLocaleDateString()}
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
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-church-blue mb-6">Historique Complet</h2>
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-bold text-church-blue">{entry.type}</p>
                        <p className="text-xs text-gray-400">{new Date(entry.date).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">
                          {entry.amount.toLocaleString()} <span className="text-xs font-normal text-gray-500">{entry.currency}</span>
                        </p>
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Validé</span>
                      </div>
                    </div>
                  ))}
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

      {/* Info Sections */}
      <section className="py-16 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-church-blue border-l-4 border-church-gold pl-4">Contact & Adresse</h3>
          <p className="text-gray-600 text-sm mb-4">
            Avenue du fleuve n°2, Kinsuka Pêcheur, Commune Ngaliema, Kinshasa/RDC
          </p>
          <div className="space-y-2">
            <p className="text-xs font-bold text-church-blue">Thème de l'année : <span className="text-church-gold">La Gloire de la Restauration</span></p>
            <p className="text-xs font-bold text-church-blue">Pensée du mois : <span className="text-church-gold">La Fidélité de Dieu</span></p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'auth-choice' | 'login' | 'register' | 'admin'>('home');

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
    if (data.user.role === 'Gestionnaire' || data.user.role === 'Technicien') {
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
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="flex-grow">
        {view === 'home' && <Home />}
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
