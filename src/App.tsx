import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  Plus, Trash2, FileText, Car, Search,
  Save, ArrowLeft, Loader2, LogOut, Lock,
  TrendingUp, CheckCircle2, X, Edit2, Eye,
  Users, DollarSign, BarChart3, PieChart, Activity,
   Download, AlertCircle, Package, 
  Cpu, Terminal, Zap,  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { FileDown } from "lucide-react";

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, getDocs,
  doc, updateDoc, deleteDoc, query, orderBy,
  Timestamp
} from 'firebase/firestore';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from 'firebase/auth';
import type { User } from 'firebase/auth';

// --- TYPES ---
interface ItemCotizacion {
  id: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  categoria: string;
}

interface CotizacionData {
  id_firebase?: string;
  cliente: string;
  rutCliente: string;
  emailCliente?: string;
  telefonoCliente?: string;
  vehiculo: string;
  anioVehiculo: string;
  patente: string;
  tipoVehiculo: string;
  fecha: string;
  numeroCotizacion: string;
  items: ItemCotizacion[];
  notas: string;
  totalFinal: number;
  estado: string;
  fechaCreacion?: any;
  ultimaModificacion?: any;
}

interface ClienteData {
  id_firebase?: string;
  nombre?: string;
  rut?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: any;
}

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyDqRdkRJzgg8jDFioiffwTkTr3HY01_N00",
  authDomain: "cotizacion-lionscars.firebaseapp.com",
  projectId: "cotizacion-lionscars",
  storageBucket: "cotizacion-lionscars.firebasestorage.app",
  messagingSenderId: "663100185995",
  appId: "1:663100185995:web:1d537b8af3af745597638e",
  measurementId: "G-9XJC46T29R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// --- UI COMPONENTS ---
const GlassCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={itemVariants}
    className={`bg-neutral-900/40 backdrop-blur-xl border border-red-900/30 shadow-2xl relative overflow-hidden group ${className}`}
    style={{ borderRadius: '16px 4px 16px 4px' }}
  >
    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-600/50 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-600/50 rounded-br-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

interface NeonButtonProps {
  onClick: (e?: any) => void;
  icon?: any;
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  className?: string;
}

const NeonButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false, className = "" }: NeonButtonProps) => {
  const variants = {
    primary: "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/50 hover:bg-red-500",
    secondary: "bg-neutral-900/80 text-red-500 border border-red-900 hover:text-red-400 hover:border-red-500 hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:bg-neutral-800",
    success: "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)] border border-emerald-400/50 hover:bg-emerald-500",
    danger: "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] border border-rose-400/50 hover:bg-rose-500"
  };
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group px-4 py-2.5 sm:px-6 sm:py-3 font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
    >
      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out pointer-events-none skew-x-12" />
      <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
        {Icon && <Icon size={14} />}
        {label}
      </span>
    </motion.button>
  );
};

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`w-full ${sizes[size]} my-4 relative pointer-events-auto`}
            >
              <div className="bg-neutral-950 border border-red-900/50 shadow-[0_0_40px_rgba(220,38,38,0.15)] relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900" />
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-red-900/30 bg-black/50">
                  <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-red-500" />
                    <h2 className="text-base sm:text-xl font-black text-white tracking-widest uppercase">{title}</h2>
                  </div>
                  <button onClick={onClose} className="p-2 bg-neutral-900/80 hover:bg-red-600 transition-colors text-red-500 hover:text-white border border-red-900/50">
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
                <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto bg-[#0a0a0a]">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- STATS CARD ---
interface StatsCardProps {
  icon: any;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  color?: 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'silver';
}

const StatsCard = ({ icon: Icon, label, value, trend, color = 'red' }: StatsCardProps) => {
  const colorStyles = {
    red: 'text-red-500 border-red-900/50',
    blue: 'text-blue-500 border-blue-900/50',
    green: 'text-emerald-500 border-emerald-900/50',
    purple: 'text-purple-500 border-purple-900/50',
    orange: 'text-orange-500 border-orange-900/50',
    silver: 'text-neutral-400 border-neutral-700'
  };
  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <p className="text-red-500/80 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 sm:mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
            <span className="truncate">{label}</span>
          </p>
          <h3 className="text-xl sm:text-3xl font-black text-white font-mono tracking-tighter">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${trend.positive ? 'text-emerald-500' : 'text-red-500'}`}>
              <TrendingUp size={12} className={trend.positive ? '' : 'rotate-180'} />
              {trend.value}% vs mes ant.
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 90, scale: 1.2 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className={`bg-black/50 p-2 sm:p-3 rounded-lg border ml-3 shrink-0 ${colorStyles[color]}`}
        >
          <Icon size={18} className="sm:w-6 sm:h-6" />
        </motion.div>
      </div>
    </GlassCard>
  );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      onLogin();
    } catch (err) {
      setError("ACCESO DENEGADO — CÓDIGO 401");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[150px] pointer-events-none" />

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, type: "spring" }} className="w-full max-w-sm relative z-10">
        <div className="bg-black/60 backdrop-blur-2xl border border-red-900/40 p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.1)]" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
          <div className="text-center mb-8">
            <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-4 relative flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-[2px] border-red-600/30 rounded-full border-dashed" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-2 border-[1px] border-red-500/20 rounded-full border-dotted" />
              <img src="EDM.LOGO_OFFICIAL.png" alt="EDM" className="w-[80%] h-[80%] object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] relative z-10"
                onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
              <Car size={32} className="text-red-500 absolute hidden" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">
              <span className="text-white">EDM</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">AUTOMOTRIZ</span>
            </h1>
            <p className="text-[9px] text-red-500 font-black tracking-[0.4em] uppercase font-mono mt-1">Terminal de Acceso</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[9px] text-red-500/80 font-mono uppercase tracking-widest block mb-1">Email</label>
              <div className="flex items-center gap-2 bg-black/80 border border-neutral-800 p-3 focus-within:border-red-500 focus-within:shadow-[0_0_10px_rgba(220,38,38,0.2)] transition-all">
                <Terminal size={14} className="text-red-600/50 shrink-0" />
                <input type="email" placeholder="admin@edm.cl" className="bg-transparent w-full text-white text-sm font-mono tracking-wider placeholder-neutral-700 outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-[9px] text-red-500/80 font-mono uppercase tracking-widest block mb-1">Contraseña</label>
              <div className="flex items-center gap-2 bg-black/80 border border-neutral-800 p-3 focus-within:border-red-500 focus-within:shadow-[0_0_10px_rgba(220,38,38,0.2)] transition-all">
                <Lock size={14} className="text-red-600/50 shrink-0" />
                <input type="password" placeholder="••••••••" className="bg-transparent w-full text-white text-sm font-mono tracking-wider placeholder-neutral-700 outline-none" value={pass} onChange={e => setPass(e.target.value)} required />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-[10px] font-mono text-center bg-red-950/30 p-3 border-l-2 border-red-500 flex items-center gap-2">
                  <AlertCircle size={12} className="animate-pulse shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full relative overflow-hidden bg-red-600 text-white font-black py-3.5 flex justify-center items-center gap-2 disabled:opacity-50 tracking-[0.2em] text-xs uppercase"
              style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-800 opacity-100 hover:opacity-0 transition-opacity" />
              <span className="relative z-10 flex items-center gap-2 font-mono">
                {loading ? <><Cpu className="animate-spin" size={14} /> PROCESANDO...</> : <><Zap size={14} /> INICIAR SESIÓN</>}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// =============================================================================
// MAIN APP
// =============================================================================
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [vista, setVista] = useState<'dashboard' | 'editor' | 'clientes' | 'analytics'>('dashboard');
  const [historial, setHistorial] = useState<CotizacionData[]>([]);
  const [clientes, setClientes] = useState<ClienteData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modales
  const [modalDetalle, setModalDetalle] = useState<{ isOpen: boolean; cotizacion?: CotizacionData }>({ isOpen: false });
  const [modalExportar, setModalExportar] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const empresa = useMemo(() => ({
    rut: '78.161.408-4',
    direccion: 'Av. Gabriela Mistral 925, Alerce',
    telefono: '+56 9 4037 3364',
    web: 'edmautomotriz.cl',
    nombre: 'EDM Automotriz'
  }), []);

  // Form state
  const [idFirebase, setIdFirebase] = useState<string | null>(null);
  const [cliente, setCliente] = useState('');
  const [rutCliente, setRutCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [anioVehiculo, setAnioVehiculo] = useState('');
  const [patente, setPatente] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('auto');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [numeroCotizacion, setNumeroCotizacion] = useState('EDM-0001');
  const [notas, setNotas] = useState('Garantía de pintura: 1 año. Garantía desabolladura: 3 meses. Validez cotización: 10 días hábiles.');
  const [items, setItems] = useState<ItemCotizacion[]>([{ id: crypto.randomUUID(), descripcion: '', precio: 0, cantidad: 1, categoria: 'desabolladura' }]);
  const [estadoCotizacion, setEstadoCotizacion] = useState('pendiente');

  // ===== GENERAR HTML PDF - acepta datos externos =====
  const generarHTMLPDF = useCallback((datos?: CotizacionData) => {
    const fmtLocal = (n: number) =>
      new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(n);

    // Usar datos pasados como parámetro o caer en los estados del form
    const _items           = datos?.items           ?? items;
    const _cliente         = datos?.cliente         ?? cliente;
    const _rutCliente      = datos?.rutCliente      ?? rutCliente;
    const _telefonoCliente = datos?.telefonoCliente ?? telefonoCliente;
    const _vehiculo        = datos?.vehiculo        ?? vehiculo;
    const _patente         = datos?.patente         ?? patente;
    const _anioVehiculo    = datos?.anioVehiculo    ?? anioVehiculo;
    const _notas           = datos?.notas           ?? notas;
    const _numeroCotizacion = datos?.numeroCotizacion ?? numeroCotizacion;
    const _fecha           = datos?.fecha           ?? fecha;
    const _estadoCotizacion = datos?.estado         ?? estadoCotizacion;

    const sub   = _items.reduce((a, i) => a + i.precio * i.cantidad, 0);
    const iva   = Math.round(sub * 0.19);
    const total = Math.round(sub * 1.19);

    const filas = _items.map(item => `
      <tr>
        <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#111">${item.descripcion || '-'}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;text-align:center;text-transform:capitalize">${item.categoria}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;font-family:monospace;text-align:center;color:#111">${fmtLocal(item.precio)}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;font-family:monospace;text-align:center;color:#111">${item.cantidad}</td>
        <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;font-family:monospace;text-align:right;font-weight:700;color:#dc2626">${fmtLocal(item.precio * item.cantidad)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family:Arial,sans-serif;background:white;color:#111;width:794px;padding:48px 52px;box-sizing:border-box;">
        <style>
          *{box-sizing:border-box;}
          .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:2px solid #dc2626;margin-bottom:28px;}
          .cn{font-size:26px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;}
          .cn span{color:#dc2626;}
          .cs{font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#6b7280;margin-top:4px;}
          .cd{margin-top:10px;font-size:10px;color:#6b7280;line-height:1.8;font-family:monospace;}
          .cd b{color:#111;}
          .dt{font-size:34px;font-weight:900;text-transform:uppercase;color:#1f2937;letter-spacing:-1px;margin-bottom:14px;}
          .dr{display:flex;justify-content:space-between;gap:20px;font-size:10px;font-family:monospace;color:#6b7280;margin-bottom:5px;}
          .dr b{color:#111;}
          .sb{display:inline-block;padding:2px 10px;background:#fee2e2;color:#dc2626;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:2px;border:1px solid #fca5a5;}
          .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;}
          .card{border:1px solid #e5e7eb;padding:18px;background:#fafafa;}
          .ct{font-size:9px;font-family:monospace;text-transform:uppercase;letter-spacing:3px;color:#6b7280;margin-bottom:12px;}
          .fl{font-size:8px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;margin-bottom:3px;}
          .fv{font-size:13px;font-weight:700;color:#111;border-bottom:1px solid #e5e7eb;padding-bottom:5px;margin-bottom:10px;min-height:24px;}
          .fg2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
          table{width:100%;border-collapse:collapse;margin-bottom:24px;}
          thead{background:#f9fafb;}
          th{padding:10px 14px;font-size:9px;font-family:monospace;text-transform:uppercase;letter-spacing:2px;color:#6b7280;border-bottom:2px solid #e5e7eb;font-weight:700;text-align:left;}
          .tr{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;}
          .nb{flex:1;border:1px solid #e5e7eb;padding:14px;font-size:11px;color:#374151;line-height:1.7;background:#fafafa;white-space:pre-wrap;}
          .tb{width:260px;border:1px solid #e5e7eb;padding:18px;background:#fafafa;flex-shrink:0;}
          .tl{display:flex;justify-content:space-between;font-size:11px;font-family:monospace;color:#6b7280;margin-bottom:7px;}
          .tl b{color:#111;}
          .td{border:none;border-top:1px solid #e5e7eb;margin:10px 0;}
          .tfl{font-size:9px;font-family:monospace;text-transform:uppercase;letter-spacing:3px;color:#dc2626;text-align:right;margin-bottom:3px;}
          .tfv{font-size:30px;font-weight:900;font-family:monospace;text-align:right;color:#111;letter-spacing:-1px;}
          .ft{margin-top:36px;padding-top:14px;border-top:1px solid #e5e7eb;text-align:center;}
          .fb{width:36px;height:3px;background:#dc2626;margin:0 auto 8px;}
          .fn{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:4px;color:#374151;}
          .fs{font-size:8px;font-family:monospace;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;margin-top:3px;}
        </style>
        <div class="hdr">
          <div>
            <p style="font-size:9px;font-family:monospace;text-transform:uppercase;letter-spacing:3px;color:#9ca3af;margin-bottom:10px">// ENTIDAD AUTORIZADA</p>
            <div class="cn">EDM <span>AUTOMOTRIZ</span></div>
            <div class="cs">Pintura • Desabolladura</div>
            <div class="cd">
              <div><b>LOC:</b> ${empresa.direccion}</div>
              <div><b>ID:</b> ${empresa.rut}</div>
              <div><b>COM:</b> ${empresa.telefono} | ${empresa.web}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div class="dt">COTIZACIÓN</div>
            <div class="dr"><span>[DOC_ID]</span><b>${_numeroCotizacion}</b></div>
            <div class="dr"><span>[DATE]</span><b>${new Date(_fecha + "T00:00:00").toLocaleDateString("es-CL")}</b></div>
            <div class="dr"><span>[STATUS]</span><span class="sb">${_estadoCotizacion.replace('_', ' ')}</span></div>
          </div>
        </div>

        <div class="g2">
          <div class="card">
            <div class="ct">// TARGET_INFO</div>
            <div class="fl">Nombre / Razón Social</div>
            <div class="fv">${_cliente || '-'}</div>
            <div class="fg2">
              <div><div class="fl">RUT</div><div class="fv" style="font-family:monospace">${_rutCliente || '-'}</div></div>
              <div><div class="fl">Teléfono</div><div class="fv" style="font-family:monospace">${_telefonoCliente || '-'}</div></div>
            </div>
          </div>
          <div class="card">
            <div class="ct">// ASSET_DATA</div>
            <div class="fl">Marca / Modelo</div>
            <div class="fv">${_vehiculo || '-'}</div>
            <div class="fg2">
              <div><div class="fl">Patente</div><div class="fv" style="font-family:monospace;font-weight:900;letter-spacing:2px">${_patente || '-'}</div></div>
              <div><div class="fl">Año</div><div class="fv" style="font-family:monospace">${_anioVehiculo || '-'}</div></div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align:left">Especificación</th>
              <th style="text-align:center">Categoría</th>
              <th style="text-align:center">Valor Unit.</th>
              <th style="text-align:center">Cant.</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>

        <div class="tr">
          <div>
            <div style="font-size:9px;font-family:monospace;text-transform:uppercase;letter-spacing:3px;color:#9ca3af;margin-bottom:6px">// NOTAS</div>
            <div class="nb">${_notas || 'Sin notas.'}</div>
          </div>
          <div class="tb">
            <div class="tl"><span>Subtotal Neto</span><b>${fmtLocal(sub)}</b></div>
            <div class="tl"><span>IVA (19%)</span><b>${fmtLocal(iva)}</b></div>
            <hr class="td"/>
            <div class="tfl">[ VALOR FINAL ]</div>
            <div class="tfv">${fmtLocal(total)}</div>
          </div>
        </div>

        <div class="ft">
          <div class="fb"></div>
          <div class="fn">${empresa.nombre}</div>
          <div class="fs">SISTEMA EDM PRO — DATOS SUJETOS A EVALUACIÓN FÍSICA</div>
        </div>
      </div>
    `;
  }, [items, cliente, rutCliente, telefonoCliente, vehiculo, patente, anioVehiculo, notas, numeroCotizacion, fecha, estadoCotizacion, empresa]);

// ===== DESCARGAR PDF - acepta datos externos =====
const descargarPDF = useCallback((datos?: CotizacionData) => {
  const htmlContent = generarHTMLPDF(datos);
  const _num = datos?.numeroCotizacion ?? numeroCotizacion;

  const ventana = window.open('', '_blank', 'width=960,height=1100,scrollbars=yes');
  if (!ventana) {
    alert("El navegador bloqueó la ventana emergente. Permite pop-ups para este sitio.");
    return;
  }

  const paginaHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>EDM_Cotizacion_${_num}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: #111;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { display: flex; flex-direction: column; align-items: center; padding: 0 0 90px 0; }
    .page-wrap {
      width: 860px;
      background: white;
      margin: 20px auto;
      box-shadow: 0 10px 60px rgba(0,0,0,0.5);
    }
    .toolbar {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #0a0a0a;
      border-top: 2px solid #dc2626;
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 14px 20px;
      z-index: 9999;
      box-shadow: 0 -8px 30px rgba(220,38,38,0.15);
    }
    .btn {
      padding: 13px 28px;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 900;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
    }
    .btn-pdf { background: #dc2626; color: white; box-shadow: 0 0 20px rgba(220,38,38,0.4); }
    .btn-pdf:hover { background: #b91c1c; }
    .btn-print { background: #1a1a1a; color: #ccc; border: 1px solid #333; }
    .btn-print:hover { background: #2a2a2a; color: white; }
    .btn-close { background: transparent; color: #555; border: 1px solid #222; }
    .btn-close:hover { color: #888; border-color: #444; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none !important; }
      .page-wrap { margin: 0; box-shadow: none; width: 100%; }
      @page { size: A4 portrait; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page-wrap" id="cotizacion-doc">${htmlContent}</div>
  <div class="toolbar">
    <button class="btn btn-close" onclick="window.close()">✕ Cerrar</button>
    <button class="btn btn-print" onclick="window.print()">🖨 Imprimir</button>
    <button class="btn btn-pdf" id="btnPDF" onclick="guardarPDF()">⬇ Guardar PDF</button>
  </div>
  <script>
    function guardarPDF() {
      var btn = document.getElementById('btnPDF');
      btn.disabled = true;
      btn.textContent = '⏳ Generando...';
      var el = document.getElementById('cotizacion-doc');
      var opt = {
        margin: [10, 10, 10, 10],
        filename: 'EDM_Cotizacion_${_num}.pdf',
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 900
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      };
      html2pdf().set(opt).from(el).save()
        .then(function() {
          btn.textContent = '✓ Descargado';
          btn.style.background = '#059669';
          setTimeout(function() {
            btn.textContent = '⬇ Guardar PDF';
            btn.style.background = '#dc2626';
            btn.disabled = false;
          }, 2500);
        })
        .catch(function(err) {
          alert('Error: ' + err);
          btn.textContent = '⬇ Guardar PDF';
          btn.disabled = false;
        });
    }
  <\/script>
</body>
</html>`;

  ventana.document.write(paginaHTML);
  ventana.document.close();
}, [generarHTMLPDF, numeroCotizacion]);

  // ===== DESCARGAR DESDE LISTA — directo, sin cambio de vista =====
  const descargarPDFDesdeLista = async (cot: CotizacionData) => {
    await descargarPDF(cot);
  };

  const cargarHistorial = useCallback(async () => {
    if (!auth.currentUser) return;
    setLoadingData(true);
    try {
      const q = query(collection(db, "cotizaciones"), orderBy("fecha", "desc"));
      const snap = await getDocs(q);
      setHistorial(snap.docs.map(d => ({ id_firebase: d.id, ...d.data() } as CotizacionData)));
    } catch (error) { console.error(error); }
    setLoadingData(false);
  }, []);

  const cargarClientes = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const snap = await getDocs(collection(db, "clientes"));
      setClientes(snap.docs.map(d => ({ id_firebase: d.id, ...d.data() } as ClienteData)));
    } catch (error) { console.error(error); }
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, u => {
      setUser(u);
      setLoadingAuth(false);
      if (u) { cargarHistorial(); cargarClientes(); }
    });
  }, [cargarHistorial, cargarClientes]);

  // Auto-save borrador
  useEffect(() => {
    if (vista === 'editor' && !idFirebase) {
      const timer = setTimeout(() => {
        const data = { cliente, rutCliente, emailCliente, telefonoCliente, vehiculo, anioVehiculo, patente, tipoVehiculo, items, notas };
        localStorage.setItem('edm_borrador', JSON.stringify(data));
        if (cliente || vehiculo || items.some(i => i.descripcion)) {
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 2000);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cliente, rutCliente, emailCliente, telefonoCliente, vehiculo, anioVehiculo, patente, tipoVehiculo, items, notas, vista, idFirebase]);

  const totales = useMemo(() => {
    const sub = items.reduce((a, i) => a + i.precio * i.cantidad, 0);
    return { sub, iva: Math.round(sub * 0.19), total: Math.round(sub * 1.19) };
  }, [items]);

  const stats = useMemo(() => {
    const totalVentas = historial.reduce((a, b) => a + (b.totalFinal || 0), 0);
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const cotizacionesMes = historial.filter(c => new Date(c.fecha) >= primerDiaMes);
    const ventasMes = cotizacionesMes.reduce((a, b) => a + (b.totalFinal || 0), 0);

    const serviciosPorCategoria: Record<string, { cantidad: number, total: number }> = {};
    historial.forEach(cot => {
      cot.items.forEach(item => {
        const cat = item.categoria || 'otros';
        if (!serviciosPorCategoria[cat]) serviciosPorCategoria[cat] = { cantidad: 0, total: 0 };
        serviciosPorCategoria[cat].cantidad += item.cantidad;
        serviciosPorCategoria[cat].total += item.precio * item.cantidad;
      });
    });
    const serviciosMasVendidos = Object.entries(serviciosPorCategoria).map(([categoria, data]) => ({ categoria, ...data })).sort((a, b) => b.total - a.total);

    const estadosPorTipo: Record<string, number> = {};
    historial.forEach(cot => { const e = cot.estado || 'pendiente'; estadosPorTipo[e] = (estadosPorTipo[e] || 0) + 1; });
    const estadoCotizaciones = Object.entries(estadosPorTipo).map(([estado, cantidad]) => ({ estado, cantidad }));

    return { totalVentas, totalCotizaciones: historial.length, totalClientes: clientes.length, ventasMes, cotizacionesMes: cotizacionesMes.length, serviciosMasVendidos, estadoCotizaciones };
  }, [historial, clientes]);

  const historialFiltrado = useMemo(() => {
    return historial.filter(cot => {
      const matchEstado = filtroEstado === 'todos' || cot.estado === filtroEstado;
      const matchBusqueda = busqueda === '' ||
        cot.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        cot.patente.toLowerCase().includes(busqueda.toLowerCase()) ||
        cot.vehiculo.toLowerCase().includes(busqueda.toLowerCase());
      return matchEstado && matchBusqueda;
    });
  }, [historial, filtroEstado, busqueda]);

  const guardar = async () => {
    if (!user) return;
    setLoadingData(true);
    const data: any = {
      cliente, rutCliente, emailCliente, telefonoCliente, vehiculo, anioVehiculo, patente, tipoVehiculo, fecha,
      numeroCotizacion, items, notas, totalFinal: totales.total, estado: estadoCotizacion, ultimaModificacion: Timestamp.now()
    };
    try {
      if (idFirebase) await updateDoc(doc(db, "cotizaciones", idFirebase), data);
      else { data.fechaCreacion = Timestamp.now(); await addDoc(collection(db, "cotizaciones"), data); }
      localStorage.removeItem('edm_borrador');
      await cargarHistorial();
      setVista('dashboard');
    } catch (e) { console.error(e); alert("Error al guardar."); }
    setLoadingData(false);
  };

  const eliminar = async (id: string) => {
    if (!window.confirm("¿Confirma eliminación permanente?")) return;
    setLoadingData(true);
    try {
      await deleteDoc(doc(db, "cotizaciones", id));
      await cargarHistorial();
      if (vista === 'editor') setVista('dashboard');
      setModalDetalle({ isOpen: false });
    } catch (e) { console.error(e); alert("Error al eliminar."); }
    setLoadingData(false);
  };

  const abrir = (d?: CotizacionData) => {
    if (d) {
      setIdFirebase(d.id_firebase || null);
      setCliente(d.cliente); setRutCliente(d.rutCliente); setEmailCliente(d.emailCliente || ''); setTelefonoCliente(d.telefonoCliente || '');
      setVehiculo(d.vehiculo); setAnioVehiculo(d.anioVehiculo); setPatente(d.patente); setTipoVehiculo(d.tipoVehiculo || 'auto');
      setFecha(d.fecha); setNumeroCotizacion(d.numeroCotizacion); setItems(d.items); setNotas(d.notas); setEstadoCotizacion(d.estado || 'pendiente');
    } else {
      const borrador = localStorage.getItem('edm_borrador');
      if (borrador && window.confirm("⚠️ Tienes un borrador guardado. ¿Restaurar?")) {
        try {
          const data = JSON.parse(borrador);
          setIdFirebase(null);
          setCliente(data.cliente || ''); setRutCliente(data.rutCliente || ''); setEmailCliente(data.emailCliente || ''); setTelefonoCliente(data.telefonoCliente || '');
          setVehiculo(data.vehiculo || ''); setAnioVehiculo(data.anioVehiculo || ''); setPatente(data.patente || ''); setTipoVehiculo(data.tipoVehiculo || 'auto');
          setItems(data.items || [{ id: crypto.randomUUID(), descripcion: '', precio: 0, cantidad: 1, categoria: 'desabolladura' }]);
          setNotas(data.notas || 'Garantía de pintura: 1 año. Garantía desabolladura: 3 meses. Validez cotización: 10 días.');
          setNumeroCotizacion('EDM-' + (historial.length + 1).toString().padStart(4, '0'));
          setEstadoCotizacion('pendiente');
        } catch { localStorage.removeItem('edm_borrador'); resetForm(); }
      } else { resetForm(); }
    }
    setSidebarOpen(false);
    setVista('editor');
  };

  const resetForm = () => {
    setIdFirebase(null);
    setCliente(''); setRutCliente(''); setEmailCliente(''); setTelefonoCliente('');
    setVehiculo(''); setAnioVehiculo(''); setPatente(''); setTipoVehiculo('auto');
    setItems([{ id: crypto.randomUUID(), descripcion: '', precio: 0, cantidad: 1, categoria: 'desabolladura' }]);
    setNumeroCotizacion('EDM-' + (historial.length + 1).toString().padStart(4, '0'));
    setNotas('Garantía de pintura: 1 año. Garantía desabolladura: 3 meses. Validez cotización: 10 días.');
    setEstadoCotizacion('pendiente');
  };

  const fmt = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(n);

  // Loading auth
  if (loadingAuth) {
    return (
      <div className="h-screen bg-[#020202] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-2 border-r-2 border-red-600 rounded-full" />
            <Cpu className="text-red-500" size={28} />
          </div>
          <p className="text-red-500 font-mono text-xs tracking-widest animate-pulse uppercase">Conectando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={() => { }} />;

  // Nav items
  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'clientes', icon: Users, label: 'Directorio' },
    { id: 'analytics', icon: Activity, label: 'Métricas' },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-neutral-200 selection:bg-red-500/30 overflow-x-hidden relative">

      {/* Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.nav
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-[72px] bg-black/90 backdrop-blur-2xl border-r border-red-900/30 flex flex-col items-center py-6 gap-4 z-40 shadow-[4px_0_30px_rgba(220,38,38,0.1)] lg:translate-x-0"
      >
        {/* Logo */}
        <div className="w-11 h-11 bg-neutral-950 flex items-center justify-center border border-red-900/50 hover:border-red-500 transition-all mb-4"
          style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
          <img src="EDM.LOGO_OFFICIAL.png" alt="EDM" className="w-8 h-8 object-contain" onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
        </div>

        <div className="w-6 h-px bg-red-900/50" />

        {navItems.map(item => (
          <div key={item.id} className="relative group w-full flex justify-center">
            {vista === item.id && (
              <motion.div layoutId="activeTab" className="absolute -left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
            )}
            <button onClick={() => { setVista(item.id as any); setSidebarOpen(false); }}
              className={`p-3 transition-all duration-300 relative ${vista === item.id ? 'bg-red-950/50 text-red-500 border border-red-900/50' : 'text-neutral-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent'}`}
              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
              <item.icon size={18} />
            </button>
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-red-950 text-red-100 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-red-900 z-50">
              {item.label}
            </span>
          </div>
        ))}

        <div className="flex-1" />

        <div className="relative group w-full flex justify-center">
          <button onClick={() => signOut(auth)} className="p-3 text-neutral-600 hover:text-red-500 hover:bg-red-950/30 transition-colors border border-transparent"
            style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
            <LogOut size={18} />
          </button>
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900 text-neutral-400 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-700 z-50">
            Salir
          </span>
        </div>
      </motion.nav>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-xl border-b border-red-900/30 flex items-center justify-between px-4 py-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-neutral-400 hover:text-red-400 transition-colors">
          <Menu size={20} />
        </button>
        <span className="text-white font-black text-sm tracking-wider uppercase">EDM <span className="text-red-500">Automotriz</span></span>
        <button onClick={() => abrir()} className="p-2 bg-red-600 text-white">
          <Plus size={18} />
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="lg:ml-[72px] relative z-10 pt-14 lg:pt-0">
        <AnimatePresence mode='wait'>

          {/* ======================== DASHBOARD ======================== */}
          {vista === 'dashboard' && (
            <motion.div key="dashboard" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, x: 20 }}
              className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">

              {/* Header */}
              <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-1.5 bg-gradient-to-b from-red-500 to-red-800 shadow-[0_0_15px_rgba(220,38,38,0.8)]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 80%, 0 20%)' }} />
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase">Módulo de Control</h1>
                  </div>
                  <p className="text-red-500/80 font-mono font-bold uppercase tracking-[0.2em] text-[9px] pl-5 flex items-center gap-2">
                    <Terminal size={10} /> Terminal Principal • {empresa.nombre}
                  </p>
                </div>
                <div className="hidden sm:flex gap-3">
                  <NeonButton onClick={() => setModalExportar(true)} icon={Download} label="Exportar" variant="secondary" />
                  <NeonButton onClick={() => abrir()} icon={Plus} label="Nueva Cotización" variant="primary" />
                </div>
              </motion.header>

              {/* Stats */}
              <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <StatsCard icon={DollarSign} label="Total Ventas" value={fmt(stats.totalVentas)} color="green" />
                <StatsCard icon={FileText} label="Cotizaciones" value={stats.totalCotizaciones} color="blue" />
                <StatsCard icon={Users} label="Clientes" value={stats.totalClientes} color="purple" />
                <StatsCard icon={Activity} label="Ventas 30D" value={fmt(stats.ventasMes)} color="red" />
              </motion.div>

              {/* Search & Filter */}
              <motion.div variants={itemVariants} className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                  <input type="text" placeholder="Buscar por cliente, patente o vehículo..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 pl-10 pr-4 py-3 text-sm font-mono text-white placeholder-neutral-600 focus:border-red-500 outline-none transition-all" />
                </div>
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm font-mono text-white focus:border-red-500 outline-none cursor-pointer">
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="completada">Completada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
                {(filtroEstado !== 'todos' || busqueda !== '') && (
                  <button onClick={() => { setFiltroEstado('todos'); setBusqueda(''); }}
                    className="px-4 py-3 bg-neutral-900 border border-neutral-700 text-xs uppercase tracking-widest font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors whitespace-nowrap">
                    Limpiar
                  </button>
                )}
              </motion.div>

              {/* List header */}
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 animate-pulse rounded-full" />
                  Registro de Operaciones
                  <span className="text-neutral-500 font-mono bg-neutral-900 px-2 py-0.5 text-[10px] border border-neutral-800 ml-1">
                    {historialFiltrado.length}
                  </span>
                </h3>
                <button onClick={cargarHistorial} disabled={loadingData} className="p-2 text-neutral-500 hover:text-red-400 transition-colors">
                  <Loader2 size={14} className={loadingData ? "animate-spin text-red-500" : ""} />
                </button>
              </motion.div>

              {/* Cotizaciones */}
              <div className="space-y-3">
                <AnimatePresence>
                  {historialFiltrado.map((cot, i) => {
                    const estadoColors: Record<string, string> = {
                      pendiente: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
                      aprobada: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
                      rechazada: 'text-rose-500 border-rose-500/30 bg-rose-500/10',
                      en_proceso: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
                      completada: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
                    };
                    const ec = estadoColors[cot.estado] || estadoColors.pendiente;

                    return (
                      <motion.div key={cot.id_firebase} layout
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(i * 0.04, 0.15) }}
                        className="group bg-black/40 border border-neutral-800 hover:border-red-600/40 p-4 sm:p-5 transition-all duration-300 relative overflow-hidden"
                        style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                        <div className="absolute top-0 left-0 w-full h-px bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                        {/* Mobile layout */}
                        <div className="flex items-start gap-3 sm:hidden">
                          <div className="shrink-0 w-12 h-12 bg-neutral-950 flex flex-col items-center justify-center border border-neutral-800 group-hover:border-red-500/30 transition-colors">
                            <span className="text-[8px] text-red-500/70 font-bold uppercase font-mono">{cot.fecha.split('-')[1]}</span>
                            <span className="text-lg font-black text-white font-mono">{cot.fecha.split('-')[2]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="text-white font-bold text-sm truncate">{cot.cliente}</h4>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 border shrink-0 ${ec}`}>{cot.estado.replace('_', ' ')}</span>
                            </div>
                            <p className="text-neutral-500 text-xs mb-1 truncate"><Car size={10} className="inline mr-1" />{cot.vehiculo}</p>
                            <div className="flex items-center justify-between">
                              <span className="bg-neutral-900 px-2 py-0.5 text-neutral-300 font-bold tracking-widest text-[10px] border border-neutral-800">{cot.patente}</span>
                              <span className="text-white font-black font-mono text-sm">{fmt(cot.totalFinal)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile actions */}
                        <div className="flex gap-2 mt-3 sm:hidden border-t border-neutral-800 pt-3">
                          <button onClick={() => setModalDetalle({ isOpen: true, cotizacion: cot })} className="flex-1 py-2 bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-blue-400 hover:border-blue-500 transition-all text-xs flex items-center justify-center gap-1">
                            <Eye size={12} /> Ver
                          </button>
                          <button onClick={() => abrir(cot)} className="flex-1 py-2 bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-red-400 hover:border-red-500 transition-all text-xs flex items-center justify-center gap-1">
                            <Edit2 size={12} /> Editar
                          </button>
                          <button onClick={() => descargarPDFDesdeLista(cot)} className="flex-1 py-2 bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500 transition-all text-xs flex items-center justify-center gap-1">
                            <Download size={12} /> PDF
                          </button>
                        </div>

                        {/* Desktop layout */}
                        <div className="hidden sm:flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="shrink-0 w-14 h-14 bg-neutral-950 flex flex-col items-center justify-center border border-neutral-800 group-hover:border-red-500/30 transition-colors"
                              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
                              <span className="text-[8px] text-red-500/70 font-bold uppercase font-mono">{cot.fecha.split('-')[1]}</span>
                              <span className="text-xl font-black text-white font-mono">{cot.fecha.split('-')[2]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                <h4 className="text-white font-bold text-base group-hover:text-red-400 transition-colors">{cot.cliente}</h4>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${ec}`}>{cot.estado.replace('_', ' ')}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-neutral-400 flex-wrap">
                                <span className="flex items-center gap-1"><Car size={12} className="text-red-900 group-hover:text-red-500 transition-colors" /> {cot.vehiculo}</span>
                                <span className="bg-neutral-900 px-2 py-0.5 border border-neutral-800 text-neutral-300 font-bold tracking-widest">{cot.patente}</span>
                                <span className="font-mono text-neutral-600">{cot.numeroCotizacion}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 shrink-0">
                            <div className="text-right">
                              <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider mb-0.5">Total</p>
                              <p className="text-xl font-black text-white font-mono">{fmt(cot.totalFinal)}</p>
                            </div>
                            <div className="flex gap-1.5">
                              {[
                                { icon: Eye, action: () => setModalDetalle({ isOpen: true, cotizacion: cot }), hover: 'hover:bg-blue-900/30 hover:border-blue-500 hover:text-blue-400' },
                                { icon: Edit2, action: () => abrir(cot), hover: 'hover:bg-red-900/30 hover:border-red-500 hover:text-red-400' },
                                { icon: Download, action: () => descargarPDFDesdeLista(cot), hover: 'hover:bg-emerald-900/30 hover:border-emerald-500 hover:text-emerald-400' },
                              ].map((btn, bi) => (
                                <motion.button key={bi} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); btn.action(); }}
                                  className={`h-9 w-9 bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 transition-all ${btn.hover}`}
                                  style={{ clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }}>
                                  <btn.icon size={14} />
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {historialFiltrado.length === 0 && !loadingData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-16 bg-neutral-900/20 border border-neutral-800 border-dashed"
                    style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}>
                    <Terminal size={40} className="text-neutral-800 mx-auto mb-3" />
                    <p className="text-neutral-600 font-mono uppercase tracking-widest text-xs">[ Sin resultados ]</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ======================== EDITOR ======================== */}
          {vista === 'editor' && (
            <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="min-h-screen pb-24 relative">

              {/* Floating Command Bar */}
              <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="fixed top-14 lg:top-4 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-xl border border-red-900/50 px-2 py-1.5 flex items-center gap-1.5 shadow-[0_10px_40px_rgba(220,38,38,0.15)] w-[95%] sm:w-auto max-w-[600px]"
                style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>

                <button onClick={() => setVista('dashboard')} className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors shrink-0">
                  <ArrowLeft size={16} />
                </button>

                <div className="w-px h-5 bg-red-900/50 mx-1 shrink-0" />

                <button onClick={() => guardar()} disabled={loadingData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-[10px] uppercase tracking-[0.15em] hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all disabled:opacity-50 shrink-0">
                  {loadingData ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                  <span className="hidden sm:inline">{idFirebase ? 'Actualizar' : 'Guardar'}</span>
                </button>

                <AnimatePresence>
                  {!idFirebase && autoSaved && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="overflow-hidden hidden sm:block">
                      <div className="flex items-center gap-1 text-emerald-400 text-[9px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest bg-emerald-950/30 border border-emerald-900/50 whitespace-nowrap">
                        <CheckCircle2 size={10} /> Borrador guardado
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex-1" />

                <button onClick={() => descargarPDF()} title="Descargar PDF"
                  className="p-2.5 bg-neutral-900 hover:bg-emerald-950 text-neutral-400 hover:text-emerald-400 transition-colors shrink-0 border border-transparent hover:border-emerald-900/50">
                  <FileDown size={16} />
                </button>

                {idFirebase && (
                  <button onClick={() => eliminar(idFirebase)}
                    className="p-2.5 bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-500 transition-colors shrink-0 border border-transparent hover:border-rose-900/50">
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>

              {/* Spacer */}
              <div className="h-24 lg:h-20" />

              <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Doc header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-red-900/30">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Panel de Emisión</h2>
                    <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest mt-0.5">Cotización #{numeroCotizacion}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[9px] text-red-500/80 font-mono uppercase tracking-wider">Fecha</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                      className="bg-neutral-950 border border-neutral-700 text-white px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors" />
                  </div>
                </div>

                {/* Cliente + Vehículo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                  {[
                    {
                      title: 'TARGET_INFO', icon: Users,
                      fields: [
                        { label: 'Nombre / Razón Social', value: cliente, setter: setCliente, placeholder: 'Nombre del cliente...', full: true, mono: false },
                        { label: 'RUT', value: rutCliente, setter: setRutCliente, placeholder: '12.345.678-9', mono: true },
                        { label: 'Teléfono', value: telefonoCliente, setter: setTelefonoCliente, placeholder: '+56 9...', mono: true },
                      ]
                    },
                    {
                      title: 'ASSET_DATA', icon: Car,
                      fields: [
                        { label: 'Marca / Modelo', value: vehiculo, setter: setVehiculo, placeholder: 'Ej: Suzuki Alto 800cc...', full: true, mono: false },
                        { label: 'Patente', value: patente, setter: (v: string) => setPatente(v.toUpperCase()), placeholder: 'XXXX-00', mono: true, upper: true },
                        { label: 'Año', value: anioVehiculo, setter: setAnioVehiculo, placeholder: '2024', mono: true },
                      ]
                    }
                  ].map((section, si) => (
                    <div key={si} className="p-5 sm:p-7 border border-neutral-800 bg-black/40 relative"
                      style={{ clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)' }}>
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500/40 pointer-events-none" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-5 flex items-center gap-2 text-red-500 font-mono">
                        <section.icon size={14} /> // {section.title}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest block mb-1.5 text-neutral-400">{section.fields[0].label}</label>
                          <input value={section.fields[0].value} onChange={e => section.fields[0].setter(e.target.value)}
                            className={`w-full bg-neutral-950/80 border border-neutral-700 p-3 text-base font-bold text-white placeholder:text-neutral-600 focus:bg-black focus:border-red-500 outline-none transition-all ${section.fields[0].mono ? 'font-mono' : ''}`}
                            placeholder={section.fields[0].placeholder}
                            style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {section.fields.slice(1).map((field, fi) => (
                            <div key={fi}>
                              <label className="text-[9px] font-bold uppercase tracking-widest block mb-1.5 text-neutral-400">{field.label}</label>
                              <input value={field.value} onChange={e => field.setter(e.target.value)}
                                className={`w-full bg-neutral-950/80 border border-neutral-700 p-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:bg-black focus:border-red-500 outline-none transition-all ${field.upper ? 'uppercase font-black tracking-widest text-red-400' : ''}`}
                                placeholder={field.placeholder}
                                style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Items Table */}
                <div className="mb-6 border border-neutral-800 bg-black/40 overflow-hidden"
                  style={{ clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)' }}>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead className="bg-neutral-900 border-b border-red-900/40">
                        <tr>
                          {['Descripción', 'Categoría', 'Valor Unit.', 'Cant.', 'Subtotal', ''].map((h, i) => (
                            <th key={i} className={`py-3 px-4 text-[9px] font-mono font-black uppercase tracking-widest text-neutral-400 ${i === 4 ? 'text-right' : i === 3 ? 'text-center' : i === 5 ? 'w-10' : ''}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/50">
                        {items.map(item => (
                          <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                            <td className="py-3 px-4">
                              <input value={item.descripcion} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, descripcion: e.target.value } : i))}
                                className="w-full bg-neutral-950/80 border border-neutral-800 p-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-red-500 outline-none transition-colors"
                                placeholder="Descripción del servicio..." />
                            </td>
                            <td className="py-3 px-4">
                              <select value={item.categoria} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, categoria: e.target.value } : i))}
                                className="w-full bg-neutral-950/80 border border-neutral-800 p-2.5 text-xs font-mono text-neutral-300 focus:border-red-500 outline-none cursor-pointer">
                                {['pintura', 'desabolladura', 'mecanica', 'repuestos', 'otros'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <input type="number" value={item.precio || ''} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, precio: Number(e.target.value) } : i))}
                                className="w-full bg-neutral-950/80 border border-neutral-800 p-2.5 text-sm font-mono text-center text-white focus:border-red-500 outline-none"
                                placeholder="0" />
                            </td>
                            <td className="py-3 px-4">
                              <input type="number" min="1" value={item.cantidad} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, cantidad: Number(e.target.value) } : i))}
                                className="w-full bg-neutral-950/80 border border-neutral-800 p-2.5 text-sm font-mono text-center text-white focus:border-red-500 outline-none" />
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-red-400 whitespace-nowrap">{fmt(item.precio * item.cantidad)}</td>
                            <td className="pr-3">
                              <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} disabled={items.length === 1}
                                className="text-neutral-600 hover:text-red-500 p-1.5 transition-colors disabled:opacity-20">
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile items */}
                  <div className="sm:hidden divide-y divide-neutral-800">
                    {items.map((item, idx) => (
                      <div key={item.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest">Ítem {idx + 1}</span>
                          <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} disabled={items.length === 1}
                            className="text-neutral-600 hover:text-red-500 transition-colors disabled:opacity-20 p-1">
                            <X size={14} />
                          </button>
                        </div>
                        <input value={item.descripcion} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, descripcion: e.target.value } : i))}
                          className="w-full bg-neutral-950 border border-neutral-800 p-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-red-500 outline-none"
                          placeholder="Descripción..." />
                        <div className="grid grid-cols-3 gap-2">
                          <select value={item.categoria} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, categoria: e.target.value } : i))}
                            className="col-span-3 bg-neutral-950 border border-neutral-800 p-2 text-xs font-mono text-neutral-300 focus:border-red-500 outline-none">
                            {['pintura', 'desabolladura', 'mecanica', 'repuestos', 'otros'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div>
                            <p className="text-[8px] text-neutral-500 mb-1 uppercase">Precio</p>
                            <input type="number" value={item.precio || ''} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, precio: Number(e.target.value) } : i))}
                              className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs font-mono text-white focus:border-red-500 outline-none" placeholder="0" />
                          </div>
                          <div>
                            <p className="text-[8px] text-neutral-500 mb-1 uppercase">Cant.</p>
                            <input type="number" min="1" value={item.cantidad} onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, cantidad: Number(e.target.value) } : i))}
                              className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs font-mono text-white focus:border-red-500 outline-none" />
                          </div>
                          <div>
                            <p className="text-[8px] text-neutral-500 mb-1 uppercase">Total</p>
                            <p className="text-sm font-mono font-bold text-red-400 p-2">{fmt(item.precio * item.cantidad)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add item button */}
                  <div className="bg-neutral-900/50 p-4 border-t border-neutral-800">
                    <button onClick={() => setItems([...items, { id: crypto.randomUUID(), descripcion: '', precio: 0, cantidad: 1, categoria: 'pintura' }])}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-white hover:bg-red-600 px-5 py-2.5 transition-colors font-mono border border-red-900/50"
                      style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}>
                      <Plus size={14} /> Añadir ítem
                    </button>
                  </div>
                </div>

                {/* Notas + Totales */}
                <div className="flex flex-col lg:flex-row gap-5 mb-8">
                  <div className="flex-1 p-5 sm:p-7 border border-neutral-800 bg-black/40 relative"
                    style={{ clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)' }}>
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500/40 pointer-events-none" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 text-red-500 font-mono">
                      <Terminal size={14} /> // NOTAS
                    </h3>
                    <textarea value={notas} onChange={e => setNotas(e.target.value)}
                      className="w-full h-28 bg-neutral-950/80 border border-neutral-700 p-4 text-xs font-mono text-neutral-300 focus:bg-black focus:border-red-500 outline-none resize-none transition-colors"
                      placeholder="Garantías, condiciones, validez..."
                      style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }} />
                  </div>

                  <div className="lg:w-[360px] p-5 sm:p-7 border border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.08)] bg-neutral-950/80 relative"
                    style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between font-mono text-sm text-neutral-400">
                        <span>Subtotal Neto</span><span className="text-white font-bold">{fmt(totales.sub)}</span>
                      </div>
                      <div className="flex justify-between font-mono text-sm text-neutral-400 pb-4 border-b border-neutral-800">
                        <span>IVA (19%)</span><span className="text-white font-bold">{fmt(totales.iva)}</span>
                      </div>
                    </div>
                    <div className="text-right mb-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] font-mono text-red-500 mb-1">[ VALOR FINAL ]</p>
                      <p className="text-4xl sm:text-5xl font-black tracking-tighter font-mono text-white">{fmt(totales.total)}</p>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest block mb-1.5 text-neutral-500">Estado del documento</label>
                      <select value={estadoCotizacion} onChange={e => setEstadoCotizacion(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 p-3 text-sm font-bold uppercase tracking-wider text-white focus:border-red-500 outline-none cursor-pointer">
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="completada">Completada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================== CLIENTES ======================== */}
          {vista === 'clientes' && (
            <motion.div key="clientes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
              <header className="flex justify-between items-end gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-1.5 bg-gradient-to-b from-red-500 to-red-800" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 80%, 0 20%)' }} />
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">Directorio</h1>
                  </div>
                  <p className="text-red-500 font-mono text-[9px] tracking-[0.3em] pl-4 uppercase">Base de datos • {stats.totalClientes} Entidades</p>
                </div>
                <NeonButton onClick={() => {}} icon={Plus} label="Nuevo" variant="primary" />
              </header>
              <div className="text-center py-24 bg-neutral-900/20 border border-red-900/20 border-dashed"
                style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                <Users size={48} className="text-red-900/30 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white mb-2 uppercase">Módulo en Construcción</h3>
                <p className="text-neutral-500 font-mono text-xs tracking-widest">[ PRÓXIMAMENTE ]</p>
              </div>
            </motion.div>
          )}

          {/* ======================== ANALYTICS ======================== */}
          {vista === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-1.5 bg-gradient-to-b from-red-500 to-red-800" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 80%, 0 20%)' }} />
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">Métricas</h1>
                </div>
                <p className="text-red-500 font-mono text-[9px] tracking-[0.3em] pl-4 uppercase">Análisis Telemetría • {empresa.nombre}</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Servicios */}
                <GlassCard className="p-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] font-mono text-red-500 mb-6 flex items-center gap-2">
                    <Package size={14} /> // Top Servicios
                  </h3>
                  <div className="space-y-5">
                    {stats.serviciosMasVendidos.slice(0, 5).map((s, i) => {
                      const catColors: Record<string, string> = {
                        mecanica: 'bg-blue-500', desabolladura: 'bg-green-500',
                        pintura: 'bg-purple-500', repuestos: 'bg-orange-500', otros: 'bg-neutral-500'
                      };
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-7 h-7 bg-neutral-900 border border-neutral-700 flex items-center justify-center font-black text-xs text-neutral-500 shrink-0">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs font-bold text-white uppercase tracking-wider">{s.categoria}</span>
                              <span className="text-xs font-mono font-bold text-red-400">{fmt(s.total)}</span>
                            </div>
                            <div className="h-1 bg-neutral-800 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(s.total / (stats.serviciosMasVendidos[0]?.total || 1)) * 100}%` }}
                                transition={{ duration: 1.2, delay: i * 0.1 }}
                                className={`h-full ${catColors[s.categoria] || 'bg-neutral-500'}`} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* Estados */}
                <GlassCard className="p-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] font-mono text-red-500 mb-6 flex items-center gap-2">
                    <PieChart size={14} /> // Conversión
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {stats.estadoCotizaciones.map((e, i) => {
                      const conf: Record<string, { color: string, border: string }> = {
                        pendiente: { color: 'text-yellow-400', border: 'border-yellow-900/50' },
                        aprobada: { color: 'text-emerald-400', border: 'border-emerald-900/50' },
                        rechazada: { color: 'text-rose-500', border: 'border-rose-900/50' },
                        en_proceso: { color: 'text-blue-400', border: 'border-blue-900/50' },
                        completada: { color: 'text-purple-400', border: 'border-purple-900/50' },
                      };
                      const c = conf[e.estado] || { color: 'text-neutral-400', border: 'border-neutral-800' };
                      return (
                        <motion.div key={i} whileHover={{ y: -3 }}
                          className={`p-4 bg-neutral-950/50 border ${c.border} flex flex-col items-center gap-1.5 transition-colors`}
                          style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}>
                          <span className={`text-2xl font-black font-mono ${c.color}`}>{e.cantidad}</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 text-center">{e.estado.replace('_', ' ')}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* MODAL DETALLE */}
      <Modal isOpen={modalDetalle.isOpen} onClose={() => setModalDetalle({ isOpen: false })} title="Detalle Cotización" size="lg">
        {modalDetalle.cotizacion && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Cliente', value: modalDetalle.cotizacion.cliente },
                { label: 'RUT', value: modalDetalle.cotizacion.rutCliente },
                { label: 'Vehículo', value: modalDetalle.cotizacion.vehiculo },
                { label: 'Patente', value: modalDetalle.cotizacion.patente },
                { label: 'Teléfono', value: modalDetalle.cotizacion.telefonoCliente || '-' },
                { label: 'Fecha', value: modalDetalle.cotizacion.fecha },
              ].map((f, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-3">
                  <p className="text-[8px] text-neutral-500 uppercase tracking-widest mb-1">{f.label}</p>
                  <p className="text-white font-bold text-sm">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="border border-neutral-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-neutral-900">
                  <tr>
                    {['Descripción', 'Cat.', 'Precio', 'Cant.', 'Total'].map((h, i) => (
                      <th key={i} className="py-2 px-3 text-[9px] text-neutral-400 font-mono uppercase tracking-wider text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {modalDetalle.cotizacion.items.map((item, i) => (
                    <tr key={i} className="bg-neutral-950/50">
                      <td className="py-2 px-3 text-white text-xs">{item.descripcion}</td>
                      <td className="py-2 px-3 text-neutral-400 text-xs">{item.categoria}</td>
                      <td className="py-2 px-3 text-white text-xs font-mono">{fmt(item.precio)}</td>
                      <td className="py-2 px-3 text-white text-xs text-center">{item.cantidad}</td>
                      <td className="py-2 px-3 text-red-400 text-xs font-mono font-bold">{fmt(item.precio * item.cantidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center bg-neutral-900/50 border border-red-900/30 p-4">
              <span className="text-xs text-neutral-400 font-mono uppercase tracking-widest">Total Final</span>
              <span className="text-2xl font-black text-white font-mono">{fmt(modalDetalle.cotizacion.totalFinal)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { abrir(modalDetalle.cotizacion!); setModalDetalle({ isOpen: false }); }}
                className="flex-1 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-colors flex items-center justify-center gap-2">
                <Edit2 size={14} /> Editar
              </button>
              <button onClick={() => descargarPDFDesdeLista(modalDetalle.cotizacion!)}
                className="flex-1 py-3 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                <Download size={14} /> PDF
              </button>
              {modalDetalle.cotizacion.id_firebase && (
                <button onClick={() => eliminar(modalDetalle.cotizacion!.id_firebase!)}
                  className="py-3 px-4 bg-neutral-900 border border-rose-900/50 text-rose-500 hover:bg-rose-950 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL EXPORTAR */}
      <Modal isOpen={modalExportar} onClose={() => setModalExportar(false)} title="Exportar Datos">
        <div className="p-4 text-center">
          <Download size={32} className="text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 font-mono text-sm mb-6">Exportar registros a formato Excel.</p>
          <NeonButton onClick={() => { alert("Módulo en desarrollo."); setModalExportar(false); }} icon={Download} label="Generar .XLSX" variant="success" />
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #020202; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type="number"] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #020202; }
        ::-webkit-scrollbar-thumb { background: #dc2626; }
        ::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}} />
    </div>
  );
};

export default App;