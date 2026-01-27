import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Printer, FileText, Building2, Car, Search,
  Save, History, ArrowLeft, Loader2, LogOut, Lock,
  TrendingUp, Zap, Hash, CheckCircle2, X, Edit2, Eye,
  Users, DollarSign, Calendar, BarChart3, PieChart, Activity,
  Wrench, Palette, Settings, Filter, Download,
  AlertCircle, Package, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// --- TYPES ---
interface ItemCotizacion {
  id: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  categoria?: 'mecanica' | 'desabolladura' | 'pintura' | 'repuestos' | 'otros';
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
  tipoVehiculo?: 'auto' | 'camioneta' | 'suv' | 'moto' | 'camion' | 'otro';
  fecha: string;
  numeroCotizacion: string;
  items: ItemCotizacion[];
  notas: string;
  totalFinal: number;
  estado?: 'pendiente' | 'aprobada' | 'rechazada' | 'en_proceso' | 'completada';
  fechaCreacion?: any;
  ultimaModificacion?: any;
}

interface ClienteData {
  id_firebase?: string;
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  totalGastado?: number;
  numeroCotizaciones?: number;
  fechaRegistro?: any;
}

interface StatsData {
  totalVentas: number;
  totalCotizaciones: number;
  totalClientes: number;
  ventasMes: number;
  cotizacionesMes: number;
  clientesNuevosMes: number;
  serviciosMasVendidos: Array<{ categoria: string; cantidad: number; total: number }>;
  vehiculosMasAtendidos: Array<{ tipo: string; cantidad: number }>;
  estadoCotizaciones: Array<{ estado: string; cantidad: number }>;
}

// --- UI COMPONENTS ---
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-neutral-900/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

interface NeonButtonProps {
  onClick: () => void;
  icon?: React.ElementType;
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  className?: string;
}

const NeonButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false, className = "" }: NeonButtonProps) => {
  const variants = {
    primary: "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:bg-red-500",
    secondary: "bg-neutral-800/50 text-neutral-400 border border-white/5 hover:text-white hover:border-white/20 hover:bg-white/5",
    success: "bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:bg-green-500",
    danger: "bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] hover:bg-rose-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {Icon && <Icon size={16} className={variant === 'primary' ? "animate-pulse" : ""} />}
        {label}
      </span>
    </button>
  );
};

// --- MODAL COMPONENT ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full ${sizes[size]} my-8`}
            >
              <GlassCard className="p-0">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-2xl font-black text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neutral-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {children}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- STATS CARD ---
interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  color?: string;
}

