import { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  User, 
  Calendar, 
  FileText,
  ShieldCheck,
  AlertCircle,
  Star,
  MapPin,
  Phone,
  Hash,
  Building2,
  Car,
  Search,
  Globe,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * INTERFACES DE TYPESCRIPT
 */
interface ItemCotizacion {
  id: string;
  descripcion: string;
  precio: number;
  cantidad: number;
}

interface Totales {
  subtotal: number;
  iva: number;
  total: number;
}

const App = () => {
  // --- ESTADOS ---
  const [cliente, setCliente] = useState<string>('');
  const [rutCliente, setRutCliente] = useState<string>('');
  const [vehiculo, setVehiculo] = useState<string>(''); // Marca y Modelo
  const [anioVehiculo, setAnioVehiculo] = useState<string>(''); // Nuevo estado para el Año
  const [patente, setPatente] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numeroCotizacion, setNumeroCotizacion] = useState<string>('2024-001');
  const [notas, setNotas] = useState<string>('Garantía de 6 meses en reparaciones. Validez de esta cotización: 15 días corridos.');
  
  // Datos de la Empresa (Actualizados)
  const empresa = {
    rut: '78.161.408.4', 
    direccion: 'Av. Gabriela Mistral 925, Alerce-Chile',
    telefono: '+56 9 40373364',
    web: 'www.lionscars.cl'
  };

  const [items, setItems] = useState<ItemCotizacion[]>([
    { id: '1', descripcion: 'REPUESTO DE TAQUIES', precio: 38880, cantidad: 1 },
    { id: '2', descripcion: 'CAMBIO DE TAQUIES', precio: 105300, cantidad: 1 }
  ]);

  /**
   * CÁLCULOS OPTIMIZADOS
   */
  const totales: Totales = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;
    return { subtotal, iva, total };
  }, [items]);

  // --- MANEJADORES ---

  const agregarFila = () => {
    const nuevoItem: ItemCotizacion = {
      id: crypto.randomUUID(),
      descripcion: '',
      precio: 0,
      cantidad: 1
    };
    setItems((prev) => [...prev, nuevoItem]);
  };

  const actualizarItem = (id: string, campo: keyof ItemCotizacion, valor: string | number) => {
    setItems((prev) => prev.map(item => {
      if (item.id === id) {
        return { ...item, [campo]: campo === 'descripcion' ? valor : Number(valor) };
      }
      return item;
    }));
  };

  const eliminarFila = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter(item => item.id !== id));
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const imprimir = () => window.print();

  return (
    <div className="min-h-screen bg-neutral-900 py-4 sm:py-6 px-2 sm:px-4 font-sans text-neutral-900 print:bg-white print:p-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        
        {/* BARRA DE ACCIONES (Oculta al imprimir) */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-4 justify-between items-center print:hidden bg-neutral-800/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl shadow-lg border border-neutral-700">
              <img src="/LOGO1.png" alt="Icono" className="h-5 w-auto" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">Cotizador Lions Cars</h1>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={imprimir}
            className="flex items-center gap-2 bg-red-600 text-white px-4 sm:px-6 py-2.5 rounded-xl hover:bg-red-700 transition-all shadow-xl font-bold text-xs uppercase tracking-wider w-full sm:w-auto justify-center"
          >
            {/* Icono Impresora en Desktop */}
            <Printer size={16} className="text-white hidden sm:block" />
            {/* Icono Descarga en Móvil */}
            <Download size={16} className="text-white sm:hidden" />
            
            <span className="hidden sm:inline">Imprimir PDF</span>
            <span className="sm:hidden">Descargar PDF</span>
          </motion.button>
        </div>

        {/* DOCUMENTO PRINCIPAL */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-neutral-800 print:shadow-none print:border-none print:rounded-none">
          
          {/* ENCABEZADO CORPORATIVO DETALLADO */}
          <div className="relative bg-black text-white p-4 sm:p-6 print:p-5 overflow-hidden border-b-4 border-red-600">
            {/* Fondo con detalles */}
            <div className="absolute top-0 right-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-red-600/20 rounded-full -mr-20 -mt-20 blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-amber-500/10 rounded-full -ml-10 -mb-10 blur-[50px]" />
            
            {/* DATOS COTIZACIÓN - POSICIÓN ABSOLUTA EN ESCRITORIO (LA ESQUINA) */}
            <div className="hidden sm:flex flex-col items-end absolute top-6 right-6 z-20">
              <h3 className="text-white/10 text-5xl font-black tracking-tighter absolute -top-2 -right-2 select-none pointer-events-none">
                COTIZACIÓN
              </h3>
              <div className="relative z-10 flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">N°</span>
                  <input 
                    type="text" 
                    value={numeroCotizacion}
                    onChange={(e) => setNumeroCotizacion(e.target.value)}
                    className="bg-transparent border-none text-white font-mono text-3xl font-black w-40 text-right focus:ring-0 p-0 placeholder-white/50"
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Fecha:</span>
                   <p className="text-neutral-200 text-sm font-mono font-medium">
                      {fecha.split('-').reverse().join('/')}
                   </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
              
              {/* IZQUIERDA: LOGO Y DATOS EMPRESA */}
              <div className="flex flex-col sm:flex-row items-start gap-5 w-full sm:w-auto">
                <div className="bg-neutral-900 p-3 rounded-2xl shadow-lg border border-neutral-700 relative overflow-hidden shrink-0 self-center sm:self-start">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                  <img 
                    src="/LOGO1.png" 
                    alt="Lions Cars Logo" 
                    className="h-12 sm:h-16 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col w-full text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none mb-1 text-white">
                    LIONS <span className="text-red-600">CARS</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs font-bold text-amber-500 tracking-[0.25em] uppercase flex items-center justify-center sm:justify-start gap-1 mb-3">
                    <Star size={10} fill="currentColor" /> Multiservicios del Sur
                  </p>
                  
                  {/* Nuevos Datos de Contacto */}
                  <div className="space-y-1 text-[10px] text-neutral-300 font-medium">
                    <p className="flex items-center justify-center sm:justify-start gap-2">
                      <Building2 size={12} className="text-red-600 shrink-0" /> 
                      <span className="opacity-90">RUT: {empresa.rut}</span>
                    </p>
                    <p className="flex items-center justify-center sm:justify-start gap-2">
                      <MapPin size={12} className="text-red-600 shrink-0" /> 
                      <span className="opacity-90">{empresa.direccion}</span>
                    </p>
                    <p className="flex items-center justify-center sm:justify-start gap-2">
                      <Phone size={12} className="text-red-600 shrink-0" /> 
                      <span className="opacity-90">{empresa.telefono}</span>
                    </p>
                    <p className="flex items-center justify-center sm:justify-start gap-2">
                      <Globe size={12} className="text-red-600 shrink-0" /> 
                      <span className="opacity-90">{empresa.web}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* DERECHA (MÓVIL): DATOS COTIZACIÓN */}
              <div className="sm:hidden w-full mt-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-center">
                <h3 className="text-xl font-black text-white mb-2 tracking-tight">COTIZACIÓN</h3>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-bold text-red-500 uppercase">N°</span>
                    <input 
                      type="text" 
                      value={numeroCotizacion}
                      onChange={(e) => setNumeroCotizacion(e.target.value)}
                      className="bg-transparent border-none text-white font-mono text-xl font-bold w-32 text-center focus:ring-0 p-0"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-neutral-400 text-xs">
                     <span>Fecha:</span>
                     <span className="text-white font-mono">{fecha.split('-').reverse().join('/')}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* DATOS DEL CLIENTE Y VEHÍCULO */}
          <div className="p-4 sm:p-6 print:p-4 border-b border-neutral-800 bg-neutral-900">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              
              {/* Cliente */}
              <div className="sm:col-span-8 space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1 ml-1">
                  <User size={10} className="text-red-600" /> Cliente / Razón Social
                </label>
                <input 
                  type="text" 
                  placeholder="Ingrese nombre del cliente..."
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all text-sm font-bold text-white placeholder:text-neutral-600"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
              </div>

              {/* RUT Cliente */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1 ml-1">
                  <Hash size={10} className="text-red-600" /> RUT Cliente
                </label>
                <input 
                  type="text" 
                  placeholder="XX.XXX.XXX-X"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all text-sm font-bold text-white placeholder:text-neutral-600"
                  value={rutCliente}
                  onChange={(e) => setRutCliente(e.target.value)}
                />
              </div>

              {/* Fila 2: Vehículo - Año - Patente - Fecha */}
              
              {/* Marca / Modelo */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1 ml-1">
                  <Car size={10} className="text-red-600" /> Vehículo
                </label>
                <input 
                  type="text" 
                  placeholder="Marca y Modelo..."
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all text-sm font-bold text-white placeholder:text-neutral-600"
                  value={vehiculo}
                  onChange={(e) => setVehiculo(e.target.value)}
                />
              </div>

              {/* Año Vehículo */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1 ml-1">
                  <Calendar size={10} className="text-red-600" /> Año
                </label>
                <input 
                  type="number" 
                  placeholder="20XX"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all text-sm font-bold text-white placeholder:text-neutral-600"
                  value={anioVehiculo}
                  onChange={(e) => setAnioVehiculo(e.target.value)}
                />
              </div>

              {/* Patente con Enlace Directo */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1 ml-1">
                  <Hash size={10} className="text-red-600" /> Patente
                </label>
                <div className="flex gap-1">
                  <input 
                    type="text" 
                    placeholder="ABCD-12"
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all text-sm font-bold text-white placeholder:text-neutral-600 uppercase"
                    value={patente}
                    onChange={(e) => setPatente(e.target.value)}
                  />
                  <a
                    href="https://www.patentechile.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neutral-800 border border-neutral-700 p-2 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-700 transition-all print:hidden flex items-center justify-center"
                    title="Buscar información de patente en PatenteChile.com"
                  >
                    <Search size={16} />
                  </a>
                </div>
              </div>

              {/* Fecha Emisión */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1 ml-1">
                  <Calendar size={10} className="text-red-600" /> Fecha Emisión
                </label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all text-sm font-bold text-white [color-scheme:dark]"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* TABLA DE SERVICIOS - Responsiva con Scroll */}
          <div className="p-4 sm:p-6 print:p-4 min-h-[200px]">
            {/* Contenedor con Scroll Horizontal para Móviles */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full border-collapse min-w-[600px] sm:min-w-full">
                <thead>
                  <tr className="text-left border-b-2 border-neutral-800">
                    <th className="pb-3 font-black text-neutral-800 text-[9px] uppercase tracking-wider">Descripción</th>
                    <th className="pb-3 px-2 font-black text-neutral-800 text-[9px] uppercase tracking-wider w-32 text-center">Precio</th>
                    <th className="pb-3 px-2 font-black text-neutral-800 text-[9px] uppercase tracking-wider w-16 text-center">Cant.</th>
                    <th className="pb-3 px-2 font-black text-neutral-800 text-[9px] uppercase tracking-wider w-32 text-right">Total</th>
                    <th className="pb-3 w-8 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <AnimatePresence mode='popLayout'>
                    {items.map((item) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-neutral-50"
                      >
                        <td className="py-2">
                          <input 
                            type="text" 
                            placeholder="Descripción del ítem..."
                            className="w-full bg-transparent border-none focus:ring-0 font-bold text-neutral-700 text-xs py-1 placeholder:text-neutral-300"
                            value={item.descripcion}
                            onChange={(e) => actualizarItem(item.id, 'descripcion', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <div className="bg-neutral-100 rounded-md px-2 py-1 flex items-center justify-center border border-neutral-200">
                            <span className="text-[10px] text-neutral-400 mr-1">$</span>
                            <input 
                              type="number" 
                              className="w-full bg-transparent border-none focus:ring-0 text-center font-bold text-neutral-800 text-xs p-0"
                              value={item.precio}
                              onChange={(e) => actualizarItem(item.id, 'precio', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none focus:ring-0 text-center font-bold text-neutral-500 text-xs py-1"
                            value={item.cantidad}
                            onChange={(e) => actualizarItem(item.id, 'cantidad', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className="font-black text-neutral-900 text-xs">
                            {formatearMoneda(item.precio * item.cantidad)}
                          </span>
                        </td>
                        <td className="py-2 text-right print:hidden">
                          <button 
                            onClick={() => eliminarFila(item.id)}
                            className="text-neutral-300 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <button 
              onClick={agregarFila}
              className="mt-4 flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:text-red-700 transition-colors print:hidden w-full sm:w-auto justify-center sm:justify-start"
            >
              <div className="bg-red-50 p-1 rounded-md border border-red-100">
                <Plus size={12} />
              </div>
              Agregar Item
            </button>
          </div>

          {/* TOTALES Y NOTAS */}
          <div className="p-4 sm:p-6 print:p-4 bg-black text-white print:break-inside-avoid relative overflow-hidden border-t border-neutral-800">
             {/* Decoración Dorada de Fondo */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row gap-8 relative z-10">
              
              {/* Notas */}
              <div className="flex-1 order-2 sm:order-1">
                <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText size={12} /> Observaciones
                </h4>
                <textarea 
                  className="w-full text-xs text-neutral-400 bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 focus:ring-1 focus:ring-amber-500/50 resize-none h-20 placeholder:italic"
                  placeholder="Notas adicionales..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                ></textarea>
                <div className="mt-3 flex flex-wrap gap-4">
                   <div className="flex items-center gap-2 text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                      <ShieldCheck size={12} className="text-red-500" /> Garantía
                   </div>
                   <div className="flex items-center gap-2 text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                      <AlertCircle size={12} className="text-amber-500" /> Soporte
                   </div>
                </div>
              </div>

              {/* Tarjeta de Totales */}
              <div className="w-full sm:w-64 bg-neutral-900 rounded-xl p-5 text-white shadow-2xl relative overflow-hidden border border-neutral-800 border-l-4 border-l-amber-500 order-1 sm:order-2">
                <div className="relative z-10 space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-neutral-800 pb-2">
                    <span className="font-bold text-neutral-400">NETO</span>
                    <span className="font-bold text-white">{formatearMoneda(totales.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-neutral-800 pb-2">
                    <span className="font-bold text-neutral-400">IVA (19%)</span>
                    <span className="font-bold text-white">{formatearMoneda(totales.iva)}</span>
                  </div>
                  <div className="pt-1 text-right">
                    <span className="block text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Total a Pagar</span>
                    <span className="text-2xl sm:text-2xl font-black tracking-tighter text-white block leading-none">
                      {totales.total.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="bg-black p-3 text-center border-t border-neutral-900 print:hidden">
            <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.5em] flex items-center justify-center gap-2">
               Lions Cars <span className="text-amber-500">•</span> Chile
            </p>
          </footer>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }

        @media print {
          @page { margin: 0.5cm; size: letter; }
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            zoom: 0.90; 
          }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:p-4 { padding: 1rem !important; }
          .shadow-xl, .shadow-lg, .shadow-2xl { box-shadow: none !important; }
          .rounded-3xl, .rounded-2xl { border-radius: 0.5rem !important; }
          input, textarea { border: none !important; }
          
          .bg-black { background-color: black !important; color: white !important; }
          .bg-neutral-900 { background-color: #171717 !important; color: white !important; }
          .text-white { color: white !important; }
          .border-neutral-800 { border-color: #262626 !important; }

          tr { break-inside: avoid; }
        }

        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; margin: 0; 
        }
      `}} />
    </div>
  );
};

export default App;