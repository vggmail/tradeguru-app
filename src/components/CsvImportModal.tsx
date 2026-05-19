import { useState } from 'react';
import Papa from 'papaparse';
import { X, Upload, Check, AlertTriangle } from 'lucide-react';
import { useAppStore, Trade } from '../store/appStore';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface CsvImportModalProps {
  onClose: () => void;
}

export default function CsvImportModal({ onClose }: CsvImportModalProps) {
  const addTrade = useAppStore(s => s.addTrade);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setError(null);
    setFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV. Please check the format.');
          return;
        }
        setParsedData(results.data);
      },
    });
  };

  const importData = () => {
    if (parsedData.length === 0) return;
    
    let importedCount = 0;
    
    parsedData.forEach((row, index) => {
      // Map basic fields, fallback to defaults for behavioral ones
      try {
        const entry = Number(row.Entry || row.entry || row['Entry Price'] || 0);
        const exit = Number(row.Exit || row.exit || row['Exit Price'] || 0);
        const symbol = row.Symbol || row.symbol || row.Asset || 'UNKNOWN';
        const directionRaw = (row.Direction || row.direction || row.Type || 'long').toLowerCase();
        const direction = directionRaw.includes('sell') || directionRaw.includes('short') ? 'short' : 'long';
        
        // PnL calculation
        let pnl = Number(row.PnL || row.pnl || row.Profit || 0);
        if (pnl === 0 && entry > 0 && exit > 0) {
            pnl = (exit - entry) * (direction === 'long' ? 1 : -1);
        }

        const trade: Trade = {
          id: `import_${Date.now()}_${index}`,
          date: row.Date || row.date || new Date().toISOString().split('T')[0],
          symbol: symbol.toUpperCase(),
          direction,
          entry,
          exit,
          sl: Number(row.SL || row.sl || 0),
          tp: Number(row.TP || row.tp || 0),
          riskPct: Number(row.Risk || row.risk || 1),
          pnl,
          timeframe: row.Timeframe || row.timeframe || '1H',
          setupType: row.Setup || row.setup || 'Imported',
          emotionBefore: 'calm', 
          emotionAfter: 'calm',
          confidence: 5,
          followedPlan: true,
          isImpulsive: false,
          lesson: 'Imported via CSV',
          notes: '',
          tags: ['imported']
        };

        addTrade(trade);
        importedCount++;
      } catch (err) {
        console.error("Failed to parse row", row, err);
      }
    });

    toast.success(`Successfully imported ${importedCount} trades! 🎉`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-tv-surface border border-tv-border rounded-2xl w-full max-w-lg shadow-xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-tv-border">
          <div className="font-bold text-tv-text text-lg">Import Trades (CSV)</div>
          <button onClick={onClose} className="text-tv-muted hover:text-tv-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer",
                isDragging ? "border-tv-blue bg-tv-blue/5" : "border-tv-border hover:border-tv-blue/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                id="csv-upload" 
                onChange={handleFileUpload} 
              />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 bg-tv-surface2 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-tv-blue" />
                </div>
                <div className="text-tv-text font-bold mb-1">Click or drag CSV here</div>
                <div className="text-tv-muted text-xs">Supports generic exports (Symbol, Direction, Entry, Exit, PnL, Date)</div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-tv-surface2 rounded-xl border border-tv-border flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-tv-text">{file.name}</div>
                  <div className="text-xs text-tv-muted">{parsedData.length} rows detected</div>
                </div>
                <button onClick={() => { setFile(null); setParsedData([]); }} className="text-tv-muted hover:text-tv-red">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-tv-red/10 border border-tv-red/30 rounded-lg flex items-center gap-2 text-tv-red text-sm">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="p-4 bg-tv-blue/5 border border-tv-blue/20 rounded-xl text-sm text-tv-text">
                <strong>Note:</strong> Imported trades will have neutral psychological scores. You can edit them later to add behavioral context.
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-tv-border flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost border border-tv-border">Cancel</button>
          <button 
            onClick={importData} 
            disabled={!file || parsedData.length === 0}
            className={cn("btn-primary", (!file || parsedData.length === 0) && "opacity-50 cursor-not-allowed")}
          >
            <Check className="w-4 h-4" /> Import {parsedData.length > 0 ? parsedData.length : ''} Trades
          </button>
        </div>
      </div>
    </div>
  );
}
