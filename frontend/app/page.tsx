// 'use client'

// import { FormEvent, useMemo, useState } from 'react'
// import {
//   Anchor,
//   ArrowDownRight,
//   ArrowUpRight,
//   BarChart3,
//   Check,
//   ChevronDown,
//   CircleHelp,
//   Cloud,
//   Gauge,
//   Globe2,
//   Menu,
//   Navigation,
//   PanelLeft,
//   RefreshCw,
//   Ship,
//   ShieldCheck,
//   SlidersHorizontal,
//   Sparkles,
//   Waves,
//   X,
//   Zap,
// } from 'lucide-react'

// type OptimizationResponse = {
//   predicted_bdi: number
//   optimization_details: {
//     origin_port: string
//     destination_port: string
//     distance_nm: number
//     cargo_allocated_mt: number
//     recommended_vessel: string
//     estimated_cost_usd: number
//     draft_check: string
//     loa_check: string
//     status: string
//   }
//   carbon_emissions: {
//     co2_emissions_tons: number
//     fuel_consumed_tons: number
//     voyage_days: number
//     cii_grams_per_dwt_nm: number
//     cii_rating: string
//   }
// }

// const ports = ['Visakhapatnam', 'Paradip', 'Haldia', 'Mumbai', 'Chennai']
// const navItems = [
//   { label: 'Fleet Overview', icon: Gauge, active: true },
//   { label: 'Voyage Planning', icon: Navigation },
//   { label: 'ESG & Emissions', icon: Cloud },
//   { label: 'Port Intelligence', icon: Globe2 },
// ]

// const formatNumber = (value: number, maximumFractionDigits = 0) =>
//   new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value)
// const formatCurrency = (value: number) =>
//   new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

// function StatusBadge({ value }: { value: string }) {
//   const positive = /pass|safe|ok|optimal|success|clear/i.test(value)
//   return (
//     <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${positive ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/25 bg-amber-400/10 text-amber-300'}`}>
//       {positive ? <Check className="size-3" /> : <CircleHelp className="size-3" />}
//       {value}
//     </span>
//   )
// }

// function MetricCard({ label, value, detail, icon: Icon, trend }: { label: string; value: string; detail: string; icon: typeof Gauge; trend?: 'up' | 'down' }) {
//   return (
//     <article className="panel relative overflow-hidden p-5">
//       <div className="mb-6 flex items-center justify-between">
//         <span className="eyebrow">{label}</span>
//         <span className="icon-box"><Icon className="size-4" /></span>
//       </div>
//       <div className="flex items-end gap-2">
//         <strong className="text-3xl font-semibold tracking-tight text-white">{value}</strong>
//         {trend && <span className={`mb-1 flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-300' : 'text-sky-300'}`}>{trend === 'up' ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}</span>}
//       </div>
//       <p className="mt-2 text-xs text-slate-500">{detail}</p>
//     </article>
//   )
// }

// export default function Page() {
//   const [origin, setOrigin] = useState('Visakhapatnam')
//   const [destination, setDestination] = useState('Haldia')
//   const [cargo, setCargo] = useState('50000')
//   const [bdi, setBdi] = useState('1500')
//   const [result, setResult] = useState<OptimizationResponse | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [sidebarOpen, setSidebarOpen] = useState(false)

//   const bdiDelta = useMemo(() => result ? result.predicted_bdi - Number(bdi) : 0, [result, bdi])
//   const costPerTon = result ? result.optimization_details.estimated_cost_usd / result.optimization_details.cargo_allocated_mt : 0

