'use client';

import { Client } from '@/types';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {client.name} {client.lastName}
          </h3>
          <p className="text-gray-600">{client.phone}</p>
          {client.email && (
            <p className="text-gray-600 text-sm">{client.email}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(client)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Cliente desde:</span>
          <span>{formatDate(client.registeredAt)}</span>
        </div>
        {client.lastVisit && (
          <div className="flex justify-between">
            <span>Última visita:</span>
            <span>{formatDate(client.lastVisit)}</span>
          </div>
        )}
        {client.birthDate && (
          <div className="flex justify-between">
            <span>Cumpleaños:</span>
            <span>
              {client.birthDate.toLocaleDateString('es-MX', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>
      
      {client.notes && (
        <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800">{client.notes}</p>
        </div>
      )}
    </div>
  );
}