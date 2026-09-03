const express = require('express');
const cors = require('cors');
require('dotenv').config();
const YahooFinance = require('yahoo-finance2').default;

// Apply Method 1: Spoof User-Agent
const yahooFinance = new YahooFinance({
  fetchOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  }
});

const NodeCache = require('node-cache');
const { translate } = require('@vitalets/google-translate-api');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini
let aiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Gemini API Client initialized.");
  } catch (e) {
    console.error("Failed to initialize Gemini:", e);
  }
}

// Helper: Call Gemini with model fallback chain (gemini-3.8-flash -> gemini-3.6-flash -> gemini-2.5-flash)
async function generateGeminiContent(contents) {
  if (!aiClient) return null;
  const models = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-2.5-flash'];
  for (const model of models) {
    try {
      const response = await aiClient.models.generateContent({ model, contents });
      if (response && response.text) {
        return { text: response.text, model };
      }
    } catch (err) {
      console.warn(`Gemini model ${model} temporarily unavailable: ${err.message}. Trying next fallback...`);
    }
  }
  return null;
}

// Initialize cache: stdTTL is 60 seconds, check period is 120 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const eternalCache = {}; // Fallback cache that never expires

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Uncaught Exception / Rejection Handlers (Prevent server crash)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Helper: Map Yahoo tickers to Twelve Data tickers
function mapToTwelveData(symbol) {
  const map = {
    '^GSPC': 'SPX',
    '^IXIC': 'NDX',
    '^DJI': 'DJI',
    '^KS11': 'KOSPI', // Might not be fully supported, but we try
    '^KQ11': 'KOSDAQ',
    'GC=F': 'XAU/USD',
    'BTC-USD': 'BTC/USD',
    'KRW=X': 'USD/KRW',
    'CL=F': 'WTI/USD',
  };
  
  if (map[symbol]) return map[symbol];
  if (symbol.endsWith('.KS')) return symbol.replace('.KS', '');
  if (symbol.endsWith('.KQ')) return symbol.replace('.KQ', '');
  return symbol;
}

// Yahoo Finance API 우회 라우트 (With Caching, Twelve Data & Fallback)
app.get('/api/quotes', async (req, res) => {
  const { symbols } = req.query;
  
  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols parameter' });
  }

  const cacheKey = `quotes_${symbols}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json({ quoteResponse: { result: cachedData }, cached: true });
  }

  try {
    const symbolList = symbols.split(',');
    let finalQuotes = [];
    let failedSymbols = [...symbolList];

    // 1. Try Twelve Data if API Key exists
    if (process.env.TWELVE_DATA_API_KEY) {
      try {
        const tdSymbols = symbolList.map(mapToTwelveData).join(',');
        const tdRes = await fetch(`https://api.twelvedata.com/quote?symbol=${tdSymbols}&apikey=${process.env.TWELVE_DATA_API_KEY}`);
        const tdData = await tdRes.json();
        
        if (tdData.status !== 'error') {
          const results = tdData.symbol ? { [tdData.symbol]: tdData } : tdData; // Handle single vs multiple response
          
          failedSymbols = [];
          for (const ySymbol of symbolList) {
            const tdSym = mapToTwelveData(ySymbol);
            const data = results[tdSym];
            if (data && data.status !== 'error' && data.close) {
              finalQuotes.push({
                symbol: ySymbol,
                regularMarketPrice: parseFloat(data.close),
                regularMarketChangePercent: parseFloat(data.percent_change || 0)
              });
            } else {
              failedSymbols.push(ySymbol);
            }
          }
        }
      } catch (e) {
        console.error('Twelve Data API Error:', e.message);
      }
    }

    // 2. Fallback to Yahoo Finance for any failed or remaining symbols
    if (failedSymbols.length > 0) {
      try {
        let yQuotes = await yahooFinance.quote(failedSymbols);
        yQuotes = Array.isArray(yQuotes) ? yQuotes : [yQuotes];
        finalQuotes = [...finalQuotes, ...yQuotes];
      } catch (yError) {
        if (yError.result && Array.isArray(yError.result)) {
          finalQuotes = [...finalQuotes, ...yError.result];
        } else {
          console.warn('Yahoo fallback completely failed for remaining symbols. Trying ultimate Google Finance fallback.');
        }
      }
    }
    
    // 3. Ultimate Fallback to Google Finance Web Scraping
    if (failedSymbols.length > 0) {
      console.warn('Using Google Finance Scraper for remaining symbols...', failedSymbols);
      const mapToGoogle = (sym) => {
        if (sym.includes('.KS')) return `${sym.split('.')[0]}:KRX`;
        if (sym === '^KS11') return 'KOSPI:KRX';
        if (sym === '^KQ11') return 'KOSDAQ:KRX';
        if (sym === '^GSPC') return '.INX:INDEXSP';
        if (sym === '^DJI') return '.DJI:INDEXDJX';
        if (sym === '^IXIC') return '.IXIC:INDEXNASDAQ';
        if (sym === 'GC=F' || sym === 'GCW00') return 'GCW00:COMEX';
        if (sym === 'BTC-USD') return 'BTC-USD';
        
        const nyseStocks = ['UNH', 'GS', 'HD', 'CAT', 'CRM', 'MCD', 'V', 'BA', 'TRV', 'BRK.B', 'LLY', 'JPM', 'TSM', 'WMT', 'MA', 'XOM', 'JNJ', 'PG', 'ORCL', 'CVX', 'MRK', 'ABBV'];
        if (nyseStocks.includes(sym)) return `${sym}:NYSE`;
        
        return `${sym}:NASDAQ`; // Fallback for US stocks like AAPL, MSFT, NVDA, AMZN, META, GOOGL, ASML, COST, AMD, QCOM, INTC, TSLA, NFLX, PEP, CSCO
      };
      
      const scrapeGoogle = async (symbol) => {
        try {
          const res = await fetch(`https://www.google.com/finance/quote/${mapToGoogle(symbol)}`);
          if (!res.ok) return null;
          const html = await res.text();
          
          const priceMatch = html.match(/data-last-price="([^"]+)"/);
          if (!priceMatch) return null;
          const price = parseFloat(priceMatch[1]);
          
          let pctMatch = html.match(/class="JwB6bf"[^>]*>([^<]+)</) || html.match(/JwB6bf[^>]*>([^<]+)</);
          let changePct = 0;
          if (pctMatch) {
            changePct = parseFloat(pctMatch[1].replace('%', '').trim());
            if (html.includes(`aria-label="Down by ${pctMatch[1]}`)) changePct = -Math.abs(changePct);
          }
          
          return { symbol, regularMarketPrice: price, regularMarketChangePercent: changePct };
        } catch (e) {
          return null;
        }
      };
      
      const googleResults = await Promise.all(failedSymbols.map(scrapeGoogle));
      const validGoogleResults = googleResults.filter(q => q !== null);
      finalQuotes = [...finalQuotes, ...validGoogleResults];
      
      const successGoogleSymbols = validGoogleResults.map(q => q.symbol);
      failedSymbols = failedSymbols.filter(sym => !successGoogleSymbols.includes(sym));
    }
    
    // Save to cache
    if (finalQuotes.length > 0) {
      cache.set(cacheKey, finalQuotes);
      eternalCache[cacheKey] = finalQuotes;
    }
    
    res.json({ quoteResponse: { result: finalQuotes } });
  } catch (error) {
    console.error('Quotes API Fatal Error:', error.message);
    if (eternalCache[cacheKey]) {
      return res.json({ quoteResponse: { result: eternalCache[cacheKey] }, cached: true, fallback: true });
    }
    
    // Hard fallback: generate mock data if everything is blocked and cache is empty
    const mockData = symbols.split(',').map(sym => ({
      symbol: sym,
      regularMarketPrice: sym.includes('^KS11') ? 2750.2 : (sym.includes('^GSPC') ? 5100.5 : 100),
      regularMarketChangePercent: (Math.random() * 2) - 1
    }));
    return res.json({ quoteResponse: { result: mockData }, mock: true });
  }
});

