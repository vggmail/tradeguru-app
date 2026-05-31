import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { emotionLabel, formatCurrency, cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Plus, Check, AlertTriangle, Upload, Pencil, Trash2, Search, X, Bot, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import CsvImportModal from '../components/CsvImportModal';

const PAGE_SIZE = 10;

export default function TradeJournal() {
  const { trades, assets, fetchAssets, deleteTrade } = useAppStore();
  const navigate = useNavigate();
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState<'all'|'wins'|'losses'|'impulsive'>('all');
  const [symbolQ, setSymbolQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (assets.length === 0) fetchAssets();
  }, [assets.length, fetchAssets]);

  // Unique symbols for quick filter chips
  const uniqueSymbols = useMemo(() =>
    [...new Set(trades.map(t => t.symbol))].sort(),
  [trades]);

  const filtered = useMemo(() => {
    return trades.filter(t => {
      if (filter === 'wins' && t.pnl <= 0) return false;
      if (filter === 'losses' && t.pnl >= 0) return false;
      if (filter === 'impulsive' && !t.isImpulsive) return false;
      if (symbolQ && !t.symbol.toUpperCase().includes(symbolQ.toUpperCase())) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [trades, filter, symbolQ, dateFrom, dateTo]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filter, symbolQ, dateFrom, dateTo]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this trade? This cannot be undone.')) return;
    await deleteTrade(id);
  };

  const clearFilters = () => {
    setSymbolQ('');
    setDateFrom('');
    setDateTo('');
    setFilter('all');
  };

  const hasActiveFilters = symbolQ || dateFrom || dateTo || filter !== 'all';

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trade Journal</h1>
          <p className="text-tv-muted text-sm mt-0.5">Psychology-driven trading log — not just P&L</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowImport(true)} className="btn-ghost border border-tv-border">
            <Upload className="w-4 h-4"/> Import CSV
          </button>
          <button onClick={() => navigate('/app/journal/log')} className="btn-primary glow-blue">
            <Plus className="w-4 h-4"/>Log Trade
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Trades', value: trades.length, color: '#d1d4dc' },
          { label: 'P&L', value: formatCurrency(trades.reduce((s,t) => s+t.pnl, 0)), color: trades.reduce((s,t)=>s+t.pnl,0)>=0?'#26a69a':'#ef5350' },
          { label: 'Win Rate', value: `${trades.length ? (trades.filter(t=>t.pnl>0).length/trades.length*100).toFixed(0) : 0}%`, color: '#2962ff' },
          { label: 'Impulsive', value: trades.filter(t=>t.isImpulsive).length, color: '#f7b500' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="text-tv-muted text-xs">{s.label}</span>
            <span className="text-xl font-bold" style={{color:s.color}}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ─── Filters ─── */}
      <div className="card space-y-3">
        {/* Row 1: type filter + clear */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all','wins','losses','impulsive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-4 py-1.5 rounded-lg border text-sm font-medium transition-all capitalize',
                filter===f ? 'border-tv-blue bg-tv-blue/15 text-tv-blue' : 'border-tv-border text-tv-muted hover:text-tv-text')}>
              {f}
            </button>
          ))}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="ml-auto flex items-center gap-1.5 text-xs text-tv-muted hover:text-tv-red transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </div>

        {/* Row 2: symbol search + date range */}
        <div className="flex flex-wrap gap-3">
          {/* Symbol search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tv-muted pointer-events-none" />
            <input
              type="text"
              value={symbolQ}
              onChange={e => setSymbolQ(e.target.value)}
              placeholder="Filter by symbol…"
              className="input pl-9 h-9 text-sm w-full"
            />
            {symbolQ && (
              <button onClick={() => setSymbolQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-tv-muted hover:text-tv-text">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date from */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-tv-muted whitespace-nowrap">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="input h-9 text-sm"
            />
          </div>

          {/* Date to */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-tv-muted whitespace-nowrap">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="input h-9 text-sm"
            />
          </div>
        </div>

        {/* Quick symbol chips */}
        {uniqueSymbols.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {uniqueSymbols.slice(0, 12).map(sym => (
              <button
                key={sym}
                onClick={() => setSymbolQ(symbolQ === sym ? '' : sym)}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all',
                  symbolQ === sym
                    ? 'bg-tv-blue/20 border-tv-blue text-tv-blue'
                    : 'border-tv-border text-tv-muted hover:text-tv-text hover:border-tv-hover'
                )}
              >
                {sym}
              </button>
            ))}
            {uniqueSymbols.length > 12 && (
              <span className="text-xs text-tv-muted self-center">+{uniqueSymbols.length - 12} more</span>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="text-xs text-tv-muted">
          Showing <span className="text-tv-text font-semibold">{Math.min(visibleCount, filtered.length)}</span> of <span className="text-tv-text font-semibold">{filtered.length}</span> trades
        </div>
      </div>

      {/* ─── Trade cards ─── */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="card text-center py-12 text-tv-muted">
            <div className="text-4xl mb-3">📭</div>
            <div className="font-semibold">No trades match your filters</div>
            <button onClick={clearFilters} className="mt-3 text-tv-blue text-sm hover:underline">Clear filters</button>
          </div>
        )}

        {visible.map(t => {
          const em = emotionLabel(t.emotionBefore);
          const asset = assets.find(a => a.symbol === t.symbol);
          const isSystemGenerated = t.entryType === 'System Generated';
          const hasPendingPrice = t.entry === -1 || t.exit === -1;

          return (
            <div key={t.id} className={cn(
              'card hover:border-tv-blue/30 transition-all duration-200',
              hasPendingPrice && 'border-tv-yellow/30 bg-tv-yellow/3'
            )}>
              <div className="flex items-start justify-between gap-4">
                {/* Left: symbol + badges */}
                <div className="flex items-center gap-3 flex-wrap flex-1">
                  <div className="flex items-center gap-2">
                    {asset && <img src={asset.image} className="w-5 h-5 rounded-full" alt="" />}
                    <span className="font-bold text-tv-text">{t.symbol}</span>
                  </div>

                  <span className={cn('badge-'+(t.direction==='long'?'green':'red'))}>
                    {t.direction==='long' ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                    {t.direction.toUpperCase()}
                  </span>

                  <span className="text-tv-muted text-xs">{t.timeframe} · {t.setupType}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{background:em.color+'20',color:em.color}}>{em.label}</span>

                  {t.platform && t.platform !== 'Manual' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-tv-surface2 text-tv-muted border border-tv-border">{t.platform}</span>
                  )}

                  {isSystemGenerated && (
                    <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-tv-blue/10 text-tv-blue border border-tv-blue/20">
                      <Bot className="w-3 h-3" /> Auto
                    </span>
                  )}

                  {t.isImpulsive && <span className="badge-yellow"><AlertTriangle className="w-3 h-3"/>Impulsive</span>}
                  {!t.followedPlan && <span className="badge-red">Plan violated</span>}
                  {hasPendingPrice && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-tv-yellow/15 text-tv-yellow border border-tv-yellow/30">
                      ⚠ Prices pending
                    </span>
                  )}
                </div>

                {/* Right: PnL + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('text-lg font-bold', t.pnl>=0?'text-tv-green':'text-tv-red')}>
                    {formatCurrency(t.pnl)}
                  </span>
                  <button
                    onClick={() => navigate(`/app/journal/edit/${t.id}`)}
                    className="p-1.5 rounded-lg text-tv-muted hover:text-tv-blue hover:bg-tv-blue/10 transition-colors"
                    title="Edit trade"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg text-tv-muted hover:text-tv-red hover:bg-tv-red/10 transition-colors"
                    title="Delete trade"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Price grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3 text-xs">
                {[
                  ['Entry', t.entry === -1 ? '—' : t.entry],
                  ['Exit',  t.exit  === -1 ? '—' : t.exit],
                  ['SL', t.sl],
                  ['TP', t.tp],
                  ['Risk', `${t.riskPct}%`],
                  ['Date', t.date],
                ].map(([l, v]) => (
                  <div key={l as string} className={cn('rounded-lg p-2', hasPendingPrice && (l==='Entry'||l==='Exit') && v==='—' ? 'bg-tv-yellow/10 border border-tv-yellow/20' : 'bg-tv-surface2')}>
                    <div className="text-tv-muted">{l}</div>
                    <div className={cn('font-semibold mt-0.5', v === '—' ? 'text-tv-yellow' : 'text-tv-text')}>{v as string}</div>
                  </div>
                ))}
              </div>

              {t.lesson && (
                <div className="mt-3 p-3 bg-tv-blue/5 border border-tv-blue/15 rounded-lg text-tv-text text-sm">
                  💡 {t.lesson}
                </div>
              )}

              {t.rulesViolated && t.rulesViolated.length > 0 ? (
                <div className="mt-3 p-3 bg-tv-red/5 border border-tv-red/15 rounded-lg text-xs space-y-1.5">
                  <div className="font-bold text-tv-red flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5"/> Violated Trading Plan Rules:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-tv-muted">
                    {t.rulesViolated.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              ) : t.rulesChecked && t.rulesChecked.length > 0 ? (
                <div className="mt-3 p-2.5 bg-tv-green/5 border border-tv-green/15 rounded-lg text-xs text-tv-green font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5"/> Followed all trading plan rules!
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-tv-border text-tv-muted hover:text-tv-text hover:border-tv-hover transition-all text-sm font-medium"
          >
            <ChevronDown className="w-4 h-4" />
            Load More ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {showImport && <CsvImportModal onClose={() => setShowImport(false)}/>}
    </div>
  );
}
