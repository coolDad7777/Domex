const express = require('express');
const app = express();
const domains = require('./domains.json');      // ← import your JSON

const PORT = process.env.PORT || 3000;
app.get('/domains', (_req, res) => res.json(domains));

app.listen(PORT, () => {
  console.log(`Domex API running on port ${PORT}`);
});
