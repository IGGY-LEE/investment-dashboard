import React, { useState, useEffect } from 'react'
import { getQuotes } from '../api'
import ChartModal from '../components/ChartModal'

export default function Materials() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeTab, setActiveTab] = useState('전체')

  const [materials, setMaterials] = useState([
    // 에너지
    { name: 'WTI 원유', symbol: 'CL=F', price: '$78.50', change: '+1.2%', status: 'Backwardation', desc: '타이트한 단기 수급', group: '에너지' },
    { name: '브렌트유 (Brent)', symbol: 'BZ=F', price: '$82.30', change: '+1.1%', status: 'Backwardation', desc: '중동 지정학적 리스크', group: '에너지' },
    { name: '천연가스 (Natural Gas)', symbol: 'NG=F', price: '$1.85', change: '-2.5%', status: 'Contango', desc: '온화한 날씨로 수요 감소', group: '에너지' },
    // 귀금속
    { name: '금 (Gold)', symbol: 'GC=F', price: '$2,050.10', change: '-0.5%', status: 'Contango', desc: '안전자산 선호도 변화', group: '귀금속' },
    { name: '은 (Silver)', symbol: 'SI=F', price: '$22.80', change: '-1.2%', status: 'Contango', desc: '산업 수요 부진', group: '귀금속' },
    // 산업금속
    { name: '구리 (Copper)', symbol: 'HG=F', price: '$3.85', change: '+2.1%', status: 'Backwardation', desc: '중국 제조업 지표 호조', group: '산업금속' },
    // 해운/물류 & 공급망
    { name: '발틱운임 ETF (BDRY)', symbol: 'BDRY', price: '$14.20', change: '+2.1%', status: '물류 병목', desc: '글로벌 벌크선 운임 선물 추종', group: '해운/물류' },
    { name: '글로벌 해운 (ZIM)', symbol: 'ZIM', price: '$18.50', change: '+3.4%', status: '희망봉 우회', desc: '수에즈 우회에 따른 운임 마진 급증', group: '해운/물류' },
    { name: '구리/금 비율 (경기선행)', symbol: null, price: '1.68', change: '+0.8%', status: 'AI 전력망 강세', desc: '구리 수요 vs 안전자산 금 상대 강도', group: '해운/물류' },
    // 농산물
    { name: '대두 (Soybeans)', symbol: 'ZS=F', price: '$1,150.25', change: '-0.3%', status: 'Contango', desc: '남미 작황 양호', group: '농산물' },
    { name: '밀 (Wheat)', symbol: 'ZW=F', price: '$580.50', change: '+1.5%', status: 'Contango', desc: '흑해 지역 수출 우려', group: '농산물' },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const symbols = materials.map(m => m.symbol).filter(Boolean);
      const quotes = await getQuotes([...new Set(symbols)]);
      
      if (quotes.length > 0) {
        setMaterials(prev => prev.map(item => {
          const q = quotes.find(q => q.symbol === item.symbol);
          if (q) {
            let price = q.regularMarketPrice;
            let change = q.regularMarketChangePercent;
            
            // Format
            let priceStr = price.toLocaleString(undefined, {
              minimumFractionDigits: price < 10 ? 2 : 2,
              maximumFractionDigits: price < 10 ? 2 : 2
            });
            
            let changeStr = change.toFixed(2) + '%';
            if (change > 0) changeStr = '+' + changeStr;

            return {
              ...item,
              price: '$' + priceStr,
              change: changeStr,
              isUp: change >= 0
            };
          }
          return item;
        }));
      }
      setIsLoading(false);
    }
    
    fetchData();
  }, []);

  const tabs = ['전체', '에너지', '귀금속', '산업금속', '해운/물류', '농산물']
  
  const filteredMaterials = activeTab === '전체' 
    ? materials 
    : materials.filter(m => m.group === activeTab)

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>원자재 동향</h1>
        {isLoading && <div className="text-secondary" style={{ fontSize: '0.875rem' }}>실시간 업데이트 중...</div>}
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
              <div className={item.change.startsWith('+') || item.isUp ? 'text-positive' : 'text-negative'} style={{ alignSelf: 'flex-start' }}>
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
