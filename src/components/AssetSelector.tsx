import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

// Fallback static list if backend assets aren't loaded yet
const FALLBACK_ASSETS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png' },
  { symbol: 'ETH/USDT', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png' },
  { symbol: 'SOL/USDT', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png' },
  { symbol: 'BNB/USDT', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png' },
  { symbol: 'XRP/USDT', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', image: '' },
  { symbol: 'GBP/USD', name: 'Pound / US Dollar', image: '' },
  { symbol: 'USD/JPY', name: 'Dollar / Yen', image: '' },
  { symbol: 'NAS100', name: 'Nasdaq 100', image: '' },
  { symbol: 'GOLD', name: 'Gold (XAU/USD)', image: '' },
  { symbol: 'NIFTY50', name: 'Nifty 50', image: '' },
  { symbol: 'SPX500', name: 'S&P 500', image: '' },
];

interface AssetSelectorProps {
  value: string;
  onChange: (symbol: string) => void;
  placeholder?: string;
}

export default function AssetSelector({ value, onChange, placeholder = 'Select symbol…' }: AssetSelectorProps) {
  const { assets, fetchAssets } = useAppStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Load assets from backend on first open
  useEffect(() => {
    if (open && assets.length === 0) fetchAssets().catch(() => {});
  }, [open, assets.length, fetchAssets]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const list = (assets.length > 0 ? assets : FALLBACK_ASSETS).filter(a =>
    a.symbol.toLowerCase().includes(query.toLowerCase()) ||
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  const selected = (assets.length > 0 ? assets : FALLBACK_ASSETS).find(a => a.symbol === value);

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Forex/index symbols don't have a coin image — show a text badge instead
  const renderIcon = (a: { symbol: string; image: string }) => {
    if (a.image) {
      return (
        <img
          src={a.image}
          alt={a.symbol}
          className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      );
    }
    // Forex / index badge
    const color = a.symbol.includes('/') ? '#2962ff' : '#f7b500';
    return (
      <span
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white"
        style={{ background: color }}
      >
        {a.symbol.slice(0, 2)}
      </span>
    );
  };

  return (
    <div ref={ref} className="relative mt-1">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'input w-full flex items-center gap-2 text-left pr-8 relative',
          !value && 'text-tv-muted'
        )}
      >
        {selected ? (
          <>
            {renderIcon(selected)}
            <span className="flex-1 font-medium text-tv-text">{selected.symbol}</span>
            <span className="text-tv-muted text-xs hidden sm:block">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1">{placeholder}</span>
        )}

        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <X
              className="w-3.5 h-3.5 text-tv-muted hover:text-tv-red transition-colors"
              onClick={handleClear}
            />
          )}
          <ChevronDown className={cn('w-4 h-4 text-tv-muted transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-tv-surface border border-tv-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-tv-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tv-muted" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search symbols…"
                className="input pl-8 py-1.5 text-sm w-full"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto">
            {list.length === 0 ? (
              <div className="p-4 text-center text-tv-muted text-sm">No results for "{query}"</div>
            ) : (
              list.map(a => (
                <button
                  key={a.symbol}
                  type="button"
                  onClick={() => handleSelect(a.symbol)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-tv-surface2 transition-colors text-left',
                    value === a.symbol && 'bg-tv-blue/10 text-tv-blue'
                  )}
                >
                  {renderIcon(a)}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-tv-text truncate">{a.symbol}</div>
                    <div className="text-tv-muted text-xs truncate">{a.name}</div>
                  </div>
                  {value === a.symbol && (
                    <span className="w-1.5 h-1.5 rounded-full bg-tv-blue flex-shrink-0" />
                  )}
                </button>
              ))
            )}

            {/* Manual entry fallback */}
            {query && !list.some(a => a.symbol.toLowerCase() === query.toLowerCase()) && (
              <button
                type="button"
                onClick={() => handleSelect(query.toUpperCase())}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-tv-surface2 transition-colors text-left border-t border-tv-border"
              >
                <span className="w-6 h-6 rounded-full bg-tv-surface2 border border-tv-border flex items-center justify-center text-[10px] text-tv-muted">+</span>
                <div>
                  <div className="font-semibold text-tv-text">Use "{query.toUpperCase()}"</div>
                  <div className="text-tv-muted text-xs">Custom symbol</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
