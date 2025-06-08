# Domex API

A **scalable**, **decentralized** domain-auction microservice powering the Domex marketplace.

Built with Node.js, Express, and MongoDB Atlas, this API delivers real-time auction data for frontend consumption.

---

## 🚀 Table of Contents

* [🏗️ Installation](#️installation)
* [⚙️ Configuration](#configuration)
* [▶️ Usage](#usage)
* [🌐 API Endpoints](#api-endpoints)
* [🔧 Contributing](#contributing)
* [📄 License](#license)

---

## 🏗️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<coolDad7777>/domex-api.git
   cd domex-api
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```

---

## ⚙️ Configuration

This service leverages MongoDB Atlas for persistence. Manage your secrets via environment variables.

| Variable      | Description                              | Example                                                                              |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `MONGODB_URI` | MongoDB connection string (including DB) | `mongodb+srv://user:pass@cluster0.xyz.mongodb.net/domex?retryWrites=true&w=majority` |

> **Pro Tip:** On Render.com, add `MONGODB_URI` under **Settings → Environment Variables**.

---

## ▶️ Usage

Bring up the API in development or production mode:

```bash
# Development (auto-reloads on change)
npm run dev

# Production
npm start
```

By default, the server listens on **port 3000** (or `process.env.PORT`).

---

## 🌐 API Endpoints

### `GET /`

Returns a health-check message.

**Response**

```text
Domex API – hit /domains for live data
```

---

### `GET /domains`

Fetch the full list of domain auctions.

**Response**

```json
[
  {
    "_id": "<ObjectId>",
    "name": "rarecrypto.xyz",
    "status": "auction",
    "highestBid": 3.5,
    "currency": "ETH",
    "timeRemaining": "01:22:30"
  },
  // ... more domains
]
```

> **Scalability Note:** Paging, filtering, and sorting can be enabled via query parameters in future releases.

---

## 🔧 Contributing

We welcome pull requests that enhance performance, security, and user experience. To get started:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add new endpoint'`)
4. Push (`git push origin feature/your-feature`)
5. Open a Pull Request

Please adhere to the existing code style and include relevant tests for your additions.

---

## 📄 License

This project is open source under the **MIT License**. See [LICENSE](LICENSE) for details.
