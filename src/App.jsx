import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  PieChart, 
  TrendingUp, 
  Wallet, 
  X,
  RefreshCw,
  Activity,
  Pencil,
  CreditCard,
  Download,
  Table as TableIcon,
  ChevronDown,
  FileSpreadsheet,
  Upload,
  LayoutDashboard,
  List,
  Zap,
  ShoppingBag,
  Coffee,
  Car,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  MoreHorizontal,
  Search,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Calendar,
  DollarSign,
  Target
} from 'lucide-react';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LabelList,
  LineChart,
  Line
} from 'recharts';

// --- Configuration ---
const SUPABASE_URL = 'https://mvtanlxccxxxfcqixczs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dGFubHhjY3h4eGZjcWl4Y3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDY5NzcsImV4cCI6MjA4NDkyMjk3N30.5rSKgcSx29r0CJbOF0PVx-nr_cphzNHCSbWdt0D8rv8';

const CATEGORIES = [
  { name: 'Food', icon: Coffee, color: '#a7f3d0' },
  { name: 'Transport', icon: Car, color: '#bfdbfe' },
  { name: 'Shopping', icon: ShoppingBag, color: '#fde68a' },
  { name: 'Bills', icon: CreditCard, color: '#fecaca' },
  { name: 'Entertainment', icon: Gamepad2, color: '#ddd6fe' },
  { name: 'Health', icon: HeartPulse, color: '#fbcfe8' },
  { name: 'Education', icon: GraduationCap, color: '#c7d2fe' },
  { name: 'Other', icon: MoreHorizontal, color: '#e9d5ff' }
];

