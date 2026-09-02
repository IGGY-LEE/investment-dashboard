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
