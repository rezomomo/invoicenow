import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface CorsControlProps {
  onEnableCors: () => void;
  onCorsEnabled: () => void;
}

export function CorsControl({ onEnableCors, onCorsEnabled }: CorsControlProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">CORS Access</h2>
      <div className="flex gap-4">
        <button
          onClick={onEnableCors}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <ExternalLink size={20} /> Enable CORS Access
        </button>
        <button
          onClick={onCorsEnabled}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          <RefreshCw size={20} /> I've Enabled CORS Access
        </button>
      </div>
    </div>
  );
}