// Yahoo Finance API 뉴스 우회 라우트 (With Caching)
app.get('/api/news', async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  const cacheKey = `news_${q}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json({ news: cachedData, cached: true });
  }

  try {
    const result = await yahooFinance.search(q, { newsCount: 15 });
    let newsData = result.news || [];
    let translatedNews = [];
    
    if (aiClient) {
      try {
        const titles = newsData.map((n, i) => `[${i}] ${n.title}`).join('\n');
        const prompt = `You are a financial translator. Translate the following news titles into natural Korean, and also write a brief 1-sentence Korean summary (guess the context from the title).
Return EXACTLY a JSON array of objects with "titleKo" and "summaryKo" keys, matching the index order. Do NOT include markdown blocks, just the JSON array.
Input:
${titles}`;
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });
        let text = response.text.trim();
        if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
        else if (text.startsWith('```')) text = text.replace(/^```\n/, '').replace(/\n```$/, '').trim();
        const aiResults = JSON.parse(text);
        
        translatedNews = newsData.map((item, idx) => ({
          ...item,
          titleKo: aiResults[idx]?.titleKo || item.title,
          summaryKo: aiResults[idx]?.summaryKo || '자세한 내용은 원문을 참고하세요.'
        }));
      } catch (e) {
        console.error('Gemini batch translation failed:', e.message);
      }
    }
    
    // Fallback to basic translation if Gemini failed or is not available
    if (translatedNews.length === 0) {
      translatedNews = await Promise.all(
        newsData.map(async (newsItem) => {
          try {
            const res = await translate(newsItem.title, { to: 'ko' });
            return { ...newsItem, titleKo: res.text, summaryKo: '자세한 내용은 원문을 참고하세요.' };
          } catch (e) {
            console.error('Translation failed for:', newsItem.title, e.message);
            return { ...newsItem, titleKo: newsItem.title, summaryKo: '자세한 내용은 원문을 참고하세요.' };
          }
        })
      );
    }
    
    cache.set(cacheKey, translatedNews, 300); // 5 minutes cache for news
    eternalCache[cacheKey] = translatedNews;
    res.json({ news: translatedNews });
  } catch (error) {
    console.error('Yahoo Finance News API Error:', error.message);
    if (eternalCache[cacheKey]) {
      console.log('Returning fallback cache for news', cacheKey);
      return res.json({ news: eternalCache[cacheKey], cached: true, fallback: true });
    }
    // Hard fallback
    return res.json({ news: [{ title: '관련 뉴스를 불러올 수 없습니다.', titleKo: '관련 뉴스를 불러올 수 없습니다.', summaryKo: '야후 파이낸스 서버가 일시적으로 차단되었습니다. 잠시 후 다시 시도해 주세요.' }], mock: true });
  }
});

