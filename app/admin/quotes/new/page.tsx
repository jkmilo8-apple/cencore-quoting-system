"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Trash2, 
  Calculator, 
  ArrowLeft, 
  Save, 
  Send, 
  Box, 
  ScrollText, 
  Layers, 
  User,
  ChevronRight,
  Info,
  Package
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClients } from "@/actions/clients";
import { getProducts } from "@/actions/products";
import { createQuoteAction } from "@/actions/quotes";
import { getCommercialConfig } from "@/actions/config";
import type { Client, Product } from "@/types/database";

const quotationSchema = z.object({
  clientId: z.string().min(1, "Seleccione un cliente"),
  items: z.array(z.object({
    productId: z.string().min(1, "Seleccione un producto"),
    quantity: z.number().min(1, "Mínimo 1"),
  })).min(1, "Agregue al menos un producto"),
  urgentDelivery: z.boolean(),
  notes: z.string().optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

const CATEGORIES = [
  { id: "Cajas", name: "Cajas", icon: Box, description: "Empaque estándar corrugado" },
  { id: "Rollos", name: "Rollos", icon: ScrollText, description: "Papel Kraft y envoltorios" },
  { id: "Accesorios", name: "Esquineros", icon: Layers, description: "Protección y estibado" },
];

export default function NewQuotationPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Cajas");

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      clientId: "",
      items: [{ productId: "", quantity: 1 }],
      urgentDelivery: false,
      notes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    async function loadData() {
      const [cRes, pRes, configRes] = await Promise.all([
        getClients(), 
        getProducts(),
        getCommercialConfig()
      ]);
      setClients(cRes.data || []);
      setProducts(pRes.data || []);
      
      const configMap: Record<string, string> = {};
      configRes.data?.forEach(c => {
        configMap[c.key] = c.value;
      });
      setConfig(configMap);
      
      setLoading(false);
    }
    loadData();
  }, []);

  const watchedItems = useWatch({ control, name: "items" }) || [];
  const urgentDelivery = useWatch({ control, name: "urgentDelivery" }) || false;

  const calculateTotals = () => {
    let subtotal = 0;
    const itemDetails = watchedItems.map((item) => {
      const product = products.find(p => p.id === item.productId);
      const unitPrice = product ? Number(product.price) : 0;
      const totalItem = unitPrice * (item.quantity || 0);
      subtotal += totalItem;
      return { unitPrice, totalItem };
    });

    const totalQuantity = watchedItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    
    const threshold2 = Number(config.volume_discount_threshold_2 || 5000);
    const rate2 = Number(config.volume_discount_rate_2 || 0.08);
    const threshold1 = Number(config.volume_discount_threshold_1 || 1000);
    const rate1 = Number(config.volume_discount_rate_1 || 0.04);
    const urgentRate = Number(config.urgent_surcharge || 0.15);

    let discount = 0;
    if (totalQuantity >= threshold2) discount = subtotal * rate2;
    else if (totalQuantity >= threshold1) discount = subtotal * rate1;

    const surcharge = urgentDelivery ? (subtotal - discount) * urgentRate : 0;
    const total = subtotal - discount + surcharge;

    return { subtotal, discount, surcharge, total, itemDetails };
  };

  const pricing = calculateTotals();

  const onSubmit = async (data: QuotationFormValues) => {
    setIsSubmitting(true);

    const { data: quote, error } = await createQuoteAction({
      client_id: data.clientId,
      total_amount: pricing.total,
      notes: data.notes || "",
      urgent_delivery: data.urgentDelivery,
      items: data.items.map((item, idx) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: pricing.itemDetails[idx]?.unitPrice || 0,
        total_price: pricing.itemDetails[idx]?.totalItem || 0
      }))
    });

    if (error) {
      alert("Error al crear la cotización: " + error);
      setIsSubmitting(false);
    } else if (quote) {
      router.push(`/admin/quotes/${quote.id}`);
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8F6]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
      <p className="mt-4 text-gray-500 font-medium">Sincronizando Consola de Operaciones...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF8F6] pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/quotes" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1F2937] tracking-tight">Consola de Operaciones</h1>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Nueva Cotización Industrial</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 border-l pl-6 border-gray-100">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Rodrigo Mendoza</p>
              <p className="text-xs text-[#F97316] font-semibold">Acceso Administrador</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#F97316]/10 flex items-center justify-center border border-[#F97316]/20">
              <User className="h-5 w-5 text-[#F97316]" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                  <span className="bg-[#F97316] text-white h-6 w-6 rounded-md flex items-center justify-center mr-3 text-xs">1</span>
                  Información del Cliente
                </h2>
              </div>
              <div className="p-6">
                <select
                  {...register("clientId")}
                  className="block w-full pl-4 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] sm:text-sm rounded-lg border transition-all bg-gray-50/50 text-black font-medium"
                >
                  <option value="">Seleccione un cliente para iniciar...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city || 'Sede Principal'}</option>)}
                </select>
                {errors.clientId && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-tight">{errors.clientId.message}</p>}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center mb-4 ml-2">
                <span className="bg-[#F97316] text-white h-6 w-6 rounded-md flex items-center justify-center mr-3 text-xs">2</span>
                Seleccione el Tipo de Empaque
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`relative p-5 text-left rounded-xl border-2 transition-all duration-200 group ${
                      selectedCategory === cat.id
                        ? "border-[#F97316] bg-white shadow-lg shadow-[#F97316]/5"
                        : "border-transparent bg-white/60 hover:bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                      selectedCategory === cat.id ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    }`}>
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <h3 className={`font-bold text-base ${selectedCategory === cat.id ? "text-gray-900" : "text-gray-500"}`}>{cat.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{cat.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                  <span className="bg-[#F97316] text-white h-6 w-6 rounded-md flex items-center justify-center mr-3 text-xs">3</span>
                  Productos y Cantidades
                </h2>
                <button
                  type="button"
                  onClick={() => append({ productId: "", quantity: 1 })}
                  className="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#F97316] hover:bg-[#F97316]/5 rounded-lg transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" /> Agregar Ítem
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end p-4 rounded-xl border border-gray-50 bg-gray-50/30 group relative">
                    <div className="lg:col-span-7 flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                         <Package className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Producto</label>
                        <select
                          {...register(`items.${index}.productId`)}
                          className="block w-full text-sm border-gray-200 rounded-lg p-2.5 border focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] bg-white transition-all text-black font-medium"
                        >
                          <option value="">Seleccionar producto...</option>
                          {products
                            .filter(p => p.category === selectedCategory || !p.category)
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {formatCurrency(Number(p.price))}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cantidad</label>
                      <input
                        type="number"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="block w-full text-sm border-gray-200 rounded-lg p-2.5 border focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] bg-white text-center font-bold text-black"
                      />
                    </div>
                    <div className="lg:col-span-2 text-right">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subtotal</label>
                      <div className="p-2.5 text-sm font-bold text-gray-700">
                        {formatCurrency(pricing.itemDetails[index]?.totalItem || 0)}
                      </div>
                    </div>
                    <div className="lg:col-span-1 flex justify-center">
                      <button type="button" onClick={() => remove(index)} className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-4">
              <div className="bg-[#1F2937] text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-800 p-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">Resumen Comercial</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="font-medium">{formatCurrency(pricing.subtotal)}</span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Descuento Volumen</span>
                      <span className="font-bold">-{formatCurrency(pricing.discount)}</span>
                    </div>
                  )}
                  <div className="pt-6 mt-6 border-t border-white/10 flex flex-col items-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] mb-2">Total Estimado</p>
                    <p className="text-4xl font-black text-white">{formatCurrency(pricing.total)}</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || watchedItems.length === 0}
                  className="w-full mt-8 py-4 px-6 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Emitiendo..." : "Generar Cotización"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
