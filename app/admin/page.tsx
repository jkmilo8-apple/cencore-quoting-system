"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { getQuotes } from "@/actions/quotes";
import { getClients } from "@/actions/clients";
import { getProducts } from "@/actions/products";
import type { Quote, Client, Product } from "@/types/database";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuotes: 0,
    activeClients: 0,
    totalProducts: 0,
    revenue: 0
  });
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [quotesRes, clientsRes, productsRes] = await Promise.all([
        getQuotes(),
        getClients(),
        getProducts()
      ]);

      const quotes = quotesRes.data || [];
      const clients = clientsRes.data || [];
      const products = productsRes.data || [];

      setStats({
        totalQuotes: quotes.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        totalProducts: products.length,
        revenue: quotes.reduce((acc, q) => acc + (q.total_amount || 0), 0)
      });

      setRecentQuotes(quotes.slice(0, 5));
      setLoading(false);
    }
    loadStats();
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando métricas industriales...</div>;

  const kpis = [
    { title: "Cotizaciones Emitidas", value: stats.totalQuotes, icon: FileText, trend: "+12%", trendUp: true, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Clientes Activos", value: stats.activeClients, icon: Users, trend: "+5%", trendUp: true, color: "text-green-600", bg: "bg-green-50" },
    { title: "Materiales en Catálogo", value: stats.totalProducts, icon: Package, trend: "Estable", trendUp: true, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Volumen Comercial (COP)", value: formatCurrency(stats.revenue), icon: TrendingUp, trend: "+8.4%", trendUp: true, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Consola de Control</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de operaciones y métricas de Cencore SAS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <span className={`flex items-center text-xs font-bold ${kpi.trendUp ? "text-green-600" : "text-red-600"}`}>
                {kpi.trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {kpi.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
              <Clock className="h-4 w-4 mr-2 text-[#F97316]" />
              Cotizaciones Recientes
            </h2>
            <Link href="/admin/quotes" className="text-xs font-bold text-[#F97316] hover:underline uppercase tracking-tight">Ver Todas</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID / Fecha</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/quotes/${quote.id}`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{quote.quote_number || "QT-2024-XXX"}</div>
                      <div className="text-xs text-gray-400">{new Date(quote.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-700">Cliente #{(quote.client_id || "").slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                        quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                        quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-[#F97316]">{formatCurrency(quote.total_amount)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6">Acciones Rápidas</h2>
          <div className="space-y-4">
            <Link href="/admin/quotes/new" className="flex items-center p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-[#F97316]/5 hover:border-[#F97316]/20 transition-all group">
              <div className="h-10 w-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-900">Nueva Cotización</p>
                <p className="text-xs text-gray-400">Generar presupuesto industrial</p>
              </div>
            </Link>
            <Link href="/admin/clients" className="flex items-center p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-green-50 hover:border-green-100 transition-all group">
              <div className="h-10 w-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-900">Gestión de Clientes</p>
                <p className="text-xs text-gray-400">Ver directorio y sedes</p>
              </div>
            </Link>
            <div className="p-4 rounded-xl border border-blue-50 bg-blue-50/30">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                <p className="text-xs font-bold text-blue-700 uppercase tracking-tight">Recordatorio</p>
              </div>
              <p className="text-xs text-blue-600 leading-relaxed">
                Recuerde que los precios base deben ser actualizados mensualmente según el índice de precios del papel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