const StatsCard = ({ icon: Icon, label, value, trend, color = 'red' }: StatsCardProps) => {
  const colors = {
    red: 'from-red-600 to-black',
    blue: 'from-blue-600 to-black',
    green: 'from-green-600 to-black',
    purple: 'from-purple-600 to-black',
    orange: 'from-orange-600 to-black'
  };

  return (
    <GlassCard className="p-6 group hover:scale-105 transition-transform">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
          <h3 className="text-3xl font-black text-white">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp size={12} className={trend.positive ? '' : 'rotate-180'} />
              {trend.value}% vs mes anterior
            </div>
          )}
        </div>
        <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} p-3 rounded-xl shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
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
      console.error(err);
      setError("ACCESO DENEGADO - Credenciales inválidas");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-10 border-t border-red-500/50">
          <div className="text-center mb-8 relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-black rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] mb-4">
              <Wrench size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">LIONS<span className="text-red-600">CARS</span></h1>
            <p className="text-[10px] text-red-500 font-mono tracking-[0.3em] uppercase mt-1">Pro Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="group">
              <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-xl p-3 focus-within:border-red-500/50 focus-within:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all">
                <Building2 size={16} className="text-neutral-500 group-focus-within:text-red-500" />
                <input
                  type="email"
                  placeholder="EMAIL CORPORATIVO"
                  className="bg-transparent w-full text-white text-xs font-bold tracking-wider placeholder-neutral-700 outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="group">
              <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-xl p-3 focus-within:border-red-500/50 focus-within:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all">
                <Lock size={16} className="text-neutral-500 group-focus-within:text-red-500" />
                <input
                  type="password"
                  placeholder="CONTRASEÑA"
                  className="bg-transparent w-full text-white text-xs font-bold tracking-wider placeholder-neutral-700 outline-none"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-[10px] font-mono text-center bg-red-500/10 p-3 rounded border border-red-500/20 flex items-center justify-center gap-2"
              >
                <AlertCircle size={12} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "ACCEDER AL SISTEMA"}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [vista, setVista] = useState<'dashboard' | 'editor' | 'clientes' | 'analytics'>('dashboard');
  const [historial, setHistorial] = useState<CotizacionData[]>([]);
  const [clientes, setClientes] = useState<ClienteData[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  // Modales
  const [modalDetalle, setModalDetalle] = useState<{ isOpen: boolean; cotizacion?: CotizacionData }>({ isOpen: false });
  const [modalCliente, setModalCliente] = useState<{ isOpen: boolean; cliente?: ClienteData }>({ isOpen: false });
  const [modalFiltros, setModalFiltros] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('todos');
  const [filtroTipoVehiculo, setFiltroTipoVehiculo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  const empresa = {
    rut: '78.161.408-4',
    direccion: 'Av. Gabriela Mistral 925, Alerce',
    telefono: '+56 9 4037 3364',
    web: 'lionscars.cl',
    nombre: 'Lions Cars'
  };

  // Estados Formulario
  const [idFirebase, setIdFirebase] = useState<string | null>(null);
  const [cliente, setCliente] = useState('');
  const [rutCliente, setRutCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [anioVehiculo, setAnioVehiculo] = useState('');
  const [patente, setPatente] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<CotizacionData['tipoVehiculo']>('auto');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [numeroCotizacion, setNumeroCotizacion] = useState('2026-001');
  const [notas, setNotas] = useState('Garantía de 3 meses en trabajos realizados. Validez de cotización: 10 días hábiles.');
  const [items, setItems] = useState<ItemCotizacion[]>([{ id: '1', descripcion: '', precio: 0, cantidad: 1, categoria: 'mecanica' }]);
  const [estadoCotizacion, setEstadoCotizacion] = useState<CotizacionData['estado']>('pendiente');

  // Cargar datos
  const cargarHistorial = useCallback(async () => {
    if (!auth.currentUser) return;
    setLoadingData(true);
    try {
      const q = query(collection(db, "cotizaciones"), orderBy("fecha", "desc"));
      const snap = await getDocs(q);
      setHistorial(snap.docs.map(d => ({ id_firebase: d.id, ...d.data() } as CotizacionData)));
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
    setLoadingData(false);
  }, []);

  const cargarClientes = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const snap = await getDocs(collection(db, "clientes"));
      setClientes(snap.docs.map(d => ({ id_firebase: d.id, ...d.data() } as ClienteData)));
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, u => {
      setUser(u);
      setLoadingAuth(false);
      if (u) {
        cargarHistorial();
        cargarClientes();
      }
    });
  }, [cargarHistorial, cargarClientes]);

  // Auto-save mejorado
  useEffect(() => {
    if (vista === 'editor' && !idFirebase) {
      const timer = setTimeout(() => {
        const dataToSave = {
          cliente, rutCliente, emailCliente, telefonoCliente,
          vehiculo, anioVehiculo, patente, tipoVehiculo, items, notas
        };
        localStorage.setItem('lions_borrador', JSON.stringify(dataToSave));

        if (cliente || vehiculo || items.some(i => i.descripcion)) {
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 2000);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [cliente, rutCliente, emailCliente, telefonoCliente, vehiculo, anioVehiculo, patente, tipoVehiculo, items, notas, vista, idFirebase]);

  // Cálculos
  const totales = useMemo(() => {
    const sub = items.reduce((a, i) => a + (i.precio * i.cantidad), 0);
    return { sub, iva: Math.round(sub * 0.19), total: Math.round(sub * 1.19) };
  }, [items]);

  // Stats calculadas
  const stats: StatsData = useMemo(() => {
    const totalVentas = historial.reduce((a, b) => a + (b.totalFinal || 0), 0);
    const totalCotizaciones = historial.length;
    const totalClientes = clientes.length;

    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const cotizacionesMes = historial.filter(c => new Date(c.fecha) >= primerDiaMes);
    const ventasMes = cotizacionesMes.reduce((a, b) => a + (b.totalFinal || 0), 0);

    const clientesNuevosMes = clientes.filter(c =>
      c.fechaRegistro && new Date(c.fechaRegistro.toDate()) >= primerDiaMes
    ).length;

    // Servicios por categoría
    const serviciosPorCategoria: { [key: string]: { cantidad: number; total: number } } = {};
    historial.forEach(cot => {
      cot.items.forEach(item => {
        const cat = item.categoria || 'otros';
        if (!serviciosPorCategoria[cat]) {
          serviciosPorCategoria[cat] = { cantidad: 0, total: 0 };
        }
        serviciosPorCategoria[cat].cantidad += item.cantidad;
        serviciosPorCategoria[cat].total += item.precio * item.cantidad;
      });
    });
    const serviciosMasVendidos = Object.entries(serviciosPorCategoria)
      .map(([categoria, data]) => ({ categoria, ...data }))
      .sort((a, b) => b.total - a.total);

    // Vehículos por tipo
    const vehiculosPorTipo: { [key: string]: number } = {};
    historial.forEach(cot => {
      const tipo = cot.tipoVehiculo || 'otro';
      vehiculosPorTipo[tipo] = (vehiculosPorTipo[tipo] || 0) + 1;
    });
    const vehiculosMasAtendidos = Object.entries(vehiculosPorTipo)
      .map(([tipo, cantidad]) => ({ tipo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Estados
    const estadosPorTipo: { [key: string]: number } = {};
    historial.forEach(cot => {
      const estado = cot.estado || 'pendiente';
      estadosPorTipo[estado] = (estadosPorTipo[estado] || 0) + 1;
    });
    const estadoCotizaciones = Object.entries(estadosPorTipo)
      .map(([estado, cantidad]) => ({ estado, cantidad }));

    return {
      totalVentas,
      totalCotizaciones,
      totalClientes,
      ventasMes,
      cotizacionesMes: cotizacionesMes.length,
      clientesNuevosMes,
      serviciosMasVendidos,
      vehiculosMasAtendidos,
      estadoCotizaciones
    };
  }, [historial, clientes]);

  // Filtros aplicados
  const historialFiltrado = useMemo(() => {
    return historial.filter(cot => {
      const matchEstado = filtroEstado === 'todos' || cot.estado === filtroEstado;
      const matchTipo = filtroTipoVehiculo === 'todos' || cot.tipoVehiculo === filtroTipoVehiculo;
      const matchBusqueda = busqueda === '' ||
        cot.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        cot.patente.toLowerCase().includes(busqueda.toLowerCase()) ||
        cot.vehiculo.toLowerCase().includes(busqueda.toLowerCase());

      let matchFecha = true;
      if (filtroFecha !== 'todos') {
        const fechaCot = new Date(cot.fecha);
        const hoy = new Date();
        if (filtroFecha === 'hoy') {
          matchFecha = fechaCot.toDateString() === hoy.toDateString();
        } else if (filtroFecha === 'semana') {
          const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchFecha = fechaCot >= semanaAtras;
        } else if (filtroFecha === 'mes') {
          matchFecha = fechaCot.getMonth() === hoy.getMonth() && fechaCot.getFullYear() === hoy.getFullYear();
        }
      }

      return matchEstado && matchTipo && matchBusqueda && matchFecha;
    });
  }, [historial, filtroEstado, filtroTipoVehiculo, busqueda, filtroFecha]);

  const guardar = async () => {
    if (!user) return;
    setLoadingData(true);

    const data: Partial<CotizacionData> = {
      cliente,
      rutCliente,
      emailCliente,
      telefonoCliente,
      vehiculo,
      anioVehiculo,
      patente,
      tipoVehiculo,
      fecha,
      numeroCotizacion,
      items,
      notas,
      totalFinal: totales.total,
      estado: estadoCotizacion,
      ultimaModificacion: Timestamp.now()
    };

    try {
      if (idFirebase) {
        await updateDoc(doc(db, "cotizaciones", idFirebase), data);
      } else {
        data.fechaCreacion = Timestamp.now();
        await addDoc(collection(db, "cotizaciones"), data);
      }

      localStorage.removeItem('lions_borrador');
      await cargarHistorial();
      setVista('dashboard');
    } catch (e) {
      console.error(e);
      alert("Error al guardar la cotización.");
    }
    setLoadingData(false);
  };

  const eliminar = async (id: string) => {
    if (!window.confirm("¿Eliminar esta cotización permanentemente?")) return;

    setLoadingData(true);
    try {
      await deleteDoc(doc(db, "cotizaciones", id));
      await cargarHistorial();
      if (vista === 'editor') setVista('dashboard');
      setModalDetalle({ isOpen: false });
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar la cotización.");
    }
    setLoadingData(false);
  };

  const abrir = (d?: CotizacionData) => {
    if (d) {
      setIdFirebase(d.id_firebase || null);
      setCliente(d.cliente);
      setRutCliente(d.rutCliente);
      setEmailCliente(d.emailCliente || '');
      setTelefonoCliente(d.telefonoCliente || '');
      setVehiculo(d.vehiculo);
      setAnioVehiculo(d.anioVehiculo);
      setPatente(d.patente);
      setTipoVehiculo(d.tipoVehiculo || 'auto');
      setFecha(d.fecha);
      setNumeroCotizacion(d.numeroCotizacion);
      setItems(d.items);
      setNotas(d.notas);
      setEstadoCotizacion(d.estado || 'pendiente');
    } else {
      const borrador = localStorage.getItem('lions_borrador');
      if (borrador && window.confirm("⚠️ Tienes una cotización sin guardar. ¿Deseas recuperarla?")) {
        try {
          const data = JSON.parse(borrador);
          setIdFirebase(null);
          setCliente(data.cliente || '');
          setRutCliente(data.rutCliente || '');
          setEmailCliente(data.emailCliente || '');
          setTelefonoCliente(data.telefonoCliente || '');
          setVehiculo(data.vehiculo || '');
          setAnioVehiculo(data.anioVehiculo || '');
          setPatente(data.patente || '');
          setTipoVehiculo(data.tipoVehiculo || 'auto');
          setItems(data.items || [{ id: crypto.randomUUID(), descripcion: '', precio: 0, cantidad: 1, categoria: 'mecanica' }]);
          setNotas(data.notas || 'Garantía de 3 meses en trabajos realizados. Validez de cotización: 10 días hábiles.');
          setNumeroCotizacion('2026-' + (historial.length + 1).toString().padStart(3, '0'));
          setEstadoCotizacion('pendiente');
        } catch (e) {
          localStorage.removeItem('lions_borrador');
          resetForm();
        }
      } else {
        resetForm();
      }
    }
    setVista('editor');
  };

  const resetForm = () => {
    setIdFirebase(null);
    setCliente('');
    setRutCliente('');
    setEmailCliente('');
    setTelefonoCliente('');
    setVehiculo('');
    setAnioVehiculo('');
    setPatente('');
    setTipoVehiculo('auto');
    setItems([{ id: crypto.randomUUID(), descripcion: '', precio: 0, cantidad: 1, categoria: 'mecanica' }]);
    setNumeroCotizacion('2026-' + (historial.length + 1).toString().padStart(3, '0'));
    setNotas('Garantía de 3 meses en trabajos realizados. Validez de cotización: 10 días hábiles.');
    setEstadoCotizacion('pendiente');
  };

  const fmt = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(n);

  const exportarExcel = () => {
    alert("Exportación a Excel - Próximamente con librería XLSX");
    setModalExportar(false);
  };

  if (loadingAuth) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-red-600 mx-auto mb-4" size={48} />
          <p className="text-neutral-400 font-mono text-sm">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={() => { }} />;

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-red-500/30 overflow-x-hidden">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"></div>

      {/* SIDEBAR */}
      <div className="fixed left-0 top-0 h-full w-20 bg-neutral-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-8 gap-6 z-40">
        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-black rounded-xl flex items-center justify-center mb-4">
          <Wrench size={24} className="text-white" />
        </div>

        <button
          onClick={() => setVista('dashboard')}
          className={`p-4 rounded-xl transition-colors relative group ${vista === 'dashboard' ? 'bg-red-600 text-white' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
        >
          <BarChart3 size={20} />
          <span className="absolute left-full ml-4 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Dashboard
          </span>
        </button>

        <button
          onClick={() => setVista('clientes')}
          className={`p-4 rounded-xl transition-colors relative group ${vista === 'clientes' ? 'bg-red-600 text-white' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
        >
          <Users size={20} />
          <span className="absolute left-full ml-4 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Clientes
          </span>
        </button>

        <button
          onClick={() => setVista('analytics')}
          className={`p-4 rounded-xl transition-colors relative group ${vista === 'analytics' ? 'bg-red-600 text-white' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
        >
          <Activity size={20} />
          <span className="absolute left-full ml-4 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Analytics
          </span>
        </button>

        <div className="flex-1" />

        <button
          onClick={() => signOut(auth)}
          className="p-4 rounded-xl text-neutral-500 hover:text-red-500 hover:bg-white/5 transition-colors relative group"
        >
          <LogOut size={20} />
          <span className="absolute left-full ml-4 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Cerrar Sesión
          </span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="ml-20">
        <AnimatePresence mode='wait'>
          {/* DASHBOARD */}
          {vista === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-[1800px] mx-auto p-8 relative z-10"
            >
              <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-1 bg-red-600 rounded-full shadow-[0_0_15px_red]"></div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">
                      CENTRO DE <span className="text-red-600">CONTROL</span>
                    </h1>
                  </div>
                  <p className="text-neutral-500 font-mono text-xs tracking-widest pl-4">
                    Sistema de Gestión Integral • {empresa.nombre}
                  </p>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <NeonButton onClick={() => setModalFiltros(true)} icon={Filter} label="FILTROS" variant="secondary" />
                  <NeonButton onClick={() => setModalExportar(true)} icon={Download} label="EXPORTAR" variant="secondary" />
                  <NeonButton onClick={() => abrir()} icon={Plus} label="NUEVA COTIZACIÓN" variant="primary" />
                </div>
              </header>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatsCard
                  icon={DollarSign}
                  label="Ventas Totales"
                  value={fmt(stats.totalVentas)}
                  trend={{ value: 12.5, positive: true }}
                  color="green"
                />
                <StatsCard
                  icon={FileText}
                  label="Cotizaciones"
                  value={stats.totalCotizaciones}
                  trend={{ value: 8.3, positive: true }}
                  color="blue"
                />
                <StatsCard
                  icon={Users}
                  label="Clientes Activos"
                  value={stats.totalClientes}
                  trend={{ value: 15.7, positive: true }}
                  color="purple"
                />
                <StatsCard
                  icon={TrendingUp}
                  label="Ventas del Mes"
                  value={fmt(stats.ventasMes)}
                  trend={{ value: 23.4, positive: true }}
                  color="orange"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <GlassCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                      <Calendar size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-bold uppercase">Este Mes</p>
                      <h3 className="text-2xl font-black text-white">{stats.cotizacionesMes} Cotizaciones</h3>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                      <Users size={24} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-bold uppercase">Clientes Nuevos</p>
                      <h3 className="text-2xl font-black text-white">{stats.clientesNuevosMes} Este Mes</h3>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                      <Clock size={24} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-bold uppercase">Pendientes</p>
                      <h3 className="text-2xl font-black text-white">
                        {stats.estadoCotizaciones.find(e => e.estado === 'pendiente')?.cantidad || 0}
                      </h3>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Search Bar */}
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por cliente, patente o vehículo..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      className="w-full bg-neutral-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-red-500/50 focus:ring-0 outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 focus:ring-0 outline-none"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completada">Completada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>

                  <button
                    onClick={() => {
                      setFiltroEstado('todos');
                      setFiltroFecha('todos');
                      setFiltroTipoVehiculo('todos');
                      setBusqueda('');
                    }}
                    className="px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-sm text-neutral-400 hover:text-white hover:border-white/20 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Cotizaciones List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="text-red-600" />
                    COTIZACIONES RECIENTES
                    <span className="text-sm text-neutral-500 font-normal">
                      ({historialFiltrado.length})
                    </span>
                  </h3>
                  <button
                    onClick={cargarHistorial}
                    className="text-neutral-500 hover:text-white transition-colors"
                    disabled={loadingData}
                  >
                    <Loader2 size={18} className={loadingData ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="grid gap-3">
                  {historialFiltrado.map((cot, i) => {
                    const estadoColors = {
                      pendiente: 'bg-yellow-600/20 text-yellow-500 border-yellow-600/30',
                      aprobada: 'bg-green-600/20 text-green-500 border-green-600/30',
                      rechazada: 'bg-red-600/20 text-red-500 border-red-600/30',
                      en_proceso: 'bg-blue-600/20 text-blue-500 border-blue-600/30',
                      completada: 'bg-purple-600/20 text-purple-500 border-purple-600/30'
                    };
                    const estadoLabel = {
                      pendiente: 'Pendiente',
                      aprobada: 'Aprobada',
                      rechazada: 'Rechazada',
                      en_proceso: 'En Proceso',
                      completada: 'Completada'
                    };

                    return (
                      <motion.div
                        key={cot.id_firebase}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3) }}
                        className="group bg-neutral-900/40 border border-white/5 hover:border-red-600/50 hover:bg-white/5 p-5 rounded-2xl cursor-pointer transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-6 flex-1">
                            <div className="h-14 w-14 bg-neutral-950 rounded-xl flex flex-col items-center justify-center border border-white/10 group-hover:border-red-600/30 transition-colors">
                              <span className="text-[9px] text-neutral-500 font-bold uppercase">
                                {cot.fecha.split('-')[1]}
                              </span>
                              <span className="text-xl font-black text-white">
                                {cot.fecha.split('-')[2]}
                              </span>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-bold text-lg group-hover:text-red-500 transition-colors">
                                  {cot.cliente}
                                </h4>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${estadoColors[cot.estado || 'pendiente']}`}>
                                  {estadoLabel[cot.estado || 'pendiente']}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-neutral-500">
                                <span className="flex items-center gap-1">
                                  <Car size={12} />
                                  {cot.vehiculo}
                                </span>
                                <span className="font-mono text-neutral-300">{cot.patente}</span>
                                <span className="text-neutral-600">•</span>
                                <span className="text-neutral-400">{cot.numeroCotizacion}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 w-full lg:w-auto">
                            <div className="text-right flex-1 lg:flex-none">
                              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">
                                Monto Total
                              </p>
                              <p className="text-2xl font-black text-white font-mono">
                                {fmt(cot.totalFinal)}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalDetalle({ isOpen: true, cotizacion: cot });
                                }}
                                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:bg-blue-600 hover:text-white transition-all"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrir(cot);
                                }}
                                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:bg-red-600 hover:text-white transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {historialFiltrado.length === 0 && !loadingData && (
                    <div className="text-center py-20">
                      <FileText size={48} className="text-neutral-700 mx-auto mb-4" />
                      <p className="text-neutral-600 font-mono">
                        {busqueda || filtroEstado !== 'todos'
                          ? 'No se encontraron cotizaciones con los filtros aplicados'
                          : 'No hay cotizaciones registradas'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CLIENTES VIEW */}
          {vista === 'clientes' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[1800px] mx-auto p-8"
            >
              <header className="flex justify-between items-end gap-8 mb-12">
                <div>
                  <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
                    GESTIÓN DE <span className="text-red-600">CLIENTES</span>
                  </h1>
                  <p className="text-neutral-500 font-mono text-xs">
                    Base de datos completa • {stats.totalClientes} clientes registrados
                  </p>
                </div>
                <NeonButton onClick={() => setModalCliente({ isOpen: true })} icon={Plus} label="NUEVO CLIENTE" variant="primary" />
              </header>

              <div className="text-center py-20">
                <Users size={64} className="text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Módulo de Clientes</h3>
                <p className="text-neutral-500">Esta sección está en desarrollo • Próximamente CRUD completo</p>
              </div>
            </motion.div>
          )}

          {/* ANALYTICS VIEW */}
          {vista === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[1800px] mx-auto p-8"
            >
              <header className="mb-12">
                <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
                  ANALYTICS & <span className="text-red-600">REPORTES</span>
                </h1>
                <p className="text-neutral-500 font-mono text-xs">
                  Análisis avanzado de rendimiento del negocio
                </p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Servicios más vendidos */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Package className="text-red-600" />
                    Servicios Más Vendidos
                  </h3>
                  <div className="space-y-4">
                    {stats.serviciosMasVendidos.slice(0, 5).map((servicio, i) => {
                      const categoriaLabels: { [key: string]: { label: string; icon: React.ElementType; color: string } } = {
                        mecanica: { label: 'Mecánica', icon: Wrench, color: 'bg-blue-600' },
                        desabolladura: { label: 'Desabolladura', icon: Car, color: 'bg-green-600' },
                        pintura: { label: 'Pintura', icon: Palette, color: 'bg-purple-600' },
                        repuestos: { label: 'Repuestos', icon: Package, color: 'bg-orange-600' },
                        otros: { label: 'Otros', icon: Settings, color: 'bg-neutral-600' }
                      };
                      const catInfo = categoriaLabels[servicio.categoria] || categoriaLabels.otros;
                      const Icon = catInfo.icon;

                      return (
                        <div key={i} className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${catInfo.color} rounded-lg flex items-center justify-center`}>
                            <Icon size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-bold text-white">{catInfo.label}</span>
                              <span className="text-sm font-mono text-neutral-400">{fmt(servicio.total)}</span>
                            </div>
                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${catInfo.color}`}
                                style={{ width: `${(servicio.total / stats.serviciosMasVendidos[0].total) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* Tipos de vehículos */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Car className="text-red-600" />
                    Vehículos Más Atendidos
                  </h3>
                  <div className="space-y-4">
                    {stats.vehiculosMasAtendidos.slice(0, 5).map((vehiculo, i) => {
                      const tipoLabels: { [key: string]: string } = {
                        auto: 'Automóvil',
                        camioneta: 'Camioneta',
                        suv: 'SUV',
                        moto: 'Motocicleta',
                        camion: 'Camión',
                        otro: 'Otro'
                      };

                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-black text-red-500">{i + 1}</span>
                            </div>
                            <span className="text-sm font-bold text-white">
                              {tipoLabels[vehiculo.tipo] || vehiculo.tipo}
                            </span>
                          </div>
                          <span className="text-2xl font-black text-neutral-300">{vehiculo.cantidad}</span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* Estados */}
                <GlassCard className="p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <PieChart className="text-red-600" />
                    Estado de Cotizaciones
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {stats.estadoCotizaciones.map((estado, i) => {
                      const estadoConfig: { [key: string]: { label: string; color: string; bgColor: string } } = {
                        pendiente: { label: 'Pendientes', color: 'text-yellow-500', bgColor: 'bg-yellow-600' },
                        aprobada: { label: 'Aprobadas', color: 'text-green-500', bgColor: 'bg-green-600' },
                        rechazada: { label: 'Rechazadas', color: 'text-red-500', bgColor: 'bg-red-600' },
                        en_proceso: { label: 'En Proceso', color: 'text-blue-500', bgColor: 'bg-blue-600' },
                        completada: { label: 'Completadas', color: 'text-purple-500', bgColor: 'bg-purple-600' }
                      };
                      const config = estadoConfig[estado.estado] || estadoConfig.pendiente;

                      return (
                        <div key={i} className="text-center">
                          <div className={`w-20 h-20 ${config.bgColor} rounded-2xl mx-auto mb-3 flex items-center justify-center`}>
                            <span className="text-3xl font-black text-white">{estado.cantidad}</span>
                          </div>
                          <p className={`text-xs font-bold uppercase ${config.color}`}>{config.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* EDITOR VIEW COMPLETO */}
          {vista === 'editor' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-[#0a0a0a] print:bg-white pb-20 overflow-x-hidden" // Added overflow-x-hidden to prevent body scroll
            >
              {/* Floating Command Bar - Responsive Adjustments */}
              <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-40 bg-black/90 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl flex items-center justify-between gap-2 shadow-2xl print:hidden w-[95%] md:w-auto overflow-x-auto">
                <button onClick={() => setVista('dashboard')} className="p-3 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors shrink-0">
                  <ArrowLeft size={20} />
                </button>

                <div className="w-px h-8 bg-white/10 mx-2 shrink-0" />

                <button onClick={guardar} disabled={loadingData} className="flex items-center gap-2 px-4 md:px-6 py-3 bg-white text-black rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50 shrink-0 whitespace-nowrap">
                  {loadingData ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {idFirebase ? 'ACTUALIZAR' : 'GUARDAR'}
                </button>

                <AnimatePresence>
                  {!idFirebase && autoSaved && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="overflow-hidden hidden sm:block">
                      <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold px-3 uppercase tracking-wider whitespace-nowrap">
                        <CheckCircle2 size={12} /> Guardado Local
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="w-px h-8 bg-white/10 mx-2 shrink-0" />

                <button onClick={() => window.print()} className="p-3 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors shrink-0">
                  <Printer size={20} />
                </button>

                {idFirebase && (
                  <button onClick={() => eliminar(idFirebase!)} className="p-3 hover:bg-red-900/20 rounded-xl text-neutral-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="h-24 print:hidden"></div>

              {/* DOCUMENTO COMPLETO - Responsive Wrapper */}
              <div className="w-full md:max-w-[21cm] mx-auto bg-neutral-900 min-h-[29.7cm] shadow-2xl print:shadow-none relative text-white print:bg-white print:text-black transition-all">

                {/* Header Premium - Stacked on mobile */}
                <div className="px-4 py-6 md:px-8 md:py-8 print:px-6 print:py-6 border-b-2 border-red-600 print:border-black flex flex-col md:flex-row justify-between items-center md:items-start relative overflow-hidden gap-6 md:gap-0">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px] pointer-events-none print:hidden"></div>

                  <div className="flex flex-col gap-4 relative z-10 w-full md:w-auto items-center md:items-start text-center md:text-left">
                    <div className="w-48 bg-black/50 p-3 rounded-xl border border-white/10 print:bg-transparent print:border-none">
                      <div className="w-full h-16 bg-neutral-800 rounded flex items-center justify-center print:bg-transparent">
                        <span className="text-xs font-bold text-white print:text-black">{empresa.nombre}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-medium space-y-1 ml-1 print:text-neutral-600 flex flex-col items-center md:items-start">
                      <p className="flex items-center gap-2"><Building2 size={10} className="text-red-600 print:text-black" /> {empresa.direccion}</p>
                      <p className="flex items-center gap-2"><Hash size={10} className="text-red-600 print:text-black" /> RUT: {empresa.rut}</p>
                      <p className="flex items-center gap-2"><Zap size={10} className="text-red-600 print:text-black" /> {empresa.web}</p>
                    </div>
                  </div>

                  <div className="text-center md:text-right relative z-10 w-full md:w-auto">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter print:text-black">COTIZACIÓN</h1>
                    <p className="text-xs font-bold text-red-600 print:text-black uppercase tracking-[0.3em] mb-4">
                      {empresa.nombre.toUpperCase()}
                    </p>

                    <div className="inline-flex flex-col items-center md:items-end gap-2 bg-neutral-800/50 print:bg-transparent p-4 rounded-lg border border-white/10 print:border print:border-neutral-300 w-full md:w-auto">
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                        <span className="text-[10px] font-bold text-neutral-400 print:text-neutral-600 uppercase tracking-wider">N°</span>
                        <input
                          value={numeroCotizacion}
                          onChange={e => setNumeroCotizacion(e.target.value)}
                          className="text-right text-xl font-black text-red-500 print:text-black w-32 border-none bg-transparent p-0 focus:ring-0"
                        />
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                        <span className="text-[10px] font-bold text-neutral-400 print:text-neutral-600 uppercase tracking-wider">Fecha</span>
                        <input
                          type="date"
                          value={fecha}
                          onChange={e => setFecha(e.target.value)}
                          className="text-right text-sm font-bold text-neutral-300 print:text-black border-none bg-transparent p-0 focus:ring-0 [color-scheme:dark] print:[color-scheme:light]"
                        />
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3 print:hidden w-full">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Estado</span>
                        <select
                          value={estadoCotizacion}
                          onChange={e => setEstadoCotizacion(e.target.value as CotizacionData['estado'])}
                          className="text-right text-xs font-bold bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-white focus:ring-0"
                        >
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

                {/* Body */}
                <div className="p-4 md:p-8 print:p-6">
                  {/* Tarjetas de Datos - Stacked on Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    {/* === CLIENTE === */}
                    <div className="bg-neutral-800/50 p-5 rounded-xl border border-white/5 print:bg-transparent print:border print:border-neutral-200">
                      <h3 className="text-[10px] font-black text-red-600 print:text-black uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Users size={12} /> Información del Cliente
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 print:text-neutral-600 uppercase block mb-1">
                            Nombre / Razón Social *
                          </label>
                          <input
                            value={cliente}
                            onChange={e => setCliente(e.target.value)}
                            className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded px-3 py-2 text-sm font-bold text-white print:text-black focus:border-red-600 focus:ring-0 transition-colors"
                            placeholder="Ingrese nombre completo"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-neutral-500 print:text-neutral-600 uppercase block mb-1">RUT *</label>
                            <input
                              value={rutCliente}
                              onChange={e => setRutCliente(e.target.value)}
                              className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded px-3 py-2 text-sm font-medium text-neutral-300 print:text-black focus:border-red-600 focus:ring-0"
                              placeholder="XX.XXX.XXX-X"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-neutral-500 print:text-neutral-600 uppercase block mb-1">Teléfono</label>
                            <input
                              value={telefonoCliente}
                              onChange={e => setTelefonoCliente(e.target.value)}
                              className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded px-3 py-2 text-sm font-medium text-neutral-300 print:text-black focus:border-red-600 focus:ring-0"
                              placeholder="+56 9 XXXX XXXX"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 print:text-neutral-600 uppercase block mb-1">Email</label>
                          <input
                            type="email"
                            value={emailCliente}
                            onChange={e => setEmailCliente(e.target.value)}
                            className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded px-3 py-2 text-sm font-medium text-neutral-300 print:text-black focus:border-red-600 focus:ring-0"
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* === VEHÍCULO === */}
                    <div className="bg-neutral-800/50 p-5 rounded-xl border border-white/5 print:bg-transparent print:border print:border-neutral-200">
                      <h3 className="text-[10px] font-black text-red-600 print:text-black uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Car size={12} /> Información del Vehículo
                      </h3>
                      <div className="space-y-3">
                        {/* Marca/Modelo */}
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 print:text-neutral-600 uppercase block mb-1">
                            Marca / Modelo *
                          </label>
                          <input
                            value={vehiculo}
                            onChange={e => setVehiculo(e.target.value)}
                            className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded px-3 py-2 text-sm font-bold text-white print:text-black focus:border-red-600 focus:ring-0"
                            placeholder="Ej: Toyota Hilux 4x4"
                            required
                          />
                        </div>

                        {/* Año y Patente */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-neutral-500 print:text-neutral-600 uppercase block mb-1">
                              Año
                            </label>
                            <input
                              value={anioVehiculo}
                              onChange={e => setAnioVehiculo(e.target.value)}
                              className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded px-3 py-2 text-sm font-medium text-neutral-300 print:text-black focus:border-red-600 focus:ring-0"
                              placeholder="2024"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-neutral-500 print:text-neutral-600 uppercase block mb-1">
                              Patente *
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                value={patente}
                                onChange={e => setPatente(e.target.value.toUpperCase())}
                                className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded px-3 py-2 text-sm font-black text-white print:text-black focus:border-red-600 focus:ring-0 uppercase tracking-wider text-center"
                                placeholder="XXXX-00"
                                required
                                style={{ minWidth: '0' }}
                              />
                              <a
                                href="https://www.patentechile.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-neutral-800 print:hidden w-9 h-9 rounded flex items-center justify-center text-neutral-500 hover:text-red-600 border border-neutral-700 shrink-0 flex-shrink-0"
                                title="Buscar"
                              >
                                <Search size={14} />
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Tipo */}
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 print:text-neutral-600 uppercase block mb-1">
                            Tipo de Vehículo
                          </label>
                          <select
                            value={tipoVehiculo}
                            onChange={e => setTipoVehiculo(e.target.value as CotizacionData['tipoVehiculo'])}
                            className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded px-3 py-2 text-sm font-medium text-neutral-300 print:text-black focus:border-red-600 focus:ring-0"
                          >
                            <option value="auto">Automóvil</option>
                            <option value="camioneta">Camioneta</option>
                            <option value="suv">SUV</option>
                            <option value="moto">Motocicleta</option>
                            <option value="camion">Camión</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de Items - Responsive Scrolling Wrapper */}
                  <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                    <table className="w-full mb-8 min-w-[600px] md:min-w-0">
                      <div className="print:text-xs"></div>
                      <thead>
                        <tr className="border-b-2 border-neutral-800 print:border-black">
                          <th className="py-3 text-left text-[10px] font-black uppercase text-neutral-500 print:text-black tracking-widest w-[40%]">
                            Descripción del Servicio
                          </th>
                          <th className="py-3 text-center text-[10px] font-black uppercase text-neutral-500 print:text-black tracking-widest w-[15%]">
                            Categoría
                          </th>
                          <th className="py-3 text-center text-[10px] font-black uppercase text-neutral-500 print:text-black tracking-widest w-[15%]">
                            Precio Unit.
                          </th>
                          <th className="py-3 text-center text-[10px] font-black uppercase text-neutral-500 print:text-black tracking-widest w-[10%]">
                            Cant.
                          </th>
                          <th className="py-3 text-right text-[10px] font-black uppercase text-neutral-500 print:text-black tracking-widest w-[15%]">
                            Subtotal
                          </th>
                          <th className="w-10 print:hidden"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 print:divide-neutral-200">
                        {items.map((item, index) => (
                          <tr key={item.id} className="group hover:bg-neutral-800/30 print:hover:bg-transparent transition-colors">
                            <td className="py-3">
                              <input
                                value={item.descripcion}
                                onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, descripcion: e.target.value } : i))}
                                className="w-full font-medium text-sm border-none p-2 focus:ring-0 bg-transparent text-white print:text-black"
                                placeholder="Describe el servicio realizado..."
                              />
                            </td>
                            <td className="py-3">
                              <select
                                value={item.categoria}
                                onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, categoria: e.target.value as ItemCotizacion['categoria'] } : i))}
                                className="w-full text-xs text-center border-none p-2 focus:ring-0 bg-neutral-900 print:bg-neutral-100 rounded text-neutral-300 print:text-black"
                              >
                                <option value="mecanica">Mecánica</option>
                                <option value="desabolladura">Desabolladura</option>
                                <option value="pintura">Pintura</option>
                                <option value="repuestos">Repuestos</option>
                                <option value="otros">Otros</option>
                              </select>
                            </td>
                            <td className="py-3">
                              <input
                                type="number"
                                value={item.precio}
                                onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, precio: Number(e.target.value) } : i))}
                                className="w-full font-mono text-sm text-center border-none p-2 focus:ring-0 bg-neutral-900 print:bg-neutral-100 rounded text-neutral-300 print:text-black"
                              />
                            </td>
                            <td className="py-3">
                              <input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={e => setItems(p => p.map(i => i.id === item.id ? { ...i, cantidad: Number(e.target.value) } : i))}
                                className="w-full font-mono text-sm text-center border-none p-2 focus:ring-0 bg-transparent text-neutral-300 print:text-black"
                              />
                            </td>
                            <td className="py-3 text-right font-bold font-mono text-sm text-white print:text-black pr-2">
                              {fmt(item.precio * item.cantidad)}
                            </td>
                            <td className="print:hidden text-center">
                              <button
                                onClick={() => setItems(p => p.filter(i => i.id !== item.id))}
                                disabled={items.length === 1}
                                className="text-neutral-600 hover:text-red-500 transition-colors p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => setItems([...items, { id: crypto.randomUUID(), descripcion: '', precio: 0, cantidad: 1, categoria: 'mecanica' }])}
                    className="print:hidden flex items-center gap-2 text-[10px] font-bold text-red-600 hover:bg-red-600/10 px-4 py-3 rounded-lg transition-colors uppercase tracking-widest border border-red-600/30 mb-8"
                  >
                    <Plus size={14} /> Agregar Servicio
                  </button>

                  {/* Footer con Totales - Stacked on mobile */}
                  <div className="flex flex-col md:flex-row items-start justify-between border-t border-neutral-800 print:border-neutral-200 pt-8 gap-8">
                    <div className="w-full md:w-1/2">
                      <p className="text-[10px] font-black text-neutral-500 print:text-neutral-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText size={12} className="text-red-600 print:text-black" /> Notas y Observaciones
                      </p>
                      <textarea
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                        className="w-full bg-neutral-900 print:bg-white border border-neutral-700 print:border-neutral-300 rounded-lg p-4 text-xs text-neutral-400 print:text-black h-24 print:h-20 resize-none focus:border-red-600 focus:ring-0 outline-none"
                        placeholder="Añade términos, condiciones o información adicional..."
                      />
                    </div>

                    <div className="w-full md:w-1/3 space-y-4">
                      <div className="space-y-3 bg-neutral-800/50 print:bg-transparent p-6 rounded-xl border border-white/5 print:border print:border-neutral-200">
                        <div className="flex justify-between text-sm text-neutral-400 print:text-neutral-600">
                          <span className="font-medium">Subtotal (Neto)</span>
                          <span className="font-mono text-white print:text-black font-bold">{fmt(totales.sub)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-neutral-400 print:text-neutral-600 border-b border-neutral-700 print:border-neutral-300 pb-3">
                          <span className="font-medium">IVA (19%)</span>
                          <span className="font-mono text-white print:text-black font-bold">{fmt(totales.iva)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-base font-black uppercase text-white print:text-black">TOTAL A PAGAR</span>
                          <span className="text-3xl font-black text-red-500 print:text-black tracking-tight leading-none">
                            {fmt(totales.total)}
                          </span>
                        </div>
                      </div>

                      <div className="text-[9px] text-neutral-500 print:text-neutral-600 text-center space-y-1">
                        <p className="font-bold">Métodos de pago aceptados</p>
                        <p>Efectivo • Transferencia • Débito • Crédito</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer del documento */}
                <div className="px-10 py-6 border-t border-neutral-800 print:border-neutral-300 text-center">
                  <p className="text-[10px] text-neutral-500 print:text-neutral-600">
                    {empresa.nombre} • {empresa.direccion} • {empresa.telefono} • {empresa.web}
                  </p>
                  <p className="text-[9px] text-neutral-600 mt-1">
                    Documento generado electrónicamente • Sistema Lions Cars Pro
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODALS */}
      <Modal isOpen={modalDetalle.isOpen} onClose={() => setModalDetalle({ isOpen: false })} title="Detalle de Cotización" size="lg">
        {modalDetalle.cotizacion && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Cliente</p>
                <p className="text-lg font-bold text-white">{modalDetalle.cotizacion.cliente}</p>
                <p className="text-sm text-neutral-400">{modalDetalle.cotizacion.rutCliente}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Vehículo</p>
                <p className="text-lg font-bold text-white">{modalDetalle.cotizacion.vehiculo}</p>
                <p className="text-sm text-neutral-400">{modalDetalle.cotizacion.patente}</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-neutral-500 font-bold uppercase mb-3">Servicios</p>
              <div className="space-y-2">
                {modalDetalle.cotizacion.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-neutral-800/30 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.descripcion}</p>
                      <p className="text-xs text-neutral-500">{item.cantidad}x {fmt(item.precio)}</p>
                    </div>
                    <p className="text-sm font-bold text-white">{fmt(item.precio * item.cantidad)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between">
              <span className="text-lg font-bold text-white">TOTAL</span>
              <span className="text-2xl font-black text-red-500">{fmt(modalDetalle.cotizacion.totalFinal)}</span>
            </div>
            <div className="flex gap-3">
              <NeonButton onClick={() => { abrir(modalDetalle.cotizacion); setModalDetalle({ isOpen: false }); }} icon={Edit2} label="EDITAR" variant="primary" className="flex-1" />
              <NeonButton onClick={() => modalDetalle.cotizacion?.id_firebase && eliminar(modalDetalle.cotizacion.id_firebase)} icon={Trash2} label="ELIMINAR" variant="danger" className="flex-1" />
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={modalFiltros} onClose={() => setModalFiltros(false)} title="Filtros Avanzados" size="md">
        <div className="space-y-6">
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase mb-2 block">Estado</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:border-red-500 focus:ring-0">
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completada">Completada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase mb-2 block">Período</label>
            <select value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:border-red-500 focus:ring-0">
              <option value="todos">Todos los períodos</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Última semana</option>
              <option value="mes">Este mes</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400 font-bold uppercase mb-2 block">Tipo de Vehículo</label>
            <select value={filtroTipoVehiculo} onChange={e => setFiltroTipoVehiculo(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white focus:border-red-500 focus:ring-0">
              <option value="todos">Todos los tipos</option>
              <option value="auto">Automóvil</option>
              <option value="camioneta">Camioneta</option>
              <option value="suv">SUV</option>
              <option value="moto">Motocicleta</option>
              <option value="camion">Camión</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <NeonButton onClick={() => { setFiltroEstado('todos'); setFiltroFecha('todos'); setFiltroTipoVehiculo('todos'); setModalFiltros(false); }} label="LIMPIAR FILTROS" variant="secondary" className="flex-1" />
            <NeonButton onClick={() => setModalFiltros(false)} label="APLICAR" variant="primary" className="flex-1" />
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalExportar} onClose={() => setModalExportar(false)} title="Exportar Datos" size="md">
        <div className="text-center py-8">
          <Download size={48} className="text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Exportación de Datos</h3>
          <p className="text-sm text-neutral-400 mb-6">Exporta todas tus cotizaciones y reportes</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={exportarExcel} className="p-6 bg-green-600/20 border border-green-600/30 rounded-xl hover:bg-green-600/30 transition-colors">
              <FileText size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">Excel</p>
              <p className="text-xs text-neutral-400 mt-1">Formato XLSX</p>
            </button>
            <button onClick={() => alert("PDF Export - Próximamente")} className="p-6 bg-red-600/20 border border-red-600/30 rounded-xl hover:bg-red-600/30 transition-colors">
              <FileText size={32} className="text-red-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">PDF</p>
              <p className="text-xs text-neutral-400 mt-1">Reporte completo</p>
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalCliente.isOpen} onClose={() => setModalCliente({ isOpen: false })} title={modalCliente.cliente ? "Editar Cliente" : "Nuevo Cliente"} size="lg">
        <div className="text-center py-12">
          <Users size={64} className="text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Gestión de Clientes</h3>
          <p className="text-neutral-400">Esta funcionalidad estará disponible próximamente</p>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        @media print {
            @page { margin: 0; size: letter; }
            body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print\\:hidden { display: none !important; }
            input, textarea, select { border: none !important; background: transparent !important; }
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #404040; }
      `}} />
    </div>
  );
};

export default App;