import React, { useState, useEffect } from 'react'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ChartModal from '../components/ChartModal'

const generateWatchlist = () => {
  const data = {
    'S&P 500': ['Apple (AAPL)', 'Microsoft (MSFT)', 'Nvidia (NVDA)', 'Amazon (AMZN)', 'Meta (META)', 'Alphabet (GOOGL)', 'Berkshire Hathaway (BRK.B)', 'Eli Lilly (LLY)', 'Broadcom (AVGO)', 'JPMorgan Chase (JPM)'],
    '나스닥': ['Nvidia (NVDA)', 'AMD (AMD)', 'ASML (ASML)', 'Qualcomm (QCOM)', 'Intel (INTC)', 'Tesla (TSLA)', 'Netflix (NFLX)', 'PepsiCo (PEP)', 'Costco (COST)', 'Cisco (CSCO)'],
    '다우존스': ['UnitedHealth (UNH)', 'Goldman Sachs (GS)', 'Microsoft (MSFT)', 'Home Depot (HD)', 'Caterpillar (CAT)', 'Salesforce (CRM)', 'McDonalds (MCD)', 'Visa (V)', 'Boeing (BA)', 'Travelers (TRV)'],
    '코스피': ['삼성전자 (005930)', 'SK하이닉스 (000660)', 'LG에너지솔루션 (373220)', '삼성바이오로직스 (207940)', '현대차 (005380)', '기아 (000270)', '셀트리온 (068270)', 'POSCO홀딩스 (005490)', 'KB금융 (105560)', 'NAVER (035420)'],
    '코스닥': ['에코프로비엠 (247540)', '알테오젠 (196170)', '에코프로 (086520)', 'HLB (028300)', '엔켐 (348370)', '리노공업 (058470)', '셀트리온제약 (068760)', 'HPSP (403870)', '레인보우로보틱스 (277810)', '클래시스 (214150)']
  };

  let idCounter = 1;
  const list = [];
  
  for (const [group, items] of Object.entries(data)) {
    items.forEach(itemStr => {
      // Avoid duplicate display in '전체' view for stocks in multiple indices
      if (list.find(item => itemStr.includes(item.ticker))) return;

      const match = itemStr.match(/(.+?)\s+\((.+?)\)/);
      const name = match ? match[1] : itemStr;
      const ticker = match ? match[2] : '';
      
      const isUp = Math.random() > 0.4;
      const priceNum = group.includes('코스') ? (20000 + Math.floor(Math.random() * 150000)) : (50 + Math.floor(Math.random() * 500));
      const pricePrefix = group.includes('코스') ? '' : '$';
      const priceSuffix = group.includes('코스') ? '원' : '';
      
      list.push({
        id: idCounter++,
        group,
        name,
        ticker,
        price: `${pricePrefix}${priceNum.toLocaleString(undefined, {minimumFractionDigits: group.includes('코스')?0:2})}${priceSuffix}`,
        change: `${isUp ? '+' : '-'}${(Math.random() * 3).toFixed(2)}%`,
        isUp,
        memo: '',
        targetPrice: `${pricePrefix}${(priceNum * (1 + Math.random() * 0.3)).toLocaleString(undefined, {minimumFractionDigits: group.includes('코스')?0:2})}${priceSuffix}`,
        analystRating: isUp ? 'Strong Buy' : 'Hold',
        recentNews: [
          { title: `${name}, 3분기 실적 호조 기대감 상승`, date: '2026-08-01' },
          { title: `글로벌 IB, ${name} 목표주가 신규 제시`, date: '2026-07-28' }
        ]
      });
    });
  }
  return list;
}

const initialWatchlist = generateWatchlist();

