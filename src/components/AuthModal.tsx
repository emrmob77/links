import React from 'react';
import { X } from 'lucide-react';
import Auth from './Auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ isOpen, onClose, mode, onModeChange }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onClose}
            >
              <span className="sr-only">Kapat</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </h3>
            <Auth initialMode={mode} onModeChange={onModeChange} onSuccess={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}