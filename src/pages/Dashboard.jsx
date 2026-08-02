import React, { useState } from 'react'
import { LineChart, Line, ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from 'recharts'
import { RefreshCw } from 'lucide-react'
import ChartModal from '../components/ChartModal'

const generateSparkline = (isUp) => {
  let val = 100;
  return Array.from({length: 15}, () => {
    val += (Math.random() - (isUp ? 0.3 : 0.7)) * 5;
    return { value: val };
  })
}

// Dummy data generators per index
const detailedData = {
  'S&P 500': {
    vixName: 'VIX (변동성 지수)',
    vixValue: '13.75',
    sentiment: '극단적 탐욕 (Extreme Greed)',
    breadth: { name: '50일선 상회 종목 비율', value: '78.5%', status: '과매수 진입' },
    sectors: [
      { name: '기술 (Technology)', change: '+2.1%', isUp: true },
      { name: '통신 (Communication)', change: '+1.5%', isUp: true },
      { name: '헬스케어 (Healthcare)', change: '-0.5%', isUp: false },
      { name: '금융 (Financials)', change: '+0.8%', isUp: true },
    ],
    heatmap: [
      { name: 'AAPL', size: 300, change: 1.2 },
      { name: 'MSFT', size: 280, change: -0.5 },
      { name: 'NVDA', size: 250, change: 3.1 },
      { name: 'AMZN', size: 180, change: 0.8 },
      { name: 'META', size: 120, change: -1.2 },
      { name: 'GOOGL', size: 170, change: 0.5 },
      { name: 'BRK.B', size: 85, change: 0.2 },
      { name: 'LLY', size: 75, change: 2.5 },
      { name: 'AVGO', size: 60, change: -2.1 },
      { name: 'JPM', size: 55, change: 0.6 },
    ]
  },
  '나스닥': {
    vixName: 'VXN (나스닥 변동성)',
    vixValue: '15.20',
    sentiment: '탐욕 (Greed)',
    breadth: { name: '50일선 상회 종목 비율', value: '65.2%', status: '강세' },
    sectors: [
      { name: '반도체', change: '+3.2%', isUp: true },
      { name: '소프트웨어', change: '+1.8%', isUp: true },
      { name: '생명공학', change: '-1.1%', isUp: false },
    ],
    heatmap: [
      { name: 'NVDA', size: 250, change: 3.1 },
      { name: 'AMD', size: 150, change: -1.5 },
      { name: 'ASML', size: 100, change: 2.0 },
      { name: 'QCOM', size: 80, change: 1.1 },
      { name: 'INTC', size: 60, change: -2.4 },
      { name: 'TSLA', size: 130, change: -1.5 },
      { name: 'NFLX', size: 90, change: 4.2 },
      { name: 'PEP', size: 70, change: 0.1 },
      { name: 'COST', size: 85, change: 0.8 },
      { name: 'CSCO', size: 50, change: -0.5 },
    ]
  },
  '다우존스': {
    vixName: 'VXD (다우 변동성)',
    vixValue: '11.10',
    sentiment: '중립 (Neutral)',
    breadth: { name: '50일선 상회 종목 비율', value: '52.0%', status: '중립' },
    sectors: [
      { name: '산업재', change: '+0.5%', isUp: true },
      { name: '필수소비재', change: '+0.2%', isUp: true },
      { name: '금융', change: '-0.3%', isUp: false },
    ],
    heatmap: [
      { name: 'UNH', size: 100, change: 0.5 },
      { name: 'GS', size: 90, change: -1.2 },
      { name: 'MSFT', size: 280, change: -0.5 },
      { name: 'HD', size: 85, change: 1.1 },
      { name: 'CAT', size: 75, change: 2.3 },
      { name: 'CRM', size: 70, change: -0.8 },
      { name: 'MCD', size: 65, change: 0.4 },
      { name: 'V', size: 80, change: 1.5 },
      { name: 'BA', size: 50, change: -3.2 },
      { name: 'TRV', size: 40, change: 0.2 },
    ]
  },
  '코스피': {
    vixName: 'VKOSPI (코스피 변동성)',
    vixValue: '14.50',
    sentiment: '중립 (Neutral)',
    breadth: { name: '50일선 상회 종목 비율', value: '45.8%', status: '약세' },
    sectors: [
      { name: '반도체', change: '+1.5%', isUp: true },
      { name: '자동차', change: '+2.0%', isUp: true },
      { name: '2차전지', change: '-1.5%', isUp: false },
      { name: '금융', change: '+0.5%', isUp: true },
    ],
    heatmap: [
      { name: '삼성전자', size: 400, change: 1.2 },
      { name: 'SK하이닉스', size: 150, change: 3.5 },
      { name: 'LG에너지솔루션', size: 120, change: -2.1 },
      { name: '삼성바이오로직스', size: 80, change: 0.5 },
      { name: '현대차', size: 90, change: 4.2 },
      { name: '기아', size: 70, change: 2.8 },
      { name: '셀트리온', size: 60, change: -1.5 },
      { name: 'POSCO홀딩스', size: 55, change: -0.8 },
      { name: 'KB금융', size: 45, change: 1.1 },
      { name: 'NAVER', size: 40, change: -0.5 },
    ]
  },
  '코스닥': {
    vixName: '코스닥 변동성',
    vixValue: '18.30',
    sentiment: '공포 (Fear)',
    breadth: { name: '50일선 상회 종목 비율', value: '25.4%', status: '과매도 진입' },
    sectors: [
      { name: '제약/바이오', change: '-2.1%', isUp: false },
      { name: '엔터테인먼트', change: '-0.8%', isUp: false },
      { name: '반도체 소부장', change: '+1.2%', isUp: true },
    ],
    heatmap: [
      { name: '에코프로비엠', size: 150, change: -3.5 },
      { name: '알테오젠', size: 120, change: 4.2 },
      { name: '에코프로', size: 100, change: -2.8 },
      { name: 'HLB', size: 90, change: -1.5 },
      { name: '엔켐', size: 70, change: 2.1 },
      { name: '리노공업', size: 65, change: 1.5 },
      { name: '셀트리온제약', size: 60, change: -0.8 },
      { name: 'HPSP', size: 50, change: 0.5 },
      { name: '레인보우로보틱스', size: 45, change: -1.2 },
      { name: '클래시스', size: 40, change: 3.1 },
    ]
  }
}

const TreemapCell = (props) => {
  const { x, y, width, height, name, change } = props;
  const isUp = change > 0;
  
  // 5%를 최대 진하기로 설정 (0 ~ 1 사이의 값)
  const intensity = Math.min(Math.abs(change) / 5, 1); 
  
  // 검은색(투명도에 의한 배경 비침)이 섞이지 않도록 투명도(opacity) 대신 HSL의 채도(Saturation)와 명도(Lightness)를 조절
  // 한국 증시: 상승(빨강, Hue 0), 하락(파랑, Hue 217)
  const hue = isUp ? 0 : 217;
  
  // 변동폭이 클수록 채도는 높게(100%), 명도는 쨍하게(50%)
  // 변동폭이 적을수록 채도는 낮게(은은하게), 명도는 밝게(파스텔톤) 설정하여 절대 검은색이 되지 않도록 함
  const saturation = 40 + (intensity * 60); // 40% ~ 100%
  const lightness = isUp ? 65 - (intensity * 15) : 70 - (intensity * 15); // 은은한 톤(65~70%)에서 원색(50~55%)으로
  
  const bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: bgColor,
          stroke: 'var(--surface-color)',
          strokeWidth: 2,
          cursor: 'pointer',
        }}
      />
      {width > 45 && height > 30 ? (
        <text 
          x={x + width / 2} 
          y={y + height / 2} 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize={width > 80 ? 13 : 11} 
          fontWeight="500" 
          pointerEvents="none"
          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
        >
          <tspan x={x + width / 2} dy="-0.2em">{name}</tspan>
          <tspan x={x + width / 2} dy="1.4em" fontSize={10} fontWeight="normal" fill="rgba(255,255,255,0.9)">
            {change > 0 ? '+' : ''}{change}%
          </tspan>
        </text>
      ) : null}
    </g>
  );
};

