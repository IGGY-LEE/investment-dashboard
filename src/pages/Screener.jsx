import React, { useState, useEffect } from 'react';
import { Filter, Search, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import ChartModal from '../components/ChartModal';
import { getQuotes } from '../api';

const SCREENER_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: '기술' },
  { symbol: 'MSFT', name: 'Microsoft', sector: '기술' },
  { symbol: 'NVDA', name: 'NVIDIA', sector: '반도체' },
  { symbol: 'JPM', name: 'JPMorgan', sector: '금융' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: '헬스케어' },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: '에너지' },
  { symbol: 'WMT', name: 'Walmart', sector: '필수소비재' },
  { symbol: 'TSLA', name: 'Tesla', sector: '경기소비재' },
  { symbol: 'META', name: 'Meta Platforms', sector: '통신' },
  { symbol: 'KO', name: 'Coca-Cola', sector: '필수소비재' },
  { symbol: '005930.KS', name: '삼성전자', sector: '반도체' },
  { symbol: '000660.KS', name: 'SK하이닉스', sector: '반도체' },
  { symbol: '005380.KS', name: '현대차', sector: '자동차' },
];

export default function Screener() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'mktCap', direction: 'desc' });
  const [selectedItem, setSelectedItem] = useState(null);

  const sectors = ['All', ...new Set(SCREENER_SYMBOLS.map(s => s.sector))];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const symbols = SCREENER_SYMBOLS.map(s => s.symbol);
      const quotes = await getQuotes(symbols);
      
      const enrichedStocks = SCREENER_SYMBOLS.map(base => {
        const quote = quotes.find(q => q.symbol === base.symbol);
        if (!quote) return { ...base, price: 0, change: 0, mktCap: 'N/A', pe: 0, divYield: 0, rawMktCap: 0 };
        
        const mktCapVal = quote.marketCap || 0;
        let mktCapStr = 'N/A';
        if (mktCapVal >= 1e12) mktCapStr = (mktCapVal / 1e12).toFixed(2) + 'T';
        else if (mktCapVal >= 1e9) mktCapStr = (mktCapVal / 1e9).toFixed(1) + 'B';
        else if (mktCapVal >= 1e6) mktCapStr = (mktCapVal / 1e6).toFixed(1) + 'M';
        
        return {
          ...base,
          price: quote.regularMarketPrice || 0,
          change: Number((quote.regularMarketChangePercent || 0).toFixed(2)),
          mktCap: mktCapStr,
          rawMktCap: mktCapVal,
          pe: quote.trailingPE || 0,
          divYield: quote.trailingAnnualDividendYield ? (quote.trailingAnnualDividendYield * 100) : 0
        };
      });
      
      setStocks(enrichedStocks);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = stocks
    .filter(stock => 
      (sectorFilter === 'All' || stock.sector === sectorFilter) &&
      (stock.name.toLowerCase().includes(searchTerm.toLowerCase()) || stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aVal = sortConfig.key === 'mktCap' ? a.rawMktCap : a[sortConfig.key];
      const bVal = sortConfig.key === 'mktCap' ? b.rawMktCap : b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>종목 스크리너</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="종목명 또는 심볼 검색" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '250px'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <Filter size={18} color="var(--text-secondary)" />
            <select 
              value={sectorFilter} 
              onChange={(e) => setSectorFilter(e.target.value)}
              style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
            >
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-hover)' }}>
              {['심볼', '종목명', '섹터', '현재가', '등락률', '시가총액', 'P/E', '배당수익률'].map((header, idx) => {
                const keyMap = ['symbol', 'name', 'sector', 'price', 'change', 'mktCap', 'pe', 'divYield'];
                const key = keyMap[idx];
                return (
                  <th 
                    key={header} 
                    className="clickable"
                    onClick={() => handleSort(key)}
                    style={{ padding: '1rem', textAlign: idx >= 3 ? 'right' : 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: idx >= 3 ? 'flex-end' : 'flex-start' }}>
                      {header}
                      {sortConfig.key === key && (
                        <ArrowUpDown size={14} color="var(--accent-color)" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((stock, idx) => (
              <tr 
                key={stock.symbol} 
                className="clickable hover-bg"
                style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}
                onClick={() => setSelectedItem({ symbol: stock.symbol, name: stock.name, value: String(stock.price) })}
              >
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{stock.symbol}</td>
                <td style={{ padding: '1rem' }}>{stock.name}</td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge neutral">{stock.sector}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                  {stock.price > 1000 ? stock.price.toLocaleString() : stock.price.toFixed(2)}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <span className={`badge ${stock.change >= 0 ? 'positive' : 'negative'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {stock.change > 0 ? '+' : ''}{stock.change}%
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{stock.mktCap}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{stock.divYield.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            실시간 데이터를 불러오는 중입니다...
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            검색 결과가 없습니다.
          </div>
        ) : null}
      </div>

      <ChartModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  );
}
