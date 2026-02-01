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
  ChevronDown,
  FileSpreadsheet,
  Upload,
  LayoutDashboard,
  List,
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
  LabelList
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
    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 99999 }} className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3`}>
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }} className="flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
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
  <div className={`bg-white rounded-3xl border border-neutral-100 shadow-lg overflow-hidden flex flex-col transition-all hover:shadow-xl ${className}`}>
    {(title || Icon) && (
      <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between bg-white">
        <div>
          <h3 className="font-bold text-neutral-800 flex items-center gap-2.5 tracking-tight text-sm">
            {Icon && <div className="p-1.5 bg-neutral-50 rounded-lg"><Icon className="w-4 h-4 text-neutral-600" /></div>}
            {title}
          </h3>
          {subtitle && <p className="text-[10px] font-semibold text-neutral-400 mt-0.5 uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
    )}
    <div className="flex-1 p-6 min-h-0">{children}</div>
  </div>
);

const StatCard = ({ title, amount, gradient, textColor, isCurrency = true, icon: Icon, trend }) => (
  <div className={`relative rounded-3xl p-6 overflow-hidden group transition-all hover:-translate-y-1 shadow-md ${gradient}`}>
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <p className={`${textColor} text-xs font-black uppercase tracking-wider`}>{title}</p>
        {Icon && <Icon className={`w-5 h-5 ${textColor} opacity-80`} />}
      </div>
      <h3 className={`text-3xl font-black ${textColor} tracking-tighter`}>
        {isCurrency 
          ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
          : amount.toLocaleString('en-IN')
        }
      </h3>
      {trend !== undefined && trend !== 0 && (
        <div className={`flex items-center gap-1 mt-2 ${textColor}`}>
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
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="#171717" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central" 
      className="text-[9px] font-black uppercase tracking-tighter"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Insight Card Component
const InsightCard = ({ icon: Icon, title, value, description, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-lg transition-all">
    <div className="flex items-start gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-xl font-black text-neutral-900 tracking-tight mb-1">{value}</p>
        <p className="text-[10px] text-neutral-500 font-medium">{description}</p>
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
      setExpenses(data.map((e) => ({
        id: e.id, 
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

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [expenses, timeframe, searchTerm]);

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

  const dailyAverage = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    const dates = [...new Set(filteredExpenses.map(e => e.date))];
    return totalExpenses / dates.length;
  }, [filteredExpenses, totalExpenses]);

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
    e.stopPropagation();
    
    console.log('Form submitted!', { amount, merchant, category, date, paymentMode });
    
    if (!amount || !merchant || !category || !date) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    setIsSyncing(true);
    const payload = { 
      amount: parseFloat(amount), 
      merchant: merchant.trim(), 
      category, 
      paymentmode: paymentMode, 
      date 
    };
    
    console.log('Sending payload:', payload);
    
    try {
      let res;
      if (editingExpense) {
        console.log('Updating expense:', editingExpense.id);
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
        console.log('Creating new expense');
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
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', errorText);
        throw new Error(`Action Failed: ${res.status}`);
      }
      
      const responseData = await res.json();
      console.log('Response data:', responseData);
      
      await fetchExpenses();
      handleCloseModal();
      showToast(editingExpense ? 'Expense updated!' : 'Expense added!', 'success');
    } catch (err) { 
      console.error('Submit error:', err);
      showToast(err.message || (editingExpense ? 'Update failed' : 'Add failed'), 'error');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-neutral-900 pb-12 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, expenseId: null })}
      />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl shadow-lg rotate-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tighter text-neutral-900">Expense Tracker</h1>
                <div className={`p-1 rounded-full ${isSyncing ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'text-blue-500 animate-spin' : 'text-emerald-500'}`} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-2 px-4 py-2 text-neutral-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-neutral-50"
              disabled={isSyncing}
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>

            <div className="relative" ref={exportDropdownRef}>
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="group flex items-center gap-2 px-4 py-2 text-neutral-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-neutral-50"
              >
                <Download className="w-3.5 h-3.5" /> Export <ChevronDown className={`w-3 h-3 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 p-2">
                  <button onClick={handleDownloadTemplate} className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 rounded-xl flex items-center gap-3 transition-colors">
                    <div className="p-2 bg-emerald-50 rounded-lg"><FileSpreadsheet className="w-4 h-4 text-emerald-600" /></div> Template
                  </button>
                  <button onClick={handleExportCSV} className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 rounded-xl flex items-center gap-3 transition-colors">
                    <div className="p-2 bg-blue-50 rounded-lg"><Download className="w-4 h-4 text-blue-600" /></div> Export
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => { 
                setEditingExpense(null); 
                setIsModalOpen(true); 
              }} 
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95"
              disabled={isSyncing}
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
        </header>

        {/* Timeframe & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="bg-white p-1.5 rounded-2xl border border-purple-100 shadow-sm flex gap-1.5">
            {['Week', 'Month', 'Year', 'All Time'].map(t => (
              <button key={t} onClick={() => setTimeframe(t)} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${timeframe === t ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md' : 'text-neutral-600 hover:bg-purple-50'}`}>{t}</button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title={`${timeframe} Outflow`} 
            amount={totalExpenses} 
            gradient="bg-gradient-to-br from-rose-100 to-rose-200" 
            textColor="text-rose-800" 
            icon={Wallet}
            trend={trend}
          />
          <StatCard 
            title="This Week" 
            amount={weeklySpends} 
            gradient="bg-gradient-to-br from-blue-100 to-blue-200" 
            textColor="text-blue-800"
            icon={Calendar}
          />
          <StatCard 
            title="Transactions" 
            amount={filteredExpenses.length} 
            gradient="bg-gradient-to-br from-emerald-100 to-emerald-200" 
            textColor="text-emerald-800" 
            isCurrency={false}
            icon={Activity}
          />
        </div>

        {/* Budget Tracker */}
        {timeframe === 'Month' && (
          <div className="mb-8">
            <Card title="Monthly Budget" subtitle="Track spending" icon={Target}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-neutral-600">Budget: ₹{monthlyBudget.toLocaleString('en-IN')}</p>
                    <p className="text-xs font-bold text-neutral-600">Spent: ₹{totalExpenses.toLocaleString('en-IN')}</p>
                  </div>
                  <button 
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl text-xs font-bold hover:from-purple-500 hover:to-pink-500 transition-colors"
                  >
                    Set
                  </button>
                </div>
                <div className="relative h-5 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${budgetPercentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-neutral-700">{budgetPercentage.toFixed(0)}%</span>
                  </div>
                </div>
                {budgetRemaining !== null && (
                  <p className={`text-xs font-bold ${budgetRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {budgetRemaining >= 0 
                      ? `₹${budgetRemaining.toLocaleString('en-IN')} remaining` 
                      : `₹${Math.abs(budgetRemaining).toLocaleString('en-IN')} over`
                    }
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white p-1.5 rounded-2xl border border-purple-100 shadow-sm mb-8 flex gap-1.5 w-fit">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md' : 'text-neutral-600 hover:bg-purple-50'}`}>
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md' : 'text-neutral-600 hover:bg-purple-50'}`}>
            <TrendingUp className="w-3.5 h-3.5" /> Analytics
          </button>
          <button onClick={() => setActiveTab('table')} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'table' ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md' : 'text-neutral-600 hover:bg-purple-50'}`}>
            <List className="w-3.5 h-3.5" /> Table
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
            {activeTab === 'dashboard' ? (
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                    <Card title="Category Distribution" subtitle="Expense Composition" icon={PieChart} className="lg:col-span-3 h-[350px]">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedPieLabel} outerRadius={90} dataKey="value" animationBegin={0} animationDuration={800}>
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px'}}
                              formatter={(val) => `₹${val.toLocaleString()}`}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400 font-bold text-sm">No data</div>
                      )}
                    </Card>

                    <Card title="Category Breakdown" subtitle="Spending by type" icon={CreditCard} className="lg:col-span-3 h-[350px]">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 60, top: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#171717', fontSize: 9, fontWeight: 900, textTransform: 'uppercase'}} 
                            />
                            <RechartsTooltip 
                               cursor={{fill: '#f8fafc'}}
                               contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px'}}
                               formatter={(val) => `₹${val.toLocaleString()}`}
                            />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                              {categoryData.map((entry, index) => (
                                <Cell key={`bar-${index}`} fill={entry.color} />
                              ))}
                              <LabelList 
                                dataKey="value" 
                                position="right" 
                                offset={8}
                                formatter={(val) => `₹${val.toLocaleString()}`}
                                style={{ fill: '#171717', fontSize: 9, fontWeight: 900 }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400 font-bold text-sm">No data</div>
                      )}
                    </Card>

                    <Card title="Cumulative Spending" subtitle="Progressive burn" icon={TrendingUp} className="lg:col-span-6 h-[300px]">
                      {burnUpData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={burnUpData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#171717" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="dateLabel" tick={{fill: '#171717', fontSize: 9, fontWeight: 900}} />
                            <YAxis tick={{fill: '#171717', fontSize: 9, fontWeight: 900}} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                            <RechartsTooltip 
                              contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px'}}
                              labelFormatter={(label) => `Date: ${label}`}
                              formatter={(val, name) => name === 'amount' ? [`₹${val.toLocaleString()}`, 'Total'] : [`₹${val.toLocaleString()}`, 'Daily']}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#171717" strokeWidth={2} fill="url(#colorAmount)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400 font-bold text-sm">No data</div>
                      )}
                    </Card>
                </div>
            ) : activeTab === 'analytics' ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-neutral-900 tracking-tight mb-4">Key Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InsightCard 
                        icon={DollarSign}
                        title="Daily Avg"
                        value={`₹${dailyAverage.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                        description={`Per day in ${timeframe.toLowerCase()}`}
                        color="bg-blue-50 text-blue-600"
                      />
                      <InsightCard 
                        icon={TrendingUp}
                        title="Top Category"
                        value={categoryData[0]?.name || 'N/A'}
                        description={categoryData[0] ? `₹${categoryData[0].value.toLocaleString('en-IN')}` : 'No data'}
                        color="bg-purple-50 text-purple-600"
                      />
                      <InsightCard 
                        icon={ShoppingBag}
                        title="Count"
                        value={filteredExpenses.length}
                        description={`Total in ${timeframe.toLowerCase()}`}
                        color="bg-emerald-50 text-emerald-600"
                      />
                    </div>
                  </div>

                  <Card title="Top Merchants" subtitle="Where you spend" icon={ShoppingBag}>
                    {topMerchants.length > 0 ? (
                      <div className="space-y-3">
                        {topMerchants.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-lg flex items-center justify-center font-black text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-black text-neutral-900 text-sm">{item.merchant}</p>
                                <p className="text-[10px] text-neutral-500 font-bold">
                                  {filteredExpenses.filter(e => e.merchant === item.merchant).length} txns
                                </p>
                              </div>
                            </div>
                            <p className="text-lg font-black text-neutral-900">₹{item.total.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-neutral-400 font-bold py-6 text-sm">No data</div>
                    )}
                  </Card>

                  <Card title="Category Analysis" subtitle="Spending details" icon={PieChart}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryData.map((cat, index) => {
                        const percentage = ((cat.value / totalExpenses) * 100).toFixed(1);
                        const catIcon = CATEGORIES.find(c => c.name === cat.name)?.icon || MoreHorizontal;
                        const CatIcon = catIcon;
                        return (
                          <div key={index} className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-white shadow-sm">
                                  <CatIcon className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <span className="font-black text-neutral-900 text-xs">{cat.name}</span>
                              </div>
                              <span className="text-[10px] font-black text-neutral-400">{percentage}%</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-black text-neutral-900">₹{cat.value.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-neutral-500 font-bold">
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
                <div className="bg-white rounded-3xl border border-neutral-100 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-neutral-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-neutral-900">Transactions</h3>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">All records</p>
                        </div>
                        <span className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-xl text-[10px] font-black tracking-wider uppercase">{filteredExpenses.length} Total</span>
                    </div>
                    {filteredExpenses.length > 0 ? (
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                          <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-100">
                                  <th className="py-4 px-6 font-black text-neutral-400 uppercase tracking-wider text-[9px]">Date</th>
                                  <th className="py-4 px-6 font-black text-neutral-400 uppercase tracking-wider text-[9px]">Merchant</th>
                                  <th className="py-4 px-6 font-black text-neutral-400 uppercase tracking-wider text-[9px]">Category</th>
                                  <th className="py-4 px-6 font-black text-neutral-400 uppercase tracking-wider text-[9px] text-right">Amount</th>
                                  <th className="py-4 px-6 font-black text-neutral-400 uppercase tracking-wider text-[9px] text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50">
                              {filteredExpenses.map((e) => {
                                  const cat = CATEGORIES.find(c => c.name.toLowerCase() === e.category.toLowerCase()) || CATEGORIES[7];
                                  return (
                                  <tr key={e.id} className="hover:bg-neutral-50 group transition-all">
                                      <td className="py-4 px-6">
                                          <div className="flex flex-col">
                                              <span className="text-neutral-900 font-bold text-xs">{e.date}</span>
                                              <span className="text-[9px] font-black text-neutral-300 uppercase tracking-wider">{e.paymentMode}</span>
                                          </div>
                                      </td>
                                      <td className="py-4 px-6 font-black text-neutral-900 text-sm">{e.merchant}</td>
                                      <td className="py-4 px-6">
                                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-100 rounded-lg shadow-sm">
                                              <cat.icon className="w-3 h-3" style={{color: cat.color}} />
                                              <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wider">{e.category}</span>
                                          </div>
                                      </td>
                                      <td className="py-4 px-6 text-right font-black text-neutral-900 text-base">₹{e.amount.toLocaleString('en-IN')}</td>
                                      <td className="py-4 px-6 text-right">
                                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                              <button 
                                                onClick={() => handleOpenEdit(e)} 
                                                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-white border border-transparent hover:border-neutral-200 rounded-lg transition-all"
                                                disabled={isSyncing}
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </button>
                                              <button 
                                                onClick={() => handleDeleteConfirm(e.id)} 
                                                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-neutral-200 rounded-lg transition-all"
                                                disabled={isSyncing}
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
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
                      <div className="p-16 text-center">
                        <Activity className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                        <p className="text-neutral-400 font-bold text-sm">No transactions</p>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl text-xs font-bold hover:from-purple-500 hover:to-pink-500 transition-colors"
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
          <>
            <div 
              style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 999999,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}
              onClick={handleCloseModal}
            >
              <div 
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  width: '100%',
                  maxWidth: '32rem',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: '24px', borderBottom: '1px solid #f5f5f5', backgroundColor: '#faf5ff', position: 'sticky', top: 0, zIndex: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#171717', marginBottom: '4px' }}>
                        {editingExpense ? 'Edit' : 'New'} Transaction
                      </h2>
                      <p style={{ fontSize: '10px', fontWeight: 900, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Fill details
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleCloseModal}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#e9d5ff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = 'transparent';
                      }}
                    >
                      <X style={{ width: '20px', height: '20px' }} />
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#a3a3a3', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.1em' }}>
                      Merchant
                    </label>
                    <input 
                      type="text" 
                      placeholder="Store name" 
                      required 
                      value={merchant} 
                      onChange={(e) => setMerchant(e.target.value)} 
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '12px',
                        border: '2px solid transparent',
                        outline: 'none',
                        fontSize: '16px',
                        fontWeight: 700
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#c084fc';
                        e.target.style.backgroundColor = 'white';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                        e.target.style.backgroundColor = '#fafafa';
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 900, color: '#a3a3a3', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.1em' }}>
                        Amount (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.01"
                        required 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: '#fafafa',
                          borderRadius: '12px',
                          border: '2px solid transparent',
                          outline: 'none',
                          fontSize: '20px',
                          fontWeight: 900
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#c084fc';
                          e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'transparent';
                          e.target.style.backgroundColor = '#fafafa';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 900, color: '#a3a3a3', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.1em' }}>
                        Date
                      </label>
                      <input 
                        type="date" 
                        required 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: '#fafafa',
                          borderRadius: '12px',
                          border: '2px solid transparent',
                          outline: 'none',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#c084fc';
                          e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'transparent';
                          e.target.style.backgroundColor = '#fafafa';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#a3a3a3', textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.1em' }}>
                      Category
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {CATEGORIES.map(c => {
                        const isSelected = category === c.name;
                        return (
                          <button 
                            key={c.name} 
                            type="button" 
                            onClick={() => setCategory(c.name)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '12px',
                              borderRadius: '12px',
                              border: '2px solid',
                              borderColor: isSelected ? '#c084fc' : '#f3e8ff',
                              backgroundColor: isSelected ? 'linear-gradient(to bottom right, #c084fc, #f472b6)' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <c.icon style={{ width: '16px', height: '16px', marginBottom: '4px', color: isSelected ? 'white' : '#a3a3a3' }} />
                            <span style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: isSelected ? 'white' : '#a3a3a3' }}>
                              {c.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#a3a3a3', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.1em' }}>
                      Payment
                    </label>
                    <select 
                      value={paymentMode} 
                      onChange={(e) => setPaymentMode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '12px',
                        border: '2px solid transparent',
                        outline: 'none',
                        fontSize: '16px',
                        fontWeight: 700
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#c084fc';
                        e.target.style.backgroundColor = 'white';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                        e.target.style.backgroundColor = '#fafafa';
                      }}
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={async () => {
                      console.log('Button clicked!');
                      if (!amount || !merchant || !category || !date) {
                        showToast('Please fill all fields', 'error');
                        return;
                      }
                      
                      setIsSyncing(true);
                      const payload = { 
                        amount: parseFloat(amount), 
                        merchant: merchant.trim(), 
                        category, 
                        paymentmode: paymentMode, 
                        date 
                      };
                      
                      console.log('Sending payload:', payload);
                      console.log('To URL:', editingExpense ? `${SUPABASE_URL}/rest/v1/Expenses?id=eq.${editingExpense.id}` : `${SUPABASE_URL}/rest/v1/Expenses`);
                      
                      try {
                        const headers = { 
                          'apikey': SUPABASE_ANON_KEY, 
                          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
                          'Content-Type': 'application/json',
                          'Prefer': 'return=representation'
                        };
                        
                        console.log('Headers:', headers);
                        
                        let res;
                        if (editingExpense) {
                          console.log('Updating expense ID:', editingExpense.id);
                          res = await fetch(`${SUPABASE_URL}/rest/v1/Expenses?id=eq.${editingExpense.id}`, {
                            method: 'PATCH',
                            headers: headers,
                            body: JSON.stringify(payload)
                          });
                        } else {
                          console.log('Creating new expense');
                          res = await fetch(`${SUPABASE_URL}/rest/v1/Expenses`, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(payload)
                          });
                        }
                        
                        console.log('Response status:', res.status);
                        console.log('Response ok:', res.ok);
                        
                        if (!res.ok) {
                          const errorText = await res.text();
                          console.error('API Error Response:', errorText);
                          throw new Error(`API returned ${res.status}: ${errorText}`);
                        }
                        
                        const responseData = await res.json();
                        console.log('Success! Response data:', responseData);
                        
                        await fetchExpenses();
                        handleCloseModal();
                        showToast(editingExpense ? 'Expense updated!' : 'Expense added!', 'success');
                      } catch (err) { 
                        console.error('Full error object:', err);
                        console.error('Error name:', err.name);
                        console.error('Error message:', err.message);
                        
                        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
                          showToast('Network error - check if Supabase is accessible', 'error');
                        } else {
                          showToast(err.message || 'Failed to save', 'error');
                        }
                      } finally {
                        setIsSyncing(false);
                      }
                    }}
                    disabled={isSyncing}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(to right, #c084fc, #f472b6)',
                      color: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      cursor: isSyncing ? 'not-allowed' : 'pointer',
                      opacity: isSyncing ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSyncing) {
                        e.target.style.transform = 'scale(0.98)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {isSyncing ? 'Saving...' : 'Save Transaction'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Budget Modal */}
        {isBudgetModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }} className="flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-neutral-50 bg-purple-50">
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Monthly Budget</h3>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Set your goal</p>
              </div>
              <div className="p-6">
                <label className="text-[9px] font-black text-neutral-400 uppercase mb-2 block tracking-wider ml-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={monthlyBudget} 
                  onChange={(e) => setMonthlyBudget(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-transparent focus:border-purple-400 focus:bg-white outline-none transition-all font-black text-xl mb-4" 
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsBudgetModalOpen(false)}
                    className="flex-1 px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBudgetSave}
                    className="flex-1 px-5 py-2.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-colors text-sm"
                  >
                    Save
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
