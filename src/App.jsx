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
  MoreHorizontal
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
  { name: 'Food', icon: Coffee, color: '#10b981' },
  { name: 'Transport', icon: Car, color: '#3b82f6' },
  { name: 'Shopping', icon: ShoppingBag, color: '#f59e0b' },
  { name: 'Bills', icon: CreditCard, color: '#ef4444' },
  { name: 'Entertainment', icon: Gamepad2, color: '#8b5cf6' },
  { name: 'Health', icon: HeartPulse, color: '#ec4899' },
  { name: 'Education', icon: GraduationCap, color: '#6366f1' },
  { name: 'Other', icon: MoreHorizontal, color: '#a855f7' }
];

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

const StatCard = ({ title, amount, gradient, textColor, isCurrency = true }) => (
  <div className={`relative rounded-[2.5rem] p-8 overflow-hidden group transition-all hover:-translate-y-1 shadow-lg ${gradient}`}>
    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
    <div className="relative z-10">
      <p className={`${textColor} opacity-80 text-xs font-black uppercase tracking-[0.15em] mb-2`}>{title}</p>
      <h3 className={`text-4xl font-black ${textColor} tracking-tighter`}>
        {isCurrency 
          ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
          : amount.toLocaleString('en-IN')
        }
      </h3>
    </div>
  </div>
);

// Custom Label for Pie Chart - Optimized for visibility
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

