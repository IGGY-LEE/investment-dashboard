import React, { useState, useEffect } from 'react';
import { Compass, AlertTriangle, TrendingUp, ShieldCheck, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAiStrategy } from '../api';

export default function Strategy() {
  const [period, setPeriod] = useState('주간'); // '주간' or '월간'
  const { currentUser } = useAuth();
  const [strategyData, setStrategyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadStrategy() {
      if (!currentUser) return;
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
    }
    loadStrategy();
  }, [currentUser, period]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spin" style={{ display: 'inline-block', marginRight: '0.5rem', width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%' }}></span> AI 기반 전략을 실시간으로 분석 중입니다...</div>;
  }

  if (errorMsg || !strategyData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid var(--positive-color)' }}>
          <h2 style={{ color: 'var(--positive-color)', marginBottom: '1rem' }}>데이터 접근 오류</h2>
          <p style={{ lineHeight: '1.6' }}>{errorMsg}</p>
        </div>
      </div>
    )
  }

  const currentData = strategyData;
  const currentRebalance = strategyData.rebalancing;
  const currentPicks = strategyData.topPicks;

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
        * 본 전략 리포트는 실시간 금융 데이터를 기반으로 Gemini AI가 산출한 결과이며, 실제 투자 결과에 대한 법적 책임을 지지 않습니다. 모든 투자의 최종 결정권과 책임은 투자자 본인에게 있습니다.
      </div>
    </div>
  );
}
