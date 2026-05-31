import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster, toast } from 'sonner';
import RulesOverlay from '../RulesOverlay';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

export default function AppLayout() {
  const { setExtensionInstalled, setExtensionData, clearExtensionData, fetchTrades, fetchCheckins, syncRules } = useAppStore();
  const fetchProfile = useAuthStore(s => s.fetchProfile);

  useEffect(() => {
    // Sync historical data from DB
    fetchProfile();
    fetchTrades();
    fetchCheckins();
    syncRules();

    // 1. Check if extension marker already exists in DOM
    const checkExtension = () => {
      const marker = document.getElementById('tradeguru-extension-marker');
      if (marker && marker.getAttribute('data-installed') === 'true') {
        setExtensionInstalled(true);
        // Request initial load of data
        window.postMessage({ source: 'tradeguru-web-app', type: 'GET_EXTENSION_DATA' }, '*');
      }
    };

    checkExtension();

    // 2. Listen for custom event indicating extension finished loading
    const handleLoadedEvent = () => {
      setExtensionInstalled(true);
      window.postMessage({ source: 'tradeguru-web-app', type: 'GET_EXTENSION_DATA' }, '*');
    };
    window.addEventListener('TradeGuruExtensionLoaded', handleLoadedEvent);

    // 3. Listen for postMessage updates from content script bridge
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.source === 'tradeguru-extension') {
        setExtensionInstalled(true);
        
        if (msg.type === 'EXTENSION_DATA_RESPONSE' || msg.type === 'TRACKING_UPDATE') {
          console.log(`[TradeGuru App] Received extension data update (${msg.type}):`, {
            type: msg.type,
            events: msg.payload?.events || [],
            stats: msg.payload?.stats || null,
            rawPayload: msg.payload
          });
          if (msg.payload) {
            const previousLength = useAppStore.getState().extensionData?.length || 0;
            const newEvents = msg.payload.events || [];
            
            // Log everything for debugging as requested by user
            console.log('[TradeGuru Debug] Incoming Events:', newEvents);
            
            setExtensionData(newEvents, msg.payload.stats || { chartChecks: 0, symbolSwitches: 0, postLossSpikes: 0 });

            // Ensure we don't process identical data twice if it's just a sync
            if (newEvents.length > previousLength) {
                const latestEvent = newEvents[newEvents.length - 1];
                if (latestEvent && latestEvent.type === 'trade_checkin') {
                    console.log('[TradeGuru Debug] Detected new trade checkin. Pushing to DB/Store:', latestEvent);
                    const { addTrade } = useAppStore.getState();
                    const metadata = latestEvent.metadata;
                    if (metadata && metadata.trade) {
                        try {
                            const newTrade = {
                                date: new Date().toISOString().split('T')[0],
                                symbol: metadata.trade.symbol || 'UNKNOWN',
                                direction: metadata.trade.side === 'LONG' || metadata.trade.side === 'BUY' ? 'long' : 'short',
                                entry: 0, // Mock entry, can be updated later by user
                                exit: 0,
                                sl: 0,
                                tp: 0,
                                riskPct: 1,
                                pnl: 0,
                                timeframe: 'Live',
                                setupType: 'Extension Handshake',
                                emotionBefore: metadata.emotion || 'calm',
                                emotionAfter: '',
                                confidence: 7,
                                followedPlan: metadata.rulesFollowed === 'Yes',
                                isImpulsive: metadata.rulesFollowed === 'No',
                                lesson: '',
                                notes: `Caught by TradeGuru Extension: ${latestEvent.message}`,
                                tags: ['extension']
                            };
                            
                            // Important: Actually persist the trade!
                            addTrade(newTrade as any); 
                            toast.success('Live trade synced from broker!');
                        } catch(e) {
                            console.error('[TradeGuru Debug] Error mapping extension trade:', e);
                        }
                    }
                }
            }
          }
        } else if (msg.type === 'DATA_RESET' || msg.type === 'EXTENSION_DATA_RESET_CONFIRMED') {
          clearExtensionData();
        } else if (msg.type === 'EXTENSION_CONTEXT_INVALIDATED') {
          toast.error('Extension context was invalidated due to an update. Please refresh the page to resume tracking.', {
            id: 'extension-invalidated',
            duration: Infinity,
            action: {
              label: 'Refresh',
              onClick: () => window.location.reload()
            }
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // 4. Periodically request latest logs from extension storage (polling fallback)
    const interval = setInterval(() => {
      window.postMessage({ source: 'tradeguru-web-app', type: 'GET_EXTENSION_DATA' }, '*');
    }, 4000);

    return () => {
      window.removeEventListener('TradeGuruExtensionLoaded', handleLoadedEvent);
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [setExtensionInstalled, setExtensionData, clearExtensionData]);

  return (
    <div className="flex h-screen bg-tv-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-tv-bg">
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
          <Outlet />
        </div>
      </div>
      <RulesOverlay />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e222d',
            border: '1px solid #2a2e39',
            color: '#d1d4dc',
          },
        }}
      />
    </div>
  );
}
