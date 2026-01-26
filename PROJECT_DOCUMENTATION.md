# Civil Engineering Project Management System

A comprehensive role-based project management platform for civil engineering projects with Admin, Engineer, and Client portals.

## 🏗️ Features

### **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, Engineer, Client)
- Secure password hashing with bcrypt
- Protected routes with automatic token validation

### **Admin Portal**
- **Dashboard**: Real-time statistics (total projects, engineers, pending approvals)
- **Project Management**: Create, update, assign engineers, track progress
- **Team Management**: Create teams and assign engineers to projects
- **Drawing Approvals**: Review, approve/reject engineer-uploaded drawings with comments
- **Material Approvals**: Review and approve/reject material requests
- **Schedule Management**: Create project phases with start/end dates

### **Engineer Portal**
- **Dashboard**: View assigned projects and personal stats
- **Project Updates**: Update project progress with notes
- **Drawing Upload**: Upload PDF/JPG drawings via MongoDB GridFS
- **Material Requests**: Request materials with quantity and required dates
- **Approval Tracking**: View admin feedback on drawings and materials

### **Client Portal (Read-Only)**
- **Dashboard**: View assigned projects overview
- **Project Details**: View progress, timeline, budget, and status
- **Approved Drawings**: Access and download approved drawings
- **Schedules**: View project phases and timelines

### **Notification System**
- In-app notifications with bell icon and unread badge
- Email notifications via Resend for:
  - Drawing uploads (Engineer → Admin)
  - Material requests (Engineer → Admin)
  - Approvals/Rejections (Admin → Engineer)
  - Schedule changes (Admin → Engineer)
  - Project assignments (Admin → Engineer)

## 🎨 Design System

**Theme**: "Structural Integrity" - Professional Construction Aesthetic

