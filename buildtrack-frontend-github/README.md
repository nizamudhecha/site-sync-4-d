# BuildTrack Frontend

Civil Engineering Project Management System - React Application

## 🏗️ Features

- **Role-Based Dashboards**: Admin, Engineer, and Client portals
- **Project Management**: Create, assign, and track projects
- **Drawing Management**: Upload and approve PDF/JPG drawings
- **Material Requests**: Request and approve materials
- **Schedule Management**: Calendar-based project scheduling
- **Notifications**: Real-time in-app notifications
- **Professional Design**: Construction-themed UI with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install

# Create .env file
cp .env.example .env

# Edit .env and add your backend URL
# REACT_APP_BACKEND_URL=http://localhost:8001

# Start development server
yarn start
```

Opens at: http://localhost:3000

## 📁 Project Structure

```
src/
├── pages/              # Page components
│   ├── Login.js        # Authentication page
│   ├── admin/          # Admin portal pages
│   ├── engineer/       # Engineer portal pages
│   └── client/         # Client portal pages
├── components/         # Reusable components
│   ├── DashboardLayout.js
│   ├── NotificationBell.js
│   └── ui/            # Shadcn UI components
├── utils/
│   └── api.js         # Axios configuration
├── App.js             # Main app with routing
├── App.css            # Custom styles
└── index.css          # Global styles + Tailwind
```

## 🎨 Tech Stack

- **React 19** - UI library
- **React Router 7** - Routing
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 🔧 Available Scripts

```bash
# Start development server
yarn start

# Build for production
yarn build

# Run tests
yarn test
```

## 🔌 Backend Integration

This frontend requires a backend API. Set the backend URL in `.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

See API documentation for required endpoints.

## 🎯 Features by Role

### Admin Portal
- Dashboard with statistics
- Create and manage projects
- Assign engineers to projects
- Approve/reject drawings
- Approve/reject material requests
- Create project schedules

### Engineer Portal
- View assigned projects
- Update project progress
- Upload drawings (PDF/JPG)
- Request materials
- View notifications

### Client Portal
- View project progress (read-only)
- Download approved drawings
- View project schedules
- Track timeline and budget

## 🎨 Design System

**Theme**: Professional Construction
**Colors**: Steel Beam (Slate-900), Safety Orange (Orange-600)
**Fonts**: Barlow Condensed, Inter

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

**Built with ❤️ for Civil Engineering Project Management**
