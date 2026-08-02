import React, { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Activity, Flame, BarChart2, ShieldAlert } from 'lucide-react'
import ChartModal from '../components/ChartModal'

export default function Crypto() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeTab, setActiveTab] = useState('전체 현황')
  
  const cryptoData = {
    '메이저 (Layer 1)': [
      { name: '비트코인 (BTC)', price: '$64,250.00', change: '+2.5%', isUp: true, desc: '반감기 이후 완만한 우상향 흐름' },
      { name: '이더리움 (ETH)', price: '$3,450.00', change: '+1.2%', isUp: true, desc: '현물 ETF 승인 기대감으로 매수세 유입' },
      { name: '솔라나 (SOL)', price: '$145.20', change: '-0.8%', isUp: false, desc: '단기 급등에 따른 차익 실현 매물 출회' },
    ],
    '디파이 (DeFi)': [
      { name: '체인링크 (LINK)', price: '$18.50', change: '+4.2%', isUp: true, desc: 'RWA(실물자산 토큰화) 테마 주도' },
      { name: '유니스왑 (UNI)', price: '$11.20', change: '-2.1%', isUp: false, desc: 'SEC 규제 우려로 투자 심리 위축' },
      { name: '메이커 (MKR)', price: '$2,850.00', change: '+1.5%', isUp: true, desc: '프로토콜 수익 급증에 따른 토큰 소각' },
    ],
    '밈 코인 (Meme)': [
      { name: '도지코인 (DOGE)', price: '$0.15', change: '+8.5%', isUp: true, desc: '일론 머스크의 X(트위터) 결제 도입 루머' },
      { name: '페페 (PEPE)', price: '$0.000008', change: '+15.2%', isUp: true, desc: '바이낸스 상장 이후 거래량 폭발' },
      { name: '시바이누 (SHIB)', price: '$0.00002', change: '-1.2%', isUp: false, desc: '과열 양상 진정 후 조정을 받는 중' },
    ]
  }

  const dominanceData = [
    { name: 'BTC', value: 54.2, color: '#f59e0b' },
    { name: 'ETH', value: 16.8, color: '#6366f1' },
    { name: 'USDT', value: 5.1, color: '#10b981' },
    { name: 'BNB', value: 3.5, color: '#facc15' },
    { name: 'SOL', value: 3.1, color: '#14b8a6' },
    { name: 'Others', value: 17.3, color: 'var(--border-color)' },
  ];

  const tabs = ['전체 현황', ...Object.keys(cryptoData)]

  return (
    <div>
      <h1 className="page-title">가상자산 (Crypto)</h1>
      <div className="text-secondary" style={{ marginBottom: '1.5rem' }}>글로벌 유동성의 선행 지표 역할을 하는 주요 가상자산 동향입니다. (24/7 거래)</div>
      
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
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {/* Left Col: Fear & Greed, Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ marginBottom: 0 }}>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Flame size={20} color="var(--negative-color)" /> 공포/탐욕 지수 (Fear & Greed)
                </h2>
                <div className="flex-between">
                  <span className="text-4xl" style={{ fontWeight: 'bold', color: 'var(--negative-color)' }}>74</span>
                  <span className="badge negative" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>탐욕 (Greed)</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '1rem' }}>* 극단적 탐욕(80 이상) 진입 전 단계로 차익 실현 주의 구간입니다.</div>
              </div>
              
              <div className="card" style={{ marginBottom: 0 }}>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="var(--positive-color)" /> 비트코인 현물 ETF 자금 동향
                </h2>
                <div className="flex-between">
                  <span className="text-2xl" style={{ fontWeight: 'bold', color: 'var(--positive-color)' }}>+$125M</span>
                  <span className="badge positive">순유입</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>최근 3영업일 연속 블랙록(IBIT) 중심으로 자금 유입 중</div>
              </div>
            </div>

            {/* Right Col: Dominance Chart */}
            <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={20} color="var(--accent-color)" /> 암호화폐 도미넌스 (시가총액 비중)
              </h2>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dominanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dominanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `${value}%`}
                      contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                {dominanceData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: d.color }}></div>
                    <span className="text-secondary">{d.name}</span>
                    <span style={{ fontWeight: 'bold' }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <h2 className="page-title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="var(--negative-color)" /> 최근 24시간 대규모 청산 맵 (선물)
          </h2>
          <div className="card" style={{ backgroundColor: 'var(--negative-bg)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <div className="flex-between">
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--negative-color)' }}>롱(Long) 포지션 대거 청산</h3>
                <p className="text-secondary" style={{ margin: 0, fontSize: '0.875rem' }}>비트코인 62K 이탈 시 5억 달러 규모의 롱 포지션 연쇄 청산(스퀴즈)이 발생했습니다.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--negative-color)' }}>$520M</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Total Liquidations</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid-3" style={{ marginTop: '1.5rem' }}>
          {cryptoData[activeTab].map((item, idx) => (
            <div key={idx} className="card clickable" onClick={() => setSelectedItem({ name: item.name, value: item.price })}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                <span className={`badge ${item.isUp ? 'positive' : 'negative'}`}>{item.change}</span>
              </div>
              <div className="text-2xl" style={{ marginBottom: '1rem' }}>{item.price}</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <ChartModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />
    </div>
  )
}
