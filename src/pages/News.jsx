import React, { useState, useEffect } from 'react'
import { ExternalLink, Clock, TrendingUp, Pickaxe, Banknote, Trophy, Bitcoin, Layers, RefreshCw } from 'lucide-react'
import { getNews } from '../api'

const FALLBACK_NEWS = {
  '거시/지표': [
    { source: 'Bloomberg', time: '1시간 전', title: '연준 파월 의장, "금리 인하 서두르지 않을 것"', summary: '최근 예상보다 높게 나온 CPI 데이터와 견고한 고용 시장을 근거로 금리 인하에 대한 신중론을 재차 강조했습니다.' }
  ]
};

export default function News() {
  const [activeTab, setActiveTab] = useState('거시/지표');
  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const queryMap = {
    '거시/지표': 'economy',
    '환율': 'currency',
    '원자재': 'commodities',
    '시장 주도주': 'technology',
    '가상자산': 'crypto',
    '테마/ETF': 'etf'
  };

  const fetchNewsData = async (tab) => {
    setIsLoading(true);
    setNewsList([]);
    const q = queryMap[tab] || 'finance';
    const fetchedNews = await getNews(q);
    
    if (fetchedNews && fetchedNews.length > 0) {
      const formattedNews = fetchedNews.map(item => {
        // Calculate relative time
        let pubDate;
        if (typeof item.providerPublishTime === 'string') {
          pubDate = new Date(item.providerPublishTime);
        } else {
          pubDate = new Date(item.providerPublishTime * 1000);
        }
        
        let timeStr = '알 수 없음';
        if (!isNaN(pubDate.getTime())) {
          const diffHours = Math.round((Date.now() - pubDate) / (1000 * 60 * 60));
          timeStr = diffHours < 1 ? '방금 전' : (diffHours < 24 ? `${diffHours}시간 전` : `${Math.floor(diffHours/24)}일 전`);
        }
        
        return {
          source: item.publisher || 'Finance News',
          time: timeStr,
          title: item.title,
          titleKo: item.titleKo,
          summary: item.type === 'STORY' ? '주요 기사입니다. 자세한 내용은 원문을 참고하세요.' : '관련 기사입니다.',
          link: item.link
        };
      });
      setNewsList(formattedNews);
    } else {
      setNewsList(FALLBACK_NEWS['거시/지표'] || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNewsData(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: '거시/지표', icon: <TrendingUp size={16} /> },
    { id: '환율', icon: <Banknote size={16} /> },
    { id: '원자재', icon: <Pickaxe size={16} /> },
    { id: '시장 주도주', icon: <Trophy size={16} /> },
    { id: '가상자산', icon: <Bitcoin size={16} /> },
    { id: '테마/ETF', icon: <Layers size={16} /> },
  ];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>주요 뉴스</h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            섹터별 최신 헤드라인 및 이슈를 실시간으로 확인하세요.
          </div>
        </div>
        <button 
          className="badge neutral clickable"
          onClick={() => fetchNewsData(activeTab)}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          {isLoading ? '업데이트 중...' : '최신 업데이트'}
        </button>
      </div>

      <div className="tabs" style={{ overflowX: 'auto', display: 'flex', gap: '0.5rem', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            {tab.icon} {tab.id}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', position: 'relative', minHeight: '300px' }}>
        {isLoading ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248, 250, 252, 0.5)', zIndex: 10 }}>
            <div className="text-secondary font-bold">최신 뉴스를 불러오는 중...</div>
          </div>
        ) : (
          newsList.map((news, idx) => (
            <a 
              key={idx} 
              href={news.link || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="card clickable" 
              style={{ padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{news.source || news.소스}</span>
                    <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {news.time}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', lineHeight: '1.4' }}>
                    {news.titleKo || news.title}
                  </h2>
                  {news.titleKo && news.titleKo !== news.title && (
                    <div className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                      원문: {news.title}
                    </div>
                  )}
                  <p className="text-secondary" style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {news.summary}
                  </p>
                </div>
                <div style={{ marginLeft: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', width: '40px', height: '40px', flexShrink: 0 }}>
                  <ExternalLink size={18} color="var(--text-secondary)" />
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
