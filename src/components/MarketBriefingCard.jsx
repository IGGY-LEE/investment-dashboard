import React, { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Clock, Flame, Calendar, Radio } from 'lucide-react'

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

export default function MarketBriefingCard({ briefingData, isLoading, onRefresh }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);
  const upcomingEvents = getUpcomingEvents();

  const breakingNews = briefingData?.breakingNews || [];

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

  return (
    <div 
      className="card" 
      style={{ 
        marginBottom: '1.5rem', 
        border: '1px solid rgba(59, 130, 246, 0.3)',
        background: 'linear-gradient(135deg, var(--surface-color) 0%, rgba(59, 130, 246, 0.03) 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Top Header Bar: AI Model Tag & D-Day Chips */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '5px', 
            padding: '0.25rem 0.6rem', 
            borderRadius: '1rem', 
            fontSize: '0.75rem', 
            fontWeight: 'bold', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--accent-color)' 
          }}>
            <Sparkles size={13} />
            <span>실시간 AI 시황 브리핑</span>
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

      {/* Main Headline & Sentiment */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          {isLoading ? (
            <div style={{ height: '28px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', width: '80%', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', lineHeight: '1.5', margin: 0, color: 'var(--text-primary)' }}>
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

      {/* Breaking News Rolling Ticker */}
      {breakingNews.length > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'var(--surface-hover)', 
          borderRadius: '0.5rem', 
          padding: '0.5rem 0.75rem', 
          marginTop: '0.75rem',
          fontSize: '0.85rem',
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

      {/* Expandable Key Drivers Drawer */}
      {isExpanded && briefingData?.keyDrivers && (
        <div style={{ 
          marginTop: '1rem', 
          paddingTop: '0.75rem', 
          borderTop: '1px dashed var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
            📌 AI 핵심 시장 드라이버 요약:
          </div>
          {briefingData.keyDrivers.map((driver, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>•</span>
              <span>{driver}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Footer: Expand Toggle & Update Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem' }}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '0.78rem', 
            color: 'var(--accent-color)', 
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? (
            <><span>상세 요약 접기</span> <ChevronUp size={14} /></>
          ) : (
            <><span>핵심 요인 3가지 더보기</span> <ChevronDown size={14} /></>
          )}
        </button>

        <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
          기준 시간: {briefingData?.updatedAt || '방금 전'} (3분 주기 갱신)
        </span>
      </div>
    </div>
  );
}
