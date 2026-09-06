import React, { useState, useEffect, useRef } from 'react'
import { LineChart, Line, AreaChart, Area, YAxis, ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from 'recharts'
import { RefreshCw, BarChart2, TrendingUp, Info } from 'lucide-react'
import ChartModal from '../components/ChartModal'
import FearGreedGauge from '../components/FearGreedGauge'
import SurgingLeadersCard from '../components/SurgingLeadersCard'
import DashboardSubNav from '../components/DashboardSubNav'
import { getQuotes, getChartData, getFearGreedIndex } from '../api'

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
      { name: 'AAPL', symbol: 'AAPL', size: 320, change: 1.2 },
      { name: 'MSFT', symbol: 'MSFT', size: 310, change: -0.5 },
      { name: 'NVDA', symbol: 'NVDA', size: 300, change: 3.1 },
      { name: 'AMZN', symbol: 'AMZN', size: 210, change: 0.8 },
      { name: 'GOOGL', symbol: 'GOOGL', size: 190, change: 0.5 },
      { name: 'META', symbol: 'META', size: 160, change: -1.2 },
      { name: 'BRK.B', symbol: 'BRK-B', size: 110, change: 0.2 },
      { name: 'LLY', symbol: 'LLY', size: 95, change: 2.5 },
      { name: 'AVGO', symbol: 'AVGO', size: 90, change: -2.1 },
      { name: 'TSLA', symbol: 'TSLA', size: 90, change: 1.5 },
      { name: 'JPM', symbol: 'JPM', size: 85, change: 0.6 },
      { name: 'WMT', symbol: 'WMT', size: 80, change: 0.4 },
      { name: 'V', symbol: 'V', size: 75, change: 0.8 },
      { name: 'UNH', symbol: 'UNH', size: 70, change: -0.3 },
      { name: 'XOM', symbol: 'XOM', size: 65, change: -0.7 },
      { name: 'MA', symbol: 'MA', size: 65, change: 0.5 },
      { name: 'COST', symbol: 'COST', size: 60, change: 0.9 },
      { name: 'JNJ', symbol: 'JNJ', size: 60, change: -0.2 },
      { name: 'HD', symbol: 'HD', size: 55, change: 0.3 },
      { name: 'PG', symbol: 'PG', size: 50, change: 0.1 },
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
      { name: 'NVDA', symbol: 'NVDA', size: 300, change: 3.1 },
      { name: 'MSFT', symbol: 'MSFT', size: 290, change: -0.5 },
      { name: 'AAPL', symbol: 'AAPL', size: 280, change: 1.2 },
      { name: 'AMZN', symbol: 'AMZN', size: 200, change: 0.8 },
      { name: 'GOOGL', symbol: 'GOOGL', size: 180, change: 0.5 },
      { name: 'META', symbol: 'META', size: 160, change: -1.2 },
      { name: 'AVGO', symbol: 'AVGO', size: 120, change: -2.1 },
      { name: 'TSLA', symbol: 'TSLA', size: 110, change: 1.5 },
      { name: 'COST', symbol: 'COST', size: 85, change: 0.8 },
      { name: 'AMD', symbol: 'AMD', size: 80, change: -1.5 },
      { name: 'ASML', symbol: 'ASML', size: 80, change: 2.0 },
      { name: 'NFLX', symbol: 'NFLX', size: 75, change: 4.2 },
      { name: 'QCOM', symbol: 'QCOM', size: 75, change: 1.1 },
      { name: 'PEP', symbol: 'PEP', size: 65, change: 0.1 },
      { name: 'ADBE', symbol: 'ADBE', size: 65, change: -0.9 },
      { name: 'CSCO', symbol: 'CSCO', size: 60, change: -0.5 },
      { name: 'INTC', symbol: 'INTC', size: 55, change: -2.4 },
      { name: 'AMAT', symbol: 'AMAT', size: 50, change: 1.8 },
      { name: 'INTU', symbol: 'INTU', size: 48, change: 0.7 },
      { name: 'ISRG', symbol: 'ISRG', size: 45, change: 1.3 },
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
      { name: 'UNH', symbol: 'UNH', size: 110, change: 0.5 },
      { name: 'GS', symbol: 'GS', size: 100, change: -1.2 },
      { name: 'MSFT', symbol: 'MSFT', size: 95, change: -0.5 },
      { name: 'HD', symbol: 'HD', size: 90, change: 1.1 },
      { name: 'CAT', symbol: 'CAT', size: 85, change: 2.3 },
      { name: 'CRM', symbol: 'CRM', size: 80, change: -0.8 },
      { name: 'MCD', symbol: 'MCD', size: 75, change: 0.4 },
      { name: 'V', symbol: 'V', size: 75, change: 1.5 },
      { name: 'AMGN', symbol: 'AMGN', size: 70, change: 0.2 },
      { name: 'IBM', symbol: 'IBM', size: 70, change: 1.4 },
      { name: 'AXP', symbol: 'AXP', size: 65, change: 0.8 },
      { name: 'BA', symbol: 'BA', size: 60, change: -3.2 },
      { name: 'TRV', symbol: 'TRV', size: 60, change: 0.2 },
      { name: 'AAPL', symbol: 'AAPL', size: 58, change: 1.2 },
      { name: 'JPM', symbol: 'JPM', size: 55, change: 0.6 },
      { name: 'WMT', symbol: 'WMT', size: 55, change: 0.4 },
      { name: 'CVX', symbol: 'CVX', size: 50, change: -0.5 },
      { name: 'JNJ', symbol: 'JNJ', size: 48, change: -0.2 },
      { name: 'PG', symbol: 'PG', size: 45, change: 0.1 },
      { name: 'DIS', symbol: 'DIS', size: 40, change: 1.0 },
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
      { name: '삼성전자', symbol: '005930.KS', size: 450, change: 1.2 },
      { name: 'SK하이닉스', symbol: '000660.KS', size: 240, change: 3.5 },
      { name: 'LG에너지솔루션', symbol: '373220.KS', size: 150, change: -2.1 },
      { name: '삼성바이오로직스', symbol: '207940.KS', size: 110, change: 0.5 },
      { name: '현대차', symbol: '005380.KS', size: 110, change: 4.2 },
      { name: '기아', symbol: '000270.KS', size: 85, change: 2.8 },
      { name: '셀트리온', symbol: '068270.KS', size: 85, change: -1.5 },
      { name: 'KB금융', symbol: '105560.KS', size: 75, change: 1.1 },
      { name: 'POSCO홀딩스', symbol: '005490.KS', size: 70, change: -0.8 },
      { name: 'NAVER', symbol: '035420.KS', size: 65, change: -0.5 },
      { name: '신한지주', symbol: '055550.KS', size: 60, change: 0.8 },
      { name: '현대모비스', symbol: '012330.KS', size: 55, change: 1.5 },
      { name: '삼성SDI', symbol: '006400.KS', size: 55, change: -1.2 },
      { name: '하나금융지주', symbol: '086790.KS', size: 50, change: 0.6 },
      { name: '카카오', symbol: '035720.KS', size: 48, change: -0.7 },
      { name: '포스코퓨처엠', symbol: '003670.KS', size: 45, change: -1.8 },
      { name: 'HD현대중공업', symbol: '329180.KS', size: 45, change: 2.4 },
      { name: '한화에어로스페이스', symbol: '012450.KS', size: 42, change: 3.1 },
      { name: '두산에너빌리티', symbol: '034020.KS', size: 40, change: 1.9 },
      { name: 'LG전자', symbol: '066570.KS', size: 38, change: 0.5 },
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
      { name: '알테오젠', symbol: '196170.KQ', size: 220, change: 4.2 },
      { name: '에코프로비엠', symbol: '247540.KQ', size: 180, change: -3.5 },
      { name: '에코프로', symbol: '086520.KQ', size: 140, change: -2.8 },
      { name: 'HLB', symbol: '028300.KQ', size: 120, change: -1.5 },
      { name: '리가켐바이오', symbol: '141080.KQ', size: 90, change: 2.5 },
      { name: '엔켐', symbol: '348370.KQ', size: 85, change: 2.1 },
      { name: '휴젤', symbol: '145020.KQ', size: 75, change: 1.8 },
      { name: '클래시스', symbol: '214150.KQ', size: 70, change: 3.1 },
      { name: '리노공업', symbol: '058470.KQ', size: 65, change: 1.5 },
      { name: '삼천당제약', symbol: '000250.KQ', size: 60, change: -1.2 },
      { name: '셀트리온제약', symbol: '068760.KQ', size: 58, change: -0.8 },
      { name: 'HPSP', symbol: '403870.KQ', size: 55, change: 0.5 },
      { name: '레인보우로보틱스', symbol: '277810.KQ', size: 50, change: -1.2 },
      { name: '파마리서치', symbol: '214450.KQ', size: 48, change: 1.6 },
      { name: '이오테크닉스', symbol: '039030.KQ', size: 45, change: 0.9 },
      { name: '원익IPS', symbol: '240810.KQ', size: 42, change: -0.4 },
      { name: '동진쎄미켐', symbol: '005290.KQ', size: 40, change: 1.1 },
      { name: '에스엠', symbol: '041510.KQ', size: 38, change: -1.0 },
      { name: 'JYP Ent.', symbol: '035900.KQ', size: 36, change: -0.6 },
      { name: '펄어비스', symbol: '263750.KQ', size: 35, change: 0.3 },
    ]
  }
}