//   async function runOptimization(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault()
//     setLoading(true)
//     setError('')
//     try {
//       const response = await fetch('http://127.0.0.1:8000/optimize', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ origin_port: origin, dest_port: destination, cargo_mt: Number(cargo), recent_bdi: Number(bdi) }),
//       })
//       if (!response.ok) throw new Error(`Backend returned ${response.status}`)
//       setResult(await response.json())
//     } catch {
//       setError('Optimization engine unavailable. Check that the local API is running and try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <main className="min-h-screen bg-background text-foreground">
//       <header className="topbar">
//         <div className="flex items-center gap-3">
//           <button aria-label="Open navigation" className="icon-button lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="size-4" /></button>
//           <div className="brand-mark"><Waves className="size-5" /></div>
//           <div><div className="brand-name">SAIL <span>FLEET PULSE</span></div><div className="brand-version">OPTIMIZATION ENGINE <span>v2.4</span></div></div>
//         </div>
//         <div className="flex items-center gap-4"><div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span className="status-dot" /> API CONNECTION <span className="text-emerald-300">LIVE</span></div><button aria-label="Refresh data" className="icon-button"><RefreshCw className="size-4" /></button><div className="avatar">OP</div></div>
//       </header>

//       <div className="shell">
//         <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
//           <div className="mb-8 flex items-center justify-between lg:hidden"><span className="eyebrow">Navigation</span><button aria-label="Close navigation" className="icon-button" onClick={() => setSidebarOpen(false)}><X className="size-4" /></button></div>
//           <div className="eyebrow mb-4">Workspace</div>
//           <nav className="space-y-1">{navItems.map(({ label, icon: Icon, active }) => <button key={label} className={`nav-item ${active ? 'nav-active' : ''}`}><Icon className="size-4" />{label}{active && <span className="ml-auto size-1.5 rounded-full bg-sky-300" />}</button>)}</nav>
//           <div className="my-8 h-px bg-white/[0.06]" />
//           <div className="eyebrow mb-4">Quick access</div>
//           <button className="nav-item"><BarChart3 className="size-4" />Market Signals</button><button className="nav-item"><ShieldCheck className="size-4" />Compliance Center</button>
//           <div className="mt-auto hidden rounded-xl border border-sky-400/10 bg-sky-400/[0.04] p-4 lg:block"><Sparkles className="mb-3 size-4 text-sky-300" /><p className="text-xs font-medium text-slate-300">AI-assisted planning</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Live intelligence from your fleet and global markets.</p></div>
//         </aside>

//         <section className="content-area">
//           <div className="page-heading"><div><div className="eyebrow mb-3 flex items-center gap-2"><span className="size-1.5 rounded-full bg-sky-300" /> Command center</div><h1>Fleet Overview</h1><p>Optimize your next voyage with live market and vessel intelligence.</p></div><div className="hidden items-center gap-2 text-xs text-slate-500 md:flex"><span className="size-2 rounded-full bg-emerald-400" /> Last sync: just now</div></div>

//           <form onSubmit={runOptimization} className="panel config-panel mb-5">
//             <div className="mb-5 flex items-center justify-between"><div><div className="section-title"><SlidersHorizontal className="size-4 text-sky-300" /> Voyage configuration</div><p className="mt-1 text-xs text-slate-500">Set parameters to run a new fleet optimization scenario.</p></div><span className="hidden rounded-md border border-white/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-500 sm:block">Scenario 01</span></div>
//             <div className="form-grid"><label className="field"><span>Origin port</span><div className="select-wrap"><select value={origin} onChange={e => setOrigin(e.target.value)}>{ports.slice(0, 4).map(port => <option key={port}>{port}</option>)}</select><ChevronDown className="size-4" /></div></label><label className="field"><span>Destination port</span><div className="select-wrap"><select value={destination} onChange={e => setDestination(e.target.value)}>{ports.filter(port => port !== origin).map(port => <option key={port}>{port}</option>)}</select><ChevronDown className="size-4" /></div></label><label className="field"><span>Cargo volume <em>metric tons</em></span><input type="number" min="1" value={cargo} onChange={e => setCargo(e.target.value)} /></label><label className="field"><span>Current BDI <em>market index</em></span><input type="number" min="0" value={bdi} onChange={e => setBdi(e.target.value)} /></label><button disabled={loading} className="run-button" type="submit">{loading ? <RefreshCw className="size-4 animate-spin" /> : <Zap className="size-4" />}{loading ? 'Running engine...' : 'Run optimization engine'}</button></div>
//             {error && <div role="alert" className="mt-4 flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2.5 text-xs text-rose-200"><X className="size-4" />{error}</div>}
//           </form>

