"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  RefreshCcw, 
  ChevronRight, 
  DollarSign, 
  Truck, 
  Percent, 
  Layers,
  ArrowRight,
  Info,
  ShieldCheck
} from "lucide-react";
import { getCommercialConfig, updateCommercialConfig } from "@/actions/config";

const SECTIONS = [
  { id: 'pricing', name: 'Esquema de Precios', icon: DollarSign },
  { id: 'discounts', name: 'Descuentos por Volumen', icon: Percent },
  { id: 'shipping', name: 'Cargos Logísticos', icon: Truck },
];

export default function CommercialConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('pricing');

  useEffect(() => {
    async function loadConfig() {
      const { data } = await getCommercialConfig();
      const map: Record<string, string> = {};
      data?.forEach(c => map[c.key] = c.value);
      setConfig(map);
      setLoading(false);
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const updates = Object.entries(config).map(([key, value]) => ({ key, value }));
    const { error } = await updateCommercialConfig(updates);
    if (error) alert("Error: " + error);
    else alert("Configuración actualizada correctamente");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando parámetros comerciales...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center text-xs font-bold text-[#F97316] uppercase tracking-widest mb-1">
            <Settings className="h-3 w-3 mr-2" />
            Configuración del Sistema
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Parámetros Comerciales</h1>
          <p className="text-sm text-gray-500 mt-1">Configure las reglas de negocio, impuestos y cargos automáticos.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="inline-flex items-center px-6 py-3 bg-[#F97316] text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg hover:bg-[#EA580C] transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-4 space-y-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl text-sm font-bold transition-all border ${
                activeSection === s.id 
                  ? "bg-white border-[#F97316] text-[#F97316] shadow-sm" 
                  : "bg-transparent border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
              }`}
            >
              <div className="flex items-center">
                <s.icon className={`h-5 w-5 mr-3 ${activeSection === s.id ? "text-[#F97316]" : "text-gray-300"}`} />
                {s.name}
              </div>
              <ChevronRight className={`h-4 w-4 ${activeSection === s.id ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
          
          <div className="mt-8 p-6 bg-[#1F2937] rounded-2xl text-white">
            <div className="flex items-center mb-4">
              <ShieldCheck className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-xs font-bold uppercase tracking-widest">Seguridad</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Cualquier cambio aquí afectará instantáneamente los cálculos de las nuevas cotizaciones generadas por el equipo de ventas.
            </p>
          </div>
        </aside>

        <div className="md:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {activeSection === 'pricing' && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Moneda y Base</h3>
                  <p className="text-xs text-gray-400 font-medium">Configuración regional de precios.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Moneda Principal</label>
                  <select 
                    value={config.currency || "COP"} 
                    onChange={(e) => setConfig({...config, currency: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-black"
                  >
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="USD">Dólar Estadounidense (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">IVA Aplicable (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={config.iva_rate || "19"} 
                      onChange={(e) => setConfig({...config, iva_rate: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-black"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'discounts' && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                  <Percent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Escalas por Volumen</h3>
                  <p className="text-xs text-gray-400 font-medium">Configure beneficios por pedidos masivos.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nivel 1 (Base)</span>
                    <Layers className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold mb-1">Mínimo Unidades</label>
                      <input 
                        type="number" 
                        value={config.volume_discount_threshold_1 || "1000"} 
                        onChange={(e) => setConfig({...config, volume_discount_threshold_1: e.target.value})}
                        className="w-full p-2 bg-white border border-gray-200 rounded-md text-sm font-bold text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold mb-1">Descuento (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={config.volume_discount_rate_1 || "0.04"} 
                        onChange={(e) => setConfig({...config, volume_discount_rate_1: e.target.value})}
                        className="w-full p-2 bg-white border border-gray-200 rounded-md text-sm font-bold text-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#F97316]/5 rounded-xl border border-[#F97316]/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest">Nivel 2 (Premium)</span>
                    <ArrowRight className="h-4 w-4 text-[#F97316]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-[#F97316] font-bold mb-1">Mínimo Unidades</label>
                      <input 
                        type="number" 
                        value={config.volume_discount_threshold_2 || "5000"} 
                        onChange={(e) => setConfig({...config, volume_discount_threshold_2: e.target.value})}
                        className="w-full p-2 bg-white border-[#F97316]/20 border rounded-md text-sm font-bold text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#F97316] font-bold mb-1">Descuento (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={config.volume_discount_rate_2 || "0.08"} 
                        onChange={(e) => setConfig({...config, volume_discount_rate_2: e.target.value})}
                        className="w-full p-2 bg-white border-[#F97316]/20 border rounded-md text-sm font-bold text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'shipping' && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-50">
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Sobrecargos y Envío</h3>
                  <p className="text-xs text-gray-400 font-medium">Defina costos por urgencia o flete.</p>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-4 flex-shrink-0 mt-1" />
                <div className="space-y-4 flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Cargo por Entrega Urgente</h4>
                    <p className="text-xs text-blue-700 mt-1">Multiplicador aplicado cuando se marca "Entrega Prioritaria" (menos de 72h).</p>
                    <div className="mt-4 max-w-xs">
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={config.urgent_surcharge || "0.15"} 
                          onChange={(e) => setConfig({...config, urgent_surcharge: e.target.value})}
                          className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm font-bold text-black"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
