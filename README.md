# ⚡ GitHub Insight Dashboard

A sleek, fully responsive **Next.js + TypeScript** dashboard that visualizes a user’s **GitHub statistics, activity, repositories, and language usage** — all in one place.

Built with modern UI using **shadcn/ui**, **TailwindCSS**, and **Recharts**, this app offers real-time GitHub insights with auto-refreshing data.

---

## 🚀 Features

✅ **GitHub User Insights**
- View avatar, bio, followers, following, and join date  
- Displays live synced data from GitHub’s REST API

✅ **Repository Analytics**
- Total repositories, stars, forks, and organizations  
- Lists top-starred repositories with details and links  

✅ **Visual Charts**
- Language usage distribution (Pie Chart)  
- Repository creation timeline (Area Chart)  
- GitHub contributions heatmap  

✅ **Responsive Dashboard**
- Beautiful layout across mobile, tablet, and desktop  
- Adaptive chart sizing and grid responsiveness  
- Sticky header with real-time refresh indicator  

✅ **Live Sync**
- Auto-refreshes data every 5 minutes  
- Manual refresh button with loader animation  

---

## 🧱 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | [Next.js 14](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS + [shadcn/ui](https://ui.shadcn.com) |
| **Icons** | [lucide-react](https://lucide.dev) |
| **Charts** | [Recharts](https://recharts.org) & [react-calendar-heatmap](https://github.com/patientslikeme/react-calendar-heatmap) |
| **Data Fetching** | Custom `useGitHubData()` hook using `fetch` API |
| **Deployment** | Vercel / Render / Netlify |

---

## 🗂️ Folder Structure

```
📦 project-root/
├── app/
│ ├── page.tsx # Home page (username input)
│ ├── dashboard/page.tsx # Main dashboard (this file)
│ └── layout.tsx # App layout wrapper
│
├── components/
│ ├── charts/
│ │ ├── language-chart.tsx
│ │ ├── repo-timeline-chart.tsx
│ │ └── contribution-heatmap.tsx
│ ├── ui/ # shadcn/ui components
│ └── refresh-indicator.tsx
│
├── hooks/
│ └── use-github-data.ts # Custom data fetching hook
│
├── lib/
│ └── utils.ts # Optional helpers
│
├── public/ # Static assets
└── README.md # This file
```


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/MainakVerse/Github-Insight-Dashboard.git
cd github-insight-dashboard
```

### 2️⃣ Install Dependencies
```
npm install
# or
yarn install
```

### 3️⃣ Run the Development Server

```
npm run dev
```

### 4️⃣Create an access token from GitHub

```
GITHUB_TOKEN=ghp_your_personal_access_token
```

### 5️⃣ Future Enhancements

- Add dark/light mode toggle

- Add trending repositories view

- Add organization-level analytics

- Export reports as PDF/CSV