export default function ExpenseTracker() {
  // --- State ---
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [timeframe, setTimeframe] = useState('Month'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

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

  const fetchExpenses = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Expenses?select=*&order=date.asc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (!res.ok) throw new Error('Fetch Error');
      const data = await res.json();
      setExpenses(data.map((e, index) => ({
        id: e.id || e.ID || `tx-${index}`, 
        amount: parseFloat(e.amount || 0),
        merchant: e.merchant || 'Unknown',
        category: e.category || 'Other',
        paymentMode: e.paymentmode || 'Other',
        date: e.date
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const eDate = new Date(e.date);
      if (timeframe === 'Week') {
        const diff = (now - eDate) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (timeframe === 'Month') {
        return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
      }
      if (timeframe === 'Year') {
        return eDate.getFullYear() === now.getFullYear();
      }
      return true; 
    });
  }, [expenses, timeframe]);

  // Specific calculation for "This Week's Spends" (Last 7 days)
  const weeklySpends = useMemo(() => {
    const now = new Date();
    return expenses.reduce((sum, e) => {
      const eDate = new Date(e.date);
      const diff = (now - eDate) / (1000 * 60 * 60 * 24);
      return diff <= 7 && diff >= 0 ? sum + e.amount : sum;
    }, 0);
  }, [expenses]);

  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, item) => sum + item.amount, 0), [filteredExpenses]);
  
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
  };

  const handleDownloadTemplate = () => {
    const template = [{ date: "YYYY-MM-DD", merchant: "Store Name", category: "Food", amount: 100, paymentMode: "UPI" }];
    downloadCSV(template, "expense_template.csv");
    setIsExportOpen(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(1);
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
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(newExpenses)
          });
          if (!res.ok) throw new Error('Upload Failed');
          fetchExpenses();
        } catch (err) { console.error(err); } finally { setIsSyncing(false); }
      }
    };
    reader.readAsText(file);
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
    const payload = { amount: parseFloat(amount), merchant, category, paymentmode: paymentMode, date };
    try {
      let res = editingExpense 
        ? await fetch(`${SUPABASE_URL}/rest/v1/Expenses?id=eq.${editingExpense.id}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        : await fetch(`${SUPABASE_URL}/rest/v1/Expenses`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
      if (!res.ok) throw new Error('Action Failed');
      fetchExpenses();
      handleCloseModal();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this transaction?")) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/Expenses?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      fetchExpenses();
    } catch (err) { console.error(err); }
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

            <button onClick={() => { setEditingExpense(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-[1.2rem] text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-neutral-800 transition-all active:scale-95">
              <Plus className="w-4 h-4" /> New Transaction
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard title={`${timeframe} Outflow`} amount={totalExpenses} gradient="bg-neutral-900" textColor="text-white" />
          <StatCard title="This Week's Spends" amount={weeklySpends} gradient="bg-white border border-neutral-100" textColor="text-neutral-900" isCurrency={true} />
          <StatCard title="Peak Category" amount={categoryData[0]?.value || 0} gradient="bg-indigo-600" textColor="text-white" />
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            <div className="bg-white p-2 rounded-[1.8rem] flex items-center gap-1 border border-neutral-100 shadow-sm w-fit">
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.4rem] text-xs font-black uppercase tracking-[0.1em] transition-all ${activeTab === 'dashboard' ? 'bg-neutral-900 text-white shadow-xl' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button 
                    onClick={() => setActiveTab('transactions')}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.4rem] text-xs font-black uppercase tracking-[0.1em] transition-all ${activeTab === 'transactions' ? 'bg-neutral-900 text-white shadow-xl' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                    <List className="w-4 h-4" /> Journal
                </button>
            </div>

            {activeTab === 'dashboard' && (
                <div className="flex items-center gap-1.5 bg-neutral-100/50 p-2 rounded-[1.5rem] w-fit">
                    {['Week', 'Month', 'Year', 'All'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/50' : 'text-neutral-400 hover:text-neutral-50'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Visualizations */}
        <div className="relative min-h-[600px]">
            {activeTab === 'dashboard' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    <Card title="Expense Velocity" subtitle="Accumulated spending" icon={TrendingUp} className="lg:col-span-2 h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={burnUpData}>
                            <defs>
                                <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#171717" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f5f5f5" />
                            <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{fill: '#A3A3A3', fontSize: 10, fontWeight: 700}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3A3A3', fontSize: 10, fontWeight: 700}} />
                            <RechartsTooltip 
                                contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '1.2rem'}}
                                itemStyle={{fontSize: '14px', fontWeight: '900', color: '#171717'}}
                                labelStyle={{fontSize: '10px', fontWeight: '900', color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px'}}
                                formatter={(val) => [`₹${val.toLocaleString()}`, 'Total Outflow']}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#171717" strokeWidth={4} fill="url(#colorBurn)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Allocation" subtitle="By Category" icon={PieChart} className="h-[450px]">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPie margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                                    <Pie 
                                        data={categoryData} 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={85} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        stroke="none"
                                        label={renderCustomizedPieLabel}
                                        labelLine={{ stroke: '#e5e5e5', strokeWidth: 1 }}
                                    >
                                        {categoryData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}
                                        formatter={(val) => `₹${val.toLocaleString()}`} 
                                    />
                                </RechartsPie>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-20"><p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Void Data</p></div>
                        )}
                    </Card>

                    <Card title="Source Breakdown" subtitle="Distribution Magnitude" icon={CreditCard} className="lg:col-span-3 h-[400px]">
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
                    </Card>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-[0_30px_60px_rgba(0,0,0,0.03)] overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="p-10 border-b border-neutral-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black tracking-tighter text-neutral-900">Transaction Journal</h3>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.15em] mt-1">Full Ledger History</p>
                        </div>
                        <span className="px-6 py-2.5 bg-neutral-100 text-neutral-500 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase">{expenses.length} Entries</span>
                    </div>
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
                            {expenses.slice().reverse().map((e) => {
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
                                            <button onClick={() => handleOpenEdit(e)} className="p-3 text-neutral-400 hover:text-neutral-900 hover:bg-white border border-transparent hover:border-neutral-200 rounded-2xl shadow-none hover:shadow-md transition-all"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(e.id)} className="p-3 text-neutral-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-neutral-200 rounded-2xl shadow-none hover:shadow-md transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-neutral-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30">
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 tracking-tighter">{editingExpense ? 'Modify' : 'Draft'} Transaction</h2>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Configure Entry Parameters</p>
                </div>
                <button onClick={handleCloseModal} className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-neutral-100 transition-all"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase mb-3 block tracking-[0.2em] ml-1">Merchant Identity</label>
                    <input type="text" placeholder="Where did this happen?" required value={merchant} onChange={(e) => setMerchant(e.target.value)} className="w-full px-7 py-5 bg-neutral-50 rounded-[1.5rem] border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-bold text-lg placeholder:text-neutral-300 tracking-tight" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-neutral-400 uppercase mb-3 block tracking-[0.2em] ml-1">Magnitude (₹)</label>
                        <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-7 py-5 bg-neutral-50 rounded-[1.5rem] border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-black text-2xl tracking-tighter" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-neutral-400 uppercase mb-3 block tracking-[0.2em] ml-1">Occurence Date</label>
                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-7 py-5 bg-neutral-50 rounded-[1.5rem] border-2 border-transparent focus:border-neutral-900 focus:bg-white outline-none transition-all font-black text-sm tracking-widest" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-400 uppercase mb-4 block tracking-[0.2em] ml-1">Taxonomy</label>
                    <div className="grid grid-cols-4 gap-3">
                      {CATEGORIES.map(c => (
                        <button key={c.name} type="button" onClick={() => setCategory(c.name)} className={`group flex flex-col items-center justify-center p-4 rounded-[1.5rem] transition-all border-2 ${category === c.name ? 'bg-neutral-900 border-neutral-900 shadow-xl' : 'bg-white border-neutral-50 hover:border-neutral-200'}`}>
                          <c.icon className={`w-5 h-5 mb-2 ${category === c.name ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                          <span className={`text-[8px] font-black uppercase tracking-widest ${category === c.name ? 'text-white' : 'text-neutral-400'}`}>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-neutral-900 text-white rounded-[1.8rem] font-black shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-neutral-800 transition-all active:scale-95 uppercase tracking-[0.25em] text-xs">Commit Transaction</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
