import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/client';

type EventItem = {
  id: string;
  timestamp: string;
  eventType: string;
  symbol: string;
  source: string;
  message: string;
  signal: string;
};

const PAGE_SIZE = 20;

function normalizePlatform(source?: string) {
  if (!source) return 'Extension';
  const s = source.toLowerCase();
  if (s.includes('tradingview')) return 'TradingView';
  if (s.includes('binance')) return 'Binance';
  if (s.includes('exness')) return 'Exness';
  if (s.includes('xm')) return 'XM';
  if (s.includes('localhost') || s.includes('tradeguru')) return 'TradeGuru';
  // If already a friendly name
  return source;
}

export default function NotificationsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (off: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/telemetry/events?limit=${PAGE_SIZE}&offset=${off}`);
      const data: EventItem[] = res.data || [];
      if (data.length < PAGE_SIZE) setHasMore(false);
      setEvents(prev => [...prev, ...data]);
      setOffset(prev => prev + data.length);
    } catch (err) {
      // ignore errors for now
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    fetchPage(0);
  }, [fetchPage]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasMore) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !loading) {
          fetchPage(offset);
        }
      });
    }, { rootMargin: '200px' });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [sentinelRef, offset, hasMore, loading, fetchPage]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Notifications & Behavioral Events</h2>
      </div>

      {events.length === 0 && loading && (
        <div className="text-sm text-tv-muted">Loading...</div>
      )}

      {events.length === 0 && !loading && (
        <div className="text-sm text-tv-muted">No notifications yet.</div>
      )}

      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="p-3 bg-tv-surface2 rounded-lg border border-tv-border">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-tv-text">{e.eventType.replace(/_/g, ' ')}</div>
              <div className="text-xs text-tv-muted">{new Date(e.timestamp).toLocaleString()}</div>
            </div>
            <div className="mt-2 text-sm text-tv-muted">{e.message}</div>
            <div className="mt-2 text-[11px] text-tv-muted flex gap-3">
              <div className="px-2 py-1 bg-tv-surface rounded">Symbol: {e.symbol || 'N/A'}</div>
              <div className="px-2 py-1 bg-tv-surface rounded">Platform: {normalizePlatform(e.source)}</div>
              <div className="px-2 py-1 bg-tv-surface rounded">Signal: {e.signal}</div>
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-6" />

      {loading && events.length > 0 && (
        <div className="mt-3 text-sm text-tv-muted">Loading more...</div>
      )}

      {!hasMore && events.length > 0 && (
        <div className="mt-3 text-sm text-tv-muted">No more notifications.</div>
      )}
    </div>
  );
}
