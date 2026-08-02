import React, { useState } from 'react';
import { Compass, AlertTriangle, TrendingUp, ShieldCheck, Target, ArrowRight } from 'lucide-react';

export default function Strategy() {
  const [period, setPeriod] = useState('주간'); // '주간' or '월간'

  // Dummy data for Market Synthesis
  const marketSynthesis = {
    '주간': {
      title: '단기 인플레이션 우려와 차익 실현의 줄다리기',
      summary: '지난주 예상치를 상회한 CPI 지표와 중동 지정학적 긴장으로 인해 원유 및 달러가 강세를 보이며, 기술주 중심의 차익 실현 매물이 출회되었습니다. 하지만 실적 시즌을 앞둔 저가 매수세가 하단을 지지하고 있습니다.',
      keyFactors: [
        { category: '거시경제', text: '미 국채 10년물 금리 4.5% 돌파 (인플레 재점화 우려)', status: 'warning' },
        { category: '원자재', text: 'WTI 원유 80달러 돌파 및 금/구리 동반 강세', status: 'warning' },
        { category: '일정/이벤트', text: '이번 주 목요일 연준 파월 의장 연설 (금리 인하 힌트 대기)', status: 'neutral' },
        { category: '포트폴리오', text: '기존 현금 비중 15% 유지 전략 적중. 방어주 매력도 상승.', status: 'positive' }
      ]
    },
    '월간': {
      title: '경기 연착륙(Soft Landing) 기대감과 실적 장세 진입',
      summary: '고용 지표가 견조하게 유지되는 가운데, 주요 기업들의 실적이 펀더멘털을 증명하면서 전형적인 실적 장세(Earnings-driven market) 국면에 진입했습니다. 유동성 축소 우려보다는 이익 성장에 주목할 시기입니다.',
      keyFactors: [
        { category: '거시경제', text: 'M2 통화량 완만한 증가세 전환, 유동성 우려 완화', status: 'positive' },
        { category: '원자재', text: '구리 가격 강세 지속 (글로벌 제조업 PMI 반등 시그널)', status: 'positive' },
        { category: '일정/이벤트', text: '월말 빅테크 실적 발표 집중 (AI 관련 CapEx 투자 가이던스 핵심)', status: 'neutral' },
        { category: '포트폴리오', text: '기술주 집중도 완화 및 가치/배당주 혼합 전략 필요', status: 'neutral' }
      ]
    }
  };

  const rebalancing = {
    '주간': '시장 변동성(VIX)이 15를 상회하며 단기 불안 심리가 커졌습니다. 고베타(High Beta) 성장주의 비중을 5% 축소하고, 이를 단기 채권(SHY)이나 현금성 자산으로 이동하여 금요일 파월 연설 이후의 방향성에 대비하는 것을 권장합니다.',
    '월간': '구리 가격 상승과 글로벌 PMI 반등은 경기 민감주(산업재, 소재)의 아웃퍼폼을 암시합니다. 현재 포트폴리오 내 5%에 불과한 경기 민감주 비중을 15%까지 확대하고, 밸류에이션 부담이 큰 일부 소비재 비중을 축소할 것을 제안합니다.'
  };

  const topPicks = {
    '주간': [
      {
        name: '에너지 섹터 ETF (XLE)',
        target: '단기 트레이딩 (Target: +5~7%)',
        thesis: '원자재 시장에서 WTI 원유가 지정학적 긴장과 구조적 공급 부족으로 인해 백워데이션을 보이며 80달러를 돌파했습니다. 이번 주 예정된 주간 원유 재고 발표에서도 감소세가 예상되어, 유가 상승에 직접 수혜를 받는 에너지 기업들의 단기 모멘텀이 매우 강력합니다.',
        risks: '중동 지역의 지정학적 긴장이 갑작스럽게 해소되거나, 예상외로 미국의 전략비축유(SPR) 방출이 결정될 경우 유가가 급락하며 갭 하락할 위험이 있습니다.'
      },
      {
        name: '미국 단기 채권 ETF (SHY)',
        target: '포트폴리오 헷지 (안전자산)',
        thesis: 'CPI 쇼크 이후 10년물 장기 금리가 4.5%를 돌파하며 주식 시장의 밸류에이션 부담이 극대화되고 있습니다. 반면 1~3년 단기채는 연 4% 중반의 안정적인 이자 수익(Carry)을 제공하며, 이번 주 파월 의장의 매파적 발언이 나오더라도 가격 하락 방어력이 매우 뛰어납니다.',
        risks: '파월 의장이 시장의 예상을 깨고 강력한 비둘기파(금리 인하 시사) 발언을 할 경우, 주식과 장기채가 급등할 때 수익률 소외(Underperform) 현상을 겪을 수 있습니다.'
      }
    ],
    '월간': [
      {
        name: '글로벌 구리 채굴 기업 (FCX)',
        target: '중장기 투자 (Target: +15~20%)',
        thesis: '데이터센터 증설 및 AI 전력망 인프라 확충으로 인해 구리 수요가 폭발적으로 증가하고 있으나, 신규 광산 개발의 구조적 지연으로 타이트한 수급이 지속될 전망입니다. 지난주 발표된 중국의 제조업 PMI가 반등하면서 실물 경기 회복 시그널이 구리 가격 상승을 뒷받침하고 있습니다.',
        risks: '중국의 부동산 경기 침체가 장기화되어 제조업 부양책이 실패로 돌아가거나, 글로벌 경기 침체(Recession)가 현실화되어 구리 수요가 급감할 리스크가 존재합니다.'
      },
      {
        name: '방산 섹터 ETF (ITA)',
        target: '구조적 성장 (Target: +10~15%)',
        thesis: '유럽 및 중동의 지정학적 리스크가 "상수"가 된 가운데, 글로벌 각국이 GDP 대비 국방비 지출을 2% 이상으로 앞다투어 늘리고 있습니다. 경기 사이클이나 금리 변동과 무관하게 수주 잔고가 쌓이는 방산 섹터는 포트폴리오의 구조적 안정성을 크게 높여줍니다.',
        risks: '단일 국가(미국)의 정치적 이벤트(대선) 결과에 따라 국방 예산안 삭감이 논의될 경우 센티먼트 악화로 단기 주가 조정을 겪을 수 있습니다.'
      }
    ]
  };

  const currentData = marketSynthesis[period];
  const currentRebalance = rebalancing[period];
  const currentPicks = topPicks[period];

  const getStatusColor = (status) => {
    if (status === 'positive') return 'var(--positive-color)';
    if (status === 'negative') return 'var(--negative-color)';
    if (status === 'warning') return '#f59e0b';
    return 'var(--text-secondary)';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={24} color="var(--accent-color)" /> AI 투자 전략 리포트
          </h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            거시경제, 원자재, 주요 일정 및 뉴스 데이터를 종합 분석하여 도출된 투자 액션 플랜입니다.
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--surface-color)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
          {['주간', '월간'].map(p => (
            <button 
              key={p} 
              className={`timeframe-btn ${period === p ? 'active' : ''}`}
              style={{ margin: 0, border: 'none', padding: '0.5rem 1.5rem' }}
              onClick={() => setPeriod(p)}
            >
              {p} 전략
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2rem', gridTemplateColumns: '1fr 1fr' }}>
        {/* Market Synthesis */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} /> 시장 환경 종합 브리핑
          </h2>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            "{currentData.title}"
          </h3>
          <p className="text-secondary" style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {currentData.summary}
          </p>
          
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>📊 핵심 변동 요인 (Drivers)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {currentData.keyFactors.map((factor, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                <div style={{ minWidth: '4px', height: '100%', backgroundColor: getStatusColor(factor.status), borderRadius: '2px', alignSelf: 'stretch' }}></div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                    {factor.category}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{factor.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Rebalancing */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} /> 포트폴리오 리밸런싱 가이드
          </h2>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              {currentRebalance}
            </p>
          </div>

          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>💡 추천 액션</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="flex-between" style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}><ArrowRight size={16} color="var(--positive-color)" /> 비중 확대 제안</span>
              <span style={{ fontWeight: 'bold' }}>{period === '주간' ? '현금 / 단기채' : '경기 민감주 / 인프라'}</span>
            </div>
            <div className="flex-between" style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}><ArrowRight size={16} color="var(--negative-color)" /> 비중 축소 제안</span>
              <span style={{ fontWeight: 'bold' }}>{period === '주간' ? '고베타 성장주' : '고평가 소비재'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Picks Section */}
      <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={24} color="var(--accent-color)" /> AI 추천 전략 종목 (Top Picks)
      </h2>
      <div className="text-secondary" style={{ marginBottom: '1.5rem' }}>추천 논리와 내재된 위험 요소를 반드시 숙지한 후 투자 결정을 내리시기 바랍니다.</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {currentPicks.map((pick, idx) => (
          <div key={idx} className="card" style={{ marginBottom: 0 }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{pick.name}</h3>
              <span className="badge positive" style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}>{pick.target}</span>
            </div>
            
            <div className="grid-2" style={{ gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TrendingUp size={16} /> 투자 추천 논리 (Investment Thesis)
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {pick.thesis}
                </p>
              </div>
              
              <div style={{ paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--negative-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertTriangle size={16} /> 핵심 위험 요소 (Risk Factors)
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {pick.risks}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        * 본 전략 리포트는 시장 데이터를 기반으로 알고리즘이 산출한 결과이며, 실제 투자 결과에 대한 법적 책임을 지지 않습니다. 모든 투자의 최종 결정권과 책임은 투자자 본인에게 있습니다.
      </div>
    </div>
  );
}
