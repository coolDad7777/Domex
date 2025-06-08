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

   * **Template (no fork or auth needed):**

     ```bash
     git clone https://github.com/openrob/domex-api-starter.git domex-api
     cd domex-api
     ```
   * **Or, if you’ve forked to your account (replace `<your-github-username>`):**

     ```bash
     git clone https://github.com/<your-github-username>/domex-api-starter.git domex-api
     cd domex-api
     ```
   * **Or, clone directly with SSH (no password prompt):**

     ```bash
     git clone git@github.com:coolDad7777/domex-api-starter.git domex-api
     cd domex-api
     ```

2. **If you encounter authentication errors** (password auth deprecated):

   * **Using SSH keys** (recommended):

     1. Generate an SSH key:

        ```bash
        ssh-keygen -t ed25519 -C "<your-email@example.com>"
        ```
     2. Start the ssh-agent and add your key:

        ```bash
        eval "$(ssh-agent -s)"
        ssh-add ~/.ssh/id_ed25519
        ```
     3. Copy your public key to GitHub (see [https://github.com/settings/keys](https://github.com/settings/keys))
     4. Clone:

        ```bash
        git clone git@github.com:coolDad7777/domex-api-starter.git domex-api
        cd domex-api
        ```
   * **Using a Personal Access Token (PAT)**:

     1. Create a PAT at [https://github.com/settings/tokens](https://github.com/settings/tokens)
     2. Clone with your token in the URL:

        ```bash
        git clone https://<YOUR_GITHUB_TOKEN>@github.com/openrob/domex-api-starter.git domex-api
        cd domex-api
        ```

---

## ⚙️ Configuration

This service leverages MongoDB Atlas for persistence. Manage your secrets via environment variables.

| Variable      | Description                              | Example                                                                                                     |                                                                                      |
| ------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `MONGODB_URI` | MongoDB connection string (including DB) | `mongodb+srv://cooldad7777:76qVwi1tBlGP0pAO@cluster0.an99cl5.mongodb.net/domex?retryWrites=true&w=majority` |                                                                                      |
|               |                                          |                                                                                                             | `mongodb+srv://user:pass@cluster0.xyz.mongodb.net/domex?retryWrites=true&w=majority` |

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
