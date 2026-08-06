const express = require('express');
const cors = require('cors');
require('dotenv').config();
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
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

// Initialize cache: stdTTL is 60 seconds, check period is 120 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

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

// Yahoo Finance API 우회 라우트 (With Caching & Fallback)
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
    let quotes = [];
    try {
      quotes = await yahooFinance.quote(symbolList);
    } catch (error) {
      if (error.result && Array.isArray(error.result)) {
        console.warn('Some symbols failed validation, returning successful ones.');
        quotes = error.result;
      } else {
        throw error;
      }
    }
    
    const data = Array.isArray(quotes) ? quotes : [quotes];
    cache.set(cacheKey, data);
    
    res.json({ quoteResponse: { result: data } });
  } catch (error) {
    console.error('Yahoo Finance API Error (Quotes):', error.message);
    // If it fails, try to return stale cache if available (though node-cache removes it after TTL by default, 
    // we can still catch immediate errors)
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
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
    
    // 번역 API를 통해 한글 제목 추가
    const translatedNews = await Promise.all(
      newsData.map(async (newsItem) => {
        try {
          const res = await translate(newsItem.title, { to: 'ko' });
          return { ...newsItem, titleKo: res.text };
        } catch (e) {
          console.error('Translation failed for:', newsItem.title, e.message);
          return { ...newsItem, titleKo: newsItem.title };
        }
      })
    );
    
    cache.set(cacheKey, translatedNews, 300); // 5 minutes cache for news
    res.json({ news: translatedNews });
  } catch (error) {
    console.error('Yahoo Finance News API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news', details: error.message });
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
    res.json({ chart: { result: [chartData] } });
  } catch (error) {
    console.error(`Yahoo Finance Chart API Error [${symbol}]:`, error.message);
    res.status(500).json({ error: 'Failed to fetch chart data', details: error.message });
  }
});

// AI Strategy Report Endpoint
app.post('/api/strategy', async (req, res) => {
  const { period } = req.body; // '주간' or '월간'
  
  try {
    // 1. Fetch current macro data for context
    const quotes = await yahooFinance.quote(['^GSPC', '^TNX', 'DX-Y.NYB', 'CL=F', 'GC=F']);
    const marketContext = quotes.map(q => `${q.shortName || q.symbol}: ${q.regularMarketPrice} (${q.regularMarketChangePercent > 0 ? '+' : ''}${q.regularMarketChangePercent.toFixed(2)}%)`).join(', ');

    if (aiClient) {
      // Real AI integration
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
      
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });
      
      let text = response.text;
      // strip markdown json block if exists
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      }
      return res.json(JSON.parse(text));
    } else {
      // Fallback robust mock generation using real data
      const isSP500Up = quotes.find(q => q.symbol === '^GSPC')?.regularMarketChangePercent > 0;
      const isRatesUp = quotes.find(q => q.symbol === '^TNX')?.regularMarketChangePercent > 0;
      
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
    }
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
        model: 'gemini-2.5-flash',
        contents: `You are an AI financial analyst. Summarize the most recent hypothetical earnings call for the ticker ${ticker}. 
Return ONLY a JSON object: 
{ "guidance": "Upgraded / Downgraded / Maintained", "summary": "A 3-bullet point summary of the earnings call", "sentiment": "Bullish / Bearish / Neutral" }`
      });
      let text = response.text;
      if (text.startsWith('\`\`\`json')) text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
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
        model: 'gemini-2.5-flash',
        contents: `Analyze the sentiment of these recent news headlines for ${ticker}: "${titles}".
Return ONLY a JSON object:
{ "score": integer between 0 to 100 (100 is highly bullish), "conclusion": "1 sentence explanation", "bullFactors": ["list of good news"], "bearFactors": ["list of bad news"] }`
      });
      let text = response.text;
      if (text.startsWith('\`\`\`json')) text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
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

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
