import React, { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, Cpu, ShieldCheck } from 'lucide-react'
import ChartModal from '../components/ChartModal'
import MarketBriefingCard from '../components/MarketBriefingCard'
import DashboardSubNav from '../components/DashboardSubNav'
import AiThemeRadarCard from '../components/AiThemeRadarCard'
import AiSentimentGuideCard from '../components/AiSentimentGuideCard'
import AiScheduleImpactCard from '../components/AiScheduleImpactCard'
import AskGeminiCard from '../components/AskGeminiCard'
import { getMarketBriefing, getFearGreedIndex } from '../api'

export default function Dashboard() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState('코스피')
  const [lastUpdated, setLastUpdated] = useState('방금 전')
  const [isUpdating, setIsUpdating] = useState(false)
  const [briefingData, setBriefingData] = useState(null)
  const [isBriefingLoading, setIsBriefingLoading] = useState(true)
  const [fearGreedData, setFearGreedData] = useState(null)

  const handleRefreshAll = async () => {
    setIsUpdating(true)
    setIsBriefingLoading(true)
    try {
      const [bData, fgData] = await Promise.allSettled([
        getMarketBriefing(),
        getFearGreedIndex()
      ])

      if (bData.status === 'fulfilled' && bData.value) {
        setBriefingData(bData.value)
      }
      if (fgData.status === 'fulfilled' && fgData.value) {
        setFearGreedData(fgData.value)
      }

      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
    } catch (e) {
      console.error('Failed to refresh AI dashboard:', e)
    } finally {
      setIsUpdating(false)
      setIsBriefingLoading(false)
    }
  }

  useEffect(() => {
    handleRefreshAll()
  }, [])

  return (
    <div>
      {/* 상단 서브 내비게이션 바 (AI 분석 ↔ 실시간 시황) */}
      <DashboardSubNav activeTab="ai" />

      {/* 헤더 & 업데이트 바 */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} style={{ color: '#fbbf24' }} />
            <span>Gemini AI 투자 분석 인텔리전스</span>
          </h1>
          <p className="text-secondary" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
            거시 환경 분석, 외인·기관 수급 진단, 주도 테마 레이더 및 실전 행동 지침
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
            마지막 업데이트: {lastUpdated}
          </span>
          <button 
            className={`badge neutral clickable`}
            onClick={handleRefreshAll}
            disabled={isUpdating}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }}
          >
            <RefreshCw size={14} className={isUpdating ? 'spin' : ''} />
            {isUpdating ? 'AI 분석 갱신 중...' : 'AI 분석 새로고침'}
          </button>
        </div>
      </div>

      {/* Section 1: AI 실시간 마켓 마스터 브리핑 & 시장별 맞춤 나침반 */}
      <MarketBriefingCard 
        briefingData={briefingData} 
        isLoading={isBriefingLoading} 
        onRefresh={handleRefreshAll} 
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
      />

      {/* Section 2: Gemini AI 원클릭 종목·이슈 퀵 인텔리전스 */}
      <AskGeminiCard onOpenChart={(stock) => setSelectedItem(stock)} />

      {/* Section 3: Gemini AI 오늘의 테마 & 섹터 레이더 */}
      <AiThemeRadarCard onSelectStock={(stock) => setSelectedItem(stock)} />

      {/* Section 4: 2-Column Grid (실전 행동 지침 + 경제 일정 파급효과 프리뷰) */}
      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        <AiSentimentGuideCard fearGreedData={fearGreedData} />
        <AiScheduleImpactCard />
      </div>

      {/* 종목 상세 차트 모달 */}
      <ChartModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  )
}