// Yahoo Finance API 차트(히스토리) 우회 라우트 (With Caching)
app.get('/api/chart', async (req, res) => {
  const { symbol, interval = '1d', range = '1y' } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  const cacheKey = `chart_${symbol}_${interval}_${range}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json({ chart: { result: [cachedData] }, cached: true });
  }

  try {
    const now = new Date();
    let period1 = new Date();
    
    if (range === '1d') period1.setDate(now.getDate() - 1);
    else if (range === '5d') period1.setDate(now.getDate() - 5);
    else if (range === '1mo') period1.setMonth(now.getMonth() - 1);
    else if (range === '3mo') period1.setMonth(now.getMonth() - 3);
    else if (range === '6mo') period1.setMonth(now.getMonth() - 6);
    else if (range === '1y') period1.setFullYear(now.getFullYear() - 1);
    else if (range === '2y') period1.setFullYear(now.getFullYear() - 2);
    else if (range === '5y') period1.setFullYear(now.getFullYear() - 5);
    else if (range === '10y') period1.setFullYear(now.getFullYear() - 10);
    else if (range === 'max') period1 = new Date('1970-01-01');
    else period1.setFullYear(now.getFullYear() - 1);

    const period1Str = period1.toISOString().split('T')[0];
    const queryOptions = { period1: period1Str, interval };
    const chartData = await yahooFinance.chart(symbol, queryOptions);
    
    cache.set(cacheKey, chartData, 120); // 2 minutes cache for charts
    eternalCache[cacheKey] = chartData;
    res.json({ chart: { result: [chartData] } });
  } catch (error) {
    console.error(`Yahoo Finance Chart API Error [${symbol}]:`, error.message);
    if (eternalCache[cacheKey]) {
      console.log('Returning fallback cache for chart', cacheKey);
      return res.json({ chart: { result: [eternalCache[cacheKey]] }, cached: true, fallback: true });
    }
    // Hard fallback
    const mockChart = {
      meta: { symbol, regularMarketPrice: 100, chartPreviousClose: 100 },
      timestamp: [Math.floor(Date.now() / 1000)],
      indicators: { quote: [{ open: [100], high: [100], low: [100], close: [100], volume: [0] }] }
    };
    return res.json({ chart: { result: [mockChart] }, mock: true });
  }
});

// AI 종합 매크로 & 공급망 투자 전략 리포트 엔드포인트
app.post('/api/strategy', async (req, res) => {
  const { period = '주간' } = req.body || {};
  const cacheKey = `strategy_intelligence_${period}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json({ ...cachedData, cached: true });
  }
  
  try {
    // 1. 종합 매크로, 원자재, 해운, 환율 데이터 동시 취합
    const targetSymbols = [
      '^GSPC', '^IXIC', '^KS11',      // 주가지수
      '^TNX', '^TYVIX', '^VIX',        // 국채금리 & 변동성
      'DX-Y.NYB', 'JPY=X',             // 달러 & 엔/달러(엔캐리)
      'CL=F', 'GC=F', 'HG=F', 'NG=F',  // 유가, 금, 구리, 천연가스
      'BDRY', 'ZIM'                    // 발틱운임 ETF, 글로벌 해운선사
    ];

    let quotes = [];
    try {
      let qRes = await yahooFinance.quote(targetSymbols);
      quotes = Array.isArray(qRes) ? qRes : [qRes];
    } catch (e) {
      console.warn('Macro strategy quotes fetch partial error:', e.message);
      quotes = [
        { symbol: '^GSPC', shortName: 'S&P 500', regularMarketPrice: 5650, regularMarketChangePercent: 0.4 },
        { symbol: '^TNX', shortName: '미 국채 10년물', regularMarketPrice: 3.85, regularMarketChangePercent: -0.8 },
        { symbol: 'DX-Y.NYB', shortName: '달러 인덱스', regularMarketPrice: 101.4, regularMarketChangePercent: -0.2 },
        { symbol: 'JPY=X', shortName: '엔/달러 환율', regularMarketPrice: 145.2, regularMarketChangePercent: -0.5 },
        { symbol: 'HG=F', shortName: '구리 선물', regularMarketPrice: 4.18, regularMarketChangePercent: 1.5 },
        { symbol: 'GC=F', shortName: '금 선물', regularMarketPrice: 2520, regularMarketChangePercent: 0.6 },
        { symbol: 'CL=F', shortName: 'WTI 원유', regularMarketPrice: 73.8, regularMarketChangePercent: -1.1 },
        { symbol: 'BDRY', shortName: '발틱운임 ETF', regularMarketPrice: 14.5, regularMarketChangePercent: 2.3 }
      ];
    }

    const getQuote = (sym) => quotes.find(q => q.symbol === sym) || { regularMarketPrice: 0, regularMarketChangePercent: 0 };
    const hgPrice = getQuote('HG=F').regularMarketPrice || 4.2;
    const gcPrice = getQuote('GC=F').regularMarketPrice || 2500;
    const copperGoldRatio = ((hgPrice / gcPrice) * 1000).toFixed(2); // standard normalized ratio
    const jpyPrice = getQuote('JPY=X').regularMarketPrice || 145.0;
    const yenCarryStatus = jpyPrice < 142 ? '위험 (급격한 엔고)' : (jpyPrice < 147 ? '주의 (청산 모니터링)' : '안정 (순항)');

    const marketContext = quotes.map(q => `${q.shortName || q.symbol}: ${q.regularMarketPrice} (${q.regularMarketChangePercent > 0 ? '+' : ''}${(q.regularMarketChangePercent || 0).toFixed(2)}%)`).join(', ');

    if (aiClient) {
      try {
        const prompt = `You are the Chief Investment Officer (CIO) of a global macro hedge fund.
Analyze the following multi-asset market context:
Market Data: ${marketContext}
Calculated Metrics:
- 구리/금 비율(Copper/Gold Ratio): ${copperGoldRatio} (높을수록 경기 회복/AI 전력 수요 강세, 낮을수록 방어적 침체)
- 엔/달러 환율: ${jpyPrice} (엔캐리 리스크 상태: ${yenCarryStatus})
- Analysis Period: ${period} (주간 또는 월간)

Generate a comprehensive, institutional-grade Global Macro, Geopolitical, Commodities, and Supply Chain Investment Intelligence Report in Korean.
Return ONLY valid JSON matching this exact structure without markdown backticks:
{
  "title": "A compelling institutional-grade report headline capturing the macro regime",
  "regime": "현재 시장 국면 요약 (예: 골디락스 기대 속 공급망·엔캐리 경계 국면)",
  "summary": "3-sentence executive summary connecting monetary policy, shipping bottlenecks, commodities, and risk sentiment.",
  "keyPulses": [
    {
      "name": "엔 캐리 트레이드 위험 지수",
      "value": "${jpyPrice} 엔",
      "status": "${yenCarryStatus.split(' ')[0]}",
      "badge": "${yenCarryStatus}",
      "desc": "일본은행 금리 기조와 미국 금리 인하에 따른 엔화 청산 위험도"
    },
    {
      "name": "구리/금 비율 (경기 & AI 선행)",
      "value": "${copperGoldRatio}",
      "status": "${parseFloat(copperGoldRatio) > 1.65 ? 'positive' : 'neutral'}",
      "badge": "${parseFloat(copperGoldRatio) > 1.65 ? 'AI 전력망 강세' : '경기 관망'}",
      "desc": "구리 수요(AI 데이터센터/전력망)와 금(안전자산) 간의 상대 강도"
    },
    {
      "name": "해운운임 스트레스 (SCFI/BDI)",
      "value": "고공행진",
      "status": "warning",
      "badge": "홍해 우회 지속",
      "desc": "수에즈 운하 통항 제한에 따른 희망봉 우회 장기화 및 선복량 부족"
    },
    {
      "name": "연준 순유동성 (RRP/TGA)",
      "value": "중립~완화",
      "status": "positive",
      "badge": "금리 인하 진입",
      "desc": "연준 9월 기준금리 인하 사이클 개시 및 시중 유동성 여건"
    }
  ],
  "thematicDeepDives": {
    "macroLiquidity": "통화정책(연준 금리인하, 달러 DXY 흐름, 엔캐리 청산 파급력)에 관한 심층 3문장 분석.",
    "geopoliticsSupplyChain": "중동 분쟁, 홍해 사태, 희망봉 우회에 따른 해운운임(SCFI/BDI) 폭등 및 글로벌 물류 병목 3문장 분석.",
    "commoditiesCycle": "구리(AI 데이터센터 전력망 슈퍼사이클), 원유(수급 불균형), 금(탈달러 헤지) 가격 동향 3문장 분석.",
    "policyTariffs": "미국 대선에 따른 관세 정책, 대중국 무역 갈등, 북미 리쇼어링/니어쇼어링 파급효과 3문장 분석."
  },
  "actionableTheses": [
    {
      "id": "copper_ai",
      "theme": "AI 전력망 & 구리 슈퍼사이클",
      "title": "AI 데이터센터 전력 인프라 및 구리 밸류체인",
      "thesis": "데이터센터 전력 공급 부족과 전선 교체 주기가 맞물려 구리 수요 폭증 및 초고압 변압기 독점 수혜 지속.",
      "picks": [
        { "name": "COPX (구리 광산 ETF)", "symbol": "COPX", "type": "ETF", "role": "글로벌 구리 원자재 대장" },
        { "name": "LS / LS에코에너지", "symbol": "006260.KS", "type": "국내주식", "role": "해저케이블 및 초고압 전선" },
        { "name": "HD현대일렉트릭", "symbol": "267260.KS", "type": "국내주식", "role": "북미 초고압 변압기 3년 수주잔고" }
      ],
      "timeframe": "중장기 스윙 (3~6개월)",
      "allocation": "25%",
      "risks": "중국 건설 경기 급랭 시 단기 비철금속 가격 조정 가능성"
    },
    {
      "id": "shipping_shipbuilding",
      "theme": "물류 병목 & 조선 슈퍼사이클",
      "title": "해운 운임 고공행진과 K-조선 친환경 선박 수주 랠리",
      "thesis": "홍해 희망봉 우회 장기화로 선박 공급 부족 지속, IMO 탄소 규제로 친환경 LNG/메탄올 추진선 교체 발주 폭증.",
      "picks": [
        { "name": "HD한국조선해양", "symbol": "009540.KS", "type": "국내주식", "role": "글로벌 1위 친환경 조선 지주사" },
        { "name": "삼성중공업", "symbol": "010140.KS", "type": "국내주식", "role": "FLNG 및 고부가가치 LNG선 강자" },
        { "name": "BDRY (발틱운임 ETF)", "symbol": "BDRY", "type": "ETF", "role": "글로벌 벌크 운임지수 직접 추종" }
      ],
      "timeframe": "중기 포지션 (1~3개월)",
      "allocation": "20%",
      "risks": "중동 평화협정 체결 시 수에즈 운하 재개통에 따른 단기 운임 조정"
    },
    {
      "id": "gold_bonds_hedge",
      "theme": "금리 인하 & 탈달러 헤지",
      "title": "실질금리 하락기 금(Gold) 실물과 미국 장기 국채",
      "thesis": "연준의 금리 인하 진입으로 무수익 자산인 금의 기회비용 급감, 글로벌 중앙은행의 탈달러 실물 금 매입 지속.",
      "picks": [
        { "name": "GLD (SPDR Gold)", "symbol": "GLD", "type": "ETF", "role": "글로벌 실물 금 ETF 1위" },
        { "name": "TLT (미국 20년+ 국채)", "symbol": "TLT", "type": "ETF", "role": "금리 인하 시 자본차익 극대화" },
        { "name": "고려아연", "symbol": "010130.KS", "type": "국내주식", "role": "금/은/아연 제련 마진 수혜" }
      ],
      "timeframe": "중장기 안정 (6~12개월)",
      "allocation": "25%",
      "risks": "미국 경제 노랜딩(No Landing) 시 금리 인하 속도 조절"
    },
    {
      "id": "nearshoring_infra",
      "theme": "공급망 블록화 & 니어쇼어링",
      "title": "미-중 관세 전쟁 대응 북미 인프라 & 리쇼어링 수혜",
      "thesis": "지정학적 갈등과 관세 장벽 회피를 위해 미국·멕시코 현지 공장 신설 붐 지속. 건설기계 및 공장 자동화 수요 견조.",
      "picks": [
        { "name": "PAVE (미국 인프라 ETF)", "symbol": "PAVE", "type": "ETF", "role": "북미 도로/전력/공장 인프라" },
        { "name": "캐터필러 (CAT)", "symbol": "CAT", "type": "미국주식", "role": "글로벌 건설/채굴 중장비 독점" },
        { "name": "이튼 (ETN)", "symbol": "ETN", "type": "미국주식", "role": "스마트 배전 및 데이터센터 전력" }
      ],
      "timeframe": "장기 성장 (6개월 이상)",
      "allocation": "20%",
      "risks": "글로벌 보호무역주의 심화에 따른 수출 둔화"
    }
  ],
  "assetAllocation": {
    "equities": 50,
    "commodities": 20,
    "bonds": 20,
    "cash": 10
  }
}
Ensure strictly valid JSON in Korean.`;

        const aiResult = await generateGeminiContent(prompt);
        if (!aiResult) throw new Error('All candidate Gemini models failed');

        let text = aiResult.text ? aiResult.text.trim() : '';
        if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
        else if (text.startsWith('```')) text = text.replace(/^```\n/, '').replace(/\n```$/, '').trim();

        const strategyJson = JSON.parse(text);
        const finalResponse = {
          ...strategyJson,
          period,
          updatedAt: new Date().toLocaleTimeString('ko-KR'),
          aiModel: aiResult.model === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : (aiResult.model === 'gemini-3.6-flash' ? 'Gemini 3.6 Flash' : 'Gemini 2.5 Flash')
        };

        cache.set(cacheKey, finalResponse, 300); // 5 minutes cache
        eternalCache[cacheKey] = finalResponse;
        return res.json(finalResponse);
      } catch (aiErr) {
        console.warn('AI strategy generation error, using rich fallback template:', aiErr.message);
      }
    }

    // High-quality fallback template structured identically
    const fallbackStrategy = {
      title: "연준 금리인하 사이클 진입과 글로벌 공급망·원자재 재편 전략",
      regime: "유동성 완화 기대 속 해운 병목 및 구리 슈퍼사이클 전개",
      summary: "미 연준의 금리 인하 사이클이 본격화되면서 글로벌 유동성 환경이 개선되고 있으나, 홍해 사태에 따른 해운 운임 고공행진과 엔 캐리 트레이드 청산 리스크가 잔존하고 있습니다. 이에 따라 AI 전력망(구리), 친환경 조선 수혜주, 금/장기채 등 공급망과 금리 인하에 직접 연동되는 자산 위주의 압축 포트폴리오를 권장합니다.",
      period,
      updatedAt: new Date().toLocaleTimeString('ko-KR'),
      aiModel: "Smart Macro Engine",
      keyPulses: [
        { name: "엔 캐리 트레이드 위험 지수", value: `${jpyPrice} 엔`, status: yenCarryStatus.split(' ')[0], badge: yenCarryStatus, desc: "엔화 가치 급등 시 글로벌 레버리지 자산 청산 위험도" },
        { name: "구리/금 비율 (경기 & AI 선행)", value: `${copperGoldRatio}`, status: "positive", badge: "AI 전력망 강세", desc: "구리 수요(데이터센터/인프라)와 금(안전자산) 간의 상대 강도" },
        { name: "해운운임 스트레스 (SCFI/BDI)", value: "고공행진", status: "warning", badge: "홍해 우회 지속", desc: "수에즈 운하 통항 제한에 따른 희망봉 우회 장기화 및 선박 부족" },
        { name: "연준 순유동성 (RRP/TGA)", value: "완화 기조", status: "positive", badge: "금리 인하 진입", desc: "연준 기준금리 인하 개시 및 금융시장 유동성 여건 개선" }
      ],
      thematicDeepDives: {
        macroLiquidity: "연준의 금리 인하로 실질금리가 하락하며 위험자산 선호 심리가 점진적으로 회복되고 있습니다. 다만 일본은행의 추가 금리 인상 가능성과 엔/달러 환율 140엔선 지지 여부가 단기 변동성의 최대 복병입니다.",
        geopoliticsSupplyChain: "중동 및 홍해 사태로 인한 아프리카 희망봉 우회가 장기화되며 글로벌 컨테이너선 유효 선복량이 10% 이상 흡수되었습니다. 이에 따라 해운 운임과 선박 신조선가가 동반 상승하는 슈퍼사이클이 전개되고 있습니다.",
        commoditiesCycle: "구리는 전 세계적인 AI 데이터센터 전력망 구축 및 신재생에너지 인프라 증설로 구조적 쇼티지(공급 부족)에 진입했습니다. 금 역시 각국 중앙은행의 탈달러 실물 매수세에 힘입어 역사적 신고가를 경신 중입니다.",
        policyTariffs: "미국 대선 정국에서 거론되는 보편 관세 10~20% 및 대중국 고율 관세 리스크로 인해, 아시아 생산 기지를 북미 및 멕시코로 이전하는 니어쇼어링(Nearshoring) 투자가 가속화되고 있습니다."
      },
      actionableTheses: [
        {
          id: "copper_ai",
          theme: "AI 전력망 & 구리 슈퍼사이클",
          title: "AI 데이터센터 전력 인프라 및 구리 밸류체인",
          thesis: "데이터센터 전력 공급 부족과 전선 교체 주기가 맞물려 구리 수요 폭증 및 초고압 변압기 독점 수혜 지속.",
          picks: [
            { name: "COPX (구리 광산 ETF)", symbol: "COPX", type: "ETF", role: "글로벌 구리 광산 기업" },
            { name: "LS / LS에코에너지", symbol: "006260.KS", type: "국내주식", role: "해저케이블 및 초고압 전선" },
            { name: "HD현대일렉트릭", symbol: "267260.KS", type: "국내주식", role: "북미 초고압 변압기 독점 수주" }
          ],
          timeframe: "중장기 스윙 (3~6개월)",
          allocation: "25%",
          risks: "중국 건설 경기 침체 장기화 시 단기 가격 변동성"
        },
        {
          id: "shipping_shipbuilding",
          theme: "물류 병목 & 조선 슈퍼사이클",
          title: "해운 운임 고공행진과 K-조선 친환경 선박 수주 랠리",
          thesis: "홍해 희망봉 우회 장기화로 선박 공급 부족 지속, IMO 탄소 규제로 친환경 LNG/메탄올 추진선 교체 발주 폭증.",
          picks: [
            { name: "HD한국조선해양", symbol: "009540.KS", type: "국내주식", role: "친환경 고부가가치 선박 대장" },
            { name: "삼성중공업", symbol: "010140.KS", type: "국내주식", role: "FLNG 및 대형 LNG선 수주" },
            { name: "BDRY (발틱운임 ETF)", symbol: "BDRY", type: "ETF", role: "글로벌 벌크선 운임 추종" }
          ],
          timeframe: "중기 포지션 (1~3개월)",
          allocation: "20%",
          risks: "중동 휴전 협상 진전 시 수에즈 운하 통항 재개 가능성"
        },
        {
          id: "gold_bonds_hedge",
          theme: "금리 인하 & 탈달러 헤지",
          title: "실질금리 하락기 금(Gold) 실물과 미국 장기 국채",
          thesis: "연준의 금리 인하 진입으로 무수익 자산인 금의 기회비용 급감, 글로벌 중앙은행의 탈달러 실물 금 매입 지속.",
          picks: [
            { name: "GLD (SPDR Gold)", symbol: "GLD", type: "ETF", role: "글로벌 1위 금 실물 ETF" },
            { name: "TLT (미국 20년+ 국채)", symbol: "TLT", type: "ETF", role: "금리 인하에 따른 채권 평가이익" },
            { name: "고려아연", symbol: "010130.KS", type: "국내주식", role: "비철금속 및 귀금속 제련 마진" }
          ],
          timeframe: "중장기 안정 (6~12개월)",
          allocation: "25%",
          risks: "미국 기대인플레이션 반등 시 긴축 장기화 우려"
        },
        {
          id: "nearshoring_infra",
          theme: "공급망 블록화 & 니어쇼어링",
          title: "미-중 관세 전쟁 대응 북미 인프라 & 리쇼어링 수혜",
          thesis: "지정학적 갈등과 관세 장벽 회피를 위해 미국·멕시코 현지 공장 신설 붐 지속. 건설기계 및 공장 자동화 수요 견조.",
          picks: [
            { name: "PAVE (미국 인프라 ETF)", symbol: "PAVE", type: "ETF", role: "북미 인프라 테마 대표 ETF" },
            { name: "캐터필러 (CAT)", symbol: "CAT", type: "미국주식", role: "글로벌 건설기계 및 채굴 장비" },
            { name: "이튼 (ETN)", symbol: "ETN", type: "미국주식", role: "산업용 전기 배전 및 스마트 제어" }
          ],
          timeframe: "장기 성장 (6개월 이상)",
          allocation: "20%",
          risks: "미국 금리 고공행진 시 기업 CapEx 설비투자 지연"
        }
      ],
      assetAllocation: {
        equities: 50,
        commodities: 20,
        bonds: 20,
        cash: 10
      }
    };

    cache.set(cacheKey, fallbackStrategy, 300);
    return res.json(fallbackStrategy);
  } catch (err) {
    console.error("Strategy API error:", err);
    res.status(500).json({ error: 'Failed to generate strategy' });
  }
});

