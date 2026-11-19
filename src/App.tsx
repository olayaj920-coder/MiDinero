/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  Calendar, 
  Tag, 
  PieChart, 
  ListOrdered, 
  Settings, 
  Sun, 
  Moon, 
  RefreshCw, 
  DollarSign, 
  CheckCircle2,
  X,
  ChevronRight,
  Globe,
  AlertCircle
} from 'lucide-react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'Dólar (USD $)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR €)', locale: 'es-ES' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Sol Peruano (PEN S/)', locale: 'es-PE' },
  MXN: { code: 'MXN', symbol: '$', name: 'Peso Mexicano (MXN $)', locale: 'es-MX' },
  COP: { code: 'COP', symbol: '$', name: 'Peso Colombiano (COP $)', locale: 'es-CO' },
  ARS: { code: 'ARS', symbol: '$', name: 'Peso Argentino (ARS $)', locale: 'es-AR' },
  CLP: { code: 'CLP', symbol: '$', name: 'Peso Chileno (CLP $)', locale: 'es-CL' },
  GBP: { code: 'GBP', symbol: '£', name: 'Libra Esterlina (£)', locale: 'en-GB' },
};

const CATEGORIES = {
  income: [
    { name: 'Sueldo', icon: '💼' },
    { name: 'Freelance', icon: '💻' },
    { name: 'Ventas', icon: '🏷️' },
    { name: 'Inversiones', icon: '📈' },
    { name: 'Otros Ingresos', icon: '💵' },
  ],
  expense: [
    { name: 'Comida / Super', icon: '🛒' },
    { name: 'Vivienda / Alquiler', icon: '🏠' },
    { name: 'Transporte', icon: '🚗' },
    { name: 'Ocio / Salidas', icon: '🎉' },
    { name: 'Servicios', icon: '⚡' },
    { name: 'Salud', icon: '💊' },
    { name: 'Otros Gastos', icon: '🛍️' },
  ]
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 2500,
    category: 'Sueldo',
    description: 'Nómina mensual',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '2',
    type: 'expense',
    amount: 650,
    category: 'Vivienda / Alquiler',
    description: 'Alquiler de piso',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
  },
  {
    id: '3',
    type: 'expense',
    amount: 120,
    category: 'Comida / Super',
    description: 'Compra semanal supermercado',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
  },
  {
    id: '4',
    type: 'expense',
    amount: 45,
    category: 'Transporte',
    description: 'Gasolina y transporte',
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
  },
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mi_dinero_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved transactions', e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    return localStorage.getItem('mi_dinero_currency') || 'USD';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'stats' | 'settings'>('home');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Success toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter state for history
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('mi_dinero_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('mi_dinero_currency', currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-hide toast after 3.5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Calculations (Rules 1, 2, 3, 4)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const currentCurrency = CURRENCIES[currencyCode] || CURRENCIES['USD'];

  const formatCurrency = (val: number) => {
    try {
      return new Intl.NumberFormat(currentCurrency.locale, { 
        style: 'currency', 
        currency: currentCurrency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val);
    } catch (e) {
      return `${currentCurrency.symbol} ${val.toFixed(2)}`;
    }
  };

  const handleOpenModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setAmount('');
    setCategory(CATEGORIES[type][0].name);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    // Validate amount > 0
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor introduce un monto válido mayor a 0');
      return;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: modalType,
      amount: numAmount,
      category: category || CATEGORIES[modalType][0].name,
      description: description.trim() || (modalType === 'income' ? 'Ingreso' : 'Gasto'),
      date: date || new Date().toISOString().split('T')[0],
    };

    // Add new transaction at the beginning (most recent first)
    setTransactions([newTx, ...transactions]);
    setModalOpen(false);

    const successText = modalType === 'income' 
      ? `¡Ingreso de ${formatCurrency(numAmount)} registrado correctamente!`
      : `¡Gasto de ${formatCurrency(numAmount)} registrado correctamente!`;
    setToastMessage(successText);
  };

  // Rule 6 & 7: Permitir eliminar un movimiento y recalcular automáticamente totales y saldo
  const handleDeleteTransaction = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      setTransactions(transactions.filter(t => t.id !== id));
      setToastMessage('Movimiento eliminado y totales recalculados');
    }
  };

  const handleResetData = () => {
    if (confirm('¿Restablecer datos de ejemplo? Se perderán tus movimientos actuales.')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setToastMessage('Datos restablecidos con éxito');
    }
  };

  // Rule 5: Ordenar los movimientos desde el más reciente hasta el más antiguo
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime() || Number(b.id) - Number(a.id);
  });

  const filteredTransactions = sortedTransactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#002941] flex flex-col items-center justify-start p-0 sm:py-6 transition-colors duration-200">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300 px-4">
          <div className="flex items-center gap-2.5 bg-[#fd6e6e] text-white px-5 py-3 rounded-2xl shadow-xl font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Mobile container simulator frame on desktop, full width on mobile */}
      <div className="w-full sm:max-w-md sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-[#001724] bg-[#002941] min-h-screen sm:min-h-[844px] flex flex-col relative overflow-hidden text-[#002941]">
        
        {/* Top Header */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-[#003c5f] bg-[#002941]/90 backdrop-blur-md sticky top-0 z-30 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fd6e6e] text-white flex items-center justify-center shadow-md shadow-[#fd6e6e]/30 font-bold text-lg">
              {currentCurrency.symbol}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Mi Dinero
              </h1>
              <p className="text-xs text-[#cfe8e1]/70">Control de finanzas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Currency Selector dropdown */}
            <div className="relative">
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="appearance-none bg-[#cfe8e1] text-[#002941] font-semibold text-xs py-2 pl-3 pr-7 rounded-xl border border-[#b2d5cb] focus:outline-none focus:ring-2 focus:ring-[#fd6e6e] cursor-pointer"
                title="Seleccionar Moneda"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#002941]">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-full bg-[#cfe8e1] text-[#002941] flex items-center justify-center hover:bg-[#b2d5cb] transition-colors"
              aria-label="Cambiar modo"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Main Content Area (Habla menta #cfe8e1 surface card wrap for main body) */}
        <main className="flex-1 overflow-y-auto pb-24 bg-[#cfe8e1] rounded-t-[32px] sm:rounded-t-none mt-2 p-4 sm:p-6 shadow-inner text-[#002941]">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              
              {/* Balance Card */}
              <div className="relative overflow-hidden rounded-3xl bg-[#002941] text-white p-6 shadow-xl">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#fd6e6e]/15 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#cfe8e1]/80">
                    Saldo Disponible ({currentCurrency.code})
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    balance >= 0 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-[#fd6e6e]/20 text-[#fd6e6e] border-[#fd6e6e]/30'
                  }`}>
                    {balance >= 0 ? 'Positivo' : 'Negativo'}
                  </span>
                </div>
                
                <div className={`text-4xl font-extrabold tracking-tight mb-6 tabular-nums ${
                  balance >= 0 ? 'text-white' : 'text-[#fd6e6e]'
                }`}>
                  {formatCurrency(balance)}
                </div>

                {balance < 0 && (
                  <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#fd6e6e]/20 border border-[#fd6e6e]/30 text-xs text-[#fd6e6e] font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Atención: Tus gastos superan tus ingresos actuales.</span>
                  </div>
                )}

                {/* Two Action Buttons: Registrar ingreso & Registrar gasto */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleOpenModal('income')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#fd6e6e] hover:bg-[#e05858] text-white font-semibold text-sm shadow-lg shadow-[#fd6e6e]/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Registrar ingreso</span>
                  </button>

                  <button
                    onClick={() => handleOpenModal('expense')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#003c5f] hover:bg-[#004d78] text-white font-semibold text-sm shadow-lg active:scale-95 transition-all cursor-pointer border border-[#cfe8e1]/20"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                    <span>Registrar gasto</span>
                  </button>
                </div>
              </div>

              {/* Three Indicators: Ingresos, Gastos, Saldo */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#b2d5cb] flex flex-col justify-between shadow-xs">
                  <div className="flex items-center gap-1.5 text-[#002941] mb-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">Ingresos</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-700 tabular-nums truncate">
                    {formatCurrency(totalIncome)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#b2d5cb] flex flex-col justify-between shadow-xs">
                  <div className="flex items-center gap-1.5 text-[#002941] mb-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">Gastos</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-rose-600 tabular-nums truncate">
                    {formatCurrency(totalExpense)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#b2d5cb] flex flex-col justify-between shadow-xs">
                  <div className="flex items-center gap-1.5 text-[#002941] mb-2">
                    <div className="w-7 h-7 rounded-xl bg-[#002941] text-white flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">Saldo</span>
                  </div>
                  <div className={`text-sm sm:text-base font-extrabold tabular-nums truncate ${
                    balance >= 0 ? 'text-[#002941]' : 'text-[#fd6e6e]'
                  }`}>
                    {formatCurrency(balance)}
                  </div>
                </div>
              </div>

              {/* Recent Transactions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#002941] uppercase tracking-wider">
                    Últimos Movimientos
                  </h3>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-bold text-[#002941] hover:underline flex items-center gap-1"
                  >
                    Ver historial completo <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#b2d5cb] bg-white/50">
                    <Wallet className="w-10 h-10 mx-auto text-[#002941]/40 mb-3" />
                    <p className="text-sm font-medium text-[#002941]">No hay movimientos registrados</p>
                    <p className="text-xs text-[#002941]/60 mt-1">Pulsa en Registrar ingreso o Gasto para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sortedTransactions.slice(0, 5).map((t) => (
                      <div 
                        key={t.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#b2d5cb] shadow-xs hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold ${
                            t.type === 'income' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {t.type === 'income' ? '↓' : '↑'}
                          </div>
                          <div>
                            {/* Rule 2: Mostrar concepto, fecha y monto */}
                            <div className="text-sm font-semibold text-[#002941]">
                              {t.description}
                            </div>
                            <div className="text-xs text-[#002941]/70 flex items-center gap-2 mt-0.5">
                              <span className="font-medium px-2 py-0.5 rounded-md bg-[#cfe8e1] text-[#002941]">{t.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{t.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Rule 3 & 4: Ingresos verde, Gastos rojo */}
                          <div className={`text-sm font-extrabold tabular-nums ${
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </div>
                          {/* Rule 6: Permitir eliminar un movimiento */}
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: HISTORY (Módulo de historial de movimientos completo) */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#002941]">
                    Historial de Movimientos
                  </h2>
                  <p className="text-xs text-[#002941]/70">Todos tus ingresos y gastos ordenados</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white text-xs font-bold text-[#002941] border border-[#b2d5cb]">
                  {filteredTransactions.length} total
                </span>
              </div>

              {/* Search & Filter */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Buscar por concepto o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#b2d5cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#fd6e6e] text-[#002941]"
                />

                <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded-xl border border-[#b2d5cb]">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      filterType === 'all' 
                        ? 'bg-[#002941] text-white shadow-xs' 
                        : 'text-[#002941] hover:text-[#002941]'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterType('income')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      filterType === 'income' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-[#002941] hover:text-[#002941]'
                    }`}
                  >
                    Ingresos (Verde)
                  </button>
                  <button
                    onClick={() => setFilterType('expense')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      filterType === 'expense' 
                        ? 'bg-rose-600 text-white shadow-xs' 
                        : 'text-[#002941] hover:text-[#002941]'
                    }`}
                  >
                    Gastos (Rojo)
                  </button>
                </div>
              </div>

              {/* Rule 1 & 5: Mostrar todos los ingresos y gastos registrados, ordenados del más reciente al más antiguo */}
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white/50 rounded-2xl border border-dashed border-[#b2d5cb]">
                  <p className="text-sm text-[#002941]/70">No se encontraron movimientos con los filtros actuales.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTransactions.map((t) => (
                    <div 
                      key={t.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#b2d5cb] shadow-xs group hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {/* Rule 3 & 4: Identificar ingresos con verde, gastos con rojo */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold ${
                          t.type === 'income' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {t.type === 'income' ? '↓' : '↑'}
                        </div>
                        <div>
                          {/* Rule 2: Mostrar concepto, fecha y monto */}
                          <div className="text-sm font-semibold text-[#002941]">
                            {t.description}
                          </div>
                          <div className="text-xs text-[#002941]/70 flex items-center gap-2 mt-0.5">
                            <span className="font-medium px-2 py-0.5 rounded-md bg-[#cfe8e1] text-[#002941]">{t.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{t.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Rule 3 & 4: Monto en verde para ingresos, rojo para gastos */}
                        <div className={`text-sm font-extrabold tabular-nums ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </div>
                        {/* Rule 6: Permitir eliminar un movimiento */}
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#002941]">
                  Resumen y Estadísticas
                </h2>
                <p className="text-xs text-[#002941]/70">Balance general en {currentCurrency.code}</p>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#b2d5cb] shadow-xs">
                  <div className="text-xs text-emerald-600 font-bold mb-1">Total Ingresos</div>
                  <div className="text-lg font-extrabold text-emerald-700 tabular-nums">
                    {formatCurrency(totalIncome)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#b2d5cb] shadow-xs">
                  <div className="text-xs text-rose-600 font-bold mb-1">Total Gastos</div>
                  <div className="text-lg font-extrabold text-rose-600 tabular-nums">
                    {formatCurrency(totalExpense)}
                  </div>
                </div>
              </div>

              {/* Savings Rate / Financial Health */}
              <div className="p-5 rounded-2xl bg-white border border-[#b2d5cb] space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-[#002941]">
                  Salud Financiera
                </h3>
                
                {totalIncome > 0 ? (
                  <>
                    <div className="flex justify-between text-xs text-[#002941]/80 font-medium">
                      <span>Tasa de Ahorro</span>
                      <span className="font-bold">
                        {Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#002941]/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, Math.min(100, ((totalIncome - totalExpense) / totalIncome) * 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#002941]/70 pt-1">
                      {balance >= 0 
                        ? '¡Excelente! Estás ahorrando parte de tus ingresos.' 
                        : 'Atención: Tus gastos superan tus ingresos este periodo.'}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-[#002941]/70">Agrega ingresos para calcular tu tasa de ahorro.</p>
                )}
              </div>

              {/* Categories breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#002941]">
                  Gastos por Categoría
                </h3>
                
                {transactions.filter(t => t.type === 'expense').length === 0 ? (
                  <p className="text-xs text-[#002941]/70">No hay gastos registrados aún.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(
                      transactions
                        .filter(t => t.type === 'expense')
                        .reduce((acc, t) => {
                          acc[t.category] = (acc[t.category] || 0) + t.amount;
                          return acc;
                        }, {} as Record<string, number>)
                    ).map(([cat, amount]) => {
                      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                      return (
                        <div key={cat} className="p-3 rounded-xl bg-white border border-[#b2d5cb] space-y-1.5 shadow-xs">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[#002941]">{cat}</span>
                            <span className="tabular-nums text-rose-600 font-bold">{formatCurrency(amount)} ({percentage}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#002941]/10 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#002941]">
                  Ajustes y Moneda
                </h2>
                <p className="text-xs text-[#002941]/70">Personaliza tu experiencia en Mi Dinero</p>
              </div>

              <div className="space-y-3">
                {/* Currency Selection Setting */}
                <div className="p-4 rounded-2xl bg-white border border-[#b2d5cb] space-y-2 shadow-xs">
                  <div className="text-sm font-bold text-[#002941]">Tipo de Moneda</div>
                  <div className="text-xs text-[#002941]/70">Elige la moneda principal para tus cuentas</div>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#cfe8e1] border border-[#b2d5cb] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fd6e6e] text-[#002941]"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#b2d5cb] flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-sm font-bold text-[#002941]">Restablecer Datos</div>
                    <div className="text-xs text-[#002941]/70">Cargar datos de prueba iniciales</div>
                  </div>
                  <button
                    onClick={handleResetData}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#002941] text-[#cfe8e1] rounded-xl hover:bg-[#003c5f] transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restablecer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Bottom Navigation Bar (Mobile Tab Bar Pattern) */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-[#002941] border-t border-[#003c5f] grid grid-cols-4 items-center px-2 z-30 pb-safe text-white">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'home' ? 'text-[#fd6e6e] font-bold' : 'text-[#cfe8e1]/60 hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5 mb-1" />
            <span className="text-[10px] tracking-tight">Resumen</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'history' ? 'text-[#fd6e6e] font-bold' : 'text-[#cfe8e1]/60 hover:text-white'
            }`}
          >
            <ListOrdered className="w-5 h-5 mb-1" />
            <span className="text-[10px] tracking-tight">Historial</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'stats' ? 'text-[#fd6e6e] font-bold' : 'text-[#cfe8e1]/60 hover:text-white'
            }`}
          >
            <PieChart className="w-5 h-5 mb-1" />
            <span className="text-[10px] tracking-tight">Estadísticas</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'settings' ? 'text-[#fd6e6e] font-bold' : 'text-[#cfe8e1]/60 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-[10px] tracking-tight">Ajustes</span>
          </button>
        </nav>

        {/* Modal: Registrar Ingreso / Gasto */}
        {modalOpen && (
          <div className="absolute inset-0 z-50 bg-[#002941]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-[#cfe8e1] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200 text-[#002941]">
              
              <div className="flex items-center justify-between border-b border-[#b2d5cb] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white ${
                    modalType === 'income' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {modalType === 'income' ? '+' : '-'}
                  </div>
                  <h3 className="text-base font-bold text-[#002941]">
                    {modalType === 'income' ? 'Registrar ingreso' : 'Registrar gasto'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#002941] hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#002941] mb-1.5 uppercase tracking-wider">
                    Concepto / Descripción
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nómina, Venta, Freelance..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#b2d5cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#fd6e6e] text-[#002941]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002941] mb-1.5 uppercase tracking-wider">
                    Monto ({currentCurrency.symbol})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#002941]/60 font-bold">{currentCurrency.symbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white border border-[#b2d5cb] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#fd6e6e] tabular-nums text-[#002941]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002941] mb-1.5 uppercase tracking-wider">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#b2d5cb] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fd6e6e] text-[#002941]"
                  >
                    {CATEGORIES[modalType].map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#002941] mb-1.5 uppercase tracking-wider">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-[#b2d5cb] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fd6e6e] text-[#002941]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition-all cursor-pointer ${
                      modalType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' : 'bg-[#fd6e6e] hover:bg-[#e05858] shadow-[#fd6e6e]/30'
                    }`}
                  >
                    {modalType === 'income' ? 'Guardar ingreso' : 'Guardar gasto'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