//           <div className="mb-3 flex items-center justify-between"><div className="section-title text-sm"><PanelLeft className="size-4 text-slate-500" /> Intelligence snapshot</div>{result && <span className="text-[11px] text-slate-500">Scenario complete</span>}</div>
//           <div className="metrics-grid mb-5"><MetricCard label="BDI forecast" value={result ? formatNumber(result.predicted_bdi) : '—'} detail={result ? `${bdiDelta >= 0 ? '+' : ''}${formatNumber(bdiDelta)} vs current index` : 'Run a scenario to forecast'} icon={BarChart3} trend={result ? (bdiDelta >= 0 ? 'up' : 'down') : undefined} /><MetricCard label="Estimated voyage cost" value={result ? formatCurrency(result.optimization_details.estimated_cost_usd) : '—'} detail={result ? `${formatCurrency(costPerTon)} per metric ton` : 'Awaiting route analysis'} icon={Zap} /></div>

//           <div className="results-grid">
//             <article className="panel p-5"><div className="mb-6 flex items-center justify-between"><div><div className="section-title"><Ship className="size-4 text-sky-300" /> Route & vessel recommendation</div><p className="mt-1 text-xs text-slate-500">Optimal deployment for this cargo profile.</p></div>{result && <StatusBadge value={result.optimization_details.status} />}</div>{result ? <><div className="route-line"><div><span className="port-code">{result.optimization_details.origin_port.slice(0, 3).toUpperCase()}</span><span className="port-name">{result.optimization_details.origin_port}</span></div><div className="route-track"><span /><Navigation className="size-4 text-sky-300" /></div><div className="text-right"><span className="port-code">{result.optimization_details.destination_port.slice(0, 3).toUpperCase()}</span><span className="port-name">{result.optimization_details.destination_port}</span></div></div><div className="detail-grid"><div><span>Distance</span><strong>{formatNumber(result.optimization_details.distance_nm)} <small>NM</small></strong></div><div><span>Allocated cargo</span><strong>{formatNumber(result.optimization_details.cargo_allocated_mt)} <small>MT</small></strong></div><div><span>Recommended vessel</span><strong>{result.optimization_details.recommended_vessel}</strong></div></div></> : <div className="empty-state"><Anchor className="size-5" /><p>Run the engine to generate a route recommendation.</p></div>}</article>
//             <article className="panel p-5"><div className="mb-6"><div className="section-title"><ShieldCheck className="size-4 text-emerald-300" /> Port safety matrix</div><p className="mt-1 text-xs text-slate-500">Constraint checks for the selected route.</p></div>{result ? <div className="space-y-3"><div className="safety-row"><span>Draft clearance</span><StatusBadge value={result.optimization_details.draft_check} /></div><div className="safety-row"><span>LOA / berth fit</span><StatusBadge value={result.optimization_details.loa_check} /></div><div className="safety-row"><span>Route readiness</span><StatusBadge value={result.optimization_details.status} /></div></div> : <div className="empty-state"><ShieldCheck className="size-5" /><p>Safety checks will appear here.</p></div>}</article>
//           </div>

