import  { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";

import { getMyDonations } from "../services/donationService";
import { getMyClaims } from "../services/claimService";
import { getAvailableRequests } from "../services/donationRequestService";

import type { Donation, DonationClaim, DonationRequest } from "../types/Dashboard";

function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "just now";
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

export default function DonorDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<DonationClaim[]>([]);
  const [availableRequests, setAvailableRequests] = useState<DonationRequest[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dResult, cResult, rResult] = await Promise.all([
          getMyDonations().catch(() => [] as Donation[]),
          getMyClaims().catch(() => [] as DonationClaim[]),
          getAvailableRequests().catch(() => [] as DonationRequest[])
        ]);
        if (isMounted) {
          setDonations(dResult);
          setClaims(cResult);
          setAvailableRequests(rResult);
        }
      } catch (error) {
        console.error("Dashboard data fetch failed", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchData();
    return () => { isMounted = false; };
  }, []);

  // 1. Stats Row Data
  const stats = useMemo(() => [
    { 
      label: "Total Donations", 
      value: donations.length, 
      color: "#F0EBE1", 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> 
    },
    { 
      label: "Available", 
      value: donations.filter(d => d.status === "AVAILABLE").length, 
      color: "#7DC542", 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> 
    },
    { 
      label: "Requested", 
      value: donations.filter(d => d.status === "REQUESTED").length, 
      color: "#FFA726", 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> 
    },
    { 
      label: "Collected", 
      value: donations.filter(d => d.status === "COLLECTED").length, 
      color: "#42A5F5", 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg> 
    },
  ], [donations]);

  // 2. Pending Claims Banner Data
  const pendingClaimsCount = useMemo(() => claims.filter(c => c.status === "PENDING").length, [claims]);

  // 3. Charts Data
  const donutData = useMemo(() => {
    const counts = { AVAILABLE: 0, REQUESTED: 0, COLLECTED: 0, COMPLETED: 0 };
    donations.forEach(d => { if (d.status in counts) counts[d.status as keyof typeof counts]++; });
    return counts;
  }, [donations]);

  const foodTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    donations.forEach(d => { counts[d.foodType] = (counts[d.foodType] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(...sorted.map(s => s[1]), 1);
    const colors = ["#7DC542","#66BB6A","#42A5F5","#FFA726","#AB47BC","#26C6DA"];
    return { data: sorted, max, colors };
  }, [donations]);

  // donut calculations
  const donutTotal = donations.length;
  const availPct = donutTotal ? (donutData.AVAILABLE / donutTotal) * 100 : 0;
  const reqPct = donutTotal ? (donutData.REQUESTED / donutTotal) * 100 : 0;
  const colPct = donutTotal ? (donutData.COLLECTED / donutTotal) * 100 : 0;
  const compPct = donutTotal ? (donutData.COMPLETED / donutTotal) * 100 : 0;

  // 4. Quick Actions
  const quickActions = [
    { 
      title: "Create Donation", 
      path: "/dashboard/donor/create", 
      desc: "Offer new surplus food.", 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg> 
    },
    { 
      title: "My Donations", 
      path: "/dashboard/donor/my-donations", 
      desc: "Manage your active listings.", 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><line x1="8" y1="11" x2="16" y2="11" /><line x1="8" y1="16" x2="16" y2="16" /></svg> 
    },
    { 
      title: "Explore Requests", 
      path: "/dashboard/donor/explore", 
      desc: "Browse what centers need.", 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg> 
    }
  ];

  // 5. Incoming Requests Logic
  const recentRequests = useMemo(() => {
    return availableRequests
      .slice()
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [availableRequests]);

  const getReqBadgeProps = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Pending' };
      case 'partially_filled': return { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/20', label: 'Partial' };
      case 'completed': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Completed' };
      default: return { bg: 'bg-white/10', text: 'text-white/60', border: 'border-white/10', label: status };
    }
  };

  // 6. Recent Activity Log Logic
  const recentActivity = useMemo(() => {
    return donations
      .slice()
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [donations]);

  const getStatusProps = (status: string) => {
    switch (status) {
      case "AVAILABLE": return { color: "#7DC542", bgClass: "bg-[#7DC542]/10", borderClass: "border-[#7DC542]/20", textClass: "text-[#7DC542]", label: "Available" };
      case "REQUESTED": return { color: "#FFA726", bgClass: "bg-[#FFA726]/10", borderClass: "border-[#FFA726]/20", textClass: "text-[#FFA726]", label: "Requested" };
      case "COLLECTED": return { color: "#42A5F5", bgClass: "bg-[#42A5F5]/10", borderClass: "border-[#42A5F5]/20", textClass: "text-[#42A5F5]", label: "Collected" };
      case "COMPLETED": return { color: "#8B5CF6", bgClass: "bg-[#8B5CF6]/10", borderClass: "border-[#8B5CF6]/20", textClass: "text-[#8B5CF6]", label: "Completed" };
      default: return { color: "#F0EBE1", bgClass: "bg-white/10", borderClass: "border-white/20", textClass: "text-[#F0EBE1]", label: "Unknown" };
    }
  };

  return (
    <DashboardLayout>
      {/* 1. Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-5 border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] flex justify-between items-start transition-all hover:border-[rgba(125,197,66,0.3)] hover:-translate-y-0.5 group">
            <div>
              <div className="text-[0.7rem] font-semibold text-[rgba(240,235,225,0.5)] tracking-wider uppercase mb-1">
                {stat.label}
              </div>
              {loading ? (
                <div className="animate-pulse h-9 w-16 bg-[rgba(255,255,255,0.05)] rounded mt-1"></div>
              ) : (
                <div className="text-3xl font-black mt-2" style={{ color: stat.color }}>{stat.value}</div>
              )}
            </div>
            <div className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: stat.color }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Pending Claims Alert Banner */}
      {!loading && pendingClaimsCount > 0 && (
        <div className="mb-8 rounded-xl border border-[#FFA726]/30 bg-[#FFA726]/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-[#FFA726]/20 p-2.5 rounded-full text-[#FFA726]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="text-[#FFA726] font-bold text-base">Review Pending Claims</h3>
              <p className="text-[rgba(240,235,225,0.7)] text-sm mt-0.5">You have {pendingClaimsCount} incoming claim request{pendingClaimsCount !== 1 ? 's' : ''} from distribution centers waiting for your approval.</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard/donor/my-donations')} className="px-5 py-2.5 bg-[#FFA726] hover:bg-[#FFB74D] text-[#0B1A08] font-bold rounded-lg transition-colors text-sm whitespace-nowrap self-start sm:self-auto">
            View Claims
          </button>
        </div>
      )}

      {/* 3. Charts Section */}
      {!loading && donations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Donation Status Breakdown Donut */}
          <div className="rounded-xl p-6 border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] flex flex-col md:flex-row items-center gap-8 h-full">
            <div className="flex-1 w-full">
              <h2 className="text-lg font-bold text-[#F0EBE1] mb-6">Status Breakdown</h2>
              <div className="space-y-4">
                {[
                  { label: "Available", count: donutData.AVAILABLE, color: "#7DC542" },
                  { label: "Requested", count: donutData.REQUESTED, color: "#FFA726" },
                  { label: "Collected", count: donutData.COLLECTED, color: "#42A5F5" },
                  { label: "Completed", count: donutData.COMPLETED, color: "#8B5CF6" }
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-[rgba(240,235,225,0.8)]">{item.label}</span>
                    </div>
                    <span className="font-bold text-[#F0EBE1]">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"></circle>
                {availPct > 0 && <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#7DC542" strokeWidth="6" strokeDasharray={`${availPct} ${100 - availPct}`} strokeDashoffset={100} className="transition-all duration-1000"></circle>}
                {reqPct > 0 && <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#FFA726" strokeWidth="6" strokeDasharray={`${reqPct} ${100 - reqPct}`} strokeDashoffset={100 - availPct} className="transition-all duration-1000"></circle>}
                {colPct > 0 && <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#42A5F5" strokeWidth="6" strokeDasharray={`${colPct} ${100 - colPct}`} strokeDashoffset={100 - (availPct + reqPct)} className="transition-all duration-1000"></circle>}
                {compPct > 0 && <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#8B5CF6" strokeWidth="6" strokeDasharray={`${compPct} ${100 - compPct}`} strokeDashoffset={100 - (availPct + reqPct + colPct)} className="transition-all duration-1000"></circle>}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#F0EBE1]">{donutTotal}</span>
                <span className="text-[0.65rem] text-[rgba(240,235,225,0.5)] uppercase tracking-wider">Donations</span>
              </div>
            </div>
          </div>

          {/* Food Type Breakdown Bars */}
          <div className="rounded-xl p-6 border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] h-full flex flex-col">
            <h2 className="text-lg font-bold text-[#F0EBE1] mb-6">Top Food Types</h2>
            <div className="space-y-4 flex-1">
              {foodTypeData.data.map(([foodType, count], idx) => (
                <div key={foodType} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#F0EBE1] font-medium truncate pr-2">{foodType}</span>
                    <span className="text-[rgba(240,235,225,0.8)] font-mono text-xs">{count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(count / foodTypeData.max) * 100}%`,
                        backgroundColor: foodTypeData.colors[idx % foodTypeData.colors.length] 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#F0EBE1] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="text-left group rounded-xl border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] p-5 transition-all duration-300 hover:border-[rgba(125,197,66,0.3)] hover:bg-[rgba(125,197,66,0.05)] cursor-pointer"
            >
              <div className="text-[rgba(240,235,225,0.8)] group-hover:text-[#7DC542] transition-colors mb-3">
                {action.icon}
              </div>
              <h3 className="font-bold text-[#F0EBE1] group-hover:text-[#7DC542] transition-colors text-base">{action.title}</h3>
              <p className="text-[rgba(240,235,225,0.5)] mt-1 text-sm">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 5. Incoming Requests Preview */}
        {!loading && availableRequests.length > 0 && (
          <div className="flex flex-col h-full border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden p-6">
            <h2 className="text-lg font-bold text-[#F0EBE1] mb-4">Open Requests Preview</h2>
            <div className="space-y-3 flex-1">
              {recentRequests.map(r => {
                const badge = getReqBadgeProps(r.status);
                return (
                  <div key={r.donationRequestId} className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                    <div className="min-w-0 pr-4">
                      <h4 className="font-bold text-[#F0EBE1] text-sm truncate">{r.foodType} &bull; {r.requestedQuantity} {r.unit}</h4>
                      <p className="text-xs text-[rgba(240,235,225,0.5)] mt-1 truncate">{r.distributionCenterName || "Anonymous Center"}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-0.5 border rounded text-[0.65rem] font-bold uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => navigate('/dashboard/donor/explore')} 
              className="mt-4 w-full py-3 rounded-lg bg-[rgba(125,197,66,0.1)] text-[#7DC542] hover:bg-[rgba(125,197,66,0.2)] font-bold text-sm transition-colors"
            >
              View All Requests &rarr;
            </button>
          </div>
        )}

        {/* 6. Recent Activity Log */}
        <div className={`flex flex-col h-full border border-[rgba(125,197,66,0.12)] bg-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden ${!loading && availableRequests.length === 0 ? 'lg:col-span-2' : ''}`}>
          <div className="p-6 pb-4 border-b border-[rgba(125,197,66,0.08)]">
            <h2 className="text-lg font-bold text-[#F0EBE1]">Recent Activity</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] animate-pulse"></div>
                    <div className="flex-1 space-y-2.5">
                      <div className="h-3.5 bg-[rgba(255,255,255,0.05)] rounded w-1/3 animate-pulse"></div>
                      <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/4 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <svg className="w-12 h-12 text-[rgba(240,235,225,0.2)] mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                <p className="text-[rgba(240,235,225,0.5)] text-sm">No recent donations to show yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(125,197,66,0.08)]">
                {recentActivity.map((d, idx) => {
                  const props = getStatusProps(d.status);
                  return (
                    <div 
                      key={`${d.donationId}-${idx}`}
                      className="flex items-center gap-4 p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      style={{ animation: `fadeSlideIn 0.3s ease ${idx * 0.05}s both` }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${props.bgClass} ${props.borderClass} ${props.textClass}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-[#F0EBE1] truncate">{d.foodType}</span>
                          <span className={`text-[0.6rem] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap border ${props.bgClass} ${props.textClass} ${props.borderClass}`}>{props.label}</span>
                        </div>
                        <p className="text-xs text-[rgba(240,235,225,0.6)] truncate">{d.quantity} {d.unit}</p>
                      </div>
                      <div className="text-xs text-[rgba(240,235,225,0.4)] whitespace-nowrap text-right">
                        {relativeTime(d.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
