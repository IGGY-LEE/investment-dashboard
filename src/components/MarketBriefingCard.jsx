import React, { useState, useEffect } from 'react'
import { 
  Sparkles, TrendingUp, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, 
  Clock, Flame, Calendar, Radio, Activity, Compass, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react'

// Upcoming high-impact economic calendar events generator
const getUpcomingEvents = () => {
  const today = new Date();
  
  const candidateEvents = [
    { title: '미국 소비자물가지수 (CPI) 발표', time: '21:30', impact: 'High', type: '매크로', daysOffset: 0 },
    { title: '미국 FOMC 성명서 및 금리결정', time: '03:00', impact: 'High', type: '통화정책', daysOffset: 2 },
    { title: '한국 선물/옵션 동시 만기일', time: '15:30', impact: 'High', type: '만기일', daysOffset: 4 },
    { title: '미국 고용보고서 (Non-farm)', time: '21:30', impact: 'High', type: '고용', daysOffset: 7 },
    { title: 'NVIDIA 분기 실적 발표', time: '06:00', impact: 'High', type: '실적', daysOffset: 9 },
  ];

  return candidateEvents.map(e => {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + e.daysOffset);
    const dDayText = e.daysOffset === 0 ? `오늘 ${e.time}` : `D-${e.daysOffset}`;
    return {
      ...e,
      dateStr: targetDate.toISOString().split('T')[0],
      dDayText,
      isToday: e.daysOffset === 0
    };
  });
};

const availableIndices = ['S&P 500', '나스닥', '다우존스', '코스피', '코스닥'];

