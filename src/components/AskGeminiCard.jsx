import React, { useState, useEffect } from 'react'
import { Sparkles, Search, CheckCircle2, AlertCircle, ArrowRight, Clock, Target, Cpu, RefreshCw } from 'lucide-react'
import { getAiQuickInsight } from '../api'

const POPULAR_PRESETS = [
  '삼성전자',
  'SK하이닉스',
  '알테오젠',
  '엔비디아',
  '현대차',
  'KB금융',
  'HD현대일렉트릭'
]

export default function AskGeminiCard({ onOpenChart }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentQuery, setCurrentQuery] = useState('삼성전자')
  const [insight, setInsight] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInsight = async (query) => {
    if (!query || !query.trim()) return
    setIsLoading(true)
    setError(null)
    setCurrentQuery(query.trim())
    try {
      const data = await getAiQuickInsight(query.trim())
      if (data) {
        setInsight(data)
      } else {
        setError('AI 분석 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } catch (err) {
      console.error('Insight fetch error:', err)
      setError('인사이트 조회 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInsight('삼성전자')
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      fetchInsight(searchTerm.trim())
      setSearchTerm('')
    }
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* 카드 상단 헤더 */}
      <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--accent-color, #3b82f6)'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Gemini 원클릭 종목·이슈 퀵 인텔리전스</span>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.75rem' }}>
                실시간 AI 애널리스트
              </span>
            </h2>
            <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
              궁금한 종목이나 키워드를 선택하면 헤지펀드 리서치 관점의 3대 핵심 투자 의견을 즉시 브리핑합니다.
            </div>
          </div>
        </div>

        {insight?.aiModel && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={13} style={{ color: 'var(--accent-color, #3b82f6)' }} />
            {insight.aiModel}
          </span>
        )}
      </div>

      {/* 프리셋 태그 & 검색창 바 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginRight: '0.25rem' }}>추천 종목:</span>
          {POPULAR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => fetchInsight(preset)}
              className={`badge clickable ${currentQuery === preset ? 'active' : 'neutral'}`}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                border: currentQuery === preset ? '1.5px solid var(--accent-color, #3b82f6)' : '1px solid var(--border-color)',
                backgroundColor: currentQuery === preset ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-hover)',
                color: currentQuery === preset ? 'var(--accent-color, #3b82f6)' : 'var(--text-primary)',
                fontWeight: currentQuery === preset ? 'bold' : 'normal'
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="직접 종목명이나 티커 입력 (예: 카카오, 에코프로, 테슬라, 비트코인 등)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.25rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-hover)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="badge neutral clickable"
            style={{
              padding: '0 1.25rem',
              backgroundColor: 'var(--accent-color, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
            <span>분석 요청</span>
          </button>
        </form>
      </div>

      {/* 결과 영역 */}
      {isLoading ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: 'var(--surface-hover)', borderRadius: '0.75rem' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.75rem auto', color: 'var(--accent-color, #3b82f6)' }} />
          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{currentQuery}의 기관급 AI 투자 인텔리전스를 생성하고 있습니다...</div>
          <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>모멘텀 촉매, 리스크 요인, 적정 포지션 시계를 도출 중입니다.</div>
        </div>
      ) : error ? (
        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', color: '#ef4444', textAlign: 'center' }}>
          {error}
        </div>
      ) : insight ? (
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--surface-hover)',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-color)'
        }}>
          {/* 종목 요약 상단 바 */}
          <div className="flex-between" style={{ marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>{insight.target}</span>
              <span className="badge positive" style={{ fontSize: '0.8rem' }}>{insight.rating}</span>
              <span className="badge neutral" style={{ fontSize: '0.8rem' }}>{insight.horizon}</span>
            </div>
            {insight.updatedAt && (
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                분석 시각: {insight.updatedAt}
              </span>
            )}
          </div>

          {/* 1줄 투자 관점 (Summary) */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--surface-color)',
            borderRadius: '0.5rem',
            borderLeft: '4px solid var(--accent-color, #3b82f6)',
            marginBottom: '1rem',
            fontSize: '0.92rem',
            lineHeight: '1.55',
            fontWeight: '500'
          }}>
            {insight.summary}
          </div>

          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            {/* 상승 모멘텀 촉매 */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--positive-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={15} />
                <span>핵심 상승 모멘텀 (Bullish Catalysts):</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.84rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {insight.catalysts?.map((c, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{c}</li>
                ))}
              </ul>
            </div>

            {/* 주요 리스크 요인 */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={15} />
                <span>핵심 리스크 및 경계 요인 (Bearish Risks):</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.84rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {insight.risks?.map((r, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 핵심 밸류에이션 / 지표 코멘트 */}
          {insight.keyMetric && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              borderRadius: '0.5rem',
              fontSize: '0.82rem',
              color: 'var(--text-primary)'
            }}>
              <span><strong>💡 밸류에이션 코멘트:</strong> {insight.keyMetric}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