//           <article className="panel mt-5 p-5"><div className="mb-6 flex items-center justify-between"><div><div className="section-title"><Cloud className="size-4 text-emerald-300" /> IMO CII & carbon emissions</div><p className="mt-1 text-xs text-slate-500">Projected voyage impact and efficiency rating.</p></div>{result && <div className="cii-rating">CII <strong>{result.carbon_emissions.cii_rating}</strong></div>}</div>{result ? <div className="carbon-grid"><div><span>CO₂ emissions</span><strong>{formatNumber(result.carbon_emissions.co2_emissions_tons, 1)} <small>TONS</small></strong></div><div><span>Fuel consumed</span><strong>{formatNumber(result.carbon_emissions.fuel_consumed_tons, 1)} <small>TONS</small></strong></div><div><span>Voyage duration</span><strong>{formatNumber(result.carbon_emissions.voyage_days, 1)} <small>DAYS</small></strong></div><div><span>CII intensity</span><strong>{formatNumber(result.carbon_emissions.cii_grams_per_dwt_nm, 2)} <small>G/DWT·NM</small></strong></div></div> : <div className="carbon-placeholder"><span /><span /><span /><span /></div>}</article>
//         </section>
//       </div>
//     </main>
//   )
// }

"use client";
import React, { useState } from "react";
import {
  runOptimization,
  OptimizationResponse,
} from "../lib/api";
import {
  Anchor,
  Compass,
  Waves,
  TrendingDown,
  Leaf,
  Ship,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BarChart3,
  Globe,
  Gauge,
  MapPin,
  FileText,
  ShieldAlert,
} from "lucide-react";

