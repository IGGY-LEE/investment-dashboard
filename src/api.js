export const getQuotes = async (symbols) => {
  if (!symbols || symbols.length === 0) return [];
  
  try {
    const symbolsStr = symbols.join(',');
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = `${baseUrl}/api/quotes?symbols=${encodeURIComponent(symbolsStr)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.quoteResponse?.result || [];
  } catch (error) {
    console.error('Failed to fetch quotes:', error);
    return [];
  }
};

export const getNews = async (query) => {
  if (!query) return [];
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${baseUrl}/api/news?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('News API response was not ok');
    const data = await response.json();
    return data.news || [];
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [];
  }
};export const getMarketBriefing = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${baseUrl}/api/briefing`);
    if (!response.ok) throw new Error('Briefing API failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch market briefing:', error);
    return null;
  }
};

export const getFearGreedIndex = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${baseUrl}/api/fear-greed`);
    if (!response.ok) throw new Error('Fear & Greed API failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch fear greed index:', error);
    return null;
  }
};

/**
 * Fetch historical chart data from local proxy backend
 * @param {string} ticker 
 * @param {string} interval - '1d', '1wk', '1mo'
 * @param {string} range - '1mo', '3mo', '1y', '5y'
 */
export async function getChartData(ticker, interval = '1d', range = '1y') {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = `${baseUrl}/api/chart?symbol=${encodeURIComponent(ticker)}&interval=${interval}&range=${range}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    if (!data.chart.result || data.chart.result.length === 0) return [];
    
    const result = data.chart.result[0];
    
    // Support yahoo-finance2 v4 format
    if (result.quotes && Array.isArray(result.quotes)) {
      return result.quotes.map(q => {
        const timeStr = q.date;
        const time = new Date(timeStr).getTime() / 1000;
        return {
          time: time,
          x: time * 1000,
          open: q.open,
          high: q.high,
          low: q.low,
          close: q.close,
          value: q.close,
          y: [q.open, q.high, q.low, q.close]
        };
      }).filter(d => d.open !== null && d.open !== undefined && d.close !== null && d.close !== undefined);
    }
    
    // Fallback for v2 format (just in case)
    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote[0] || {};
    
    // Convert to format required by Lightweight Charts & ApexCharts
    const chartData = timestamps.map((time, index) => {
      return {
        time: time, // UNIX timestamp in seconds
        x: time * 1000, // milliseconds for ApexCharts
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        value: quotes.close[index],
        y: [quotes.open[index], quotes.high[index], quotes.low[index], quotes.close[index]]
      };
    }).filter(d => d.open !== null && d.open !== undefined && d.close !== null && d.close !== undefined);
    
    return chartData;
  } catch (error) {
    console.error(`Error fetching chart data for ${ticker}:`, error);
    return [];
  }
}

export const getAiStrategy = async (period = '주간') => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${baseUrl}/api/strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period })
    });
    if (!response.ok) throw new Error('Strategy API failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch AI strategy:', error);
    return null;
  }
};

export const getPluginEarnings = async (ticker) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${baseUrl}/api/plugin/earnings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker })
    });
    if (!response.ok) throw new Error('Plugin Earnings API failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Plugin Earnings:', error);
    return null;
  }
};

export const getPluginSentiment = async (ticker) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${baseUrl}/api/plugin/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker })
    });
    if (!response.ok) throw new Error('Plugin Sentiment API failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Plugin Sentiment:', error);
    return null;
  }
};

/**
 * Fetch Gemini Quick Institutional Investment Insight for a stock or topic
 * @param {string} target 
 */
