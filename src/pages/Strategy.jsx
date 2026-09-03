import React, { useState, useEffect } from 'react';
import { 
  Compass, AlertTriangle, TrendingUp, ShieldCheck, Target, 
  ArrowRight, RefreshCw, Anchor, Zap, Droplets, Globe, 
  Cpu, Layers, BarChart2, ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAiStrategy } from '../api';
import ChartModal from '../components/ChartModal';

export default function Strategy() {
  const [period, setPeriod] = useState('주간'); // '주간' or '월간'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'macro', 'commodities', 'shipping', 'theses'
  const { currentUser } = useAuth();
  const [strategyData, setStrategyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);

  const loadStrategy = async (isManual = false) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getAiStrategy(period);
      if (data) {
        setStrategyData(data);
      } else {
        setErrorMsg('서버와 통신할 수 없습니다.');
      }
    } catch (err) {
      console.error("Failed to load strategy:", err);
      setErrorMsg('AI 전략 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategy();
  }, [period]);

  const getStatusColor = (status) => {
    if (status === 'positive' || status === '안정') return 'var(--positive-color)';
    if (status === 'negative' || status === '위험') return 'var(--negative-color)';
    if (status === 'warning' || status === '주의') return '#f59e0b';
    return 'var(--text-secondary)';
  };

  const getStatusBg = (status) => {
    if (status === 'positive' || status === '안정') return 'rgba(34, 197, 94, 0.1)';
    if (status === 'negative' || status === '위험') return 'rgba(239, 68, 68, 0.1)';
    if (status === 'warning' || status === '주의') return 'rgba(245, 158, 11, 0.12)';
    return 'var(--surface-hover)';
  };

  if (loading && !strategyData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%' }}></div>
        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>글로벌 매크로·공급망·원자재 인텔리전스 분석 중...</div>
        <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Gemini 3.8 Flash가 연준 금리, 엔캐리 리스크, 해운운임, 구리/금 비율을 종합 분석하고 있습니다.</div>
      </div>
    );
  }

  if (errorMsg || !strategyData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid var(--negative-color)' }}>
          <h2 style={{ color: 'var(--negative-color)', marginBottom: '1rem' }}>데이터 접근 오류</h2>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>{errorMsg}</p>
          <button className="btn-primary" onClick={() => loadStrategy(true)}>다시 시도</button>
        </div>
      </div>
    );
  }

  const { title, regime, summary, keyPulses = [], thematicDeepDives = {}, actionableTheses = [], assetAllocation = { equities: 50, commodities: 20, bonds: 20, cash: 10 }, aiModel, updatedAt } = strategyData;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={26} color="var(--accent-color)" /> 글로벌 매크로 & 공급망 투자 인텔리전스
            </h1>
            <span className="badge positive" style={{ fontSize: '0.75rem' }}>
              ⚡ {aiModel || 'Gemini 3.8 Flash'}
            </span>
          </div>
          <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
            거시경제, 지정학적 리스크, 해운운임(SCFI/BDI), 원자재 슈퍼사이클, 엔 캐리 트레이드 위험을 종합한 헤지펀드급 실전 리포트
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>기준: {updatedAt || '실시간'}</span>
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--surface-color)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            {['주간', '월간'].map(p => (
              <button 
                key={p} 
                className={`timeframe-btn ${period === p ? 'active' : ''}`}
                style={{ margin: 0, border: 'none', padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}
                onClick={() => setPeriod(p)}
              >
                {p} 전략
              </button>
            ))}
          </div>
          <button 
            className="badge neutral clickable"
            onClick={() => loadStrategy(true)}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 0.8rem', border: '1px solid var(--border-color)' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? '분석 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 4 Core Macro Pulses (헤지펀드 4대 핵심 펄스 카드) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {keyPulses.map((pulse, idx) => (
          <div 
            key={idx} 
            className="card" 
            style={{ 
              marginBottom: 0, 
              padding: '1.25rem', 
              backgroundColor: 'var(--surface-color)', 
              border: `1px solid ${getStatusColor(pulse.status)}33`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: '500' }}>{pulse.name}</span>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '0.25rem', 
                    backgroundColor: getStatusBg(pulse.status),
                    color: getStatusColor(pulse.status)
                  }}
                >
                  {pulse.badge}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {pulse.value}
              </div>
            </div>
            <div className="text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
              {pulse.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Market Regime & Executive Summary Banner */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '1.5rem', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)' 
        }}
      >
        <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🌐</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              CURRENT MARKET REGIME (시장 국면)
            </span>
          </div>
          <span className="badge neutral" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
            {regime}
          </span>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          "{title}"
        </h2>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-secondary)', margin: 0 }}>
          {summary}
        </p>
      </div>

      {/* Navigation Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'all', label: '전체 종합 리포트', icon: <Layers size={16} /> },
          { id: 'theses', label: '🎯 실전 투자 아이디어 4選', icon: <Target size={16} /> },
          { id: 'shipping', label: '🚢 해운운임 & 글로벌 물류망', icon: <Anchor size={16} /> },
          { id: 'commodities', label: '⛏️ 원자재 & 구리 슈퍼사이클', icon: <Zap size={16} /> },
          { id: 'macro', label: '💧 유동성 & 엔 캐리 리스크', icon: <Droplets size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            className={`timeframe-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '0.6rem 1.1rem', 
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              borderRadius: '0.5rem'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Thematic Deep Dives Section */}
      {(activeTab === 'all' || activeTab === 'macro' || activeTab === 'commodities' || activeTab === 'shipping') && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} color="var(--accent-color)" /> 핵심 팩터별 심층 분석 (Deep Dives)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Macro & Liquidity */}
            {(activeTab === 'all' || activeTab === 'macro') && (
              <div className="card" style={{ marginBottom: 0, borderTop: '3px solid #3b82f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Droplets size={18} color="#3b82f6" />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>거시경제 & 통화 유동성 (Macro)</h4>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {thematicDeepDives.macroLiquidity || '연준의 금리 인하 사이클과 글로벌 유동성 확장이 주식 및 위험자산의 밸류에이션을 지지하고 있습니다.'}
                </p>
              </div>
            )}

            {/* Geopolitics & Shipping */}
            {(activeTab === 'all' || activeTab === 'shipping') && (
              <div className="card" style={{ marginBottom: 0, borderTop: '3px solid #06b6d4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Anchor size={18} color="#06b6d4" />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>국제정세 & 해운운임 (Supply Chain)</h4>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {thematicDeepDives.geopoliticsSupplyChain || '홍해 사태 장기화로 인한 아프리카 희망봉 우회가 지속되며 컨테이너선 및 벌크선 운임이 고공행진 중입니다.'}
                </p>
              </div>
            )}

            {/* Commodities */}
            {(activeTab === 'all' || activeTab === 'commodities') && (
              <div className="card" style={{ marginBottom: 0, borderTop: '3px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Zap size={18} color="#f59e0b" />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>원자재 & AI 슈퍼사이클 (Commodities)</h4>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {thematicDeepDives.commoditiesCycle || 'AI 데이터센터 전력망 증설에 따른 구리 공급 부족과 각국 중앙은행의 탈달러 실물 금 매입이 신고가를 견인하고 있습니다.'}
                </p>
              </div>
            )}

            {/* Policy & Tariffs */}
            {(activeTab === 'all' || activeTab === 'macro') && (
              <div className="card" style={{ marginBottom: 0, borderTop: '3px solid #8b5cf6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Globe size={18} color="#8b5cf6" />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>정책/관세 & 리쇼어링 (Policy)</h4>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {thematicDeepDives.policyTariffs || '미국 대선 정국의 보편 관세 및 대중국 무역 규제 강화에 대응하여 북미 현지 인프라 및 니어쇼어링 투자가 가속화되고 있습니다.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actionable Theses (실전 투자 아이디어 4選) */}
      {(activeTab === 'all' || activeTab === 'theses') && (
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="var(--accent-color)" /> 실전 투자 아이디어 & 수혜 포트폴리오 (Actionable Theses)
              </h3>
              <div className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                종목 태그를 클릭하면 즉시 실시간 캔들 차트와 상세 시세를 확인하실 수 있습니다.
              </div>
            </div>
            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>4대 테마 포트폴리오</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {actionableTheses.map((thesis, idx) => (
              <div 
                key={thesis.id || idx} 
                className="card" 
                style={{ 
                  marginBottom: 0, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Header with Theme Badge */}
                <div>
                  <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold', 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '0.25rem',
                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--accent-color)'
                      }}
                    >
                      {thesis.theme}
                    </span>
                    <span className="badge positive" style={{ fontSize: '0.8rem' }}>
                      권장 비중 {thesis.allocation}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    {thesis.title}
                  </h4>

                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    {thesis.thesis}
                  </p>

                  {/* Stock / ETF Picks Badges */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Target size={14} color="var(--accent-color)" /> 수혜 종목 및 핵심 자산 (클릭 시 차트 확인)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {thesis.picks && thesis.picks.map((pick, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => setSelectedStock({ name: pick.name, symbol: pick.symbol, value: '100' })}
                          className="clickable"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.4rem 0.75rem',
                            backgroundColor: 'var(--surface-hover)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.4rem',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s ease'
                          }}
                          title={`${pick.role} (차트 열기)`}
                        >
                          <span style={{ fontWeight: 'bold' }}>{pick.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({pick.type})</span>
                          <ExternalLink size={12} color="var(--accent-color)" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Meta: Timeframe & Risks */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    <span className="text-secondary">목표 기간:</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{thesis.timeframe}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'flex-start', gap: '4px', lineHeight: '1.4' }}>
                    <AlertTriangle size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span><strong>리스크:</strong> {thesis.risks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Portfolio Asset Allocation Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} color="var(--accent-color)" /> 권장 포트폴리오 자산 배분 비중 (Asset Allocation)
        </h3>

        {/* Stacked Progress Bar */}
        <div style={{ height: '24px', width: '100%', display: 'flex', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{ width: `${assetAllocation.equities}%`, backgroundColor: '#3b82f6' }} title={`주식 ${assetAllocation.equities}%`}></div>
          <div style={{ width: `${assetAllocation.commodities}%`, backgroundColor: '#f59e0b' }} title={`원자재/실물 ${assetAllocation.commodities}%`}></div>
          <div style={{ width: `${assetAllocation.bonds}%`, backgroundColor: '#10b981' }} title={`채권/금리 ${assetAllocation.bonds}%`}></div>
          <div style={{ width: `${assetAllocation.cash}%`, backgroundColor: '#64748b' }} title={`현금/유동성 ${assetAllocation.cash}%`}></div>
        </div>

        {/* Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3b82f6', display: 'inline-block' }}></span>
            <span>주식 (Equity): <strong>{assetAllocation.equities}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
            <span>원자재 (Commodity): <strong>{assetAllocation.commodities}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            <span>채권 (Fixed Income): <strong>{assetAllocation.bonds}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#64748b', display: 'inline-block' }}></span>
            <span>현금 (Cash): <strong>{assetAllocation.cash}%</strong></span>
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      <div style={{ padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        * 본 인텔리전스 리포트는 실시간 거시경제, 원자재 선물, 해운운임, 환율 데이터를 기반으로 Gemini AI가 산출한 분석이며 투자 권유가 아닙니다. 모든 투자의 최종 결정과 책임은 투자자 본인에게 있습니다.
      </div>

      {/* Chart Modal for Clicked Stocks/ETFs */}
      <ChartModal 
        isOpen={!!selectedStock} 
        onClose={() => setSelectedStock(null)} 
        item={selectedStock} 
      />
    </div>
  );
}
