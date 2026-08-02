import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertCircle, TrendingUp } from 'lucide-react'
import ChartModal from '../components/ChartModal'

// Dummy data for USD/KRW 1 year trend
const usdKrwTrend = [
  { month: '23.08', value: 1320 },
  { month: '23.09', value: 1345 },
  { month: '23.10', value: 1355 },
  { month: '23.11', value: 1310 },
  { month: '23.12', value: 1295 },
  { month: '24.01', value: 1330 },
  { month: '24.02', value: 1335 },
  { month: '24.03', value: 1345 },
  { month: '24.04', value: 1370 },
  { month: '24.05', value: 1365 },
  { month: '24.06', value: 1380 },
  { month: '24.07', value: 1385 },
]

export default function ExchangeRates() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeTab, setActiveTab] = useState('전체 현황')

  const ratesData = {
    '주요 통화': [
      { name: '원/달러 환율 (USD/KRW)', price: '1,385.50', change: '+2.10', isUp: true },
      { name: '원/엔 환율 (JPY/KRW 100)', price: '875.40', change: '+1.50', isUp: true },
      { name: '원/유로 환율 (EUR/KRW)', price: '1,502.30', change: '+3.20', isUp: true },
      { name: '원/위안 환율 (CNY/KRW)', price: '190.85', change: '-0.15', isUp: false },
    ],
    '이종 통화': [
      { name: '엔/달러 환율 (USD/JPY)', price: '158.20', change: '-0.45', isUp: false },
      { name: '유로/달러 환율 (EUR/USD)', price: '1.0850', change: '+0.0020', isUp: true },
      { name: '파운드/달러 환율 (GBP/USD)', price: '1.2750', change: '-0.0015', isUp: false },
      { name: '달러/위안 환율 (USD/CNY)', price: '7.2550', change: '+0.0150', isUp: true },
    ],
    '글로벌 인덱스': [
      { name: '달러 인덱스 (DXY)', price: '104.25', change: '+0.15', isUp: true },
      { name: '아시아 달러 인덱스 (ADXY)', price: '98.50', change: '-0.20', isUp: false },
    ],
    '기타 신흥국': [
      { name: '달러/인도 루피 (USD/INR)', price: '83.50', change: '+0.10', isUp: true },
      { name: '달러/브라질 헤알 (USD/BRL)', price: '5.1500', change: '-0.0200', isUp: false },
    ]
  }

  const tabs = ['전체 현황', ...Object.keys(ratesData)]

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>환율 (Exchange Rates)</h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            원/달러 환율 및 주요국 이종 통화 간의 실시간 환율 동향을 파악하세요.
          </div>
        </div>
      </div>

      <div className="tabs" style={{ overflowX: 'auto', display: 'flex', gap: '0.5rem', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === '전체 현황' ? (
        <div style={{ marginTop: '1.5rem' }}>
          
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h2 className="card-title" style={{ margin: 0 }}>원/달러 환율 (USD/KRW) 최근 1년 추이</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
                <span className="text-2xl" style={{ fontWeight: 'bold' }}>1,385.50</span>
                <span className="text-positive text-sm">+2.10 (+0.15%)</span>
              </div>
            </div>
            
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usdKrwTrend} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" stroke={textColor} tick={{fill: textColor, fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 20', 'dataMax + 20']} stroke={textColor} tick={{fill: textColor, fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Line type="monotone" dataKey="value" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 className="card-title">주요국 통화 크로스 테이블 (Cross Currency Matrix)</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: '400px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>통화</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>USD</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>EUR</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>JPY (100)</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>KRW</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '0.5rem' }}>USD</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>1.000</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>0.922</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>158.20</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>1,385.50</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '0.5rem' }}>EUR</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>1.085</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>1.000</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>171.65</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>1,502.30</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '0.5rem' }}>JPY (100)</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>0.632</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>0.582</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>100.0</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem' }}>875.40</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={20} color="var(--accent-color)" />
                <h2 className="card-title" style={{ margin: 0 }}>외환 시장 모니터링 브리핑</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', borderLeft: '4px solid var(--accent-color)' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>외국인 배당 역송금 수요 집중</h3>
                  <p className="text-secondary" style={{ fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>
                    이번 주 국내 주요 대기업들의 결산 배당금 지급이 집중됨에 따라, 외국인 투자자들의 원화 매도 및 달러 환전(역송금) 수요가 급증하여 원/달러 환율 상승 압력으로 작용하고 있습니다.
                  </p>
                </div>
                
                <div style={{ padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', borderLeft: '4px solid var(--negative-color)' }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>엔화 약세 심화 및 BOJ 개입 경계감</h3>
                  <p className="text-secondary" style={{ fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>
                    엔/달러 환율이 158엔을 돌파하며 슈퍼 엔저 현상이 지속되고 있습니다. 일본 외환 당국의 실개입(구두 개입 포함) 경계감이 극도에 달해 있어 이종 통화 변동성에 유의해야 합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="grid-3" style={{ marginTop: '1.5rem' }}>
          {ratesData[activeTab].map((item, idx) => (
            <div 
              key={idx} 
              className="card clickable" 
              onClick={() => setSelectedItem({ name: item.name, value: item.price, change: (item.isUp ? '+' : '') + item.change })}
            >
              <h2 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{item.name}</h2>
              <div className="flex-between">
                <span className="text-2xl" style={{ fontWeight: 'bold' }}>{item.price}</span>
                <span className={`badge ${item.isUp ? 'positive' : 'negative'}`}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ChartModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />
    </div>
  )
}
