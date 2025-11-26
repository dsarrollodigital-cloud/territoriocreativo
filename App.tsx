import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VERTICAL_AXIS, HORIZONTAL_AXIS } from './constants';
import { CellCoordinate, IntersectionData, LoadingState, MatrixData } from './types';
import { generateIntersection } from './services/geminiService';

// --- Helper Components ---

const Header = () => (
  <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-[60]">
    <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
          Matriz Conceptual Nexus AI
        </h1>
      </div>
      <div className="text-sm text-slate-400 hidden md:block">
        <span>Explorador de Intersecciones Diseño-Función</span>
      </div>
    </div>
  </header>
);

const DetailPanel = ({ 
  coordinate, 
  data, 
  loading, 
  onClose 
}: { 
  coordinate: CellCoordinate | null; 
  data: IntersectionData | null; 
  loading: boolean;
  onClose: () => void;
}) => {
  if (!coordinate) return null;

  const row = VERTICAL_AXIS.find(r => r.id === coordinate.rowId);
  const col = HORIZONTAL_AXIS.find(c => c.id === coordinate.colId);

  if (!row || !col) return null;

  return (
    <div className="fixed right-0 top-[73px] bottom-0 w-full md:w-[450px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl p-8 flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out z-[70]">
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">Detalle de Intersección</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-800 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-8 pb-10">
        {/* Coordinates Info */}
        <div className="space-y-4">
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">{row.id}</span>
                <div className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Eje Vertical</div>
            </div>
            <div className="font-serif text-lg text-slate-100 mb-2">{row.label}</div>
            <div className="text-sm text-slate-400 leading-relaxed">{row.description}</div>
          </div>
          
          <div className="flex justify-center text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold">{col.id}</span>
                <div className="text-xs text-purple-300 uppercase font-bold tracking-wider">Eje Horizontal</div>
            </div>
            <div className="font-serif text-lg text-slate-100 mb-2">{col.label}</div>
            <div className="text-sm text-slate-400 leading-relaxed">{col.description}</div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

        {/* Generated Content */}
        <div className="min-h-[250px] relative">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 space-y-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                    <span className="text-sm font-medium animate-pulse">Sintetizando análisis...</span>
                </div>
            ) : data ? (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-inner">
                        <div className="text-xs text-slate-500 uppercase mb-2">Análisis de la Intersección</div>
                        <p className="text-slate-200 leading-relaxed text-lg font-serif">
                            {data.description}
                        </p>
                    </div>
                    
                    <div className="bg-indigo-950/30 rounded-xl p-6 border border-indigo-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        <div className="text-xs font-semibold text-indigo-400 uppercase mb-3 tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            Ejemplo / Metáfora
                        </div>
                        <p className="text-indigo-100 italic text-base leading-relaxed relative z-10">
                            "{data.metaphor}"
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                    <span className="text-sm">Selecciona una intersección</span>
                    <span className="text-xs opacity-50 mt-1">para ver el análisis</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [selectedCell, setSelectedCell] = useState<CellCoordinate | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixData>({});
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate data when cell changes
  useEffect(() => {
    if (!selectedCell) return;

    const key = `${selectedCell.rowId}-${selectedCell.colId}`;
    
    // If we already have data, don't fetch again
    if (matrixData[key]) {
      return;
    }

    const fetchData = async () => {
      setLoadingState(LoadingState.LOADING);
      try {
        const row = VERTICAL_AXIS.find(r => r.id === selectedCell.rowId)!;
        const col = HORIZONTAL_AXIS.find(c => c.id === selectedCell.colId)!;
        
        const result = await generateIntersection(row, col);
        
        setMatrixData(prev => ({
          ...prev,
          [key]: result
        }));
        setLoadingState(LoadingState.SUCCESS);
      } catch (error) {
        console.error(error);
        setLoadingState(LoadingState.ERROR);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCell]);

  const handleCellClick = useCallback((rowId: number, colId: number) => {
    setSelectedCell({ rowId, colId });
  }, []);

  const getCellColor = (rowId: number, colId: number) => {
    const isSelected = selectedCell?.rowId === rowId && selectedCell?.colId === colId;
    if (isSelected) return 'bg-indigo-600 ring-2 ring-white z-10 shadow-[0_0_20px_rgba(79,70,229,0.5)]';

    const hasData = matrixData[`${rowId}-${colId}`];
    if (hasData) return 'bg-purple-900/40 hover:bg-purple-800/60 border-purple-500/30';

    return 'bg-slate-800/40 hover:bg-slate-700/60 border-slate-700/30';
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 flex flex-col h-screen overflow-hidden">
      <Header />

      <main className="flex-1 overflow-hidden relative flex flex-col">
        
        {/* 
            Monolithic CSS Grid Layout 
            - Use a single grid for headers and cells to ensure alignment.
            - Sticky positioning for top row and left column.
            - Minmax widths ensure text is readable.
        */}
        <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-auto custom-scrollbar bg-[#0b1120]"
        >
            <div 
              className="grid"
              style={{
                // 1 column for row headers (260px) + 20 columns for data (min 200px each)
                gridTemplateColumns: '260px repeat(20, minmax(200px, 1fr))',
                // Auto rows based on content
                gridAutoRows: 'auto',
              }}
            >
                {/* --- Top Left Corner (Intersection of Axis) --- */}
                <div className="sticky top-0 left-0 z-50 bg-[#0b1120] border-b border-r border-slate-700 p-4 flex flex-col justify-end items-end shadow-xl">
                   <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">Horizontal</div>
                      <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Vertical</div>
                   </div>
                </div>

                {/* --- Column Headers (Top Row) --- */}
                {HORIZONTAL_AXIS.map((col) => (
                    <div 
                        key={`header-col-${col.id}`}
                        className={`
                            sticky top-0 z-40 bg-[#0b1120] p-4 border-b border-slate-700 border-r border-slate-800/50
                            flex flex-col justify-end gap-2 shadow-md
                            ${selectedCell?.colId === col.id ? 'bg-slate-900 border-b-indigo-500' : ''}
                        `}
                    >
                        <div className="flex items-center gap-2 text-purple-400/50 font-mono text-xs">
                            <span>{col.id}</span>
                            <div className="h-px bg-purple-900 w-full"></div>
                        </div>
                        <div>
                            <div className="font-bold text-slate-200 text-sm leading-tight mb-2">{col.label}</div>
                            <div className="text-xs text-slate-500 leading-relaxed font-light whitespace-normal break-words">
                                {col.description}
                            </div>
                        </div>
                    </div>
                ))}

                {/* --- Rows --- */}
                {VERTICAL_AXIS.map((row) => (
                    <React.Fragment key={`row-${row.id}`}>
                        
                        {/* Row Header (Left Column) */}
                        <div 
                            className={`
                                sticky left-0 z-30 bg-[#0b1120] p-4 border-r border-b border-slate-700 border-b-slate-800/50
                                flex flex-col justify-center shadow-md
                                ${selectedCell?.rowId === row.id ? 'bg-slate-900 border-r-indigo-500' : ''}
                            `}
                        >
                             <div className="flex items-center gap-2 text-indigo-400/50 font-mono text-xs mb-2">
                                <span>{row.id}</span>
                            </div>
                            <div className="font-bold text-slate-200 text-sm leading-tight mb-2">{row.label}</div>
                            <div className="text-xs text-slate-500 leading-relaxed font-light whitespace-normal break-words">
                                {row.description}
                            </div>
                        </div>

                        {/* Data Cells */}
                        {HORIZONTAL_AXIS.map((col) => {
                            const key = `${row.id}-${col.id}`;
                            const data = matrixData[key];
                            return (
                                <div 
                                    key={`cell-${row.id}-${col.id}`}
                                    onClick={() => handleCellClick(row.id, col.id)}
                                    className={`
                                        relative min-h-[140px] border-b border-r border-slate-800/50 cursor-pointer group transition-all duration-200
                                        p-3 flex flex-col justify-center items-center text-center
                                        ${getCellColor(row.id, col.id)}
                                    `}
                                >
                                    {/* Hover Coordinate indicator */}
                                    <span className="absolute top-2 left-2 text-[9px] font-mono text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {row.id}.{col.id}
                                    </span>

                                    {/* Content */}
                                    {data ? (
                                        <div className="animate-fade-in w-full">
                                            <span className="block text-xs font-normal text-purple-200 leading-relaxed whitespace-normal break-words">
                                                {data.description}
                                            </span>
                                            {/* Optional: Small visual indicator for metaphor, hidden on grid but available in detail */}
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-all text-slate-500">
                                            <span className="text-lg font-light">+</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>

        {/* Detail Sidebar */}
        <DetailPanel 
            coordinate={selectedCell} 
            data={selectedCell ? matrixData[`${selectedCell.rowId}-${selectedCell.colId}`] || null : null}
            loading={loadingState === LoadingState.LOADING}
            onClose={() => setSelectedCell(null)}
        />

      </main>
    </div>
  );
}