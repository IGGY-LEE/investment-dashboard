import React, { useState } from 'react'
import { Sparkles, Zap, Flame, Compass, ChevronRight, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react'

const RADAR_THEMES = [
  {
    id: 'power_grid',
    title: 'AI 데이터센터 전력망 & 변압기',
    badge: '모멘텀 최상 (🔥 강력 집중)',
    score: 96,
    status: 'bullish',
    timeframe: '중장기 스윙 (3~6개월)',
    thesis: '글로벌 빅테크의 AI 훈련용 데이터센터 증설로 북미 및 유럽 초고압 변압기 수주 잔고가 3년치 이상 누적되며 슈퍼사이클 지속.',
    stocks: [
      { name: 'HD현대일렉트릭', symbol: '267260.KS', change: '+4.8%', role: '북미 초고압 변압기 1위' },
      { name: '효성중공업', symbol: '298040.KS', change: '+3.9%', role: '초고압 차단기 및 유럽 수주 급증' },
      { name: 'LS ELECTRIC', symbol: '010120.KS', change: '+2.5%', role: '배전 및 데이터센터 IDC 전력 시스템' },
      { name: '대원전선', symbol: '006340.KS', change: '+5.2%', role: '초고압 케이블 및 북미 수출' }
    ],
    risk: '구리 원자재 가격 급등에 따른 원가율 단기 변동성'
  },
  {
    id: 'hbm_packaging',
    title: 'HBM4 & 첨단 패키징(유리기판)',
    badge: '차별화 랠리 (🚀 수급 유입)',
    score: 92,
    status: 'bullish',
    timeframe: '단기 스윙 ~ 중기 (1~3개월)',
    thesis: '차세대 AI 가속기(루빈 등) 탑재를 위한 12단/16단 HBM 고도화 및 열 발산 한계 극복을 위한 유리기판 소재 전환 가속.',
    stocks: [
      { name: 'SK하이닉스', symbol: '000660.KS', change: '+3.5%', role: 'HBM3E/HBM4 글로벌 독점적 지위' },
      { name: '한미반도체', symbol: '042700.KS', change: '+4.2%', role: '2.5D TC 본더 독점 공급' },
      { name: '이수페타시스', symbol: '007660.KS', change: '+2.8%', role: 'AI 가속기용 초고다층 MLB 기판' },
      { name: '필옵틱스', symbol: '161580.KQ', change: '+6.1%', role: '유리기판 TGV 레이저 가공 원천기술' }
    ],
    risk: '빅테크 분기 CapEx(설비투자) 발표 후 단기 재료 소멸에 따른 매물 소화'
  },
  {
    id: 'bio_cdmo',
    title: '바이오 ADC 기술수출 & 비만치료제',
    badge: '글로벌 M&A 모멘텀 (✨)',
    score: 88,
    status: 'bullish',
    timeframe: '중장기 분할 매수 (3~6개월)',
    thesis: '미국 생물보안법 통과에 따른 중국 CDMO 반사이익과 항체-약물 접합체(ADC), 차세대 GLP-1 경구용 비만 치료제 기술수출 랠리.',
    stocks: [
      { name: '알테오젠', symbol: '196170.KQ', change: '+4.2%', role: '키트루다 SC 독점 플랫폼 및 코스닥 대장' },
      { name: '리가켐바이오', symbol: '141080.KQ', change: '+2.5%', role: '글로벌 빅파마 향 ADC 플랫폼 최다 수출' },
      { name: '삼성바이오로직스', symbol: '207940.KS', change: '+0.5%', role: '생물보안법 최대 수혜 및 대규모 수주' }
    ],
    risk: '임상 2/3상 데이터 발표 전후 단기 변동성 확대'
  },
  {
    id: 'defense_aerospace',
    title: 'K-방산 수출 다변화 & 수주 랠리',
    badge: '실적 가시성 최고 (🛡️)',
    score: 85,
    status: 'positive',
    timeframe: '중장기 트렌드 (6~12개월)',
    thesis: '유럽 및 중동 지정학적 안보 위기 장기화로 폴란드 2차 계약 및 루마니아/사우디 대규모 방산 수출 파이프라인 지속.',
    stocks: [
      { name: '한화에어로스페이스', symbol: '012450.KS', change: '+3.1%', role: 'K9 자주포 및 천무 다연장 글로벌 1위' },
      { name: '현대로템', symbol: '064350.KS', change: '+4.5%', role: 'K2 흑표 전차 수출 및 방산 비중 급증' },
      { name: 'LIG넥스원', symbol: '079550.KS', change: '+2.1%', role: '천궁-II 중동 요격 미사일 4조원 수주' }
    ],
    risk: '국제 정전 협상 타결 가능성에 따른 단기 센티먼트 출렁임'
  }
]

export default function AiThemeRadarCard({ onSelectStock }) {
  const [selectedTheme, setSelectedTheme] = useState(RADAR_THEMES[0])

  return (
    <div className="card" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444'
          }}>
            <Flame size={18} />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Gemini AI 테마 & 섹터 레이더</span>
              <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: '0.75rem' }}>
                실시간 수급·모멘텀 분석
              </span>
            </h2>
            <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
              시장 수급과 글로벌 매크로를 연계하여 Gemini AI가 선정한 당일 핵심 주도 테마
            </div>
          </div>
        </div>
      </div>

      {/* 테마 셀렉터 탭 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        {RADAR_THEMES.map((theme) => {
          const isSelected = selectedTheme.id === theme.id
          return (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className="clickable"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '0.65rem',
                backgroundColor: isSelected ? 'var(--surface-hover)' : 'var(--surface-color)',
                border: `1.5px solid ${isSelected ? 'var(--accent-color, #3b82f6)' : 'var(--border-color)'}`,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isSelected ? 'var(--accent-color, #3b82f6)' : 'var(--text-secondary)' }}>
                  {theme.badge}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--positive-color)' }}>
                  AI 모멘텀 {theme.score}점
                </span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {theme.title}
              </div>
            </div>
          )
        })}
      </div>

      {/* 선택된 테마 심층 브리핑 박스 */}
      <div style={{
        padding: '1.25rem',
        backgroundColor: 'var(--surface-hover)',
        borderRadius: '0.75rem',
        border: '1px solid var(--border-color)'
      }}>
        <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={16} style={{ color: 'var(--accent-color, #3b82f6)' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{selectedTheme.title}</span>
            <span className="badge positive" style={{ fontSize: '0.75rem' }}>{selectedTheme.timeframe}</span>
          </div>
          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
            종목 클릭 시 차트 및 AI 퀵 분석 연동
          </span>
        </div>

        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          {selectedTheme.thesis}
        </p>

        {/* 주도 종목군 태그 리스트 */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            핵심 주도 종목군 (Click to Analyze):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {selectedTheme.stocks.map((stock, i) => (
              <div
                key={i}
                onClick={() => onSelectStock && onSelectStock(stock)}
                className="clickable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'var(--surface-color)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  transition: 'background-color 0.15s'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>{stock.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stock.role}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge positive" style={{ fontSize: '0.75rem' }}>{stock.change}</span>
                  <ChevronRight size={14} style={{ color: 'var(--text-secondary)', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 리스크 및 체크포인트 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem' }}>
          <ShieldAlert size={15} />
          <span><strong>AI 리스크 체크:</strong> {selectedTheme.risk}</span>
        </div>
      </div>
    </div>
  )
}
