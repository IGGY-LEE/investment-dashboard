import React, { useState } from 'react'
import { Puzzle, Sparkles, Zap, DownloadCloud, Activity, CheckCircle2, Search, Brain } from 'lucide-react'

export default function Plugins() {
  const [installedPlugins, setInstalledPlugins] = useState(['earnings', 'sentiment'])
  
  // Fallback for missing icon in import
  const ShieldAlert = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>

  const plugins = [
    {
      id: 'earnings',
      title: 'Gemini 어닝콜 요약기',
      category: '기업 분석',
      icon: <Brain size={24} color="#a855f7" />,
      desc: '분기별 실적 발표(Earnings Call)의 오디오 및 스크립트를 실시간으로 분석하여 핵심 가이던스와 경영진의 뉘앙스를 3줄 요약합니다.',
      author: 'Google AI',
      downloads: '124K'
    },
    {
      id: 'sentiment',
      title: '글로벌 뉴스 센티먼트 스캐너',
      category: '시장 심리',
      icon: <Activity size={24} color="#3b82f6" />,
      desc: '블룸버그, 로이터 등 수만 개의 실시간 금융 기사를 NLP로 분석하여 특정 종목에 대한 긍정/부정(Bull/Bear) 지수를 산출합니다.',
      author: 'FinTech Labs',
      downloads: '89K'
    },
    {
      id: 'insider',
      title: '내부자 거래(Insider) 알리미',
      category: '리스크 관리',
      icon: <ShieldAlert size={24} color="#ef4444" />,
      desc: '미국 SEC EDGAR 데이터를 크롤링하여 CEO, CFO 등 주요 임원진의 자사주 대량 매수/매도 발생 시 즉시 알림을 발송합니다.',
      author: 'SEC Watcher',
      downloads: '45K'
    },
    {
      id: 'macro',
      title: '거시경제 시나리오 시뮬레이터',
      category: '포트폴리오',
      icon: <Sparkles size={24} color="#f59e0b" />,
      desc: '"연준이 금리를 50bp 인하한다면?", "유가가 $100을 돌파한다면?" 과거 상관관계를 바탕으로 내 포트폴리오의 변화를 예측합니다.',
      author: 'Quant Master',
      downloads: '67K'
    },
    {
      id: 'onchain',
      title: '크립토 고래(Whale) 트래커',
      category: '가상자산',
      icon: <Zap size={24} color="#10b981" />,
      desc: '비트코인 및 이더리움 대형 지갑의 자금 이동(거래소 입출금 등)을 온체인 데이터로 추적하여 덤핑 리스크를 조기 경보합니다.',
      author: 'Chainalysis Pro',
      downloads: '112K'
    },
    {
      id: 'filing',
      title: '공시(Filing) 이상 탐지기',
      category: '기업 분석',
      icon: <Search size={24} color="#6366f1" />,
      desc: '기업의 사업보고서(10-K, 10-Q) 내 리스크 팩터 문구 변화를 과거 수년 치와 비교 분석하여 숨겨진 악재를 찾아냅니다.',
      author: 'AlphaSeek',
      downloads: '34K'
    }
  ]

  const toggleInstall = (id) => {
    if (installedPlugins.includes(id)) {
      setInstalledPlugins(installedPlugins.filter(p => p !== id))
    } else {
      setInstalledPlugins([...installedPlugins, id])
    }
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Puzzle size={24} color="var(--accent-color)" /> AI 스킬 & 플러그인 스토어
          </h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Google Gemini 기반의 강력한 투자 분석 모듈을 대시보드에 설치하여 기능을 무한히 확장하세요.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="badge neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem' }}>
            설치된 플러그인: <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{installedPlugins.length}개</span>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', marginBottom: '2rem' }}>
        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="badge positive" style={{ marginBottom: '1rem', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none' }}>Editor's Choice</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain color="var(--accent-color)" /> Gemini 어닝콜 요약기 (PRO)
            </h2>
            <p className="text-secondary" style={{ maxWidth: '600px', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              더 이상 2시간짜리 컨퍼런스 콜을 직접 듣지 마세요. Gemini 1.5 Pro 모델이 경영진의 Q&A 세션까지 분석하여 '가이던스 상향 여부', '마진 압박 요인' 등 숨겨진 뉘앙스를 완벽하게 번역 및 요약해 드립니다.
            </p>
            <button 
              className={`badge ${installedPlugins.includes('earnings') ? 'neutral' : 'positive'} clickable`}
              style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', border: installedPlugins.includes('earnings') ? '1px solid var(--border-color)' : 'none' }}
              onClick={() => toggleInstall('earnings')}
            >
              {installedPlugins.includes('earnings') ? '설치됨 (제거)' : '무료 설치'}
            </button>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', width: '300px', display: 'none' }}>
            {/* Can add graphic here */}
          </div>
        </div>
      </div>

      <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>전체 플러그인 마켓플레이스</h2>
      <div className="grid-3">
        {plugins.map(plugin => (
          <div key={plugin.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                {plugin.icon}
              </div>
              <span className="badge neutral" style={{ fontSize: '0.75rem' }}>{plugin.category}</span>
            </div>
            
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{plugin.title}</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>
              {plugin.desc}
            </p>
            
            <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
              <div className="text-secondary" style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span>By {plugin.author} • v1.{Math.floor(Math.random() * 9)}.{Math.floor(Math.random() * 9)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <DownloadCloud size={12} /> {plugin.downloads}
                  <span style={{ margin: '0 0.25rem' }}>|</span>
                  <span style={{ color: 'var(--positive-color)' }}>업데이트: {Math.floor(Math.random() * 3) + 1}일 전</span>
                </span>
              </div>
              
              <button 
                className={`badge ${installedPlugins.includes(plugin.id) ? 'neutral' : 'positive'} clickable`}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem',
                  border: installedPlugins.includes(plugin.id) ? '1px solid var(--border-color)' : 'none'
                }}
                onClick={() => toggleInstall(plugin.id)}
              >
                {installedPlugins.includes(plugin.id) ? (
                  <><CheckCircle2 size={14} /> 활성화됨</>
                ) : (
                  <><DownloadCloud size={14} /> 설치</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
