# Frontend Web Application

This is the React client application built with Vite. It interacts with the Express API and opens WebSocket connections for real-time task status updates.

## Directory Structure

```
frontend/
├── public/             # Static public assets
├── src/
│   ├── assets/         # Images, fonts, SVG icons
│   ├── components/     # Reusable global UI components (Button, Modal, etc.)
│   ├── hooks/          # Custom React hooks (useAuth, useSocket)
│   ├── pages/          # Router page views (Dashboard, Login, Landing)
│   ├── routes/         # Router configuration
│   ├── services/       # API call handlers & Socket clients
│   ├── index.css       # Core design system and CSS styling variables
│   └── main.jsx        # App entrypoint
├── package.json        # Build scripts and dependencies
├── vite.config.js      # Vite build config
└── .gitignore          # Git exclusion rules
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   VITE_WS_URL=http://localhost:5000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   The application will run on [http://localhost:3000](http://localhost:3000).
