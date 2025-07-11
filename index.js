// index.js
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing
app.use(express.json());

// 🔑 Store this in Render as MONGODB_URI (Settings → Environment Variables)
const uri = process.env.MONGODB_URI 
  || "mongodb+srv://cooldad7777:76qVwi1tBlGP0pAO@cluster0.an99cl5.mongodb.net/domex?retryWrites=true&w=majority&appName=Domex";

// 🤖 Claude AI setup - Add CLAUDE_API_KEY to your environment variables
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || 'your-claude-api-key-here',
});

// Create one MongoClient for the whole app
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// 🧠 AI Helper Functions
async function getDomainValuation(domainName) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20241022",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Analyze the domain "${domainName}" and provide:
        1. Estimated value range in USD
        2. Key factors affecting its value
        3. Target audience/use cases
        4. Marketability score (1-10)
        5. Brief reasoning
        
        Format as JSON with keys: estimatedValue, factors, targetAudience, marketabilityScore, reasoning`
      }]
    });
    
    return JSON.parse(message.content[0].text);
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

async function generateDomainDescription(domainName, currentBid = null) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20241022",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Create a compelling auction description for the domain "${domainName}"${currentBid ? ` (current bid: ${currentBid} ETH)` : ''}. 
        Include potential use cases, brand value, and why someone should bid. Keep it under 150 words and make it engaging for buyers.`
      }]
    });
    
    return message.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

async function analyzeBiddingTrends(domains) {
  try {
    const domainsText = domains.map(d => `${d.name}: ${d.highestBid || 'No bids'} ${d.currency || ''}`).join('\n');
    
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20241022",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `Analyze these domain auction data and provide market insights:
        
        ${domainsText}
        
        Provide:
        1. Overall market trends
        2. High-value domain characteristics
        3. Bidding patterns
        4. Recommendations for sellers
        
        Format as JSON with keys: trends, highValueCharacteristics, biddingPatterns, recommendations`
      }]
    });
    
    return JSON.parse(message.content[0].text);
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

// Main startup
async function main() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // GET /domains → live data
    app.get('/domains', async (_req, res) => {
      try {
        const db = client.db('domex');
        const domains = await db
          .collection('domains')
          .find({})
          .toArray();
        return res.json(domains);
      } catch (err) {
        console.error("Error fetching domains:", err);
        return res.status(500).json({ error: "Unable to load domains" });
      }
    });

    // 🤖 NEW: GET /domains/:name/valuation → AI domain valuation
    app.get('/domains/:name/valuation', async (req, res) => {
      try {
        const { name } = req.params;
        const valuation = await getDomainValuation(name);
        
        if (!valuation) {
          return res.status(500).json({ error: "Unable to generate valuation" });
        }
        
        res.json({
          domain: name,
          ...valuation,
          generatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Valuation error:", error);
        res.status(500).json({ error: "Valuation service unavailable" });
      }
    });

    // 🤖 NEW: GET /domains/:name/description → AI-generated description
    app.get('/domains/:name/description', async (req, res) => {
      try {
        const { name } = req.params;
        const { currentBid } = req.query;
        
        const description = await generateDomainDescription(name, currentBid);
        
        if (!description) {
          return res.status(500).json({ error: "Unable to generate description" });
        }
        
        res.json({
          domain: name,
          description,
          generatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Description generation error:", error);
        res.status(500).json({ error: "Description service unavailable" });
      }
    });

    // 🤖 NEW: GET /market-analysis → AI market insights
    app.get('/market-analysis', async (req, res) => {
      try {
        const db = client.db('domex');
        const domains = await db
          .collection('domains')
          .find({})
          .toArray();
        
        const analysis = await analyzeBiddingTrends(domains);
        
        if (!analysis) {
          return res.status(500).json({ error: "Unable to generate market analysis" });
        }
        
        res.json({
          ...analysis,
          totalDomains: domains.length,
          generatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Market analysis error:", error);
        res.status(500).json({ error: "Market analysis service unavailable" });
      }
    });

    // 🤖 NEW: POST /domains/bulk-enhance → Enhance multiple domains with AI
    app.post('/domains/bulk-enhance', async (req, res) => {
      try {
        const { domainNames } = req.body;
        
        if (!domainNames || !Array.isArray(domainNames)) {
          return res.status(400).json({ error: "domainNames array required" });
        }
        
        const enhanced = await Promise.all(
          domainNames.map(async (name) => {
            const [valuation, description] = await Promise.all([
              getDomainValuation(name),
              generateDomainDescription(name)
            ]);
            
            return {
              name,
              valuation,
              description,
              enhancedAt: new Date().toISOString()
            };
          })
        );
        
        res.json({ domains: enhanced });
      } catch (error) {
        console.error("Bulk enhancement error:", error);
        res.status(500).json({ error: "Bulk enhancement service unavailable" });
      }
    });

    // Optional root endpoint
    app.get('/', (_req, res) => {
      res.send(`
        <h1>🚀 Domex API with Claude AI</h1>
        <p>Available endpoints:</p>
        <ul>
          <li><strong>GET /domains</strong> - Live domain data</li>
          <li><strong>GET /domains/:name/valuation</strong> - AI domain valuation</li>
          <li><strong>GET /domains/:name/description</strong> - AI-generated description</li>
          <li><strong>GET /market-analysis</strong> - AI market insights</li>
          <li><strong>POST /domains/bulk-enhance</strong> - Bulk AI enhancement</li>
        </ul>
      `);
    });

    app.listen(PORT, () => {
      console.log(`🚀 Domex API with Claude AI running on port ${PORT}`);
      console.log(`🤖 Claude AI integration ${process.env.CLAUDE_API_KEY ? 'active' : 'requires API key'}`);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

main();
