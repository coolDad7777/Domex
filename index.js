const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/domains', (req, res) => {
  res.json([
    {
      id: 'd1',
      name: 'rarecrypto.xyz',
      status: 'auction',
      highestBid: 3.5,
      currency: 'ETH',
      timeRemaining: '01:22:30'
    },
    {
      id: 'd2',
      name: 'blocktrend.eth',
      status: 'available',
      highestBid: null,
      currency: null,
      timeRemaining: null
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`Domex API running on port ${PORT}`);
});
