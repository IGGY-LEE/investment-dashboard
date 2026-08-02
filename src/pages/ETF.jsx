import React, { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Activity, DollarSign, X } from 'lucide-react'
import ChartModal from '../components/ChartModal'

export default function ETF() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeTab, setActiveTab] = useState('전체 현황')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newThemeName, setNewThemeName] = useState('')
  
  const [etfData, setEtfData] = useState({
    '주도 테마 (AI/반도체)': [
      { name: 'SOXX (미국 반도체 ETF)', price: '$225.50', change: '+3.2%', isUp: true, desc: '엔비디아 발 훈풍으로 사상 최고치 경신' },
      { name: 'BOTZ (로봇/AI ETF)', price: '$32.40', change: '+1.5%', isUp: true, desc: '산업용 로봇 수요 회복 기대감' },
      { name: 'CIBR (사이버보안 ETF)', price: '$58.10', change: '+0.8%', isUp: true, desc: '기업들의 IT 보안 투자 확대 수혜' },
    ],
    '수익 추구 (배당/리츠)': [
      { name: 'SCHD (미국 배당성장 ETF)', price: '$78.20', change: '+0.4%', isUp: true, desc: '안정적인 1분기 배당금 발표' },
      { name: 'JEPI (커버드콜 ETF)', price: '$56.40', change: '+0.1%', isUp: true, desc: '월배당 매력으로 개인 매수세 지속' },
      { name: 'VNQ (미국 리츠 ETF)', price: '$82.10', change: '-1.2%', isUp: false, desc: '상업용 부동산 공실률 리스크 잔존' },
    ],
    '안전 자산 (채권/금)': [
      { name: 'TLT (미국 20년 이상 장기채)', price: '$92.50', change: '-0.8%', isUp: false, desc: '연준 금리인하 지연 우려로 가격 하락' },
      { name: 'SHY (미국 1~3년 단기채)', price: '$81.30', change: '-0.1%', isUp: false, desc: '기준금리 동결에 따른 보합세' },
      { name: 'GLD (금 현물 ETF)', price: '$190.20', change: '+0.5%', isUp: true, desc: '중앙은행 매입 지속 및 인플레 헤지' },
    ]
  });

  const handleAddTheme = () => {
    if (!newThemeName.trim()) return;
    if (etfData[newThemeName]) {
      alert('이미 존재하는 테마입니다.');
      return;
    }
    setEtfData({
      ...etfData,
      [newThemeName]: [] // 빈 배열로 새 테마 생성
    });
    setNewThemeName('');
    setIsAddModalOpen(false);
    setActiveTab(newThemeName);
  };

  const tabs = ['전체 현황', ...Object.keys(etfData)];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>테마 및 ETF 트렌드</h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            시장의 스마트 머니(자금)가 어느 섹터로 집중되고 있는지 흐름을 추적합니다.
          </div>
        </div>
        <button 
          className="badge positive clickable" 
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} /> 관심 테마 추가
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
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={20} color="var(--accent-color)" /> 이번 주 글로벌 ETF 자금 유입 TOP 3
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: '500' }}>1. 미국 단기채 (SHV)</span>
                  <span className="text-positive" style={{ fontWeight: 'bold' }}>+$4.2B</span>
                </li>
                <li className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: '500' }}>2. 반도체 레버리지 (SOXL)</span>
                  <span className="text-positive" style={{ fontWeight: 'bold' }}>+$2.1B</span>
                </li>
                <li className="flex-between">
                  <span style={{ fontWeight: '500' }}>3. 인도 증시 (INDA)</span>
                  <span className="text-positive" style={{ fontWeight: 'bold' }}>+$1.5B</span>
                </li>
              </ul>
            </div>
            
            <div className="card">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--negative-color)" /> 이번 주 글로벌 ETF 자금 유출 TOP 3
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: '500' }}>1. 미국 장기채 (TLT)</span>
                  <span className="text-negative" style={{ fontWeight: 'bold' }}>-$3.1B</span>
                </li>
                <li className="flex-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: '500' }}>2. 중국 증시 (MCHI)</span>
                  <span className="text-negative" style={{ fontWeight: 'bold' }}>-$1.8B</span>
                </li>
                <li className="flex-between">
                  <span style={{ fontWeight: '500' }}>3. 글로벌 리츠 (VNQ)</span>
                  <span className="text-negative" style={{ fontWeight: 'bold' }}>-$1.2B</span>
                </li>
              </ul>
            </div>
          </div>
          
          <h2 className="page-title" style={{ fontSize: '1.25rem' }}>주요 테마별 대표 종목 요약</h2>
          <div className="grid-3">
            {Object.entries(etfData).map(([theme, items]) => {
              if (items.length === 0) return null;
              const rep = items[0]; // 대표 종목 1개만 표시
              return (
                <div key={theme} className="card clickable" onClick={() => setSelectedItem({ name: rep.name, value: rep.price })}>
                  <div className="badge neutral" style={{ marginBottom: '1rem', display: 'inline-block' }}>{theme}</div>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{rep.name}</span>
                    <span className={`badge ${rep.isUp ? 'positive' : 'negative'}`}>{rep.change}</span>
                  </div>
                  <div className="text-2xl">{rep.price}</div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '1.5rem' }}>
          {etfData[activeTab].length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div className="text-secondary" style={{ marginBottom: '1rem' }}>이 테마에는 아직 등록된 ETF가 없습니다.</div>
              <button 
                className="badge neutral clickable" 
                onClick={() => alert('백엔드 연동 시 종목 검색 및 추가 UI가 제공됩니다.')}
              >
                + 종목 검색하여 추가하기
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {etfData[activeTab].map((item, idx) => (
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
              
              <div 
                className="card clickable" 
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed var(--border-color)', backgroundColor: 'transparent' }}
                onClick={() => alert('백엔드 연동 시 종목 검색 및 추가 UI가 제공됩니다.')}
              >
                <div className="text-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={24} />
                  <span>이 테마에 ETF 추가</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Theme Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>관심 테마 추가</h2>
              <X size={20} className="clickable" onClick={() => setIsAddModalOpen(false)} color="var(--text-secondary)" />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>테마 이름</label>
              <input 
                type="text" 
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="예: 우주항공, 인도 증시, 비만 치료제 등"
                style={{ 
                  width: '100%', padding: '0.75rem', borderRadius: '0.5rem', 
                  border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)', outline: 'none'
                }}
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                className="badge neutral clickable" 
                style={{ padding: '0.5rem 1rem' }}
                onClick={() => setIsAddModalOpen(false)}
              >
                취소
              </button>
              <button 
                className="badge positive clickable" 
                style={{ padding: '0.5rem 1rem', border: 'none' }}
                onClick={handleAddTheme}
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      <ChartModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />
    </div>
  )
}
