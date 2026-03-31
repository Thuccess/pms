import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { useRecords } from '@/features/dashboard/hooks/useRecords';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="border border-primary/30 p-4 rounded-md shadow-2xl backdrop-blur-md transition-colors duration-300 bg-card text-card-foreground">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
        <p className="text-sm font-bold text-primary">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';
  const { data, loading } = useRecords();
  const payments = data.payments;
  const maintenance = data.maintenance;
  const units = data.units;
  const properties = data.properties;

  if (loading) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  const monthlyRevenue = payments.reduce<Record<string, number>>((acc, payment) => {
    const month = new Date(payment.date).toLocaleString('en-US', { month: 'short' }).toUpperCase();
    acc[month] = (acc[month] || 0) + payment.amount;
    return acc;
  }, {});

  const REVENUE_DATA = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));
  const OCCUPANCY_DATA = units.slice(0, 6).map((unit) => ({
    name: unit.number,
    value: unit.status === 'Occupied' ? 100 : unit.status === 'Maintenance' ? 50 : 0,
  }));

  const occupiedCount = units.filter((unit) => unit.status === 'Occupied').length;
  const occupancyRate = units.length ? (occupiedCount / units.length) * 100 : 0;
  const pendingRevenue = payments
    .filter((payment) => payment.status === 'Pending' || payment.status === 'Late')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalRevenue = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.amount, 0);
  const activeMaintenance = maintenance.filter((request) => request.status !== 'Resolved').length;

  const KPI_DATA = [
    { label: 'Portfolio Revenue', value: `$${totalRevenue.toLocaleString()}`, change: `${payments.length} TXNS`, icon: TrendingUp, trend: 'up' as const },
    { label: 'Total Occupancy', value: `${occupancyRate.toFixed(1)}%`, change: `${occupiedCount}/${units.length || 0}`, icon: Users, trend: 'up' as const },
    { label: 'Pending Payments', value: `$${pendingRevenue.toLocaleString()}`, change: `${payments.filter((payment) => payment.status !== 'Paid').length} OPEN`, icon: CreditCard, trend: pendingRevenue > 0 ? 'down' as const : 'up' as const },
    { label: 'Total Assets', value: String(properties.length), change: `${activeMaintenance} ACTIVE TICKETS`, icon: Building2, trend: 'up' as const },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.16em]">Executive Overview</h1>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.28em] mt-2">Real-time portfolio intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-card border border-border rounded-md flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-foreground uppercase tracking-widest">System Live</span>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: KPIs & Charts */}
        <div className="xl:col-span-8 space-y-6 sm:space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {KPI_DATA.map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="premium-surface p-5 sm:p-6 group hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-2.5 bg-secondary rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <kpi.icon className="w-5 h-5" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
                    kpi.trend === 'up' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <h3 className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold mb-2">{kpi.label}</h3>
                <p className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6 sm:gap-8">
            <div className="bg-card p-6 sm:p-10 rounded-lg card-shadow border border-border transition-colors duration-300">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.22em]">Revenue Performance</h3>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-[0.22em] mt-2">Monthly financial yield</p>
                </div>
              </div>
              <div className="h-[260px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA.length ? REVENUE_DATA : [{ month: 'N/A', revenue: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C8A64B" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#C8A64B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#262626' : '#E5E5E5'} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: isDark ? '#737373' : '#555555', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(v) => `$${v/1000}K`}
                      tick={{ fill: isDark ? '#737373' : '#555555', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#C8A64B" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card p-6 sm:p-10 rounded-lg card-shadow border border-border transition-colors duration-300">
              <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.22em] mb-8 sm:mb-10">Asset Occupancy</h3>
              <div className="h-[220px] sm:h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={OCCUPANCY_DATA.length ? OCCUPANCY_DATA : [{ name: 'N/A', value: 0 }]} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#262626' : '#E5E5E5'} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={60} 
                      tick={{ fill: isDark ? '#737373' : '#555555', fontSize: 9 }}
                    />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                      {(OCCUPANCY_DATA.length ? OCCUPANCY_DATA : [{ name: 'N/A', value: 0 }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#C8A64B' : isDark ? '#2B2721' : '#E7DBC2'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-md border border-border">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest block mb-1">Average Occupancy</span>
                  <span className="text-sm font-bold text-foreground">{occupancyRate.toFixed(1)}%</span>
                </div>
                <div className="p-4 bg-secondary rounded-md border border-border">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest block mb-1">Elite Units</span>
                  <span className="text-sm font-bold text-foreground">{occupiedCount}/{units.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Maintenance */}
        <div className="xl:col-span-4 space-y-6 sm:space-y-8">
          <div className="premium-surface overflow-hidden transition-colors duration-300 flex flex-col h-full max-h-[1200px]">
            <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between bg-background/50">
              <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Recent Transactions</h3>
              <button className="text-[8px] sm:text-[9px] text-primary font-bold uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="divide-y divide-border flex-1 overflow-y-auto custom-scrollbar">
              {payments.slice(0, 8).map((payment) => (
                <div key={payment.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-background/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider truncate max-w-[170px]">{payment.description}</h4>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">{payment.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">${payment.amount.toLocaleString()}</p>
                    <StatusBadge status={payment.status} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-surface overflow-hidden transition-colors duration-300">
            <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between bg-background/50">
              <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Concierge Requests</h3>
              <button className="text-[8px] sm:text-[9px] text-primary font-bold uppercase tracking-widest hover:underline">View All</button>
            </div>
            <div className="divide-y divide-border">
              {maintenance.slice(0, 5).map((request) => (
                <div key={request.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-background/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider truncate max-w-[170px]">{request.issue}</h4>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">UNIT {request.unitId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={request.status} className="mb-1" />
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest">{request.priority} PRIORITY</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
