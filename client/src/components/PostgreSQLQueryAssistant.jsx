import React, { useState, useEffect } from 'react';
import { Database, Send, History, Star, Trash2, Info, Loader2, AlertCircle } from 'lucide-react';

// Backend API URL - update this if your backend runs on a different port
const API_URL = 'http://localhost:3001';

export default function PostgreSQLQueryAssistant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
    loadFavorites();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await window.storage.get('query-history');
      if (stored) {
        setHistory(JSON.parse(stored.value));
      }
    } catch (err) {
      console.log('No history found');
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await window.storage.get('query-favorites');
      if (stored) {
        setFavorites(JSON.parse(stored.value));
      }
    } catch (err) {
      console.log('No favorites found');
    }
  };

  const saveToHistory = async (item) => {
    const newHistory = [item, ...history.slice(0, 19)];
    setHistory(newHistory);
    try {
      await window.storage.set('query-history', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  const toggleFavorite = async (item) => {
    const isFavorite = favorites.some(f => f.naturalQuery === item.naturalQuery);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(f => f.naturalQuery !== item.naturalQuery);
    } else {
      newFavorites = [...favorites, item];
    }
    
    setFavorites(newFavorites);
    try {
      await window.storage.set('query-favorites', JSON.stringify(newFavorites));
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  };

  const executeQuery = async (naturalQuery) => {
    if (!naturalQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `I need help querying a PostgreSQL database. 

Natural language request: "${naturalQuery}"

Please:
1. Analyze what data is being requested
2. Use the list_tables tool to see available tables
3. Use the describe_table tool to understand the schema
4. Generate and execute the appropriate SQL query using the query tool
5. Provide a brief explanation of what the query does

Be thorough in exploring the schema before writing the query.`
          }],
          tools: [{
            type: 'mcp_tool_use_20250304',
            name: 'mcp_postgres'
          }]
        })
      });

      const data = await response.json();
      
      let sqlQuery = '';
      let queryResult = null;
      let explanation = '';
      let toolCalls = [];

      for (const block of data.content) {
        if (block.type === 'text') {
          explanation += block.text + '\n';
        } else if (block.type === 'tool_use') {
          toolCalls.push(block);
          if (block.name === 'query') {
            sqlQuery = block.input.sql;
          }
        } else if (block.type === 'tool_result') {
          try {
            const resultData = JSON.parse(block.content);
            if (Array.isArray(resultData)) {
              queryResult = resultData;
            }
          } catch (e) {
            console.log('Could not parse tool result:', block.content);
          }
        }
      }

      const resultItem = {
        naturalQuery,
        sqlQuery,
        result: queryResult,
        explanation: explanation.trim(),
        timestamp: new Date().toISOString(),
        toolCalls
      };

      setResult(resultItem);
      await saveToHistory(resultItem);

    } catch (err) {
      setError(err.message || 'Failed to execute query');
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeQuery(query);
  };

  const clearHistory = async () => {
    setHistory([]);
    try {
      await window.storage.delete('query-history');
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const isFavorited = (item) => {
    return favorites.some(f => f.naturalQuery === item.naturalQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">PostgreSQL Query Assistant</h1>
          </div>

          <div className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your database... (e.g., 'Show me all users who signed up last month')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading && query.trim()) {
                    executeQuery(query);
                  }
                }}
              />
              <button
                onClick={() => executeQuery(query)}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Query
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <History className="w-4 h-4" />
              History ({history.length})
            </button>
            <button
              onClick={() => setShowHistory('favorites')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <Star className="w-4 h-4" />
              Favorites ({favorites.length})
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Your Question</h3>
                    <p className="text-blue-800">{result.naturalQuery}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(result)}
                    className="ml-4"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isFavorited(result)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400 hover:text-yellow-400'
                      } transition-colors`}
                    />
                  </button>
                </div>
              </div>

              {result.sqlQuery && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Generated SQL</h3>
                  <pre className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                    {result.sqlQuery}
                  </pre>
                </div>
              )}

              {result.explanation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-2">Explanation</h3>
                      <p className="text-green-800 whitespace-pre-wrap">{result.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.result && Array.isArray(result.result) && result.result.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Results ({result.result.length} rows)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(result.result[0]).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {result.result.slice(0, 100).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {Object.values(row).map((value, vidx) => (
                              <td key={vidx} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                                {value === null ? (
                                  <span className="text-gray-400 italic">null</span>
                                ) : (
                                  String(value)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.result.length > 100 && (
                      <p className="text-sm text-gray-500 mt-2">Showing first 100 rows of {result.result.length}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {showHistory && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {showHistory === 'favorites' ? 'Favorite Queries' : 'Query History'}
              </h2>
              {showHistory !== 'favorites' && history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(showHistory === 'favorites' ? favorites : history).map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setQuery(item.naturalQuery);
                    setShowHistory(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.naturalQuery}</p>
                      {item.sqlQuery && (
                        <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                          {item.sqlQuery}
                        </pre>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item);
                      }}
                      className="ml-4"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          isFavorited(item)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-400'
                        } transition-colors`}
                      />
                    </button>
                  </div>
                </div>
              ))}

              {(showHistory === 'favorites' ? favorites : history).length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {showHistory === 'favorites' ? 'No favorites yet' : 'No history yet'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
