import React from 'react'
import { Calendar, AlertCircle, ArrowUpRight, TrendingUp, Sparkles, Clock } from 'lucide-react'

const UPCOMING_IMPACT_EVENTS = [
  {
    title: '미국 8월 소비자물가지수 (CPI) 발표',
    date: '2026.09.11 (수) 21:30',
    dDay: 'D-5',
    impact: 'High (매우 높음)',
    scenario: {
      bull: '예상치(YoY 2.6%) 부합 또는 하회 시 연준의 빅컷(50bp 인하) 기대 확산 및 기술주 급반등',
      bear: '주거비/서비스 물가 재반등 시 금리 인하 속도 조절 우려로 지수 단기 변동성 확대'
    },
    sectors: ['빅테크', '바이오/성장주', '미국 장기 국채']
  },
  {
    title: '미 연준 FOMC 정례회의 및 금리 결정',
    date: '2026.09.19 (목) 03:00',
    dDay: 'D-13',
    impact: 'Critical (시장 분수령)',
    scenario: {
      bull: '점도표 상 연내 추가 2~3회 인하 시사 및 파월 의장의 온건한 경기 연착륙 확신',
      bear: '인플레이션 경계 발언 및 점도표 상 인하 횟수 축소 시 차익 실현 매물 출회'
    },
    sectors: ['코스피/코스닥 지수', '환율/외환시장', '금융/지주사']
  },
  {
    title: '마이크론 테크놀로지 분기 실적 발표',
    date: '2026.09.25 (수)',
    dDay: 'D-19',
    impact: 'High (반도체 풍향계)',
    scenario: {
      bull: 'HBM3E 매출 급증 및 서버용 DRAM 가격 상승 지속 확인 시 K-반도체 랠리 재점화',
      bear: '스마트폰·PC 수요 둔화로 인한 범용 메모리 재고 증가 언급 시 단기 조정'
    },
    sectors: ['삼성전자', 'SK하이닉스', '반도체 소부장']
  }
]

export default function AiScheduleImpactCard() {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981'
          }}>
            <Calendar size={18} />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>
              Gemini 경제 일정 파급효과 프리뷰
            </h2>
            <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
              핵심 이벤트 시나리오별 시장 반응 사전 예측
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
        {UPCOMING_IMPACT_EVENTS.map((event, i) => (
          <div
            key={i}
            style={{
              padding: '0.85rem',
              backgroundColor: 'var(--surface-hover)',
              borderRadius: '0.65rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="flex-between" style={{ marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="badge negative" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                  {event.dDay}
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>{event.title}</span>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} />
                {event.date}
              </span>
            </div>

            {/* Bull vs Bear 시나리오 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.35rem', margin: '0.5rem 0', fontSize: '0.8rem', lineHeight: '1.45' }}>
              <div style={{ color: 'var(--positive-color)', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                <span style={{ fontWeight: 'bold', minWidth: '42px' }}>[상승]</span>
                <span>{event.scenario.bull}</span>
              </div>
              <div style={{ color: 'var(--negative-color)', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                <span style={{ fontWeight: 'bold', minWidth: '42px' }}>[하락]</span>
                <span>{event.scenario.bear}</span>
              </div>
            </div>

            {/* 영향 섹터 뱃지 */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {event.sectors.map((sec, sIdx) => (
                <span key={sIdx} style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '0.3rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  #{sec}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