export default function FleetPulseDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [originPort, setOriginPort] = useState("Visakhapatnam");
  const [destPort, setDestPort] = useState("Haldia");
  const [cargoMt, setCargoMt] = useState<number>(50000);
  const [recentBdi, setRecentBdi] = useState<number>(1500);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await runOptimization({
        origin_port: originPort,
        dest_port: destPort,
        cargo_mt: Number(cargoMt),
        recent_bdi: Number(recentBdi),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to optimization engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#090d19] hidden lg:flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">SAIL Fleet Pulse</h1>
              <p className="text-[10px] text-blue-400 font-medium">OPTIMIZATION ENGINE v2.4</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Workspace</p>
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Fleet Overview
            </button>
            <button
              onClick={() => setActiveTab("voyage")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === "voyage"
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <Compass className="w-4 h-4" />
              Voyage Planning
            </button>
            <button
              onClick={() => setActiveTab("esg")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === "esg"
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <Leaf className="w-4 h-4" />
              ESG & Emissions
            </button>
            <button
              onClick={() => setActiveTab("port")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === "port"
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <Globe className="w-4 h-4" />
              Port Intelligence
            </button>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            AI-Assisted Planning
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Live intelligence active from global maritime markets & port logs.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-[#090d19]/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 lg:hidden">
            <Anchor className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-sm">SAIL Fleet Pulse</span>
          </div>
          <div className="hidden lg:block text-sm font-semibold tracking-wide uppercase text-slate-300">
            {activeTab === "overview" && "Fleet Command Center"}
            {activeTab === "voyage" && "Advanced Voyage Planner"}
            {activeTab === "esg" && "ESG & Emissions Monitoring"}
            {activeTab === "port" && "Port Intelligence Hub"}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API CONNECTION LIVE
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Views */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TAB 1: FLEET OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Voyage Configuration</h2>
                  </div>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-400 font-mono">SCENARIO 01</span>
                </div>

                <form onSubmit={handleOptimize} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Origin Port</label>
                    <select
                      value={originPort}
                      onChange={(e) => setOriginPort(e.target.value)}
                      className="w-full bg-[#060913] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Visakhapatnam">Visakhapatnam</option>
                      <option value="Paradip">Paradip</option>
                      <option value="Haldia">Haldia</option>
                      <option value="Mumbai">Mumbai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Destination Port</label>
                    <select
                      value={destPort}
                      onChange={(e) => setDestPort(e.target.value)}
                      className="w-full bg-[#060913] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Haldia">Haldia</option>
                      <option value="Visakhapatnam">Visakhapatnam</option>
                      <option value="Paradip">Paradip</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Cargo Volume (MT)</label>
                    <input
                      type="number"
                      value={cargoMt}
                      onChange={(e) => setCargoMt(Number(e.target.value))}
                      className="w-full bg-[#060913] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Current BDI Index</label>
                    <input
                      type="number"
                      value={recentBdi}
                      onChange={(e) => setRecentBdi(Number(e.target.value))}
                      className="w-full bg-[#060913] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Waves className="w-4 h-4" />}
                    Run optimization engine
                  </button>
                </form>

                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {!result && !loading && (
                <div className="bg-[#0b1021]/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center text-slate-500">
                  <Compass className="w-10 h-10 mb-3 stroke-1 text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">Awaiting Simulation Parameters</p>
                  <p className="text-xs text-slate-600 mt-1">Configure your route and click run optimization above.</p>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider">BDI Forecast</span>
                        <Activity className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {result.predicted_bdi.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <TrendingDown className="w-4 h-4" />
                        <span>vs. current {recentBdi} benchmark</span>
                      </div>
                    </div>

                    <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Estimated Voyage Cost</span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        ${result.optimization_details.estimated_cost_usd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                      <div className="text-xs text-slate-400">
                        ${(result.optimization_details.estimated_cost_usd / cargoMt).toFixed(2)} / metric ton unit cost
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                        Route & Vessel Recommendation
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#060913] p-3 rounded-xl border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 mb-1">Distance</div>
                          <div className="text-sm font-bold text-slate-200">{result.optimization_details.distance_nm} NM</div>
                        </div>
                        <div className="bg-[#060913] p-3 rounded-xl border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 mb-1">Vessel Class</div>
                          <div className="text-sm font-bold text-blue-400 flex items-center gap-1">
                            <Ship className="w-3.5 h-3.5" />
                            {result.optimization_details.recommended_vessel}
                          </div>
                        </div>
                        <div className="bg-[#060913] p-3 rounded-xl border border-slate-800/60">
                          <div className="text-[10px] text-slate-500 mb-1">Allocated Cargo</div>
                          <div className="text-sm font-bold text-slate-200">{result.optimization_details.cargo_allocated_mt.toLocaleString()} MT</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                        Port Safety & Constraint Matrix
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#060913] border border-slate-800 text-xs">
                          <span className="text-slate-400">Draft Check</span>
                          <span className="px-2.5 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {result.optimization_details.draft_check}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#060913] border border-slate-800 text-xs">
                          <span className="text-slate-400">LOA Berth Fit</span>
                          <span className="px-2.5 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {result.optimization_details.loa_check}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">IMO CII & Carbon Emissions Tracker</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#060913] p-3.5 rounded-xl border border-slate-800/60 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">CO₂ Emissions</div>
                        <div className="text-sm font-bold text-slate-200">{result.carbon_emissions.co2_emissions_tons.toFixed(1)} tons</div>
                      </div>
                      <div className="bg-[#060913] p-3.5 rounded-xl border border-slate-800/60 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">Fuel Consumed</div>
                        <div className="text-sm font-bold text-slate-200">{result.carbon_emissions.fuel_consumed_tons.toFixed(1)} tons</div>
                      </div>
                      <div className="bg-[#060913] p-3.5 rounded-xl border border-slate-800/60 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">Duration</div>
                        <div className="text-sm font-bold text-slate-200">{result.carbon_emissions.voyage_days.toFixed(1)} Days</div>
                      </div>
                      <div className="bg-[#060913] p-3.5 rounded-xl border border-slate-800/60 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">CII Rating</div>
                        <div className="text-sm font-bold text-emerald-400">{result.carbon_emissions.cii_rating}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: VOYAGE PLANNING */}
          {activeTab === "voyage" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Compass className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Routes</span>
                  </div>
                  <div className="text-2xl font-bold text-white">12 Corridors</div>
                  <p className="text-xs text-slate-400 mt-1">Primary domestic raw material lanes.</p>
                </div>
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Gauge className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Average Speed</span>
                  </div>
                  <div className="text-2xl font-bold text-white">14.2 Knots</div>
                  <p className="text-xs text-slate-400 mt-1">Optimized for weather & fuel efficiency.</p>
                </div>
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Ship className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Vessel Utilization</span>
                  </div>
                  <div className="text-2xl font-bold text-white">94.8%</div>
                  <p className="text-xs text-slate-400 mt-1">Panamax & Handysize allocation.</p>
                </div>
              </div>

              <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                  Corridor Distance & Transit Matrix
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#060913] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm">Visakhapatnam ➔ Haldia</div>
                      <div className="text-slate-500 mt-0.5">Iron ore transport lane</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-400">450 NM</div>
                      <div className="text-slate-500">~1.5 Days</div>
                    </div>
                  </div>
                  <div className="bg-[#060913] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm">Paradip ➔ Chennai</div>
                      <div className="text-slate-500 mt-0.5">Coastal steel distribution</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-400">680 NM</div>
                      <div className="text-slate-500">~2.2 Days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESG & EMISSIONS */}
          {activeTab === "esg" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Leaf className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">CII Compliance</span>
                  </div>
                  <div className="text-2xl font-bold text-white">Rating A (Superior)</div>
                  <p className="text-xs text-slate-400 mt-1">Aligned with IMO 2030 decarbonization goals.</p>
                </div>
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Total CO₂ Saved</span>
                  </div>
                  <div className="text-2xl font-bold text-white">1,420 Tons</div>
                  <p className="text-xs text-slate-400 mt-1">Through speed & route optimization.</p>
                </div>
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">EEXI Status</span>
                  </div>
                  <div className="text-2xl font-bold text-white">Compliant</div>
                  <p className="text-xs text-slate-400 mt-1">Engine power limitation verified.</p>
                </div>
              </div>

              <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                  Emissions Reduction Breakdown by Vessel Class
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="bg-[#060913] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm">Panamax Bulk Carriers</div>
                      <div className="text-slate-500 mt-0.5">Low sulfur fuel oil (LSFO) utilization</div>
                    </div>
                    <span className="px-3 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      -18.4% vs Baseline
                    </span>
                  </div>
                  <div className="bg-[#060913] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm">Handysize Vessels</div>
                      <div className="text-slate-500 mt-0.5">Draft-optimized coastal runs</div>
                    </div>
                    <span className="px-3 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      -12.1% vs Baseline
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PORT INTELLIGENCE */}
          {activeTab === "port" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Visakhapatnam</span>
                  </div>
                  <div className="text-lg font-bold text-white">Draft: 14.5m</div>
                  <p className="text-xs text-emerald-400 mt-1">Status: Normal Operations</p>
                </div>
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Paradip</span>
                  </div>
                  <div className="text-lg font-bold text-white">Draft: 15.0m</div>
                  <p className="text-xs text-emerald-400 mt-1">Status: Smooth Berthing</p>
                </div>
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Haldia</span>
                  </div>
                  <div className="text-lg font-bold text-white">Draft: 9.8m</div>
                  <p className="text-xs text-amber-400 mt-1">Status: Tidal Restricted</p>
                </div>
                <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Chennai</span>
                  </div>
                  <div className="text-lg font-bold text-white">Draft: 13.2m</div>
                  <p className="text-xs text-emerald-400 mt-1">Status: Normal Operations</p>
                </div>
              </div>

              <div className="bg-[#0b1021] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                  Live Port Turnaround & Congestion Logs
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="bg-[#060913] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm">Haldia Dock Complex</div>
                      <div className="text-slate-500 mt-0.5">Average berth waiting time: 4.2 hours</div>
                    </div>
                    <span className="px-3 py-1 rounded-full font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Low Congestion
                    </span>
                  </div>
                  <div className="bg-[#060913] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm">Visakhapatnam Port Trust</div>
                      <div className="text-slate-500 mt-0.5">Average berth waiting time: 2.1 hours</div>
                    </div>
                    <span className="px-3 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Optimal Flow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}