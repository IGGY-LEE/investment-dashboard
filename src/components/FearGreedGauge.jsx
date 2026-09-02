import React, { useMemo } from 'react'

export default function FearGreedGauge({ score = 65, sentiment = '탐욕 (Greed)', vixName = 'VIX', vixValue = '13.75' }) {
  // Score range: 0 ~ 100
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 50));

  // Needle angle: -90 degrees (score 0) to +90 degrees (score 100)
  const angle = (clampedScore / 100) * 180 - 90;

  // Determine sentiment color
  const sentimentMeta = useMemo(() => {
    if (clampedScore < 25) return { text: '극단적 공포', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', desc: '과매도 국면, 반등 기회 모색' };
    if (clampedScore < 45) return { text: '공포', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', desc: '투자 심리 위축, 방어적 접근' };
    if (clampedScore <= 55) return { text: '중립', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', desc: '지표 대기 및 방향성 탐색' };
    if (clampedScore <= 75) return { text: '탐욕', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', desc: '상승 모멘텀 지속, 비중 유지' };
    return { text: '극단적 탐욕', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', desc: '과열 경계, 분할 차익 실현 권장' };
  }, [clampedScore]);

  // Radius and center for SVG
  const cx = 130;
  const cy = 120;
  const r = 90;
  const strokeWidth = 18;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width="260" height="150" viewBox="0 0 260 150" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="25%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="75%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Background Arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--surface-hover)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored Gradient Arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset="0"
        />

        {/* Gauge Scale Labels */}
        <text x="30" y="145" fontSize="11" fill="var(--text-secondary)" textAnchor="middle" fontWeight="bold">0 (공포)</text>
        <text x="130" y="22" fontSize="11" fill="var(--text-secondary)" textAnchor="middle">50 (중립)</text>
        <text x="230" y="145" fontSize="11" fill="var(--text-secondary)" textAnchor="middle" fontWeight="bold">100 (탐욕)</text>

        {/* Animated Needle */}
        <g transform={`rotate(${angle} ${cx} ${cy})`} style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} filter="url(#needleShadow)">
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 8}
            stroke="var(--text-primary)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="7" fill="var(--text-primary)" />
          <circle cx={cx} cy={cy} r="3" fill="#fff" />
        </g>
      </svg>

      {/* Score & Sentiment Display */}
      <div style={{ textAlign: 'center', marginTop: '-15px' }}>
        <div style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1', color: sentimentMeta.color }}>
          {clampedScore}
        </div>
        <div style={{ 
          display: 'inline-block',
          marginTop: '0.4rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          backgroundColor: sentimentMeta.bg,
          color: sentimentMeta.color
        }}>
          {sentimentMeta.text} ({sentiment.split(' ')[0]})
        </div>
        <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
          {sentimentMeta.desc}
        </div>
      </div>

      {/* Auxiliary Metrics (VIX & Benchmarks) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        width: '100%', 
        marginTop: '1rem', 
        paddingTop: '0.75rem', 
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span className="text-secondary">어제 수치</span>
          <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{Math.max(10, clampedScore - 3)}</div>
        </div>
        <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />
        <div style={{ textAlign: 'center' }}>
          <span className="text-secondary">지난주 수치</span>
          <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{Math.max(15, clampedScore - 7)}</div>
        </div>
        <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />
        <div style={{ textAlign: 'center' }}>
          <span className="text-secondary">{vixName.split(' ')[0]} 지수</span>
          <div style={{ fontWeight: 'bold', marginTop: '2px', color: parseFloat(vixValue) > 20 ? 'var(--positive-color)' : 'var(--text-primary)' }}>
            {vixValue}
          </div>
        </div>
      </div>
    </div>
  );
}