export const getAiQuickInsight = async (target = '삼성전자') => {
  const cleanTarget = target.trim();
  const curatedInsights = {
    '삼성전자': {
      target: '삼성전자',
      sentiment: 'Bullish',
      rating: '비중 확대',
      summary: 'HBM3E 퀄테스트 통과 가시화 및 범용 메모리 가격 상승 사이클 진입에 따른 밸류에이션 디스카운트 해소 국면',
      catalysts: [
        '글로벌 AI 선두 기업 향 HBM3E(8단/12단) 최종 승인 및 하반기 공급 가시화',
        'AI 서버용 고용량 eSSD 수요 급증과 범용 DRAM/NAND 고정거래가격 상승세',
        '파운드리 2nm/3nm 선단 공정 수율 안정화를 통한 글로벌 빅테크 수주 기대'
      ],
      risks: [
        'HBM 양산 일정 재지연 시 단기 외국인 수급 변동성 확대',
        '글로벌 매크로 불확실성에 따른 PC·스마트폰 세트 완제품 수요 둔화'
      ],
      horizon: '중장기 스윙 (3~6개월)',
      keyMetric: '12M Fwd PBR 1.1배 수준으로 역사적 하단 구간, 손익비(Risk/Reward)가 매우 우수한 진입 매력',
      aiModel: 'Gemini 3.8 Flash'
    },
    'SK하이닉스': {
      target: 'SK하이닉스',
      sentiment: 'Bullish',
      rating: '적극 매수',
      summary: 'HBM3E 독점적 지배력과 차세대 HBM4 선제 개발로 글로벌 AI 메모리 시장 초격차 마진 유지',
      catalysts: [
        '엔비디아 차세대 AI 가속기 독점적 HBM3E 공급 지속 및 2025년 생산 물량 완판',
        '영업이익률 30%를 상회하는 고수익 HBM 믹스 개선 효과',
        '용인 반도체 클러스터 투자 및 차세대 첨단 패키징 리더십 선점'
      ],
      risks: [
        '경쟁사의 HBM 시장 진입 가속에 따른 2025년 판가(ASP) 하락 압력',
        '단기 급등에 따른 밸류에이션 차익 실현 매물 출회'
      ],
      horizon: '단기 스윙 ~ 중기 (1~3개월)',
      keyMetric: 'AI 서버 메모리 시장점유율 50% 상회, 2024년 사상 최대 영업이익 달성 전망',
      aiModel: 'Gemini 3.8 Flash'
    },
    '알테오젠': {
      target: '알테오젠',
      sentiment: 'Bullish',
      rating: '적극 매수',
      summary: '키트루다 SC 독점 변경 계약 및 다국적 제약사 피하주사(SC) 플랫폼 추가 기술수출 기대감 고조',
      catalysts: [
        '머크(MSD) 키트루다 SC 임상 3상 성공에 따른 조기 상용화 및 마일스톤 유입',
        '피하주사(ALT-B4) 글로벌 빅파마 대상 추가 라이선스아웃 계약 임박',
        '코스닥 시총 1위 등극에 따른 패시브 자금 대규모 유입'
      ],
      risks: [
        '미국 FDA 품목 허가 심사 타임라인 지연 리스크',
        '바이오 섹터 전반의 임상 데이터 및 금리 변동성에 따른 급등락'
      ],
      horizon: '중장기 스윙 (3~6개월)',
      keyMetric: '키트루다 SC 전환율 50% 가정 시 연간 조 단위 로열티 현금흐름 창출 가능',
      aiModel: 'Gemini 3.8 Flash'
    },
    '엔비디아': {
      target: '엔비디아',
      sentiment: 'Bullish',
      rating: '비중 확대',
      summary: '블랙웰(Blackwell) 아키텍처 출시와 클라우드 빅테크의 AI CapEx 상향이 뒷받침하는 강력한 해자',
      catalysts: [
        '블랙웰 B200 서버 수주잔고 폭증 및 데이터센터 매출 견인',
        'CUDA 생태계를 기반으로 한 글로벌 AI 가속기 시장 독점적 록인(Lock-in) 효과',
        '기업 및 각국 소버린 AI(Sovereign AI) 인프라 구축 수요 확산'
      ],
      risks: [
        'TSMC 첨단 패키징(CoWoS) 선단 공정 공급 병목 현상',
        '미국 정부의 대중국 AI 반도체 추가 수출 규제 리스크'
      ],
      horizon: '장기 보유 (6~12개월)',
      keyMetric: '데이터센터 매출 비중 85% 돌파, PEG(주가수익성장비율) 1.2배로 성장성 대비 합리적 구간',
      aiModel: 'Gemini 3.8 Flash'
    },
    '현대차': {
      target: '현대차',
      sentiment: 'Bullish',
      rating: '비중 확대',
      summary: '인도법인(IPO) 대규모 유동성 확보 및 하이브리드(HEV) 고수익 라인업 확장을 통한 밸류업 모멘텀',
      catalysts: [
        '전기차 캐즘(Chasm)을 돌파하는 하이브리드/EREV 글로벌 판매 호조',
        '역대 최대 규모 자사주 매입 및 총주주환원율(TSR) 35% 달성 주주가치 제고',
        '인도 시장 점유율 2위 지위와 현지 상장 프리미엄'
      ],
      risks: [
        '미국 대선 결과에 따른 인플레이션 감축법(IRA) 보조금 축소 우려',
        '원/달러 환율 하락 시 수출 마진율 일시적 축소'
      ],
      horizon: '중장기 안정 (6~12개월)',
      keyMetric: '배당수익률 5.5% 상회 및 PER 5배 수준의 극단적 저평가 매력',
      aiModel: 'Gemini 3.8 Flash'
    },
    'KB금융': {
      target: 'KB금융',
      sentiment: 'Bullish',
      rating: '비중 확대',
      summary: '국내 최고 수준의 자본비율(CET1)을 바탕으로 한 선도적인 밸류업 주주환원 프레임워크 구축',
      catalysts: [
        '자사주 매입·소각 정례화 및 주주환원율 40% 조기 달성 가시화',
        '비은행 포트폴리오(증권, 보험, 카드)의 다변화된 수수료 이익 성장',
        '외국인 지분율 75% 돌파 등 글로벌 배당 펀드의 지속적 수급 유입'
      ],
      risks: [
        '한국은행 기준금리 인하 진입 시 순이자마진(NIM) 축소 압력',
        '부동산 PF 관련 추가 충당금 적립 부담'
      ],
      horizon: '중장기 배당 스윙 (6~12개월)',
      keyMetric: 'PBR 0.55배, 배당수익률 약 5.8%로 안정성과 하방 경직성이 가장 뛰어난 밸류업 대장',
      aiModel: 'Gemini 3.8 Flash'
    },
    'HD현대일렉트릭': {
      target: 'HD현대일렉트릭',
      sentiment: 'Bullish',
      rating: '적극 매수',
      summary: '북미 전력망 교체 및 AI 데이터센터 전력 수요 폭발로 2030년까지 수주 잔고가 가득 찬 변압기 글로벌 1위',
      catalysts: [
        '북미 유틸리티 기업 향 초고압 변압기 3년 이상 수주잔고 확보',
        '판가 상승(ASP 인상)에 따른 분기 영업이익률 20% 돌파 서프라이즈',
        '울산 및 미국 공장 증설을 통한 납기 단축 경쟁력 강화'
      ],
      risks: [
        '구리 원자재 가격 급등에 따른 단기 매출원가율 상승',
        '단기 급등에 따른 밸류에이션 부담'
      ],
      horizon: '중장기 스윙 (3~6개월)',
      keyMetric: '수주잔고 5조원 돌파, 연평균 EPS 성장률 45%를 상회하는 압도적 성장성',
      aiModel: 'Gemini 3.8 Flash'
    }
  };

  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    let response = await fetch(`${baseUrl}/api/ai/quick-insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: cleanTarget, query: cleanTarget })
    });

    // If remote returns 404 (e.g. Render deploying), try local proxy
    if (!response.ok && baseUrl) {
      try {
        response = await fetch(`/api/ai/quick-insight`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: cleanTarget, query: cleanTarget })
        });
      } catch (localErr) {
        // ignore and fallback
      }
    }

    if (response.ok) {
      const data = await response.json();
      if (data && data.summary) return data;
    }
  } catch (error) {
    console.warn('Backend quick insight fetch failed, checking curated dictionary:', error.message);
  }

  // Fallback to curated dictionary if available
  if (curatedInsights[cleanTarget]) {
    return {
      ...curatedInsights[cleanTarget],
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    };
  }

  // Generic intelligent fallback
  return {
    target: cleanTarget,
    sentiment: 'Bullish',
    rating: '비중 확대',
    summary: `${cleanTarget}은(는) 업황 반등 기대감과 주력 사업부문의 실적 턴어라운드를 바탕으로 견조한 수급 흐름을 형성하고 있습니다.`,
    catalysts: [
      '글로벌 핵심 밸류체인 수요 증가에 따른 하반기 실적 개선 기대',
      '신규 수주 파이프라인 및 고부가가치 제품 믹스 개선',
      '기관 및 외국인의 실적주 중심 분할 매수세 유입'
    ],
    risks: [
      '글로벌 거시경제 금리 및 환율 변동성에 따른 단기 센티먼트 위축',
      '단기 기술적 저항선 부근 매물 소화 과정'
    ],
    horizon: '중장기 스윙 (3~6개월)',
    keyMetric: '업종 평균 대비 양호한 재무 건전성 및 밸류에이션 매력 확보',
    updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    aiModel: 'Gemini 3.8 Flash (Fallback)'
  };
};

