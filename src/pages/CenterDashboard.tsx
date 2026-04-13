import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useInventory } from "../components/hooks/useInventory";
import { useCenterOutgoingRequests } from "../components/hooks/useDonationRequests";
import { useAvailableDonations } from "../components/hooks/useDonations";
import type { Donation, DonationRequest } from "../types/Dashboard";

function daysUntil(dateString: string): number {
  if (!dateString) return 0;
  const target = new Date(dateString);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function relativeTime(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "just now";
  const diffMs = new Date().getTime() - date.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSecs < 60) return "just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function CenterDashboard() {
  const navigate = useNavigate();

  const { inventory, loading: inventoryLoading } = useInventory();
  const { requests, loading: requestsLoading } = useCenterOutgoingRequests();
  const { donations: availableDonations } = useAvailableDonations();

  const loading = inventoryLoading || requestsLoading;

  // 1. Summary Stats
  const totalCollected = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.collectedAmount ?? item.quantity), 0);
  }, [inventory]);

  const totalDistributed = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.distributedQuantity ?? 0), 0);
  }, [inventory]);

  const inInventory = useMemo(() => {
    return inventory.filter(item => item.status === "COLLECTED").length;
  }, [inventory]);

  // 2. Charts Data
  const inventoryByFoodType = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach(item => {
      const qty = item.collectedAmount ?? item.quantity;
      map.set(item.foodType, (map.get(item.foodType) || 0) + qty);
    });
    return Array.from(map.entries())
      .map(([foodType, quantity]) => ({ foodType, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [inventory]);

  const maxInventoryQuantity = useMemo(() => {
    return Math.max(...inventoryByFoodType.map(d => d.quantity), 1);
  }, [inventoryByFoodType]);

  const requestsDonutData = useMemo(() => {
    let pending = 0, partiallyFilled = 0, completed = 0;
    requests.forEach(r => {
      if (r.status === "pending") pending++;
      else if (r.status === "partially_filled") partiallyFilled++;
      else if (r.status === "completed") completed++;
    });
    return { pending, partiallyFilled, completed, total: requests.length };
  }, [requests]);

  // 3. Expiring Soon
  const expiringItems = useMemo(() => {
    return inventory
      .filter(item => daysUntil(item.expirationDate) <= 7)
      .slice()
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
      .slice(0, 6);
  }, [inventory]);

  const getUrgencyStyles = (days: number) => {
    if (days < 0) return { border: 'border-red-500/50', badge: 'bg-red-500/20 text-red-400', label: 'Expired' };
    if (days === 0) return { border: 'border-orange-500/50', badge: 'bg-orange-500/20 text-orange-400', label: 'Today' };
    if (days <= 3) return { border: 'border-yellow-500/50', badge: 'bg-yellow-500/20 text-yellow-400', label: `${days}d left` };
    return { border: 'border-[#7DC542]/50', badge: 'bg-[#7DC542]/20 text-[#7DC542]', label: `${days}d left` };
  };

  // 5. Recent Activity
  const recentActivity = useMemo(() => {
    const activities: Array<{ id: string, type: 'inventory' | 'request', title: string, subtitle: string, date: Date }> = [];
    
    inventory.forEach(item => {
      const date = new Date(item.createdAt);
      activities.push({
        id: `inv-${item.donationId || Math.random()}`,
        type: 'inventory',
        title: `Inventory Collected`,
        subtitle: `${item.collectedAmount ?? item.quantity} ${item.unit} of ${item.foodType}`,
        date
      });
    });

    requests.forEach(r => {
      const date = new Date(r.createdAt);
      activities.push({
        id: `req-${r.donationRequestId || Math.random()}`,
        type: 'request',
        title: `Request ${r.status}`,
        subtitle: `${r.requestedQuantity} ${r.unit} of ${r.foodType}`,
        date
      });
    });

    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [inventory, requests]);

  // Donut SVG Setup
  const pendingPct = requestsDonutData.total ? (requestsDonutData.pending / requestsDonutData.total) * 100 : 0;
  const partialPct = requestsDonutData.total ? (requestsDonutData.partiallyFilled / requestsDonutData.total) * 100 : 0;
  const completedPct = requestsDonutData.total ? (requestsDonutData.completed / requestsDonutData.total) * 100 : 0;

  return (
    <DashboardLayout>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideIn {
          animation: fadeSlideIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* 1. Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Collected", value: totalCollected, unit: "units", color: "#7DC542" },
          { label: "Distributed", value: totalDistributed, unit: "units", color: "#66BB6A" },
          { label: "In Inventory", value: inInventory, unit: "items", color: "#42A5F5" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-6 border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] transition-all duration-300 hover:border-[rgba(125,197,66,0.3)] hover:-translate-y-0.5">
            <h3 className="text-[0.82rem] font-semibold text-[rgba(240,235,225,0.5)] tracking-wider uppercase mb-2">
              {stat.label}
            </h3>
            {loading ? (
              <div className="animate-pulse h-10 w-24 bg-[rgba(255,255,255,0.05)] rounded mt-1"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</span>
                <span className="text-sm text-[rgba(240,235,225,0.5)]">{stat.unit}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#F0EBE1] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "Browse Donations", 
              path: "/dashboard/center/explore", 
              desc: "Find food", 
              icon: <svg className="w-7 h-7 text-[#7DC542] mb-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> 
            },
            { 
              label: "Create Request", 
              path: "/dashboard/center/create-request", 
              desc: "Need supplies", 
              icon: <svg className="w-7 h-7 text-[#42A5F5] mb-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg> 
            },
            { 
              label: "Outgoing Requests", 
              path: "/dashboard/center/requests", 
              desc: "Track status", 
              icon: <svg className="w-7 h-7 text-[#FFA726] mb-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> 
            },
            { 
              label: "Inventory", 
              path: "/dashboard/center/inventory", 
              desc: "Manage stock", 
              icon: <svg className="w-7 h-7 text-[#66BB6A] mb-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg> 
            },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="group text-left p-5 rounded-xl border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(125,197,66,0.3)] hover:bg-[rgba(125,197,66,0.05)] transition-all cursor-pointer"
            >
              {action.icon}
              <div className="font-bold text-[#F0EBE1] text-sm group-hover:text-[#7DC542] transition-colors">{action.label}</div>
              <div className="text-xs text-[rgba(240,235,225,0.5)] mt-1">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Charts Section */}
      {(inventory.length > 0 || requests.length > 0) && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Inventory by Food Type */}
          <div className="rounded-xl p-6 border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] h-full flex flex-col">
            <h2 className="text-lg font-bold text-[#F0EBE1] mb-6">Inventory by Food Type</h2>
            <div className="space-y-4 flex-1">
              {inventoryByFoodType.length === 0 ? (
                <div className="text-[rgba(240,235,225,0.5)] text-sm h-full flex items-center">No inventory data available.</div>
              ) : (
                inventoryByFoodType.map((item, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <div className="w-24 truncate text-[rgba(240,235,225,0.8)] pr-2" title={item.foodType}>{item.foodType}</div>
                    <div className="flex-1 h-3 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#66BB6A] to-[#7DC542] rounded-full transition-all duration-1000"
                        style={{ width: `${(item.quantity / maxInventoryQuantity) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right text-[rgba(240,235,225,0.9)] font-mono text-xs">{item.quantity}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outgoing Requests Donut */}
          <div className="rounded-xl p-6 border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] flex flex-col md:flex-row items-center gap-8 h-full">
            <div className="flex-1 w-full">
              <h2 className="text-lg font-bold text-[#F0EBE1] mb-6">Outgoing Requests</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FFA726]"></span>
                    <span className="text-[rgba(240,235,225,0.8)]">Pending</span>
                  </div>
                  <span className="font-bold text-[#F0EBE1]">{requestsDonutData.pending}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#42A5F5]"></span>
                    <span className="text-[rgba(240,235,225,0.8)]">Partially Filled</span>
                  </div>
                  <span className="font-bold text-[#F0EBE1]">{requestsDonutData.partiallyFilled}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#7DC542]"></span>
                    <span className="text-[rgba(240,235,225,0.8)]">Completed</span>
                  </div>
                  <span className="font-bold text-[#F0EBE1]">{requestsDonutData.completed}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-[rgba(125,197,66,0.12)] flex items-center justify-between text-sm">
                  <span className="text-[rgba(240,235,225,0.8)]">Available to claim</span>
                  <span className="font-bold text-[#7DC542]">{availableDonations.length}</span>
                </div>
              </div>
            </div>
            
            <div className="relative w-36 h-36 flex-shrink-0">
              {requestsDonutData.total === 0 ? (
                <div className="w-full h-full rounded-full border-[6px] border-[rgba(255,255,255,0.05)] flex items-center justify-center text-xs text-[rgba(240,235,225,0.5)]">No Data</div>
              ) : (
                <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"></circle>
                  {pendingPct > 0 && (
                    <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#FFA726" strokeWidth="6" strokeDasharray={`${pendingPct} ${100 - pendingPct}`} strokeDashoffset={100} className="transition-all duration-1000"></circle>
                  )}
                  {partialPct > 0 && (
                    <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#42A5F5" strokeWidth="6" strokeDasharray={`${partialPct} ${100 - partialPct}`} strokeDashoffset={100 - pendingPct} className="transition-all duration-1000"></circle>
                  )}
                  {completedPct > 0 && (
                    <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#7DC542" strokeWidth="6" strokeDasharray={`${completedPct} ${100 - completedPct}`} strokeDashoffset={100 - (pendingPct + partialPct)} className="transition-all duration-1000"></circle>
                  )}
                </svg>
              )}
              {requestsDonutData.total > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#F0EBE1]">{requestsDonutData.total}</span>
                  <span className="text-[0.65rem] text-[rgba(240,235,225,0.5)] uppercase tracking-wider">Total</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Expiring Soon Section */}
      {!loading && expiringItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-[#F0EBE1]">Expiring Soon</h2>
            <div className="bg-red-500/20 text-red-400 text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{expiringItems.length} items</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringItems.map((item, i) => {
              const days = daysUntil(item.expirationDate);
              const styles = getUrgencyStyles(days);
              return (
                <div key={i} className={`rounded-xl p-4 border bg-[rgba(255,255,255,0.03)] flex flex-col gap-2 ${styles.border}`}>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[#F0EBE1] text-sm">{item.foodType}</span>
                    <span className={`text-[0.7rem] px-2 py-0.5 rounded font-bold whitespace-nowrap ${styles.badge}`}>{styles.label}</span>
                  </div>
                  <div className="text-xs text-[rgba(240,235,225,0.5)]">
                    {item.collectedAmount ?? item.quantity} {item.unit} &bull; Expires {new Date(item.expirationDate).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Recent Activity Log */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#F0EBE1] mb-4">Recent Activity</h2>
        <div className="rounded-xl border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
          {loading ? (
             <div className="p-6 space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex gap-4 items-center">
                   <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] animate-pulse"></div>
                   <div className="flex-1 space-y-2">
                     <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-1/3 animate-pulse"></div>
                     <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/2 animate-pulse"></div>
                   </div>
                 </div>
               ))}
             </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-8 text-center text-[rgba(240,235,225,0.5)] text-sm">
              No recent activity found.
            </div>
          ) : (
            <div className="divide-y divide-[rgba(125,197,66,0.08)]">
              {recentActivity.map((act, i) => (
                <div 
                  key={act.id} 
                  className="p-4 flex items-center gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors animate-fadeSlideIn"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${act.type === 'inventory' ? 'bg-[#7DC542]/10 text-[#7DC542] border border-[#7DC542]/20' : 'bg-[#42A5F5]/10 text-[#42A5F5] border border-[#42A5F5]/20'}`}>
                    {act.type === 'inventory' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="8 17 12 21 16 17" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#F0EBE1] truncate">{act.title}</p>
                    <p className="text-xs text-[rgba(240,235,225,0.5)] truncate">{act.subtitle}</p>
                  </div>
                  <div className="text-xs font-medium text-[rgba(240,235,225,0.4)] whitespace-nowrap">
                    {relativeTime(act.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
