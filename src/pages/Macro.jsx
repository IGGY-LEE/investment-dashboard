import React, { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ChartModal from '../components/ChartModal'
import { getQuotes } from '../api'

const gdpData = [
  { quarter: '23Q1', value: 2.2 },
  { quarter: '23Q2', value: 2.1 },
  { quarter: '23Q3', value: 4.9 },
  { quarter: '23Q4', value: 3.4 },
  { quarter: '24Q1', value: 1.6 },
  { quarter: '24Q2', value: 2.8 },
]

const cpiData = [
  { month: '2월', value: 3.2 },
  { month: '3월', value: 3.5 },
  { month: '4월', value: 3.4 },
  { month: '5월', value: 3.3 },
  { month: '6월', value: 3.0 },
  { month: '7월', value: 2.9 },
]

const us10yData = [
  { month: '2월', value: 4.15 },
  { month: '3월', value: 4.20 },
  { month: '4월', value: 4.70 },
  { month: '5월', value: 4.55 },
  { month: '6월', value: 4.35 },
  { month: '7월', value: 4.25 },
]

const dxyData = [
  { month: '2월', value: 103.5 },
  { month: '3월', value: 104.2 },
  { month: '4월', value: 106.1 },
  { month: '5월', value: 105.3 },
  { month: '6월', value: 104.8 },
  { month: '7월', value: 104.2 },
]

export default function Macro() {
  const [selectedItem, setSelectedItem] = useState(null)

  const [yields, setYields] = useState([
    { name: '미국 국채 30년물', symbol: '^TYX', value: '0', change: '0.00', flash: null },
    { name: '미국 국채 10년물', symbol: '^TNX', value: '0', change: '0.00', flash: null },
    { name: '미국 국채 5년물', symbol: '^FVX', value: '0', change: '0.00', flash: null },
    { name: '미국 단기채 13주', symbol: '^IRX', value: '0', change: '0.00', flash: null },
  ])

  const baseRates = [
    { name: '미국 (연준 FOMC)', value: '5.50%', change: '동결', isMacroChart: true },
    { name: '한국 (한국은행 금통위)', value: '3.50%', change: '동결', isMacroChart: true },
    { name: '유로존 (유럽중앙은행 ECB)', value: '4.25%', change: '-0.25%p', isMacroChart: true },
    { name: '일본 (일본은행 BOJ)', value: '0.10%', change: '동결' },
  ]

  const [volatilityIndices, setVolatilityIndices] = useState([
    { name: 'VIX (S&P 500 변동성)', symbol: '^VIX', value: '0', change: '0.00', flash: null },
    { name: '유로 스톡스 변동성', symbol: '^V2TX', value: '0', change: '0.00', flash: null },
    { name: 'CBOE 10년물 국채 변동성', symbol: '^TYVIX', value: '0', change: '0.00', flash: null },
  ])

  const macroIndicators = [
    { name: '달러 인덱스 (DXY)', symbol: 'DX-Y.NYB', value: '104.20', change: '+0.15' },
    { name: '미국 10년 BEI (기대인플레이션)', value: '2.35%', change: '+0.02%', isMacroChart: true },
    { name: '연준 역레포(Reverse Repo) 잔고', value: '485B', change: '-12B', isMacroChart: true },
    { name: '미국 장단기 금리차 (10년-2년)', value: '-0.35%', change: '+0.04%', isMacroChart: true },
  ]

  const [futures, setFutures] = useState([
    { name: 'S&P 500 선물', symbol: 'ES=F', value: '0', change: '0.00', flash: null },
    { name: '다우존스 선물', symbol: 'YM=F', value: '0', change: '0.00', flash: null },
    { name: '나스닥 100 선물', symbol: 'NQ=F', value: '0', change: '0.00', flash: null },
    { name: '러셀 2000 선물', symbol: 'RTY=F', value: '0', change: '0.00', flash: null },
    { name: '국제 유가 (WTI)', symbol: 'CL=F', value: '0', change: '0.00', flash: null },
    { name: '금 선물', symbol: 'GC=F', value: '0', change: '0.00', flash: null },
  ])

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const fetchRealData = async () => {
      const symbols = [
        ...yields.map(i => i.symbol),
        ...volatilityIndices.map(i => i.symbol),
        ...futures.map(i => i.symbol)
      ];
      
      const quotes = await getQuotes(symbols);
      if (!isMountedRef.current || quotes.length === 0) return;

      const updateState = (setter) => {
        setter(prev => prev.map(item => {
          const quote = quotes.find(q => q.symbol === item.symbol);
          if (!quote) return item;

          const newPrice = quote.regularMarketPrice || parseFloat(item.value);
          const changeVal = quote.regularMarketChange || 0;
          const isUp = changeVal >= 0;
          
          let formattedValue = newPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4});
          if (item.symbol.startsWith('^TYX') || item.symbol.startsWith('^TNX')) {
             formattedValue += '%';
          }
          
          let flash = null;
          if (item.value !== '0' && parseFloat(item.value) !== newPrice) {
            flash = newPrice > parseFloat(item.value) ? 'flash-up' : 'flash-down';
          }
          
          return { 
            ...item, 
            value: formattedValue, 
            change: `${isUp ? '+' : ''}${changeVal.toFixed(2)}`, 
            flash 
          };
        }));
      };

      updateState(setYields);
      updateState(setVolatilityIndices);
      updateState(setFutures);
      
      setTimeout(() => {
        if (isMountedRef.current) {
          const clearFlash = (setter) => setter(prev => prev.map(item => ({ ...item, flash: null })));
          clearFlash(setYields);
          clearFlash(setVolatilityIndices);
          clearFlash(setFutures);
        }
      }, 1000);
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 10000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    }
  }, []);

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  return (
    <div>
      <h1 className="page-title">매크로 및 지수 선물</h1>
      
      <div className="grid-2">
        <div className="card">
          <h2 className="card-title">주요 채권 금리</h2>
          <table className="data-table">
            <tbody>
              {yields.map((item, idx) => (
                <tr key={idx} className={`clickable ${item.flash || ''}`} onClick={() => setSelectedItem(item)} style={{ transition: 'background-color 0.3s' }}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value === '0' ? '로딩중...' : item.value}</td>
                  <td className={item.change.startsWith('+') ? 'text-positive' : item.change.startsWith('-') ? 'text-negative' : 'text-secondary'}>{item.change}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="card-title" style={{ marginTop: '2rem' }}>주요국 기준금리</h2>
          <table className="data-table">
            <tbody>
              {baseRates.map((item, idx) => (
                <tr key={idx} className="clickable" onClick={() => setSelectedItem(item)}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value}</td>
                  <td className={item.change.includes('-') ? 'text-negative' : 'text-secondary'}>{item.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h2 className="card-title" style={{ marginTop: '2rem' }}>기타 매크로 지표</h2>
          <table className="data-table">
            <tbody>
              {macroIndicators.map((item, idx) => (
                <tr key={idx} className="clickable" onClick={() => setSelectedItem(item)}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value}</td>
                  <td className={item.change.startsWith('+') ? 'text-positive' : 'text-negative'}>{item.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="card-title">지수 선물 데이터</h2>
          <table className="data-table">
            <tbody>
              {futures.map((item, idx) => (
                <tr key={idx} className={`clickable ${item.flash || ''}`} onClick={() => setSelectedItem(item)} style={{ transition: 'background-color 0.3s' }}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value === '0' ? '로딩중...' : item.value}</td>
                  <td className={item.change.startsWith('+') ? 'text-positive' : item.change.startsWith('-') ? 'text-negative' : 'text-secondary'}>{item.change}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="card-title" style={{ marginTop: '2rem' }}>시장 변동성 및 위험 지표</h2>
          <table className="data-table">
            <tbody>
              {volatilityIndices.map((item, idx) => (
                <tr key={idx} className={`clickable ${item.flash || ''}`} onClick={() => setSelectedItem(item)} style={{ transition: 'background-color 0.3s' }}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value === '0' ? '로딩중...' : item.value}</td>
                  <td className={item.change.startsWith('+') ? 'text-negative' : item.change.startsWith('-') ? 'text-positive' : 'text-secondary'}>
                    {/* 변동성은 오르면 안 좋은 것이므로 색상 반전 처리 */}
                    {item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          

        </div>
      </div>

      {/* 굵직한 거시경제 지표 차트 */}
      <h2 className="page-title" style={{ marginTop: '2rem', fontSize: '1.25rem' }}>주요 거시경제 지표 추이</h2>
      <div className="grid-2">
        <div className="card clickable" onClick={() => setSelectedItem({ name: '미국 GDP 성장률 (연율)', value: '2.8' })}>
          <h2 className="card-title">미국 GDP 성장률 (연율, %)</h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gdpData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="quarter" stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="value" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card clickable" onClick={() => setSelectedItem({ name: '미국 소비자물가지수 (CPI, YoY)', value: '2.9' })}>
          <h2 className="card-title">미국 소비자물가지수 (CPI, YoY %)</h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpiData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="value" stroke="var(--negative-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card clickable" onClick={() => setSelectedItem({ name: '미국 10년물 국채 금리 추이', value: '4.25%', symbol: '^TNX' })}>
          <h2 className="card-title">미국 10년물 국채 금리 (%)</h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={us10yData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card clickable" onClick={() => setSelectedItem({ name: '달러 인덱스 (DXY) 추이', value: '104.2', symbol: 'DX-Y.NYB' })}>
          <h2 className="card-title">달러 인덱스 (DXY)</h2>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dxyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke={textColor} tick={{fill: textColor}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
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