// --- Toast Notification Component ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Activity;

  return (
    <div className={`fixed top-6 right-6 z-[600] ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300`}>
      <Icon className="w-5 h-5" />
      <span className="font-bold text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- Confirmation Dialog ---
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[550] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-neutral-900 tracking-tight">{title}</h3>
          </div>
          <p className="text-neutral-600 font-medium mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Shared UI Components ---
const Card = ({ children, className = "", title, subtitle, icon: Icon }) => (
  <div className={`bg-white rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${className}`}>
    {(title || Icon) && (
      <div className="px-8 py-5 border-b border-neutral-50 flex items-center justify-between bg-white">
        <div>
          <h3 className="font-bold text-neutral-800 flex items-center gap-2.5 tracking-tight">
            {Icon && <div className="p-1.5 bg-neutral-50 rounded-lg"><Icon className="w-4 h-4 text-neutral-600" /></div>}
            {title}
          </h3>
          {subtitle && <p className="text-[11px] font-semibold text-neutral-400 mt-0.5 uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
    )}
    <div className="flex-1 p-8 min-h-0">{children}</div>
  </div>
);

const StatCard = ({ title, amount, gradient, textColor, isCurrency = true, icon: Icon, trend }) => (
  <div className={`relative rounded-[2.5rem] p-8 overflow-hidden group transition-all hover:-translate-y-1 shadow-lg ${gradient}`}>
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <p className={`${textColor} opacity-80 text-xs font-black uppercase tracking-[0.15em]`}>{title}</p>
        {Icon && <Icon className={`w-5 h-5 ${textColor} opacity-60`} />}
      </div>
      <h3 className={`text-4xl font-black ${textColor} tracking-tighter`}>
        {isCurrency 
          ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
          : amount.toLocaleString('en-IN')
        }
      </h3>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 ${textColor} opacity-70`}>
          {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-xs font-bold">{Math.abs(trend)}% vs last period</span>
        </div>
      )}
    </div>
  </div>
);

// Custom Label for Pie Chart
const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#171717" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central" 
      className="text-[10px] font-black uppercase tracking-tighter"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Insight Card Component
const InsightCard = ({ icon: Icon, title, value, description, color }) => (
  <div className="bg-white rounded-2xl p-6 border border-neutral-100 hover:shadow-lg transition-all">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-neutral-900 tracking-tight mb-1">{value}</p>
        <p className="text-xs text-neutral-500 font-medium">{description}</p>
      </div>
    </div>
  </div>
);

export default function ExpenseTracker() {
  // --- State ---
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [timeframe, setTimeframe] = useState('Month'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, expenseId: null });
  const [monthlyBudget, setMonthlyBudget] = useState(50000);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingExpense, setEditingExpense] = useState(null);

  const exportDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchExpenses = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Expenses?select=*&order=date.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const data = await res.json();
      setExpenses(data.map((e, index) => ({
        id: e.id || e.ID || `tx-${index}`, 
        amount: parseFloat(e.amount || 0),
        merchant: e.merchant || 'Unknown',
        category: e.category || 'Other',
        paymentMode: e.paymentmode || e.paymentMode || 'Other',
        date: e.date
      })));
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let filtered = expenses.filter(e => {
      const eDate = new Date(e.date);
      if (timeframe === 'Week') {
        const diff = (now - eDate) / (1000 * 60 * 60 * 24);
        return diff <= 7 && diff >= 0;
      }
      if (timeframe === 'Month') {
        return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
      }
      if (timeframe === 'Year') {
        return eDate.getFullYear() === now.getFullYear();
      }
      return true; 
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [expenses, timeframe, searchTerm]);

  // Calculate previous period for trend
  const previousPeriodExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const eDate = new Date(e.date);
      if (timeframe === 'Week') {
        const diff = (now - eDate) / (1000 * 60 * 60 * 24);
        return diff > 7 && diff <= 14;
      }
      if (timeframe === 'Month') {
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return eDate.getMonth() === prevMonth.getMonth() && eDate.getFullYear() === prevMonth.getFullYear();
      }
      if (timeframe === 'Year') {
        return eDate.getFullYear() === now.getFullYear() - 1;
      }
      return false;
    });
  }, [expenses, timeframe]);

  const weeklySpends = useMemo(() => {
    const now = new Date();
    return expenses.reduce((sum, e) => {
      const eDate = new Date(e.date);
      const diff = (now - eDate) / (1000 * 60 * 60 * 24);
      return diff <= 7 && diff >= 0 ? sum + e.amount : sum;
    }, 0);
  }, [expenses]);

  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, item) => sum + item.amount, 0), [filteredExpenses]);
  const previousTotal = useMemo(() => previousPeriodExpenses.reduce((sum, item) => sum + item.amount, 0), [previousPeriodExpenses]);
  
  const trend = useMemo(() => {
    if (previousTotal === 0) return 0;
    return Math.round(((totalExpenses - previousTotal) / previousTotal) * 100);
  }, [totalExpenses, previousTotal]);

  const categoryData = useMemo(() => {
    const data = {};
    filteredExpenses.forEach(e => { data[e.category] = (data[e.category] || 0) + e.amount; });
    return Object.keys(data).map((name) => {
      const cat = CATEGORIES.find(c => c.name === name) || CATEGORIES[7];
      return { name, value: data[name], color: cat.color };
    }).sort((a,b) => b.value - a.value);
  }, [filteredExpenses]);

  const burnUpData = useMemo(() => {
    const dailyTotals = {};
    filteredExpenses.forEach(e => { dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount; });
    const sortedDates = Object.keys(dailyTotals).sort();
    let cumulative = 0;
    return sortedDates.map(date => {
        cumulative += dailyTotals[date];
        return {
            dateLabel: date.split('-').slice(1).join('/'),
            fullDate: date,
            amount: cumulative,
            daily: dailyTotals[date]
        };
    });
  }, [filteredExpenses]);

  // Top merchants analysis
  const topMerchants = useMemo(() => {
    const merchantTotals = {};
    filteredExpenses.forEach(e => {
      merchantTotals[e.merchant] = (merchantTotals[e.merchant] || 0) + e.amount;
    });
    return Object.entries(merchantTotals)
      .map(([merchant, total]) => ({ merchant, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredExpenses]);

  // Daily average
  const dailyAverage = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    const dates = [...new Set(filteredExpenses.map(e => e.date))];
    return totalExpenses / dates.length;
  }, [filteredExpenses, totalExpenses]);

  // Budget remaining
  const budgetRemaining = useMemo(() => {
    if (timeframe !== 'Month') return null;
    return monthlyBudget - totalExpenses;
  }, [monthlyBudget, totalExpenses, timeframe]);

  const budgetPercentage = useMemo(() => {
    if (timeframe !== 'Month') return 0;
    return Math.min((totalExpenses / monthlyBudget) * 100, 100);
  }, [totalExpenses, monthlyBudget, timeframe]);

  const downloadCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Date,Merchant,Category,Amount,PaymentMode", ...data.map(e => `${e.date},"${e.merchant}",${e.category},${e.amount},${e.paymentMode}`)].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    downloadCSV(expenses, "expenses_export.csv");
    setIsExportOpen(false);
    showToast('Expenses exported successfully!', 'success');
  };

  const handleDownloadTemplate = () => {
    const template = [{ date: "YYYY-MM-DD", merchant: "Store Name", category: "Food", amount: 100, paymentMode: "UPI" }];
    downloadCSV(template, "expense_template.csv");
    setIsExportOpen(false);
    showToast('Template downloaded!', 'success');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(1).filter(row => row.trim());
      const newExpenses = rows.map(row => {
        const parts = row.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length < 5 || isNaN(parts[3])) return null;
        return { date: parts[0], merchant: parts[1], category: parts[2], amount: parseFloat(parts[3]), paymentmode: parts[4] };
      }).filter(Boolean);

      if (newExpenses.length > 0) {
        setIsSyncing(true);
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/Expenses`, {
            method: 'POST',
            headers: { 
              'apikey': SUPABASE_ANON_KEY, 
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(newExpenses)
          });
          if (!res.ok) throw new Error('Upload Failed');
          await fetchExpenses();
          showToast(`${newExpenses.length} expenses imported!`, 'success');
        } catch (err) { 
          console.error(err);
          showToast('Import failed', 'error');
        } finally { 
          setIsSyncing(false);
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setMerchant(expense.merchant);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setPaymentMode(expense.paymentMode);
    setDate(expense.date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setMerchant('');
    setAmount('');
    setCategory('Food');
    setPaymentMode('UPI');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
    const payload = { amount: parseFloat(amount), merchant, category, paymentmode: paymentMode, date };
    
    try {
      let res;
      if (editingExpense) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/Expenses?id=eq.${editingExpense.id}`, {
          method: 'PATCH',
          headers: { 
            'apikey': SUPABASE_ANON_KEY, 
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${SUPABASE_URL}/rest/v1/Expenses`, {
          method: 'POST',
          headers: { 
            'apikey': SUPABASE_ANON_KEY, 
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        });
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Action Failed: ${errorText}`);
      }
      
      await fetchExpenses();
      handleCloseModal();
      showToast(editingExpense ? 'Expense updated!' : 'Expense added!', 'success');
    } catch (err) { 
      console.error('Submit error:', err);
      showToast(editingExpense ? 'Update failed' : 'Add failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteConfirm = (id) => {
    setConfirmDialog({ isOpen: true, expenseId: id });
  };

  const handleDelete = async () => {
    const { expenseId } = confirmDialog;
    setConfirmDialog({ isOpen: false, expenseId: null });
    setIsSyncing(true);
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Expenses?id=eq.${expenseId}`, {
        method: 'DELETE',
        headers: { 
          'apikey': SUPABASE_ANON_KEY, 
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      
      await fetchExpenses();
      showToast('Expense deleted!', 'success');
    } catch (err) { 
      console.error('Delete error:', err);
      showToast('Delete failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBudgetSave = () => {
    showToast('Budget updated!', 'success');
    setIsBudgetModalOpen(false);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-neutral-50 border-t-neutral-900 rounded-full animate-spin" />
        <Activity className="w-6 h-6 text-neutral-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="font-black text-neutral-400 tracking-widest text-xs uppercase">Initializing Tracker</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-neutral-900 pb-20 font-sans selection:bg-neutral-900 selection:text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, expenseId: null })}
      />

      <div className="max-w-7xl mx-auto p-6 md:p-12">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-neutral-900 rounded-[1.5rem] shadow-2xl rotate-3">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-black tracking-tighter text-neutral-900">My Expense Tracker</h1>
                <div className={`p-1 rounded-full ${isSyncing ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'text-blue-500 animate-spin' : 'text-emerald-500'}`} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-[2rem] border border-neutral-100 shadow-sm w-fit">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-2 px-5 py-3 text-neutral-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-neutral-50"
              disabled={isSyncing}
            >
              <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" /> Import
            </button>

            <div className="relative" ref={exportDropdownRef}>
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="group flex items-center gap-2 px-5 py-3 text-neutral-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-neutral-50"
              >
                <Download className="w-4 h-4" /> Export <ChevronDown className={`w-3 h-3 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isExportOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-neutral-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[300] p-2 animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={handleDownloadTemplate} className="w-full text-left px-4 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 rounded-2xl flex items-center gap-3 transition-colors">
                    <div className="p-2 bg-emerald-50 rounded-xl"><FileSpreadsheet className="w-4 h-4 text-emerald-500" /></div> CSV Template
                  </button>
                  <button onClick={handleExportCSV} className="w-full text-left px-4 py-4 text-[11px] font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 rounded-2xl flex items-center gap-3 transition-colors">
                    <div className="p-2 bg-blue-50 rounded-xl"><TableIcon className="w-4 h-4 text-blue-500" /></div> Export Data
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => { setEditingExpense(null); setIsModalOpen(true); }} 
              className="flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-[1.2rem] text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-neutral-800 transition-all active:scale-95"
              disabled={isSyncing}
            >
              <Plus className="w-4 h-4" /> New Transaction
            </button>
          </div>
        </header>

        {/* Timeframe Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="bg-white p-2 rounded-[2rem] border border-neutral-100 shadow-sm flex gap-2">
            {['Week', 'Month', 'Year', 'All Time'].map(t => (
              <button key={t} onClick={() => setTimeframe(t)} className={`px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-50'}`}>{t}</button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-100 rounded-2xl text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard 
            title={`${timeframe} Outflow`} 
            amount={totalExpenses} 
            gradient="bg-neutral-900" 
            textColor="text-white" 
            icon={Wallet}
            trend={trend}
          />
          <StatCard 
            title="This Week's Spends" 
            amount={weeklySpends} 
            gradient="bg-gradient-to-br from-blue-500 to-blue-600" 
            textColor="text-white"
            icon={Calendar}
          />
          <StatCard 
            title="Total Transactions" 
            amount={filteredExpenses.length} 
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" 
            textColor="text-white" 
            isCurrency={false}
            icon={Activity}
          />
        </div>

        {/* Budget Tracker (Only for Month view) */}
        {timeframe === 'Month' && (
          <div className="mb-12">
            <Card title="Monthly Budget" subtitle="Track your spending" icon={Target}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-neutral-600">Budget: ₹{monthlyBudget.toLocaleString('en-IN')}</p>
                    <p className="text-sm font-bold text-neutral-600">Spent: ₹{totalExpenses.toLocaleString('en-IN')}</p>
                  </div>
                  <button 
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
                  >
                    Set Budget
                  </button>
                </div>
                <div className="relative h-6 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${budgetPercentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-neutral-700">{budgetPercentage.toFixed(0)}%</span>
                  </div>
                </div>
                {budgetRemaining !== null && (
                  <p className={`text-sm font-bold ${budgetRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {budgetRemaining >= 0 
                      ? `₹${budgetRemaining.toLocaleString('en-IN')} remaining` 
                      : `₹${Math.abs(budgetRemaining).toLocaleString('en-IN')} over budget`
                    }
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white p-2 rounded-[2rem] border border-neutral-100 shadow-sm mb-10 flex gap-2 w-fit">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            <TrendingUp className="w-4 h-4" /> Analytics
          </button>
          <button onClick={() => setActiveTab('table')} className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'table' ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            <List className="w-4 h-4" /> Table View
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
            {activeTab === 'dashboard' ? (
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                    <Card title="Expense Composition" subtitle="Category Distribution" icon={PieChart} className="lg:col-span-3 h-[400px]">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedPieLabel} outerRadius={100} dataKey="value" animationBegin={0} animationDuration={800}>
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}
                              formatter={(val) => `₹${val.toLocaleString()}`}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400 font-bold">No data available</div>
                      )}
                    </Card>

                    <Card title="Source Breakdown" subtitle="Distribution Magnitude" icon={CreditCard} className="lg:col-span-3 h-[400px]">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 80, top: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#171717', fontSize: 10, fontWeight: 900, textTransform: 'uppercase'}} 
                            />
                            <RechartsTooltip 
                               cursor={{fill: '#f8fafc'}}
                               contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}
                               formatter={(val) => `₹${val.toLocaleString()}`}
                            />
                            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                              {categoryData.map((entry, index) => (
                                <Cell key={`bar-${index}`} fill={entry.color} />
                              ))}
                              <LabelList 
                                dataKey="value" 
                                position="right" 
                                offset={12}
                                formatter={(val) => `₹${val.toLocaleString()}`}
                                style={{ fill: '#171717', fontSize: 10, fontWeight: 900, fontFamily: 'inherit' }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400 font-bold">No data available</div>
                      )}
                    </Card>

                    <Card title="Cumulative Burn" subtitle="Progressive Spending" icon={TrendingUp} className="lg:col-span-6 h-[350px]">
                      {burnUpData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={burnUpData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#171717" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="dateLabel" tick={{fill: '#171717', fontSize: 10, fontWeight: 900}} />
                            <YAxis tick={{fill: '#171717', fontSize: 10, fontWeight: 900}} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                            <RechartsTooltip 
                              contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}
                              labelFormatter={(label) => `Date: ${label}`}
                              formatter={(val, name) => name === 'amount' ? [`₹${val.toLocaleString()}`, 'Cumulative'] : [`₹${val.toLocaleString()}`, 'Daily']}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#171717" strokeWidth={3} fill="url(#colorAmount)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400 font-bold">No data available</div>
                      )}
                    </Card>
                </div>
            ) : activeTab === 'analytics' ? (
                <div className="space-y-8">
                  {/* Key Insights */}
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight mb-6">Key Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InsightCard 
                        icon={DollarSign}
                        title="Daily Average"
                        value={`₹${dailyAverage.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                        description={`Average spending per day in ${timeframe.toLowerCase()}`}
                        color="bg-blue-50 text-blue-600"
                      />
                      <InsightCard 
                        icon={TrendingUp}
                        title="Highest Category"
                        value={categoryData[0]?.name || 'N/A'}
                        description={categoryData[0] ? `₹${categoryData[0].value.toLocaleString('en-IN')} spent` : 'No data'}
                        color="bg-purple-50 text-purple-600"
                      />
                      <InsightCard 
                        icon={ShoppingBag}
                        title="Transaction Count"
                        value={filteredExpenses.length}
                        description={`Total transactions in ${timeframe.toLowerCase()}`}
                        color="bg-emerald-50 text-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Top Merchants */}
                  <Card title="Top Merchants" subtitle="Where you spend most" icon={ShoppingBag}>
                    {topMerchants.length > 0 ? (
                      <div className="space-y-4">
                        {topMerchants.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-black">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-black text-neutral-900">{item.merchant}</p>
                                <p className="text-xs text-neutral-500 font-bold">
                                  {filteredExpenses.filter(e => e.merchant === item.merchant).length} transactions
                                </p>
                              </div>
                            </div>
                            <p className="text-xl font-black text-neutral-900">₹{item.total.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-neutral-400 font-bold py-8">No merchant data available</div>
                    )}
                  </Card>

                  {/* Category-wise Trends */}
                  <Card title="Category Analysis" subtitle="Spending by category" icon={PieChart}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryData.map((cat, index) => {
                        const percentage = ((cat.value / totalExpenses) * 100).toFixed(1);
                        const catIcon = CATEGORIES.find(c => c.name === cat.name)?.icon || MoreHorizontal;
                        const CatIcon = catIcon;
                        return (
                          <div key={index} className="p-4 bg-neutral-50 rounded-2xl">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${cat.color}20` }}>
                                  <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                                </div>
                                <span className="font-black text-neutral-900 text-sm">{cat.name}</span>
                              </div>
                              <span className="text-xs font-black text-neutral-400">{percentage}%</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-neutral-900">₹{cat.value.toLocaleString('en-IN')}</span>
                              <span className="text-xs text-neutral-500 font-bold">
                                {filteredExpenses.filter(e => e.category === cat.name).length} txns
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-[0_30px_60px_rgba(0,0,0,0.03)] overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="p-10 border-b border-neutral-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black tracking-tighter text-neutral-900">Transaction Journal</h3>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.15em] mt-1">Full Ledger History</p>
                        </div>
                        <span className="px-6 py-2.5 bg-neutral-100 text-neutral-500 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase">{filteredExpenses.length} Entries</span>
                    </div>
                    {filteredExpenses.length > 0 ? (
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                          <thead>
                              <tr className="bg-neutral-50/30 border-b border-neutral-50">
                                  <th className="py-6 px-10 font-black text-neutral-400 uppercase tracking-widest text-[10px]">Reference</th>
                                  <th className="py-6 px-10 font-black text-neutral-400 uppercase tracking-widest text-[10px]">Entity</th>
                                  <th className="py-6 px-10 font-black text-neutral-400 uppercase tracking-widest text-[10px]">Classification</th>
                                  <th className="py-6 px-10 font-black text-neutral-400 uppercase tracking-widest text-[10px] text-right">Magnitude</th>
                                  <th className="py-6 px-10 font-black text-neutral-400 uppercase tracking-widest text-[10px] text-right">Control</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50">
                              {filteredExpenses.map((e) => {
                                  const cat = CATEGORIES.find(c => c.name.toLowerCase() === e.category.toLowerCase()) || CATEGORIES[7];
                                  return (
                                  <tr key={e.id} className="hover:bg-neutral-50/50 group transition-all duration-300">
                                      <td className="py-6 px-10">
                                          <div className="flex flex-col">
                                              <span className="text-neutral-900 font-bold text-sm tracking-tight">{e.date}</span>
                                              <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{e.paymentMode}</span>
                                          </div>
                                      </td>
                                      <td className="py-6 px-10 font-black text-neutral-900 text-base tracking-tight">{e.merchant}</td>
                                      <td className="py-6 px-10">
                                          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border border-neutral-100 rounded-xl shadow-sm">
                                              <cat.icon className="w-3.5 h-3.5" style={{color: cat.color}} />
                                              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{e.category}</span>
                                          </div>
                                      </td>
                                      <td className="py-6 px-10 text-right font-black text-neutral-900 text-lg tracking-tighter">₹{e.amount.toLocaleString('en-IN')}</td>
                                      <td className="py-6 px-10 text-right">
                                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                              <button 
                                                onClick={() => handleOpenEdit(e)} 
                                                className="p-3 text-neutral-400 hover:text-neutral-900 hover:bg-white border border-transparent hover:border-neutral-200 rounded-2xl shadow-none hover:shadow-md transition-all"
                                                disabled={isSyncing}
                                              >
                                                <Pencil className="w-4 h-4" />
                                              </button>
                                              <button 
                                                onClick={() => handleDeleteConfirm(e.id)} 
                                                className="p-3 text-neutral-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-neutral-200 rounded-2xl shadow-none hover:shadow-md transition-all"
                                                disabled={isSyncing}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                                  );
                              })}
                          </tbody>
                          </table>
                      </div>
                    ) : (
                      <div className="p-20 text-center">
                        <Activity className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                        <p className="text-neutral-400 font-bold">No transactions found</p>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    )}
                </div>
            )}
        </div>

        {/* Transaction Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30">
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 tracking-tighter">{editingExpense ? 'Modify' : 'Draft'} Transaction</h2>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Configure Entry Parameters</p>
                </div>
                <button onClick={handleCloseModal} className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-neutral-100 transition-all">
                  <X className="w-6 h-6"/>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase mb-3 block tracking-[0.2em] ml-1">Merchant Identity</label>
                    <input 
                      type="text" 
                      placeholder="Where did this happen?" 
                      required 
                      value={merchant} 
                      onChange={(e) => setMerchant(e.target.value)} 
                      className="w-full px-7 py-5 bg-neutral-50 rounded-[1.5rem] border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-bold text-lg placeholder:text-neutral-300 tracking-tight" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-neutral-400 uppercase mb-3 block tracking-[0.2em] ml-1">Magnitude (₹)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          required 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          className="w-full px-7 py-5 bg-neutral-50 rounded-[1.5rem] border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-black text-2xl tracking-tighter" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-neutral-400 uppercase mb-3 block tracking-[0.2em] ml-1">Occurrence Date</label>
                        <input 
                          type="date" 
                          required 
                          value={date} 
                          onChange={(e) => setDate(e.target.value)} 
                          className="w-full px-7 py-5 bg-neutral-50 rounded-[1.5rem] border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-black text-sm tracking-widest" 
                        />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase mb-4 block tracking-[0.2em] ml-1">Taxonomy</label>
                    <div className="grid grid-cols-4 gap-3">
                      {CATEGORIES.map(c => (
                        <button 
                          key={c.name} 
                          type="button" 
                          onClick={() => setCategory(c.name)} 
                          className={`group flex flex-col items-center justify-center p-4 rounded-[1.5rem] transition-all border-2 ${category === c.name ? 'bg-neutral-900 border-neutral-900 shadow-xl' : 'bg-white border-neutral-50 hover:border-neutral-200'}`}
                        >
                          <c.icon className={`w-5 h-5 mb-2 ${category === c.name ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                          <span className={`text-[8px] font-black uppercase tracking-widest ${category === c.name ? 'text-white' : 'text-neutral-400'}`}>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase mb-3 block tracking-[0.2em] ml-1">Payment Method</label>
                    <select 
                      value={paymentMode} 
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full px-7 py-5 bg-neutral-50 rounded-[1.5rem] border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-bold text-lg tracking-tight"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSyncing}
                  className="w-full py-6 bg-neutral-900 text-white rounded-[1.8rem] font-black shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-neutral-800 transition-all active:scale-95 uppercase tracking-[0.25em] text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? 'Processing...' : 'Commit Transaction'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Budget Modal */}
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-neutral-50">
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Set Monthly Budget</h3>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Track your spending goal</p>
              </div>
              <div className="p-8">
                <label className="text-[10px] font-black text-neutral-400 uppercase mb-3 block tracking-[0.2em] ml-1">Budget Amount (₹)</label>
                <input 
                  type="number" 
                  value={monthlyBudget} 
                  onChange={(e) => setMonthlyBudget(parseFloat(e.target.value))}
                  className="w-full px-7 py-5 bg-neutral-50 rounded-[1.5rem] border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-black text-2xl tracking-tighter mb-6" 
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsBudgetModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBudgetSave}
                    className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors"
                  >
                    Save Budget
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
