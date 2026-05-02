"use client";

import { useState, useEffect } from "react";
import { Search, Users, Plus, Mail, Phone, MapPin, Building2, MoreVertical, Edit, Trash2 } from "lucide-react";
import { getClients } from "@/actions/clients";
import type { Client } from "@/types/database";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchClients() {
      const { data } = await getClients();
      setClients(data || []);
      setLoading(false);
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Directorio de Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">Gestión de sedes y contactos corporativos.</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F97316] hover:bg-[#EA580C] transition-colors">
          <Plus className="-ml-1 mr-2 h-5 w-5" /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, industria..."
            className="block w-full pl-10 text-sm border border-gray-300 rounded-md py-2 focus:ring-[#F97316] focus:border-[#F97316] text-black font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 font-medium">Cargando base de datos de clientes...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#F97316]/10 group-hover:text-[#F97316] transition-colors">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <button className="text-gray-300 hover:text-gray-500"><MoreVertical className="h-5 w-5" /></button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 truncate">{client.name}</h3>
                <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider mt-1">{client.industry || "Industria General"}</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-4 w-4 mr-3 text-gray-300" />
                    {client.email || "Sin correo"}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="h-4 w-4 mr-3 text-gray-300" />
                    {client.phone || "Sin teléfono"}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-3 text-gray-300" />
                    {client.city || "Sede No Definida"}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-50 flex justify-between items-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {client.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
                <button className="text-xs font-bold text-blue-600 hover:underline">Ver Historial</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
