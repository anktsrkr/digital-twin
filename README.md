# Ankit Sarkar — AI Solutions Architect (Digital Twin Console)

Interactive Architecture Portfolio & AI Digital Twin built with React 19, TypeScript, Vite, CopilotKit AG-UI, and Logto Authentication.

🌐 **Live URL**: [https://anktsrkr.github.io/digital-twin/](https://anktsrkr.github.io/digital-twin/)  
📝 **Architecture Blog**: [https://anktsrkr.github.io](https://anktsrkr.github.io)  
💼 **LinkedIn**: [https://linkedin.com/in/sarkaran](https://linkedin.com/in/sarkaran)

---

## ⚡ Features

- **Split-Pane Architecture Console**: Left pane displays verified executive dossiers, career achievements, and enterprise architectures; right pane is a real-time agentic chat terminal.
- **Enterprise Agentic Chat**: Real-time token streaming with tool calling (live calendar availability, resume asset downloads, system design cards).
- **Logto OIDC Authentication**: Passwordless magic link recruiter authentication with disposable email protection.
- **Automated CI/CD**: Seamless GitHub Actions deployment to GitHub Pages.

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env` and set your backend API URL and Logto credentials:
   ```env
   VITE_LOGTO_ENDPOINT=https://<your-tenant>.logto.app
   VITE_LOGTO_APP_ID=YOUR_LOGTO_APP_ID
   VITE_LOGTO_API_RESOURCE=api://digital.twin
   VITE_API_URL=http://localhost:5000
   VITE_BACKEND_API_URL=http://localhost:5000
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🚀 Deployment to GitHub Pages

Deployment is automated via GitHub Actions in `.github/workflows/deploy.yml`.

### Required GitHub Secrets
Configure under **Settings > Secrets and variables > Actions**:
- `VITE_BACKEND_API_URL`: Your hosted backend URL (e.g. on MonsterASP.NET: `https://<site>.monsterasp.net`)
- `VITE_LOGTO_ENDPOINT`: Your Logto endpoint URL (e.g. `https://<tenant>.logto.app`)
- `VITE_LOGTO_APP_ID`: Your Logto Single-Page App ID
- `VITE_LOGTO_API_RESOURCE`: Your Logto API Resource indicator (e.g. `api://digital.twin`)