// Plugin: Earnings Call Summarizer
app.post('/api/plugin/earnings', async (req, res) => {
  const { ticker } = req.body;
  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an AI financial analyst. Summarize the most recent hypothetical earnings call for the ticker ${ticker}. 
Return ONLY a JSON object: 
{ "guidance": "Upgraded / Downgraded / Maintained", "summary": "A 3-bullet point summary of the earnings call", "sentiment": "Bullish / Bearish / Neutral" }`
      });
      let text = response.text;
      if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
      return res.json(JSON.parse(text));
    } else {
      return res.json({
        guidance: "가이던스 유지 (Maintained)",
        summary: `• ${ticker}의 최근 실적은 컨센서스를 소폭 상회했습니다.\n• 경영진은 다음 분기 마진 압박 요인이 해소될 것이라 강조했습니다.\n• AI 및 신규 투자에 대한 CapEx(자본적 지출) 가이던스를 유지했습니다. (API Key 미적용 - 가상 데이터)`,
        sentiment: "Bullish (강세)"
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Plugin: News Sentiment Scanner
app.post('/api/plugin/sentiment', async (req, res) => {
  const { ticker } = req.body;
  try {
    const result = await yahooFinance.search(ticker, { newsCount: 10 });
    const news = result.news || [];
    const titles = news.map(n => n.title).join(' | ');

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze the sentiment of these recent news headlines for ${ticker}: "${titles}".
Return ONLY a JSON object:
{ "score": integer between 0 to 100 (100 is highly bullish), "conclusion": "1 sentence explanation", "bullFactors": ["list of good news"], "bearFactors": ["list of bad news"] }`
      });
      let text = response.text;
      if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
      return res.json(JSON.parse(text));
    } else {
      // Mock logic
      const randomScore = Math.floor(Math.random() * 60) + 20; // 20 to 80
      return res.json({
        score: randomScore,
        conclusion: `${ticker}에 관한 최근 뉴스 ${news.length}건을 분석한 결과, 시장 심리는 ${randomScore > 50 ? '긍정적' : '부정적'}입니다. (API Key 미적용 - 가상 데이터)`,
        bullFactors: ["실적 방어 기대감", "신제품 출시 루머"],
        bearFactors: ["시장 전체 변동성", "경쟁 심화 우려"]
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// AI 실시간 시장 브리핑 (Market Briefing) 엔드포인트
app.get('/api/briefing', async (req, res) => {
  const cacheKey = 'market_briefing_latest';
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    // 1. Fetch current index quotes (with safety)
    let quotes = [];
    try {
      let qRes = await yahooFinance.quote(['^GSPC', '^IXIC', '^DJI', '^KS11', '^KQ11']);
      quotes = Array.isArray(qRes) ? qRes : [qRes];
    } catch (e) {
      quotes = [
        { symbol: '^GSPC', shortName: 'S&P 500', regularMarketPrice: 7740, regularMarketChangePercent: 0.6 },
        { symbol: '^IXIC', shortName: '나스닥', regularMarketPrice: 26390, regularMarketChangePercent: 0.4 },
        { symbol: '^KS11', shortName: '코스피', regularMarketPrice: 6470, regularMarketChangePercent: -0.8 }
      ];
    }

    // 2. Fetch top breaking news
    let breakingNews = [];
    try {
      const searchRes = await yahooFinance.search('stock market economy', { newsCount: 5 });
      const rawNews = searchRes.news || [];
      breakingNews = rawNews.slice(0, 4).map(n => ({
        title: n.title,
        source: n.publisher || 'Finance News',
        time: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '방금 전',
        link: n.link || '#'
      }));
    } catch (ne) {
      console.warn('Briefing news fetch fallback:', ne.message);
    }

    const quotesSummary = quotes.map(q => `${q.shortName || q.symbol}: ${q.regularMarketPrice} (${q.regularMarketChangePercent > 0 ? '+' : ''}${(q.regularMarketChangePercent || 0).toFixed(2)}%)`).join(', ');
    const newsSummary = breakingNews.map(n => n.title).join(' | ');

    if (aiClient) {
      try {
        const prompt = `You are a chief investment strategist and financial anchor. Analyze current financial market conditions:
Market data: ${quotesSummary}
Recent headlines: ${newsSummary}

Provide a concise, real-time market briefing in Korean.
Return ONLY valid JSON matching this exact structure:
{
  "headline": "1-2 sentence real-time market headline summarizing the dominant market theme and direction with an appropriate emoji prefix.",
  "sentiment": "탐욕 / 공포 / 중립 / 관망 / 혼조 중 하나",
  "sentimentReason": "1-sentence reason for this sentiment",
  "keyDrivers": [
    "핵심 요인 1 (예: 기술주 차익 실현 및 반도체 조정)",
    "핵심 요인 2 (예: 국채 금리 안정세 및 유동성 기대)",
    "핵심 요인 3 (예: 환율 변동성 및 주요 경제 지표 발표 대기)"
  ],
  "riskLevel": "주의 / 보통 / 안정 중 하나"
}
Ensure the text is natural Korean and strictly JSON without code blocks.`;

        const aiResult = await generateGeminiContent(prompt);
        if (!aiResult) throw new Error('All candidate Gemini models failed');

        let text = aiResult.text ? aiResult.text.trim() : '';
        if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
        else if (text.startsWith('```')) text = text.replace(/^```\n/, '').replace(/\n```$/, '').trim();
        
        const aiJson = JSON.parse(text);
        const result = {
          ...aiJson,
          breakingNews,
          quotes: quotes.map(q => ({ symbol: q.symbol, name: q.shortName || q.symbol, price: q.regularMarketPrice, change: q.regularMarketChangePercent })),
          updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          aiModel: aiResult.model === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : (aiResult.model === 'gemini-3.6-flash' ? 'Gemini 3.6 Flash' : 'Gemini 2.5 Flash')
        };

        cache.set(cacheKey, result, 180); // 3 minutes cache
        eternalCache[cacheKey] = result;
        return res.json(result);
      } catch (aiErr) {
        console.warn('AI briefing generation error, using fallback:', aiErr.message);
      }
    }

    // Fallback template if AI is not available
    const isSPUp = (quotes.find(q => q.symbol === '^GSPC')?.regularMarketChangePercent || 0) > 0;
    const fallbackResult = {
      headline: isSPUp 
        ? "🚀 글로벌 증시가 주요 대형 기술주 매수세에 힘입어 견조한 상승 흐름을 이어가고 있습니다."
        : "⚠️ 주요 기술주 차익 실현과 거시경제 지표 발표를 앞둔 경계 심리로 증시가 숨고르기 양상을 보이고 있습니다.",
      sentiment: isSPUp ? "탐욕" : "중립",
      sentimentReason: isSPUp ? "주요 지수 상승 및 기업 실적 기대감 반영" : "지표 발표 관망 및 밸류에이션 부담 완화 과정",
      keyDrivers: [
        isSPUp ? "대형 기술주 중심의 반등세 지속" : "기술주 단기 변동성 및 차익 매물 출회",
        "국채 금리 및 달러 인덱스 안정화 추세",
        "주요 경제 지표(물가 및 고용) 발표 대기 모드"
      ],
      riskLevel: isSPUp ? "보통" : "주의",
      breakingNews,
      quotes: quotes.map(q => ({ symbol: q.symbol, name: q.shortName || q.symbol, price: q.regularMarketPrice, change: q.regularMarketChangePercent })),
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      aiModel: 'Smart Template'
    };

    cache.set(cacheKey, fallbackResult, 180);
    return res.json(fallbackResult);
  } catch (error) {
    console.error('Briefing API Error:', error.message);
    res.status(500).json({ error: 'Failed to generate briefing' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