export default function Watchlist() {
  const [expandedId, setExpandedId] = useState(null)
  const [watchlist, setWatchlist] = useState(initialWatchlist)
  const [activeTab, setActiveTab] = useState('전체 현황')
  const [selectedItem, setSelectedItem] = useState(null)

  const tabs = ['전체 현황', 'S&P 500', '나스닥', '다우존스', '코스피', '코스닥']

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  // Extract M7 data for BarChart
  const m7Tickers = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'GOOGL', 'TSLA'];
  const m7Data = watchlist
    .filter(w => m7Tickers.includes(w.ticker))
    .map(w => ({
      name: w.ticker,
      changePercent: parseFloat(w.change.replace('%', '')),
      fullName: w.name,
      price: w.price
    }))
    .sort((a, b) => b.changePercent - a.changePercent);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleMemoChange = (id, newMemo) => {
    setWatchlist(watchlist.map(item => item.id === id ? { ...item, memo: newMemo } : item))
  }

  const filteredList = activeTab === '전체 현황' 
    ? [] 
    : watchlist.filter(item => item.group === activeTab)

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>시장 주도주 (Market Leaders)</h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            각 지수별 시가총액 상위 10개 핵심 주도주들의 시세와 변동성을 확인하세요.
          </div>
        </div>
        <button className="badge positive clickable" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          + 종목 추가
        </button>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === '전체 현황' ? (
        <div style={{ marginTop: '1.5rem' }}>
          <h2 className="page-title" style={{ fontSize: '1.25rem' }}>글로벌 M7 (Magnificent 7) 등락률</h2>
          
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m7Data} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                  <YAxis stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'var(--surface-hover)'}}
                    contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    formatter={(value) => [`${value > 0 ? '+' : ''}${value}%`, '등락률']}
                  />
                  <Bar dataKey="changePercent" radius={[4, 4, 0, 0]}>
                    {m7Data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.changePercent > 0 ? 'var(--positive-color)' : 'var(--negative-color)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 className="card-title">미국 증시 주도 섹터 자금 흐름</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>AI 반도체 밸류체인</span>
                    <span className="text-positive">+4.5%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '90%', height: '100%', backgroundColor: 'var(--positive-color)' }}></div>
                  </div>
                </li>
                <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>클라우드 / 소프트웨어</span>
                    <span className="text-positive">+2.1%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '50%', height: '100%', backgroundColor: 'var(--positive-color)', opacity: 0.8 }}></div>
                  </div>
                </li>
                <li style={{ padding: '1rem 0' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>방산 / 우주항공</span>
                    <span className="text-positive">+1.8%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--positive-color)', opacity: 0.6 }}></div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="card">
              <h2 className="card-title">한국 증시 주도 섹터 자금 흐름</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>저PBR 밸류업 프로그램 수혜주</span>
                    <span className="text-positive">+3.2%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', backgroundColor: 'var(--positive-color)' }}></div>
                  </div>
                </li>
                <li style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>HBM 장비 부품사</span>
                    <span className="text-positive">+2.5%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', backgroundColor: 'var(--positive-color)', opacity: 0.8 }}></div>
                  </div>
                </li>
                <li style={{ padding: '1rem 0' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>K-뷰티 (화장품)</span>
                    <span className="text-positive">+1.9%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '40%', height: '100%', backgroundColor: 'var(--positive-color)', opacity: 0.6 }}></div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        {filteredList.map(item => (
          <div key={item.id} className="card" style={{ marginBottom: 0, padding: 0, overflow: 'hidden' }}>
            <div 
              style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
              onClick={() => setSelectedItem({ name: item.name, value: item.price.replace(/[^0-9.]/g, '') })}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{item.name}</h2>
                  <span className="badge neutral">{item.ticker}</span>
                  {activeTab === '전체' && <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>{item.group}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="text-xl" style={{ fontWeight: 'bold' }}>{item.price}</span>
                  <span className={`badge ${item.isUp ? 'positive' : 'negative'}`}>{item.change}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                <button 
                  className="badge neutral clickable" 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', height: 'fit-content' }}
                  onClick={() => alert(`${item.name} 네이버/야후 파이낸스 뉴스 연동 예정`)}
                >
                  <ExternalLink size={14} /> 뉴스 보기
                </button>
                <button 
                  className="badge neutral clickable" 
                  onClick={() => toggleExpand(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', height: 'fit-content' }}
                >
                  {expandedId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  상세 정보
                </button>
              </div>
            </div>

            {expandedId === item.id && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                <div className="grid-2" style={{ gap: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>내부 메모 / 투자 아이디어</h3>
                    <textarea 
                      style={{ 
                        width: '100%', 
                        minHeight: '100px', 
                        padding: '0.75rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                      value={item.memo}
                      onChange={(e) => handleMemoChange(item.id, e.target.value)}
                      placeholder="투자 아이디어나 어닝콜 핵심 내용을 메모하세요..."
                    />
                  </div>

                  <div>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                      <div>
                        <div className="text-secondary" style={{ fontSize: '0.875rem' }}>애널리스트 투자의견</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{item.analystRating}</div>
                      </div>
                      <div>
                        <div className="text-secondary" style={{ fontSize: '0.875rem' }}>목표 주가 (Target)</div>
                        <div style={{ fontWeight: 'bold' }}>{item.targetPrice}</div>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>최근 주요 공시 및 리포트</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {item.recentNews.map((news, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer' }}>{news.title}</span>
                          <span className="text-secondary">{news.date}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      <ChartModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  )
}