export default function Dashboard() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('ko-KR'))
  
  // Single selected index for both Highlights and Heatmap
  const [selectedIndex, setSelectedIndex] = useState('S&P 500')
  
  const [topIndices, setTopIndices] = useState([
    { name: '코스피', value: 2667.70, changeStr: '-0.30%', isUp: false },
    { name: 'S&P 500', value: 5088.80, changeStr: '+1.20%', isUp: true },
    { name: '상해종합', value: 2977.02, changeStr: '+0.55%', isUp: true },
    { name: '원/달러', value: 1332.50, changeStr: '+2.00', isUp: true },
    { name: '나스닥', value: 15996.82, changeStr: '+1.55%', isUp: true },
    { name: '다우존스', value: 39131.53, changeStr: '+0.16%', isUp: true },
    { name: '닛케이', value: 39233.71, changeStr: '+2.10%', isUp: true },
  ])

  const [marketCards, setMarketCards] = useState([
    { name: 'S&P 500', value: 5088.80, changeStr: '+1.20%', isUp: true },
    { name: '나스닥 (NASDAQ)', value: 15996.82, changeStr: '+1.55%', isUp: true },
    { name: '다우존스 (Dow Jones)', value: 39131.53, changeStr: '+0.16%', isUp: true },
    { name: '코스피 (KOSPI)', value: 2667.70, changeStr: '-0.30%', isUp: false },
  ].map(d => ({ ...d, sparkline: generateSparkline(d.isUp) })))

  const handleUpdate = () => {
    setIsUpdating(true)
    setTimeout(() => {
      const scramble = (val) => val * (1 + (Math.random() - 0.5) * 0.004);
      
      setTopIndices(prev => prev.map(item => ({
        ...item,
        value: scramble(item.value)
      })))

      setMarketCards(prev => prev.map(item => {
        const newVal = scramble(item.value)
        const isUp = newVal > item.value ? true : newVal < item.value ? false : item.isUp;
        return {
          ...item,
          value: newVal,
          isUp,
          sparkline: [...item.sparkline.slice(1), { value: newVal }]
        }
      }))
      
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'))
      setIsUpdating(false)
    }, 800)
  }
  
  const currentData = detailedData[selectedIndex]
  const availableIndices = ['S&P 500', '나스닥', '다우존스', '코스피', '코스닥']

  return (
    <div>
      {/* Ticker Tape */}
      <div className="ticker-wrap" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex' }}>
          {topIndices.map((idx, i) => (
            <div key={i} className="ticker-item clickable" onClick={() => setSelectedItem({ name: idx.name, value: String(idx.value) })}>
              <span className="text-secondary" style={{ marginRight: '8px' }}>{idx.name}</span>
              <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{idx.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
              <span className={idx.isUp ? 'text-positive' : 'text-negative'}>{idx.changeStr}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>시장 요약</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
            마지막 업데이트: {lastUpdated}
          </span>
          <button 
            className={`badge neutral clickable`}
            onClick={handleUpdate}
            disabled={isUpdating}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }}
          >
            <RefreshCw size={14} className={isUpdating ? 'spin' : ''} />
            {isUpdating ? '업데이트 중...' : '실시간 업데이트'}
          </button>
        </div>
      </div>
      
      <div className="grid-4">
        {marketCards.map((data, idx) => (
          <div 
            key={idx} 
            className="card clickable" 
            style={{ marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}
            onClick={() => setSelectedItem({ name: data.name, value: String(data.value) })}
          >
            <div className="text-secondary" style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>{data.name}</div>
            <div className="text-xl">{data.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</div>
            <div className={`badge ${data.isUp ? 'positive' : 'negative'}`} style={{ marginTop: '0.5rem' }}>
              {data.changeStr}
            </div>
            
            <div style={{ position: 'absolute', right: '1rem', bottom: '1rem', width: '80px', height: '40px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sparkline}>
                  <Line type="monotone" dataKey="value" stroke={data.isUp ? 'var(--positive-color)' : 'var(--negative-color)'} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-between" style={{ marginTop: '2rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>상세 분석</h2>
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--surface-color)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          {availableIndices.map(idx => (
            <button 
              key={idx}
              className={`timeframe-btn ${selectedIndex === idx ? 'active' : ''}`}
              style={{ margin: 0, border: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
              onClick={() => setSelectedIndex(idx)}
            >
              {idx}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>오늘의 하이라이트</h2>
          
          <div className="clickable" onClick={() => setSelectedItem({ name: currentData.vixName, value: currentData.vixValue })} style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <div className="flex-between">
              <span style={{ fontWeight: '500' }}>{currentData.vixName}</span>
              <span className="text-xl">{currentData.vixValue}</span>
            </div>
            <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>시장 심리: {currentData.sentiment}</div>
          </div>
          
          <div className="clickable" onClick={() => setSelectedItem({ name: `시장 폭 (${currentData.breadth.name})`, value: currentData.breadth.value })} style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
            <div className="flex-between">
              <span style={{ fontWeight: '500' }}>{currentData.breadth.name}</span>
              <span className="text-xl" style={{ color: parseFloat(currentData.breadth.value) > 70 ? 'var(--negative-color)' : parseFloat(currentData.breadth.value) < 30 ? 'var(--positive-color)' : 'inherit' }}>
                {currentData.breadth.value}
              </span>
            </div>
            <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>시장 폭 상태: <span style={{ fontWeight: 'bold' }}>{currentData.breadth.status}</span></div>
          </div>
          
          <h3 className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>섹터별 등락</h3>
          {currentData.sectors.map((sector, idx) => (
            <div key={idx} className="flex-between clickable" onClick={() => setSelectedItem({ name: `${selectedIndex} ${sector.name} 섹터`, value: '100' })} style={{ padding: '0.75rem 0.5rem', borderRadius: '0.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <span>{sector.name}</span>
              <span className={sector.isUp ? 'text-positive' : 'text-negative'} style={{ fontWeight: 'bold' }}>{sector.change}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ margin: 0 }}>시장 맵 (Heatmap)</h2>
          </div>

          <div style={{ flex: 1, backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={currentData.heatmap}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                content={<TreemapCell />}
                isAnimationActive={false}
                onClick={(e) => {
                  if (e && e.name) setSelectedItem({ name: e.name, value: '100' });
                }}
              >
                <RechartsTooltip 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{ backgroundColor: 'var(--surface-color)', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.25rem' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{data.name}</div>
                          <div className={data.change > 0 ? 'text-positive' : 'text-negative'}>{data.change > 0 ? '+' : ''}{data.change}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ChartModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  )
}
