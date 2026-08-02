import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ChartModal from '../components/ChartModal'

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

  const yields = [
    { name: '미국 국채 30년물', value: '4.450%', change: '+0.040' },
    { name: '미국 국채 10년물', value: '4.250%', change: '+0.030' },
    { name: '미국 국채 2년물', value: '4.600%', change: '-0.010' },
    { name: '한국 국채 10년물', value: '3.620%', change: '+0.020' },
    { name: '한국 국채 3년물', value: '3.450%', change: '+0.015' },
  ]

  const baseRates = [
    { name: '미국 (연준 FED)', value: '5.50%', change: '동결' },
    { name: '한국 (한국은행 BOK)', value: '3.50%', change: '동결' },
    { name: '유로존 (유럽중앙은행 ECB)', value: '4.25%', change: '-0.25%p' },
    { name: '일본 (일본은행 BOJ)', value: '0.10%', change: '동결' },
  ]

  const volatilityIndices = [
    { name: 'VIX (S&P 500 변동성)', value: '14.25', change: '-1.10' },
    { name: 'MOVE (미 국채 변동성)', value: '98.50', change: '+2.10' },
    { name: 'Fear & Greed Index', value: '72 (탐욕)', change: '+4' },
  ]

  const macroIndicators = [
    { name: '달러 인덱스 (DXY)', value: '104.20', change: '+0.15' },
    { name: '미국 10년 BEI (기대인플레이션)', value: '2.35%', change: '+0.02%' },
    { name: '연준 역레포(Reverse Repo) 잔고', value: '485B', change: '-12B' },
    { name: '미국 장단기 금리차 (10년-2년)', value: '-0.35%', change: '+0.04%' },
    { name: '미국 하이일드 스프레드', value: '3.45%', change: '-0.02%' },
    { name: '미국 10년물 실질금리', value: '1.92%', change: '+0.03%' },
    { name: '한국 수출금액지수 (YoY)', value: '+5.2%', change: '+0.8%' },
  ]

  const futures = [
    { name: 'S&P 500 선물', value: '5,100.50', change: '+10.25' },
    { name: '다우존스 선물', value: '39,200.00', change: '+50.00' },
    { name: '나스닥 100 선물', value: '18,020.00', change: '+45.50' },
    { name: '러셀 2000 선물', value: '2,050.30', change: '-5.40' },
    { name: '코스피 200 선물', value: '365.40', change: '-1.20' },
    { name: '코스닥 150 선물', value: '1,420.50', change: '-10.50' },
  ]

  const nightFutures = [
    { name: '코스피 200 야간선물 (CME)', value: '366.10', change: '+0.70' },
    { name: '위켄드 다우존스 (IG)', value: '39,250.00', change: '+50.00' },
    { name: '위켄드 나스닥 (IG)', value: '18,050.00', change: '+30.00' },
    { name: '야간 원/달러 선물', value: '1,352.50', change: '+2.00' },
  ]

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
                <tr key={idx} className="clickable" onClick={() => setSelectedItem(item)}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value}</td>
                  <td className={item.change.startsWith('+') ? 'text-positive' : 'text-negative'}>{item.change}</td>
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
                <tr key={idx} className="clickable" onClick={() => setSelectedItem(item)}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value}</td>
                  <td className={item.change.startsWith('+') ? 'text-positive' : 'text-negative'}>{item.change}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="card-title" style={{ marginTop: '2rem' }}>시장 변동성 및 위험 지표</h2>
          <table className="data-table">
            <tbody>
              {volatilityIndices.map((item, idx) => (
                <tr key={idx} className="clickable" onClick={() => setSelectedItem(item)}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value}</td>
                  <td className={item.change.startsWith('+') ? 'text-negative' : 'text-positive'}>
                    {/* 변동성은 오르면 안 좋은 것이므로 색상 반전 처리(CSS 클래스 커스텀 대신 인라인 또는 반대로 맵핑) */}
                    {item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex-between" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ margin: 0 }}>야간/위켄드 장외 선물</h2>
            <span className="badge warning" style={{ fontSize: '0.75rem' }}>휴일 참조용</span>
          </div>
          <table className="data-table">
            <tbody>
              {nightFutures.map((item, idx) => (
                <tr key={idx} className="clickable" onClick={() => setSelectedItem(item)}>
                  <td>{item.name}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.value}</td>
                  <td className={item.change.startsWith('+') ? 'text-positive' : 'text-negative'}>{item.change}</td>
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
        
        <div className="card clickable" onClick={() => setSelectedItem({ name: '미국 10년물 국채 금리 추이', value: '4.25%' })}>
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

        <div className="card clickable" onClick={() => setSelectedItem({ name: '달러 인덱스 (DXY) 추이', value: '104.2' })}>
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
