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

If you haven’t already cloned or created a `domex-api` project folder, follow these steps:

1. **Create or clone the project**

   * **Clone the template** (no auth needed):

     ```bash
     git clone https://github.com/openrob/domex-api-starter.git domex-api
     ```
   * **Or fork & clone** to your own account (replace `<your-github-username>`):

     ```bash
     git clone https://github.com/<your-github-username>/domex-api-starter.git domex-api
     ```
   * **Or create from scratch**:

     ```bash
     mkdir domex-api && cd domex-api
     # copy index.js and package.json into this folder (or run npm init)
     ```

2. **Enter the project directory**

   ```bash
   cd domex-api
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

---

## ⚙️ Configuration

This service leverages MongoDB Atlas for persistence. Manage your secrets via environment variables.

| Variable      | Description                              | Example                                                                                                     |                                                                                                             |
| ------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI` | MongoDB connection string (including DB) | `mongodb+srv://cooldad7777:76qVwi1tBlGP0pAO@cluster0.an99cl5.mongodb.net/domex?retryWrites=true&w=majority` | `mongodb+srv://cooldad7777:76qVwi1tBlGP0pAO@cluster0.an99cl5.mongodb.net/domex?retryWrites=true&w=majority` |
|               |                                          |                                                                                                             | `mongodb+srv://user:pass@cluster0.xyz.mongodb.net/domex?retryWrites=true&w=majority`                        |

> **Pro Tip:** On Render.com, add `MONGODB_URI` under **Settings → Environment Variables**.

---

## ▶️ Usage

Make sure you are **inside the project root** (`domex-api` folder) where your `package.json` and `index.js` live.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the server**

   ```bash
   node index.js
   ```

> If you have **nodemon** installed globally for auto-reloads, you can run:
>
> ```bash
> nodemon index.js
> ```

The server listens on **port 3000** by default (or `process.env.PORT` when deployed).

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

---

## 🛠️ Troubleshooting

### Authentication Errors Cloning Repo

* If you see **Permission denied (publickey)** when cloning via SSH:

  1. Make sure you generated an SSH key on your machine by running:

     ```bash
     ssh-keygen -t ed25519 -C "your-email@example.com"
     ```
  2. Start the agent and add your key:

     ```bash
     eval "$(ssh-agent -s)"
     ssh-add ~/.ssh/id_ed25519
     ```
  3. Copy the contents of `~/.ssh/id_ed25519.pub` and add it in **GitHub → Settings → SSH and GPG keys → New SSH key**.

* Or use a Personal Access Token (PAT) with HTTPS if you prefer:

  ```bash
  git clone https://<YOUR_GITHUB_TOKEN>@github.com/openrob/domex-api-starter.git domex-api
  ```

### Cannot GET /

If you visit the root URL and see **Cannot GET /**, remember to hit the `/domains` endpoint:

```
https://<your-service>.onrender.com/domains
```

---

\[cooldad7777\@archlinux \~]\$ ssh-keygen -t ed25519 -C [berres.builders@gmail.com](mailto:berres.builders@gmail.com)

Generating public/private ed25519 key pair.

Enter file in which to save the key (/home/cooldad7777/.ssh/id\_ed25519):&#x20;
