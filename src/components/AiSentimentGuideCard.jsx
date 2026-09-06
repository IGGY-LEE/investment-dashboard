import React from 'react'
import { ShieldCheck, AlertTriangle, TrendingDown, TrendingUp, Compass, Target, ArrowRight } from 'lucide-react'

export default function AiSentimentGuideCard({ fearGreedData }) {
  const score = fearGreedData?.score || 42;
  const sentiment = fearGreedData?.sentiment || '공포';
  const previousClose = fearGreedData?.previousClose || 35;

  // Derive dynamic tactical advice based on Fear & Greed Score
  const getPlaybook = (sc) => {
    if (sc <= 30) {
      return {
        regime: '극단적 공포 (Extreme Fear) - 역발상 매수 기회 국면',
        stance: '적극적 분할 매수 (Aggressive Accumulation)',
        cashTarget: '10~15%',
        actionItems: [
          '지수 및 시가총액 상위 우량주의 패닉 투매 구간은 중장기 최고의 손익비 진입 구간',
          'VIX 스파이크 발생 후 완만한 하락 전환 시 1차 분할 매수 집행',
          '실적 가시성이 뚜렷한 주도 섹터(AI 전력망, HBM) 중심 압축 매수'
        ],
        badgeColor: '#10b981',
        alertType: 'opportunity'
      };
    } else if (sc <= 45) {
      return {
        regime: '공포 (Fear) - 감정적 뇌동매매 금지 및 저가 분할 대응',
        stance: '신중한 분할 매수 & 포트폴리오 압축',
        cashTarget: '20~25%',
        actionItems: [
          '공포 심리에 휩쓸려 저점에서 손절하는 행위를 엄격히 지양',
          '현금 비중 20%를 유지하며 기술적 지지선(60일선/120일선) 터치 시 분할 매수',
          '모멘텀이 살아있는 방산/원전 및 고배당 방어주를 포트폴리오 완충재로 활용'
        ],
        badgeColor: '#3b82f6',
        alertType: 'neutral'
      };
    } else if (sc <= 60) {
      return {
        regime: '중립 (Neutral) - 종목별 개별 장세 & 실적 모멘텀 집중',
        stance: '균형 유지 및 알파(Alpha) 종목 발굴',
        cashTarget: '15~20%',
        actionItems: [
          '지수 전체의 방향성 베팅보다는 어닝 서프라이즈가 기대되는 개별주 선별',
          '추격 매수보다는 눌림목 지지 확인 후 진입하는 스윙 전략 유효',
          '단기 급등 종목은 일부 분할 익절하여 수익을 확정 짓는 리밸런싱 병행'
        ],
        badgeColor: '#8b5cf6',
        alertType: 'neutral'
      };
    } else {
      return {
        regime: '탐욕/극단적 탐욕 (Greed) - 추격 매수 자제 및 이익 실현 조율',
        stance: '현금 비중 확대 & 리스크 관리',
        cashTarget: '30~40%',
        actionItems: [
          '과열권 진입에 따른 단기 조정에 대비하여 보유 종목 목표가 도달 시 분할 익절',
          '신규 레버리지 매수 및 고점 추격 매수를 극도로 자제',
          '단기 급락에 대비한 손절 기준선(Trailing Stop)을 타이트하게 상향 조정'
        ],
        badgeColor: '#ef4444',
        alertType: 'warning'
      };
    }
  };

  const playbook = getPlaybook(score);

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
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: '#3b82f6'
          }}>
            <Compass size={18} />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>
              Gemini 실전 투자 행동 지침 (Tactical Playbook)
            </h2>
            <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
              시장 심리(CNN {score}점 · {sentiment}) 및 거시 지표 기반
            </div>
          </div>
        </div>
      </div>

      {/* 심리 국면 요약 뱃지 박스 */}
      <div style={{
        padding: '0.85rem 1rem',
        borderRadius: '0.65rem',
        backgroundColor: 'var(--surface-hover)',
        border: '1px solid var(--border-color)',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>현재 시장 국면</span>
          <span className="badge" style={{ backgroundColor: `${playbook.badgeColor}22`, color: playbook.badgeColor, fontWeight: 'bold' }}>
            {sentiment} ({score}점)
          </span>
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {playbook.regime}
        </div>
      </div>

      {/* 권장 포지션 및 권장 현금 비중 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>권장 포트폴리오 스탠스</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{playbook.stance}</div>
        </div>
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>권장 적정 현금 비중</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--accent-color, #3b82f6)' }}>{playbook.cashTarget} 유지</div>
        </div>
      </div>

      {/* 실전 행동 가이드 리스트 */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          지금 반드시 체크해야 할 액션 플랜:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {playbook.actionItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
              <Target size={14} style={{ color: playbook.badgeColor, marginTop: '3px', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
