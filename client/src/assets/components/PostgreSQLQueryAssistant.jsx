import React, { useState } from 'react';
import { Database, Send, Sparkles, Terminal, Activity, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export default function PostgreSQLQueryAssistant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`${API_BASE}/api/ai-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch results');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // FULL SCREEN CENTERED CONTAINER
    <div className="min-h-screen w-full bg-[#0f172a] text-white flex items-center justify-center p-4 selection:bg-indigo-500/30">
      
      {/* MAIN CARD */}
      <div className="w-full max-w-4xl bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
              AI Data Assistant
            </h1>
          </div>
          <p className="text-slate-400 mt-2">Ask questions about your data in plain English</p>
        </div>

        {/* SEARCH AREA */}
        <div className="p-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 transition duration-500"></div>
            <div className="relative flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Show me the top 5 active users..."
                className="w-full bg-[#1e293b] border border-white/10 text-slate-200 placeholder-slate-500 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg shadow-inner"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mt-6 mx-auto max-w-2xl p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* RESULTS AREA */}
          {data && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* EXPLANATION & SQL GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AI Explanation */}
                <div className="md:col-span-2 p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Analysis</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{data.explanation}</p>
                </div>

                {/* SQL Code */}
                <div className="p-5 rounded-xl bg-black/30 border border-white/10 font-mono text-sm overflow-x-auto relative group">
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Generated SQL</span>
                  </div>
                  <code className="text-indigo-300 block pb-2">{data.sql}</code>
                </div>
              </div>

              {/* DATA TABLE */}
              <div className="rounded-xl border border-white/10 overflow-hidden bg-[#1e293b]/50 shadow-inner">
                <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Activity className="w-4 h-4" />
                    <span className="font-medium">Query Results</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                    {data.results.length} rows
                  </span>
                </div>
                
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-black/20 text-slate-200 uppercase font-medium text-xs sticky top-0 backdrop-blur-md">
                      <tr>
                        {data.results.length > 0 && Object.keys(data.results[0]).map((key) => (
                          <th key={key} className="px-6 py-4 tracking-wider whitespace-nowrap">{key.replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.results.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-6 py-4 text-slate-300 whitespace-nowrap">
                              {val === null ? <span className="text-slate-600 italic">null</span> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.results.length === 0 && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                      <Database className="w-12 h-12 mb-3 opacity-20" />
                      <p>No data returned for this query</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}