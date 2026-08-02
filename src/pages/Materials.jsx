import React, { useState } from 'react'
import ChartModal from '../components/ChartModal'

export default function Materials() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeTab, setActiveTab] = useState('전체')

  const materials = [
    // 에너지
    { name: 'WTI 원유', price: '$78.50', change: '+1.2%', status: 'Backwardation', desc: '타이트한 단기 수급', group: '에너지' },
    { name: '브렌트유 (Brent)', price: '$82.30', change: '+1.1%', status: 'Backwardation', desc: '중동 지정학적 리스크', group: '에너지' },
    { name: '천연가스 (Natural Gas)', price: '$1.85', change: '-2.5%', status: 'Contango', desc: '온화한 날씨로 수요 감소', group: '에너지' },
    // 귀금속
    { name: '금 (Gold)', price: '$2,050.10', change: '-0.5%', status: 'Contango', desc: '안전자산 선호도 변화', group: '귀금속' },
    { name: '은 (Silver)', price: '$22.80', change: '-1.2%', status: 'Contango', desc: '산업 수요 부진', group: '귀금속' },
    // 산업금속
    { name: '구리 (Copper)', price: '$3.85', change: '+2.1%', status: 'Backwardation', desc: '중국 제조업 지표 호조', group: '산업금속' },
    { name: '알루미늄 (Aluminum)', price: '$2,230.00', change: '+0.8%', status: 'Contango', desc: '재고 증가세 둔화', group: '산업금속' },
    { name: '리튬 (Lithium Carbonate)', price: '95,500 CNY', change: '-0.5%', status: 'Contango', desc: '전기차 수요 둔화 여파', group: '산업금속' },
    // 농산물
    { name: '대두 (Soybeans)', price: '$1,150.25', change: '-0.3%', status: 'Contango', desc: '남미 작황 양호', group: '농산물' },
    { name: '밀 (Wheat)', price: '$580.50', change: '+1.5%', status: 'Contango', desc: '흑해 지역 수출 우려', group: '농산물' },
    // 핵심 비율
    { name: '금/구리 비율 (Gold/Copper Ratio)', price: '532.4', change: '-1.2%', status: '하락 추세', desc: '실물 경기 회복 시그널 (구리 강세)', group: '핵심 비율' },
    { name: '금/은 비율 (Gold/Silver Ratio)', price: '89.9', change: '+0.5%', status: '상승 추세', desc: '안전자산 쏠림 현상 심화', group: '핵심 비율' },
  ]

  const tabs = ['전체', '에너지', '귀금속', '산업금속', '농산물', '핵심 비율']
  
  const filteredMaterials = activeTab === '전체' 
    ? materials 
    : materials.filter(m => m.group === activeTab)

  return (
    <div>
      <h1 className="page-title">원자재 동향</h1>
      
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
      
      <div className="grid-3">
        {filteredMaterials.map((item, idx) => (
          <div 
            key={idx} 
            className="card clickable"
            onClick={() => setSelectedItem(item)}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
                  {item.group}
                </span>
                <div className="text-secondary">{item.name}</div>
              </div>
              <div className={item.change.startsWith('+') ? 'text-positive' : 'text-negative'} style={{ alignSelf: 'flex-start' }}>
                {item.change}
              </div>
            </div>
            
            <div className="text-2xl" style={{ marginBottom: '1.5rem', flex: 1 }}>{item.price}</div>
            
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem' }}>선물 곡선 상태</span>
                <span className={`badge ${item.status === 'Backwardation' ? 'positive' : 'neutral'}`}>
                  {item.status}
                </span>
              </div>
              <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ChartModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  )
}
