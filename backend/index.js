const functions = require('firebase-functions');
const admin = require('firebase-admin');
const yahooFinance = require('yahoo-finance2').default;
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.api = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { symbols } = req.query;
    
    if (!symbols) {
      return res.status(400).json({ error: 'Missing symbols parameter' });
    }

    try {
      const symbolList = symbols.split(',');
      const quotes = await yahooFinance.quote(symbolList);
      
      const data = Array.isArray(quotes) ? quotes : [quotes];
      
      return res.json({ quoteResponse: { result: data } });
    } catch (error) {
      console.error('Yahoo Finance API Error:', error);
      return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
  });
});