export default function MarketBriefingCard({ 
  briefingData, 
  isLoading, 
  onRefresh, 
  selectedIndex = 'S&P 500',
  onSelectIndex
}) {
  const [localIndex, setLocalIndex] = useState(selectedIndex);
  const [isDriversExpanded, setIsDriversExpanded] = useState(true);
  const [newsIndex, setNewsIndex] = useState(0);
  const upcomingEvents = getUpcomingEvents();

  // Sync with parent selectedIndex if updated externally
  useEffect(() => {
    if (selectedIndex && selectedIndex !== localIndex) {
      setLocalIndex(selectedIndex);
    }
  }, [selectedIndex]);

  const activeMarket = localIndex || 'S&P 500';

  const handleIndexClick = (idx) => {
    setLocalIndex(idx);
    if (onSelectIndex) {
      onSelectIndex(idx);
    }
  };

  const breakingNews = briefingData?.breakingNews || [];
  const quickPulse = briefingData?.quickPulse || [];
  const dailySignal = briefingData?.dailySignal;
  const investorFlow = briefingData?.investorFlow;
  const marketDetails = briefingData?.markets?.[activeMarket] || {
    summary: briefingData?.headline || '글로벌 주요 증시 동향 분석 중',
    keyDrivers: briefingData?.keyDrivers || [
      '주요 기업 실적 및 거시경제 지표 혼조세',
      '중앙은행 통화정책 경로 관망 및 금리 변동성',
      '주도 섹터 간 빠른 순환매 장세 지속'
    ],
    focus: '주요 기술주 모멘텀 및 외국인 수급'
  };

  // Auto-rolling ticker for breaking news (every 4 seconds)
  useEffect(() => {
    if (breakingNews.length <= 1) return;
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % breakingNews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [breakingNews.length]);

  const currentNews = breakingNews[newsIndex];

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case '탐욕':
        return { label: '🔥 탐욕 (상승 우세)', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      case '공포':
        return { label: '❄️ 공포 (조정 압력)', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
      case '혼조':
        return { label: '⚖️ 혼조 (디커플링)', bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' };
      case '관망':
        return { label: '👀 관망 (지표 대기)', bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' };
      default:
        return { label: '⚖️ 중립 (균형)', bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' };
    }
  };

  const sentimentStyle = getSentimentBadge(briefingData?.sentiment);

  // Daily signal style helper
  const getSignalBadgeStyle = (mode) => {
    if (mode === 'bullish') {
      return {
        borderColor: 'rgba(34, 197, 94, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)',
        badgeBg: '#22c55e',
        badgeText: '#ffffff'
      };
    }
    if (mode === 'caution') {
      return {
        borderColor: 'rgba(239, 68, 68, 0.4)',
        bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.02) 100%)',
        badgeBg: '#ef4444',
        badgeText: '#ffffff'
      };
    }
    return {
      borderColor: 'rgba(234, 179, 8, 0.4)',
      bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(234, 179, 8, 0.02) 100%)',
      badgeBg: '#eab308',
      badgeText: '#000000'
    };
  };

  const signalStyle = getSignalBadgeStyle(dailySignal?.mode);

  return (
    <div 
      className="card" 
      style={{ 
        marginBottom: '1.5rem', 
        border: '1px solid rgba(59, 130, 246, 0.3)',
        background: 'linear-gradient(135deg, var(--surface-color) 0%, rgba(59, 130, 246, 0.02) 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* 1. Top Header Bar: AI Model Tag & D-Day Chips */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '5px', 
            padding: '0.25rem 0.65rem', 
            borderRadius: '1rem', 
            fontSize: '0.78rem', 
            fontWeight: 'bold', 
            backgroundColor: 'rgba(59, 130, 246, 0.12)', 
            color: 'var(--accent-color)' 
          }}>
            <Sparkles size={14} />
            <span>실시간 AI 하이브리드 시황 브리핑</span>
          </span>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '0.75rem', 
            color: 'var(--positive-color)',
            fontWeight: '600'
          }}>
            <Radio size={12} className="spin-slow" /> LIVE ({briefingData?.aiModel || 'Gemini 3.8 Flash'})
          </span>
        </div>

        {/* Economic D-Day Countdown Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', maxWidth: '100%', paddingBottom: '2px' }}>
          <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
            <Calendar size={12} /> 주요 일정:
          </span>
          {upcomingEvents.slice(0, 3).map((ev, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.2rem 0.5rem',
                borderRadius: '0.35rem',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                backgroundColor: ev.isToday ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-hover)',
                color: ev.isToday ? 'var(--positive-color)' : 'var(--text-primary)',
                border: ev.isToday ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)',
                fontWeight: ev.isToday ? 'bold' : 'normal'
              }}
            >
              {ev.isToday && <Flame size={12} color="var(--positive-color)" />}
              <span>{ev.title.split(' ')[1] || ev.title}</span>
              <span style={{ 
                padding: '1px 4px', 
                borderRadius: '3px', 
                backgroundColor: ev.isToday ? 'var(--positive-color)' : 'var(--accent-color)', 
                color: '#fff', 
                fontSize: '0.68rem',
                fontWeight: 'bold'
              }}>
                {ev.dDayText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 글로벌 선물 & 환율 퀵 펄스 (Quick Macro Pulse) */}
      {quickPulse.length > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          overflowX: 'auto', 
          padding: '0.4rem 0.6rem', 
          marginBottom: '0.85rem',
          backgroundColor: 'var(--surface-hover)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: '700', 
            color: 'var(--text-secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            whiteSpace: 'nowrap',
            paddingRight: '4px',
            borderRight: '1px solid var(--border-color)'
          }}>
            <Activity size={13} color="var(--accent-color)" /> 퀵 펄스
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'nowrap' }}>
            {quickPulse.map((item, qIdx) => (
              <div 
                key={qIdx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  fontSize: '0.78rem', 
                  whiteSpace: 'nowrap' 
                }}
              >
                <span className="text-secondary">{item.name}</span>
                <span style={{ fontWeight: '600' }}>{item.price}</span>
                <span 
                  style={{ 
                    color: item.isUp ? 'var(--positive-color)' : 'var(--negative-color)',
                    fontWeight: '700',
                    fontSize: '0.75rem'
                  }}
                >
                  {item.change}
                </span>
                {qIdx < quickPulse.length - 1 && (
                  <span style={{ color: 'var(--border-color)', marginLeft: '4px' }}>|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Global Headline & Overall Sentiment */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          {isLoading ? (
            <div style={{ height: '28px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', width: '80%', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <h2 style={{ fontSize: '1.12rem', fontWeight: '700', lineHeight: '1.5', margin: 0, color: 'var(--text-primary)' }}>
              {briefingData?.headline || '실시간 글로벌 금융 시황을 분석하는 중입니다...'}
            </h2>
          )}
          {briefingData?.sentimentReason && (
            <div className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              💡 {briefingData.sentimentReason}
            </div>
          )}
        </div>

        {/* Sentiment & Risk Badge */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
          {briefingData?.sentiment && (
            <span style={{ 
              padding: '0.35rem 0.75rem', 
              borderRadius: '0.5rem', 
              fontSize: '0.82rem', 
              fontWeight: '700',
              backgroundColor: sentimentStyle.bg,
              color: sentimentStyle.color
            }}>
              {sentimentStyle.label}
            </span>
          )}
          {briefingData?.riskLevel && (
            <span style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '0.5rem',
              fontSize: '0.82rem',
              fontWeight: '600',
              backgroundColor: briefingData.riskLevel === '주의' ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-hover)',
              color: briefingData.riskLevel === '주의' ? 'var(--positive-color)' : 'var(--text-secondary)'
            }}>
              위험도: {briefingData.riskLevel}
            </span>
          )}
        </div>
      </div>

      {/* 4. [특화 섹션 1] 연구원 아빠의 데일리 시그널 (Action Guide) */}
      {dailySignal && (
        <div 
          style={{
            border: `1px solid ${signalStyle.borderColor}`,
            background: signalStyle.bgGradient,
            borderRadius: '0.6rem',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px',
                padding: '2px 8px', 
                borderRadius: '4px', 
                backgroundColor: signalStyle.badgeBg, 
                color: signalStyle.badgeText,
                fontSize: '0.78rem',
                fontWeight: '800',
                letterSpacing: '0.3px'
              }}>
                <Compass size={13} /> {dailySignal.badge}
              </span>
              <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {dailySignal.headline}
              </span>
            </div>
            <span style={{ 
              fontSize: '0.78rem', 
              fontWeight: '700', 
              padding: '2px 8px', 
              borderRadius: '1rem', 
              backgroundColor: 'var(--surface-hover)', 
              color: 'var(--accent-color)',
              border: '1px solid var(--border-color)'
            }}>
              💰 {dailySignal.recommendedCash}
            </span>
          </div>

          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            💡 <strong style={{ color: 'var(--text-primary)' }}>행동 가이드:</strong> {dailySignal.advice}
          </div>
        </div>
      )}

      {/* 5. 5대 시장별(S&P 500, 나스닥, 다우존스, 코스피, 코스닥) 탭 바 & 상세 포커스 */}
      <div style={{ 
        borderTop: '1px dashed var(--border-color)', 
        paddingTop: '0.85rem',
        marginTop: '0.5rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={14} color="var(--accent-color)" />
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              시장별 맞춤형 심층 브리핑
            </span>
          </div>

          {/* Market Tab Selector */}
          <div style={{ 
            display: 'flex', 
            gap: '0.25rem', 
            backgroundColor: 'var(--surface-hover)', 
            padding: '2px', 
            borderRadius: '0.45rem',
            overflowX: 'auto',
            maxWidth: '100%'
          }}>
            {availableIndices.map(idx => (
              <button
                key={idx}
                onClick={() => handleIndexClick(idx)}
                style={{
                  border: 'none',
                  background: activeMarket === idx ? 'var(--accent-color)' : 'transparent',
                  color: activeMarket === idx ? '#ffffff' : 'var(--text-secondary)',
                  padding: '3px 10px',
                  borderRadius: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: activeMarket === idx ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {idx}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Market One-line Summary & Today's Focus */}
        <div style={{ 
          backgroundColor: 'var(--surface-hover)', 
          borderRadius: '0.5rem', 
          padding: '0.65rem 0.85rem', 
          marginBottom: '0.75rem',
          borderLeft: '3px solid var(--accent-color)'
        }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>
            [{activeMarket}] {marketDetails.summary}
          </div>
          {marketDetails.focus && (
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '500' }}>
              🎯 핵심 관전 포인트: {marketDetails.focus}
            </div>
          )}
        </div>

        {/* 6. [특화 섹션 2] 국내장 선택 시 또는 상시: 외국인·기관 수급 레이더 */}
        {investorFlow && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
            gap: '0.5rem', 
            marginBottom: '0.85rem' 
          }}>
            {/* 코스피 수급 */}
            <div style={{ 
              padding: '0.5rem 0.75rem', 
              backgroundColor: 'var(--surface-hover)', 
              borderRadius: '0.45rem', 
              border: activeMarket === '코스피' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: '700' }}>
                <span>📊 코스피 외인·기관 수급</span>
                {activeMarket === '코스피' && <span style={{ color: 'var(--accent-color)' }}>선택됨</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>외국인: <strong style={{ color: investorFlow.kospi.foreignIsBuy ? 'var(--positive-color)' : 'var(--negative-color)' }}>{investorFlow.kospi.foreign}</strong></span>
                <span>기관: <strong style={{ color: investorFlow.kospi.instIsBuy ? 'var(--positive-color)' : 'var(--negative-color)' }}>{investorFlow.kospi.institution}</strong></span>
              </div>
            </div>

            {/* 코스닥 수급 */}
            <div style={{ 
              padding: '0.5rem 0.75rem', 
              backgroundColor: 'var(--surface-hover)', 
              borderRadius: '0.45rem', 
              border: activeMarket === '코스닥' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: '700' }}>
                <span>📊 코스닥 외인·기관 수급</span>
                {activeMarket === '코스닥' && <span style={{ color: 'var(--accent-color)' }}>선택됨</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>외국인: <strong style={{ color: investorFlow.kosdaq.foreignIsBuy ? 'var(--positive-color)' : 'var(--negative-color)' }}>{investorFlow.kosdaq.foreign}</strong></span>
                <span>기관: <strong style={{ color: investorFlow.kosdaq.instIsBuy ? 'var(--positive-color)' : 'var(--negative-color)' }}>{investorFlow.kosdaq.institution}</strong></span>
              </div>
            </div>

            {/* 선물 수급 */}
            <div style={{ 
              padding: '0.5rem 0.75rem', 
              backgroundColor: 'var(--surface-hover)', 
              borderRadius: '0.45rem', 
              border: '1px solid var(--border-color)',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: '700' }}>
                <span>⚡ 코스피200 선물 외인</span>
                <span style={{ color: investorFlow.futures.isBuy ? 'var(--positive-color)' : 'var(--negative-color)', fontWeight: '800' }}>
                  {investorFlow.futures.contracts}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {investorFlow.futures.desc}
              </div>
            </div>
          </div>
        )}

        {/* 7. Key Drivers 3선 (항상 열어두거나 토글 가능) */}
        {marketDetails.keyDrivers && marketDetails.keyDrivers.length > 0 && (
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '0.6rem 0.75rem', 
            backgroundColor: 'var(--surface-color)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDriversExpanded ? '0.4rem' : 0 }}>
              <span className="text-secondary" style={{ fontSize: '0.78rem', fontWeight: '700' }}>
                📌 [{activeMarket}] 상승·하락 핵심 드라이버 3가지:
              </span>
              <button 
                onClick={() => setIsDriversExpanded(!isDriversExpanded)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--accent-color)', 
                  cursor: 'pointer', 
                  fontSize: '0.75rem', 
                  fontWeight: '600',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2px' 
                }}
              >
                {isDriversExpanded ? <><span>접기</span><ChevronUp size={13} /></> : <><span>펼치기</span><ChevronDown size={13} /></>}
              </button>
            </div>

            {isDriversExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {marketDetails.keyDrivers.map((driver, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', lineHeight: '1.4' }}>•</span>
                    <span style={{ lineHeight: '1.4' }}>{driver}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 8. Breaking News Rolling Ticker */}
      {breakingNews.length > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'var(--surface-hover)', 
          borderRadius: '0.5rem', 
          padding: '0.45rem 0.75rem', 
          marginTop: '0.85rem',
          fontSize: '0.84rem',
          gap: '0.5rem'
        }}>
          <span style={{ 
            backgroundColor: '#ef4444', 
            color: '#fff', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontSize: '0.7rem', 
            fontWeight: 'bold',
            flexShrink: 0 
          }}>
            속보
          </span>
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {currentNews && (
              <a 
                href={currentNews.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--text-primary)', textDecoration: 'none', transition: 'opacity 0.3s' }}
              >
                <span style={{ fontWeight: '500' }}>{currentNews.title}</span>
                <span className="text-secondary" style={{ marginLeft: '6px', fontSize: '0.75rem' }}>({currentNews.source} · {currentNews.time})</span>
              </a>
            )}
          </div>
          <span className="text-secondary" style={{ fontSize: '0.75rem', flexShrink: 0 }}>
            {newsIndex + 1}/{breakingNews.length}
          </span>
        </div>
      )}

      {/* 9. Bottom Footer: Status & Update Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          * 5대 시장 탭을 클릭하면 대시보드 전체(공포·탐욕 지수, 섹터, 히트맵)와 연동됩니다.
        </span>

        <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
          기준: 한국시간(KST) {briefingData?.updatedAt || '방금 전'} (3분 주기 자동 갱신)
        </span>
      </div>
    </div>
  );
}