**Colors**:
- Primary: Steel Beam (Slate-900 #0F172A)
- Secondary: Safety Orange (Orange-600 #EA580C)
- Background: Concrete Mist (Slate-50 #F8FAFC)
- Surface: Blueprint White (#FFFFFF)
- Accent: Technical Blue (Sky-500 #0EA5E9)

**Typography**:
- Headings: Barlow Condensed (Bold, Uppercase)
- Body: Inter
- Code: JetBrains Mono

**Design Elements**:
- Sharp edges with minimal border radius
- Technical shadows (4px offset)
- Bento grid layout
- Graph paper background pattern
- Button press animations

## 🛠️ Technology Stack

### **Backend**
- **Framework**: FastAPI
- **Database**: MongoDB with Motor (async)
- **File Storage**: MongoDB GridFS (for PDF/JPG drawings)
- **Authentication**: JWT with PyJWT
- **Password Hashing**: bcrypt
- **Email**: Resend API
- **Language**: Python 3.9+

### **Frontend**
- **Framework**: React 19
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (Radix UI)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: Sonner (Toast)
- **State Management**: React useState/useEffect

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── .env                   # Environment variables
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── EngineerDashboard.js
│   │   │   ├── ClientDashboard.js
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── engineer/      # Engineer pages
│   │   │   └── client/        # Client pages
│   │   ├── components/
│   │   │   ├── DashboardLayout.js
│   │   │   ├── NotificationBell.js
│   │   │   └── ui/            # Shadcn components
│   │   ├── utils/
│   │   │   └── api.js         # Axios configuration
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── .env                   # Frontend environment
│
└── design_guidelines.json     # Design system documentation
```

## 🚀 Getting Started

### **Prerequisites**
- Python 3.9+
- Node.js 16+
- MongoDB running on localhost:27017
- Resend API key (for email notifications)

### **Backend Setup**

1. Install dependencies:
```bash
cd /app/backend
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production"
RESEND_API_KEY="your_resend_api_key"
SENDER_EMAIL="onboarding@resend.dev"
```

3. Start the server:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### **Frontend Setup**

1. Install dependencies:
```bash
cd /app/frontend
yarn install
```

2. Configure environment in `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

3. Start development server:
```bash
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000)

## 🔑 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### **Projects**
- `POST /api/projects` - Create project (Admin)
- `GET /api/projects` - Get projects (role-filtered)
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project (Admin)
- `POST /api/projects/{id}/assign` - Assign engineers (Admin)
- `POST /api/projects/{id}/progress` - Update progress (Engineer)

### **Teams**
- `POST /api/teams` - Create team (Admin)
- `GET /api/teams` - Get all teams (Admin)

### **Drawings**
- `POST /api/drawings/upload` - Upload drawing (Engineer)
- `GET /api/drawings` - Get drawings (role-filtered)
- `GET /api/drawings/{id}/download` - Download drawing
- `POST /api/drawings/{id}/approve` - Approve/Reject (Admin)

### **Materials**
- `POST /api/materials/request` - Request material (Engineer)
- `GET /api/materials` - Get materials (role-filtered)
- `POST /api/materials/{id}/approve` - Approve/Reject (Admin)

### **Schedules**
- `POST /api/schedules` - Create schedule (Admin)
- `GET /api/schedules` - Get schedules
- `PUT /api/schedules/{id}` - Update schedule (Admin)
- `DELETE /api/schedules/{id}` - Delete schedule (Admin)

### **Notifications**
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/{id}/read` - Mark as read
- `GET /api/notifications/unread/count` - Get unread count

### **Statistics**
- `GET /api/stats/admin` - Admin dashboard stats
- `GET /api/stats/engineer` - Engineer dashboard stats

## 👥 Default Test Users

Create test users via the registration form or API:

```json
{
  "email": "admin@buildtrack.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "Admin"
}

{
  "email": "engineer@buildtrack.com",
  "password": "engineer123",
  "name": "John Engineer",
  "role": "Engineer",
  "employee_id": "ENG-001"
}

{
  "email": "client@buildtrack.com",
  "password": "client123",
  "name": "Sarah Client",
  "role": "Client"
}
```

## 📊 Database Collections

### **users**
- user_id, email, password_hash, name, role, employee_id, created_at

### **projects**
- project_id, name, client_name, location, start_date, end_date, budget, status, assigned_engineers[], progress, created_at

### **teams**
- team_id, name, project_id, engineer_ids[], created_at

### **drawings**
- drawing_id, project_id, engineer_id, engineer_name, file_id (GridFS), filename, status, admin_comments, upload_date

### **materials**
- material_id, project_id, engineer_id, engineer_name, name, quantity, required_date, status, admin_comments, created_at

### **schedules**
- schedule_id, project_id, phase_name, start_date, end_date, description, created_at

### **notifications**
- notification_id, user_id, type, title, message, read, related_id, created_at

### **progress_notes**
- note_id, project_id, engineer_id, notes, progress, created_at

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control on all endpoints
- HTTP-only token storage
- CORS configuration
- Protected routes on frontend
- Automatic token validation via Axios interceptors

## 📧 Email Notifications

Powered by Resend API, emails are sent for:
- New drawing uploads → Admin
- Material requests → Admin
- Drawing approvals/rejections → Engineer
- Material approvals/rejections → Engineer
- Schedule changes → Assigned Engineers
- Project assignments → Engineer

## 🎯 Key Features Highlights

1. **File Management**: MongoDB GridFS for efficient PDF/JPG storage
2. **Real-time Updates**: In-app notifications with unread badges
3. **Role Segregation**: Complete separation of Admin/Engineer/Client views
4. **Progress Tracking**: Visual progress bars and status updates
5. **Approval Workflow**: Structured drawing and material approval process
6. **Schedule Management**: Calendar-based project phase planning
7. **Professional Design**: Construction-themed UI with technical shadows

## 🔧 Customization

### **Change Colors**
Edit `/app/frontend/src/index.css` and update CSS variables:
```css
:root {
    --primary: 222.2 47% 11%;      /* Steel Beam */
    --secondary: 210 40% 96.1%;    /* Adjust as needed */
    /* ... */
}
```

### **Add New Routes**
1. Add route in `/app/backend/server.py`
2. Create corresponding page in `/app/frontend/src/pages/`
3. Update navigation in `DashboardLayout.js`

### **Modify Email Templates**
Edit the HTML content in the `send_email_notification` function calls within `server.py`

## 📝 Testing

### **Backend API Testing**
```bash
# Register user
curl -X POST "http://localhost:8001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","role":"Admin"}'

# Login
curl -X POST "http://localhost:8001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"Admin"}'
```

### **Frontend Testing**
Use the Playwright-based testing subagent or manual browser testing

## 🐛 Troubleshooting

### **Backend not starting**
- Check MongoDB is running: `systemctl status mongodb`
- Verify environment variables in `/app/backend/.env`
- Check logs: `tail -n 50 /var/log/supervisor/backend.err.log`

### **Frontend not connecting**
- Verify `REACT_APP_BACKEND_URL` in `/app/frontend/.env`
- Check CORS settings in backend
- Open browser console for errors

### **File upload failing**
- Ensure MongoDB GridFS is properly configured
- Check file size limits
- Verify file type validation (only PDF/JPG allowed)

## 🚀 Deployment

### **Production Checklist**
- [ ] Change JWT_SECRET to strong random value
- [ ] Update CORS_ORIGINS to specific domains
- [ ] Configure MongoDB with authentication
- [ ] Set up SSL/TLS certificates
- [ ] Enable rate limiting
- [ ] Configure proper logging
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Use production Resend API key
- [ ] Optimize build: `yarn build`

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review API documentation
- Check browser/server console logs

---

**Built with ❤️ for Civil Engineering Project Management**