const TreemapCell = (props) => {
  const { x, y, width, height, name, change } = props;
  const isUp = change > 0;
  
  const intensity = Math.min(Math.abs(change) / 5, 1); 
  const hue = isUp ? 0 : 217;
  const saturation = 40 + (intensity * 60);
  const lightness = isUp ? 65 - (intensity * 15) : 70 - (intensity * 15);
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
      {width > 35 && height > 22 ? (
        <text 
          x={x + width / 2} 
          y={y + height / 2} 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize={width > 70 && height > 40 ? 12 : 10} 
          fontWeight="500" 
          pointerEvents="none"
          style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.6)' }}
        >
          {height > 34 ? (
            <>
              <tspan x={x + width / 2} dy="-0.2em">{name}</tspan>
              <tspan x={x + width / 2} dy="1.3em" fontSize={9} fontWeight="normal" fill="rgba(255,255,255,0.92)">
                {change > 0 ? '+' : ''}{change}%
              </tspan>
            </>
          ) : (
            <tspan x={x + width / 2} dy="0.3em">{name}</tspan>
          )}
        </text>
      ) : null}
    </g>
  );
};

export default function MarketOverview() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState('코스피')
  const [lastUpdated, setLastUpdated] = useState('방금 전')
  const [isUpdating, setIsUpdating] = useState(false)
  const [detailedDataState, setDetailedDataState] = useState(detailedData)
  const [fearGreedData, setFearGreedData] = useState(null)

  const [marketCards, setMarketCards] = useState([
    { name: 'S&P 500', symbol: '^GSPC', value: 5864.67, changeStr: '+0.40%', isUp: true, sparkline: generateSparkline(true) },
    { name: '나스닥', symbol: '^IXIC', value: 18342.94, changeStr: '+0.63%', isUp: true, sparkline: generateSparkline(true) },
    { name: '다우존스', symbol: '^DJI', value: 42863.86, changeStr: '-0.12%', isUp: false, sparkline: generateSparkline(false) },
    { name: '코스피', symbol: '^KS11', value: 2596.91, changeStr: '+0.25%', isUp: true, sparkline: generateSparkline(true) },
    { name: '코스닥', symbol: '^KQ11', value: 770.98, changeStr: '-0.35%', isUp: false, sparkline: generateSparkline(false) }
  ])

  const availableIndices = ['S&P 500', '나스닥', '다우존스', '코스피', '코스닥']
  const currentData = detailedDataState[selectedIndex] || detailedDataState['코스피']

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const symbols = ['^GSPC', '^IXIC', '^DJI', '^KS11', '^KQ11']
      const quotes = await getQuotes(symbols)
      
      const fgResult = await getFearGreedIndex()
      if (fgResult) setFearGreedData(fgResult)

      if (quotes && quotes.length > 0) {
        setMarketCards(prev => prev.map(card => {
          const q = quotes.find(item => item.symbol === card.symbol)
          if (!q) return card
          const val = q.regularMarketPrice || card.value
          const chg = q.regularMarketChangePercent || 0
          const isUp = chg >= 0
          const changeStr = `${isUp ? '+' : ''}${chg.toFixed(2)}%`
          return {
            ...card,
            value: val,
            changeStr: changeStr,
            isUp: isUp,
            sparkline: card.sparkline
          }
        }))
      }

      // Fetch actual 1mo chart candles for sparklines
      Promise.all(symbols.map(sym => getChartData(sym, '1d', '1mo'))).then(results => {
        setMarketCards(prev => prev.map((card, idx) => {
          const chartData = results[idx]
          if (chartData && chartData.length > 3) {
            const sparkline = chartData.map(c => ({ value: c.close || c.value || 0 }))
            return { ...card, sparkline }
          }
          return card
        }))
      }).catch(err => console.warn('Market sparkline fetch error:', err))

      // Update Heatmap stocks
      const allStockSymbols = Object.values(detailedData)
        .flatMap(idxObj => idxObj.heatmap.map(h => h.symbol))
        .filter(Boolean)
      const uniqueStockSymbols = [...new Set(allStockSymbols)]
      
      const stockQuotes = await getQuotes(uniqueStockSymbols)
      if (stockQuotes && stockQuotes.length > 0) {
        const quoteMap = {}
        stockQuotes.forEach(q => {
          if (q.symbol) quoteMap[q.symbol] = q
        })

        setDetailedDataState(prev => {
          const nextState = { ...prev }
          for (const [idxName, idxData] of Object.entries(nextState)) {
            const nextHeatmap = idxData.heatmap.map(item => {
              const q = quoteMap[item.symbol]
              if (q && typeof q.regularMarketChangePercent === 'number') {
                return {
                  ...item,
                  change: parseFloat(q.regularMarketChangePercent.toFixed(1))
                }
              }
              return item
            })
            nextState[idxName] = { ...idxData, heatmap: nextHeatmap }
          }
          return nextState
        })
      }

      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
    } catch (e) {
      console.error('Update failed:', e)
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    handleUpdate()
  }, [])

  return (
    <div>
      {/* 상단 서브 내비게이션 바 (AI 분석 ↔ 실시간 시황) */}
      <DashboardSubNav activeTab="market" />

      {/* 헤더 & 업데이트 버튼 */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={24} style={{ color: 'var(--accent-color, #3b82f6)' }} />
            <span>실시간 글로벌 & 국내 종합 시황</span>
          </h1>
          <p className="text-secondary" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
            5대 주요 지수, 주도주 및 급등 섹터, 시총 비중 히트맵 실시간 모니터링
          </p>
        </div>

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
            {isUpdating ? '업데이트 중...' : '시황 실시간 새로고침'}
          </button>
        </div>
      </div>

      {/* 5대 지수 실시간 카드 (스파크라인 포함) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        {marketCards.map((data, idx) => (
          <div 
            key={idx} 
            className="card clickable" 
            style={{ 
              position: 'relative', 
              overflow: 'hidden', 
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '115px'
            }}
            onClick={() => setSelectedItem({ name: data.name, symbol: data.symbol, value: String(data.value) })}
          >
            <div>
              <div className="text-secondary" style={{ marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: '500' }}>
                {data.name}
              </div>
              <div className="text-xl" style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
                {data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`badge ${data.isUp ? 'positive' : 'negative'}`} style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
                {data.changeStr}
              </div>
            </div>
            
            {/* 1개월 실시간 차트 변동성 스파크라인 */}
            <div style={{ position: 'absolute', right: '0.75rem', bottom: '0.75rem', width: '95px', height: '46px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.sparkline} margin={{ top: 2, bottom: 2, left: 1, right: 1 }}>
                  <defs>
                    <linearGradient id={`grad-spark-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={data.isUp ? 'var(--positive-color)' : 'var(--negative-color)'} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={data.isUp ? 'var(--positive-color)' : 'var(--negative-color)'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <YAxis 
                    hide 
                    domain={['dataMin', 'dataMax']} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={data.isUp ? 'var(--positive-color)' : 'var(--negative-color)'} 
                    strokeWidth={2} 
                    fill={`url(#grad-spark-${idx})`} 
                    isAnimationActive={false} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* 당일 시장 주도주 & 급등 섹터 랭킹 카드 */}
      <SurgingLeadersCard 
        detailedDataState={detailedDataState}
        onSelectStock={(stock) => setSelectedItem(stock)}
      />

      {/* 지수별 상세 분석 탭 헤더 */}
      <div className="flex-between" style={{ marginTop: '2rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="page-title" style={{ margin: 0, fontSize: '1.25rem' }}>시장별 정밀 데이터 분석</h2>
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
        {/* Left Column: Fear & Greed Gauge, Breadth, Sectors */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>{selectedIndex} 공포·탐욕 지수 & 시장 심리</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            {(() => {
              const currentFG = fearGreedData?.indices?.[selectedIndex] || {
                score: fearGreedData?.score || 36,
                sentiment: fearGreedData?.sentiment || '공포',
                previousClose: fearGreedData?.previousClose,
                previous1Week: fearGreedData?.previous1Week,
                vixName: currentData.vixName,
                vixValue: fearGreedData?.vix || currentData.vixValue,
                source: fearGreedData?.source || 'CNN 공식 실시간 지수'
              };
              return (
                <FearGreedGauge 
                  score={currentFG.score}
                  sentiment={currentFG.sentiment}
                  previousClose={currentFG.previousClose}
                  previous1Week={currentFG.previous1Week}
                  vixName={currentFG.vixName}
                  vixValue={currentFG.vix}
                  source={`${selectedIndex} · ${currentFG.source}`}
                />
              );
            })()}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentData.sectors.map((sec, i) => (
              <div key={i} className="flex-between clickable" onClick={() => setSelectedItem({ name: `${selectedIndex} ${sec.name} 섹터`, value: sec.change })} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>{sec.name}</span>
                <span className={`badge ${sec.isUp ? 'positive' : 'negative'}`}>{sec.change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Heatmap & Spotlight */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ margin: 0 }}>{selectedIndex} 시장 히트맵</h2>
            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>시가총액 비중 반영</span>
          </div>

          <div style={{ width: '100%', height: 320, backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={currentData.heatmap}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="var(--surface-color)"
                content={<TreemapCell />}
                onClick={(node) => {
                  if (node && node.name) {
                    setSelectedItem({
                      name: node.name,
                      symbol: node.symbol,
                      value: `${node.change > 0 ? '+' : ''}${node.change}%`,
                      size: node.size,
                    });
                  }
                }}
              >
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const totalSize = currentData.heatmap.reduce((acc, cur) => acc + (cur.size || 0), 0);
                      const weightPercent = totalSize > 0 ? ((data.size / totalSize) * 100).toFixed(1) : '0.0';
                      return (
                        <div style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                          <div style={{ fontWeight: 'bold' }}>{data.name} ({data.symbol})</div>
                          <div style={{ color: data.change > 0 ? 'var(--positive-color)' : 'var(--negative-color)', marginTop: '0.25rem' }}>
                            등락률: {data.change > 0 ? '+' : ''}{data.change}%
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
                            시총 비중: {weightPercent}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              실시간 시장 스팟라이트: {currentData.heatmap[0].name} ({currentData.heatmap[0].symbol})
            </h3>
            {(() => {
              const leader = currentData.heatmap[0];
              const totalSize = currentData.heatmap.reduce((acc, cur) => acc + (cur.size || 0), 0);
              const leaderWeight = totalSize > 0 ? ((leader.size / totalSize) * 100).toFixed(1) : '0.0';
              return (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  현재 {selectedIndex} 지수 내 최대 비중(약 {leaderWeight}%)을 차지하는 <strong>{leader.name}</strong> 종목이 
                  전일 대비 <span style={{ color: leader.change > 0 ? 'var(--positive-color)' : 'var(--negative-color)', fontWeight: 'bold' }}>{leader.change > 0 ? '+' : ''}{leader.change}%</span> 변동하며 
                  지수 흐름을 견인하고 있습니다.
                </div>
              );
            })()}
            <button 
              className="badge neutral clickable" 
              style={{ marginTop: '0.75rem', display: 'inline-flex', padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)' }}
              onClick={() => setSelectedItem({
                name: currentData.heatmap[0].name,
                symbol: currentData.heatmap[0].symbol,
                value: `${currentData.heatmap[0].change > 0 ? '+' : ''}${currentData.heatmap[0].change}%`,
                size: currentData.heatmap[0].size
              })}
            >
              종목 상세 차트 보기
            </button>
          </div>
        </div>
      </div>

      {/* 종목 상세 차트 모달 */}
      <ChartModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  )
}
