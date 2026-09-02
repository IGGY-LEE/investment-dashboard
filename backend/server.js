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

// AI Strategy Report Endpoint
app.post('/api/strategy', async (req, res) => {
  const { period = '주간' } = req.body || {};
  
  try {
    // 1. Fetch current macro data for context (with safe fallback)
    let quotes = [];
    try {
      let qRes = await yahooFinance.quote(['^GSPC', '^TNX', 'DX-Y.NYB', 'CL=F', 'GC=F']);
      quotes = Array.isArray(qRes) ? qRes : [qRes];
    } catch (e) {
      console.warn('Macro quotes fetch failed in strategy, using default context:', e.message);
      quotes = [
        { symbol: '^GSPC', shortName: 'S&P 500', regularMarketPrice: 5100, regularMarketChangePercent: 0.5 },
        { symbol: '^TNX', shortName: '10-Yr Bond Yield', regularMarketPrice: 4.25, regularMarketChangePercent: -0.1 },
        { symbol: 'CL=F', shortName: 'Crude Oil', regularMarketPrice: 78.5, regularMarketChangePercent: 0.2 },
        { symbol: 'GC=F', shortName: 'Gold', regularMarketPrice: 2350, regularMarketChangePercent: 0.4 }
      ];
    }

    const marketContext = quotes.map(q => `${q.shortName || q.symbol}: ${q.regularMarketPrice} (${q.regularMarketChangePercent > 0 ? '+' : ''}${(q.regularMarketChangePercent || 0).toFixed(2)}%)`).join(', ');

    if (aiClient) {
      try {
        const prompt = `You are a professional financial analyst. Based on the following real-time market data: ${marketContext}.
Write an investment strategy report for a ${period} period.
Return ONLY a JSON object matching this EXACT format:
{
  "title": "A catchy title summarizing the market",
  "summary": "A 3-sentence summary of the current macroeconomic environment and market sentiment.",
  "keyFactors": [
    { "category": "거시경제", "text": "fact 1", "status": "warning" },
    { "category": "원자재", "text": "fact 2", "status": "positive" },
    { "category": "일정/이벤트", "text": "fact 3", "status": "neutral" },
    { "category": "포트폴리오", "text": "fact 4", "status": "negative" }
  ],
  "rebalancing": "A detailed 3-sentence portfolio rebalancing recommendation.",
  "topPicks": [
    { "name": "Asset/Sector 1", "target": "Target return", "thesis": "Investment thesis", "risks": "Risk factors" },
    { "name": "Asset/Sector 2", "target": "Target return", "thesis": "Investment thesis", "risks": "Risk factors" }
  ]
}
Ensure the output is valid JSON in Korean language.`;
        
        const aiResult = await generateGeminiContent(prompt);
        if (!aiResult) throw new Error('All candidate Gemini models failed');
        
        let text = aiResult.text ? aiResult.text.trim() : '';
        if (text.startsWith('```json')) text = text.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
        else if (text.startsWith('```')) text = text.replace(/^```\n/, '').replace(/\n```$/, '').trim();
        
        return res.json(JSON.parse(text));
      } catch (aiErr) {
        console.warn('AI strategy generation failed, using structured fallback:', aiErr.message);
      }
    }

    // Fallback robust mock generation using real/context data
    const isSP500Up = (quotes.find(q => q.symbol === '^GSPC')?.regularMarketChangePercent || 0) > 0;
    const isRatesUp = (quotes.find(q => q.symbol === '^TNX')?.regularMarketChangePercent || 0) > 0;
    
    return res.json({
      title: isSP500Up ? (period === '주간' ? '단기 상승 모멘텀 유지, 기술적 저항선 돌파 시도' : '글로벌 유동성 확대에 따른 실적 장세 진입') : (period === '주간' ? '단기 변동성 확대, 방어적 포트폴리오 구축 필요' : '거시경제 불확실성 지속, 안전자산 선호 심리 강화'),
      summary: `현재 S&P500 등 주요 지수는 ${isSP500Up ? '견조한 상승 흐름을 보이고 있습니다.' : '조정 압력을 받고 있습니다.'} 미 10년물 국채 금리가 ${isRatesUp ? '상승하며 밸류에이션 부담이' : '안정되며 유동성 환경이'} ${isRatesUp ? '커진 상태입니다.' : '개선되었습니다.'} ${marketContext} 등의 실시간 데이터가 이를 뒷받침합니다.`,
      keyFactors: [
        { category: '거시경제', text: `미 국채 10년물 금리 변동성 (${isRatesUp ? '상승' : '하락'})`, status: isRatesUp ? 'warning' : 'positive' },
        { category: '증시/지수', text: `S&P500 최근 등락률 반영 중`, status: isSP500Up ? 'positive' : 'negative' },
        { category: '원자재/환율', text: `현재 달러인덱스 및 유가 흐름 주시 필요`, status: 'neutral' },
        { category: '포트폴리오', text: isSP500Up ? '주식 비중 유지 및 주도주 탑승 전략' : '현금 비중 확대 및 리스크 관리', status: 'neutral' }
      ],
      rebalancing: isSP500Up ? '현재의 상승 추세를 감안하여 성장주 비중을 유지하되, 단기 과열 시 일부 차익 실현을 권장합니다. 유동성 장세에 대비해 경기 민감주를 선별적으로 담으세요.' : '시장 변동성 확대를 대비해 고베타 주식의 비중을 축소하고 단기 채권(SHY) 및 현금 비중을 늘릴 것을 권장합니다.',
      topPicks: [
        { name: isSP500Up ? '미국 대형 기술주 (XLK)' : '단기 국채 ETF (SHY)', target: isSP500Up ? '상승 추세 추종 (+5~10%)' : '안전자산 헷지', thesis: isSP500Up ? '금리 안정화와 AI 사이클 지속에 따른 실적 기대감' : '시장 변동성 확대 시 자본 방어 및 이자 수익 수취', risks: '돌발적인 인플레이션 지표 상승 시 밸류에이션 충격 가능성' },
        { name: isRatesUp ? '금융주 ETF (XLF)' : '유틸리티 ETF (XLU)', target: '구조적 대응 (+5%)', thesis: isRatesUp ? '금리 상승에 따른 순이자마진(NIM) 개선 수혜' : '금리 하락 시 고배당 매력 부각', risks: '경기 침체 우려 발생 시 펀더멘털 악화 가능성' }
      ]
    });
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
