import React, { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react'

export default function TopMoversCard({ heatmapItems = [], onSelectStock }) {
  const [activeTab, setActiveTab] = useState('gainers'); // 'gainers' | 'losers'

  // Extract and sort movers from the current active heatmap list
  const { topGainers, topLosers, totalSize } = useMemo(() => {
    if (!heatmapItems || heatmapItems.length === 0) {
      return { topGainers: [], topLosers: [], totalSize: 0 };
    }

    // Filter valid items
    const valid = heatmapItems.filter(item => typeof item.change === 'number' && !isNaN(item.change));

    const sortedByChange = [...valid].sort((a, b) => b.change - a.change);

    const gainers = sortedByChange.slice(0, 3);
    const losers = [...sortedByChange].reverse().slice(0, 3);
    const sumSize = heatmapItems.reduce((acc, cur) => acc + (Number(cur.size) || 0), 0);

    return { topGainers: gainers, topLosers: losers, totalSize: sumSize };
  }, [heatmapItems]);

  const formatPrice = (item) => {
    if (item.price === undefined || item.price === null) return null;
    const num = Number(item.price);
    if (isNaN(num)) return null;
    const isKorean = (item.symbol && (item.symbol.endsWith('.KS') || item.symbol.endsWith('.KQ'))) || /[가-힣]/.test(item.name);
    return isKorean ? `₩${num.toLocaleString('ko-KR')}` : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentList = activeTab === 'gainers' ? topGainers : topLosers;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header & Toggle */}
      <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={18} color="var(--accent-color)" />
          <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>실시간 시장 스팟라이트</h2>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', backgroundColor: 'var(--surface-hover)', borderRadius: '0.4rem', padding: '2px' }}>
          <button
            onClick={() => setActiveTab('gainers')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '0.3rem',
              fontSize: '0.78rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: activeTab === 'gainers' ? 'var(--surface-color)' : 'transparent',
              color: activeTab === 'gainers' ? 'var(--positive-color)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'gainers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <TrendingUp size={13} />
            <span>급등 TOP 3</span>
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '0.3rem',
              fontSize: '0.78rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: activeTab === 'losers' ? 'var(--surface-color)' : 'transparent',
              color: activeTab === 'losers' ? 'var(--negative-color)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'losers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <TrendingDown size={13} />
            <span>급락 TOP 3</span>
          </button>
        </div>
      </div>

      {/* Movers List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
        {currentList.length === 0 ? (
          <div className="text-secondary" style={{ textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>
            데이터를 취합하는 중입니다...
          </div>
        ) : (
          currentList.map((item, idx) => {
            const isUp = item.change >= 0;
            const rank = idx + 1;
            const weightPct = totalSize > 0 && item.size 
              ? ((item.size / totalSize) * 100).toFixed(1) 
              : null;
            const priceStr = formatPrice(item);

            return (
              <div
                key={idx}
                className="clickable"
                onClick={() => onSelectStock && onSelectStock({ name: item.name, symbol: item.symbol || item.name, value: String(item.price || item.size || '100') })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.15s, border-color 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    backgroundColor: rank === 1 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.15)',
                    color: rank === 1 ? 'var(--accent-color)' : 'var(--text-secondary)'
                  }}>
                    {rank}
                  </span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {weightPct && (
                        <span>
                          시총 비중 <strong style={{ color: 'var(--text-color)', fontWeight: '600' }}>{weightPct}%</strong>
                        </span>
                      )}
                      {weightPct && priceStr && <span style={{ opacity: 0.5 }}>·</span>}
                      {priceStr && <span style={{ color: 'var(--text-secondary)' }}>{priceStr}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span 
                    className={`badge ${isUp ? 'positive' : 'negative'}`}
                    style={{ fontSize: '0.82rem', padding: '0.2rem 0.5rem', fontWeight: 'bold' }}
                  >
                    {isUp ? '+' : ''}{item.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
        <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
          💡 종목 클릭 시 캔들 차트 팝업 제공
        </span>
      </div>
    </div>
  );
}
