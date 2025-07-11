// test-claude.js - Test script for Claude AI endpoints
const BASE_URL = 'http://localhost:3000';

async function testClaudeEndpoints() {
  console.log('🧪 Testing Claude AI Integration...\n');

  try {
    // Test 1: Domain Valuation
    console.log('1️⃣ Testing Domain Valuation...');
    const valuationResponse = await fetch(`${BASE_URL}/domains/crypto-trader.com/valuation`);
    if (valuationResponse.ok) {
      const valuation = await valuationResponse.json();
      console.log('✅ Domain Valuation:', JSON.stringify(valuation, null, 2));
    } else {
      console.log('❌ Valuation failed:', await valuationResponse.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Domain Description
    console.log('2️⃣ Testing Domain Description...');
    const descResponse = await fetch(`${BASE_URL}/domains/rarecrypto.xyz/description?currentBid=3.5`);
    if (descResponse.ok) {
      const description = await descResponse.json();
      console.log('✅ Domain Description:', JSON.stringify(description, null, 2));
    } else {
      console.log('❌ Description failed:', await descResponse.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Market Analysis
    console.log('3️⃣ Testing Market Analysis...');
    const analysisResponse = await fetch(`${BASE_URL}/market-analysis`);
    if (analysisResponse.ok) {
      const analysis = await analysisResponse.json();
      console.log('✅ Market Analysis:', JSON.stringify(analysis, null, 2));
    } else {
      console.log('❌ Market analysis failed:', await analysisResponse.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Bulk Enhancement
    console.log('4️⃣ Testing Bulk Enhancement...');
    const bulkResponse = await fetch(`${BASE_URL}/domains/bulk-enhance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domainNames: ['ai-startup.com', 'blockchain-news.org']
      })
    });
    
    if (bulkResponse.ok) {
      const bulk = await bulkResponse.json();
      console.log('✅ Bulk Enhancement:', JSON.stringify(bulk, null, 2));
    } else {
      console.log('❌ Bulk enhancement failed:', await bulkResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: node index.js');
    console.log('💡 And that CLAUDE_API_KEY is set in your environment');
  }
}

// Run tests
testClaudeEndpoints();