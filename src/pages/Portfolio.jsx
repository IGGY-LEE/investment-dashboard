import React, { useState } from 'react'
import { Briefcase, Target, ArrowUpRight, ArrowDownRight, Wallet, PieChart as PieChartIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import ChartModal from '../components/ChartModal'

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('전체 현황')
  const [selectedItem, setSelectedItem] = useState(null)

  const tabs = ['전체 현황', '미국 주식', '한국 주식', '배당 및 배분']

  const portfolioHistory = [
    { month: '1월', value: 95000 },
    { month: '2월', value: 98000 },
    { month: '3월', value: 102000 },
    { month: '4월', value: 99000 },
    { month: '5월', value: 105000 },
    { month: '6월', value: 112000 },
    { month: '7월', value: 115400 },
  ]

  const sectorAllocation = [
    { name: '기술 (Tech)', value: 45, color: '#3b82f6' },
    { name: '금융 (Financials)', value: 20, color: '#10b981' },
    { name: '헬스케어 (Healthcare)', value: 15, color: '#f59e0b' },
    { name: '소비재 (Consumer)', value: 10, color: '#8b5cf6' },
    { name: '현금 (Cash)', value: 10, color: 'var(--text-secondary)' },
  ]

  const holdings = {
    '미국 주식': [
      { ticker: 'AAPL', name: 'Apple Inc.', qty: 50, avgPrice: 150.20, currentPrice: 175.40, return: '+16.7%' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', qty: 30, avgPrice: 310.50, currentPrice: 420.10, return: '+35.3%' },
      { ticker: 'NVDA', name: 'Nvidia Corp.', qty: 15, avgPrice: 450.00, currentPrice: 880.20, return: '+95.6%' },
    ],
    '한국 주식': [
      { ticker: '005930', name: '삼성전자', qty: 200, avgPrice: 72000, currentPrice: 81000, return: '+12.5%' },
      { ticker: '000660', name: 'SK하이닉스', qty: 50, avgPrice: 110000, currentPrice: 175000, return: '+59.0%' },
    ]
  }

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={24} color="var(--accent-color)" /> 내 포트폴리오
          </h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>계좌 연동을 통한 실시간 자산 추이 및 종목 관리 대시보드입니다.</div>
        </div>
        <button 
          className="badge neutral clickable" 
          onClick={() => alert('증권사 Open API 연동 기능은 백엔드에서 제공됩니다.')}
        >
          + 증권사 계좌 연동
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
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <Wallet size={16} /> 총 평가 금액
              </div>
              <div className="text-4xl" style={{ fontWeight: 'bold' }}>$115,400.00</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <span className="badge positive" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <ArrowUpRight size={14} /> +$4,250 (3.8%)
                </span>
                <span className="text-secondary" style={{ fontSize: '0.875rem' }}>vs 지난달</span>
              </div>
            </div>
            
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <Target size={16} /> 2026년 목표 달성률
              </div>
              <div className="text-4xl" style={{ fontWeight: 'bold' }}>76.9%</div>
              
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginTop: '1.25rem', overflow: 'hidden' }}>
                <div style={{ width: '76.9%', height: '100%', backgroundColor: 'var(--accent-color)' }}></div>
              </div>
              <div className="flex-between text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <span>$115,400</span>
                <span>목표 $150,000</span>
              </div>
            </div>
            
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <PieChartIcon size={16} /> 투자 성향 분석
              </div>
              <div className="text-2xl" style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>적극투자형 (Aggressive)</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '1rem', lineHeight: '1.4' }}>
                현재 포트폴리오는 기술주(45%) 비중이 매우 높아 시장 변동성에 민감하게 반응할 수 있습니다. 
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 className="card-title">월별 자산 추이</h2>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={portfolioHistory} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="month" stroke={textColor} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke={textColor} 
                      axisLine={false} 
                      tickLine={false} 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip 
                      formatter={(val) => `$${val.toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">섹터 비중 (Sector Allocation)</h2>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `${value}%`}
                      contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend Overlay */}
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sectorAllocation.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: s.color }}></div>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === '배당 및 배분' ? (
        <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="text-secondary" style={{ marginBottom: '1rem' }}>배당 캘린더 및 리밸런싱 시뮬레이터는 백엔드 연동 후 제공됩니다.</div>
        </div>
      ) : (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>종목명 (Ticker)</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>수량</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>매수 평균가</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>현재가</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>수익률</th>
                </tr>
              </thead>
              <tbody>
                {holdings[activeTab]?.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="clickable" 
                    onClick={() => setSelectedItem({ name: item.name, value: item.currentPrice })}
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.ticker}</div>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{item.name}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{item.qty}주</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{item.avgPrice.toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>{item.currentPrice.toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span className={`badge ${item.return.startsWith('+') ? 'positive' : 'negative'}`}>{item.return}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ChartModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />
    </div>
  )
}
