# 🚀 Apple Notes Clone - Quick Reference

## 🎯 What's Implemented

### ✅ Frontend (Complete & Beautiful)
- [x] Apple Notes-inspired UI with modern design
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Single Navbar component (no duplicates!)
- [x] Rich text editor with formatting
- [x] Folder organization with custom icons
- [x] Pin/unpin notes
- [x] Tags and search functionality
- [x] Dark mode support
- [x] Offline sync with IndexedDB
- [x] PWA with service worker
- [x] All pages styled with Tailwind + DaisyUI

### ✅ Backend (Complete & Secure)
- [x] JWT authentication
- [x] Notes CRUD operations
- [x] Folder management
- [x] Tags management
- [x] User management
- [x] Password reset via email
- [x] Rate limiting
- [x] CORS protection
- [x] Input validation

### ✅ PWA Features
- [x] Service Worker for offline support
- [x] Workbox caching strategies
- [x] IndexedDB for local storage
- [x] Install on any device
- [x] Auto-update support
- [x] Works on desktop, tablet, mobile

---

## 🚀 Quick Commands

### Backend
```bash
cd Backend
npm install
npm run dev              # Development mode
npm start                # Production mode
```

### Frontend
```bash
cd Frontend
npm install
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
```

### Full Stack
```bash
# Terminal 1: Backend
cd Backend && npm run dev

# Terminal 2: Frontend
cd Frontend && npm run dev
```

---

## 📋 Environment Setup

### Backend (.env.development.local)
```
PORT=5000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/notes_db
JWT_SECRET=your_secret_key
JWT_EXPIRE_IN=7d
FRONTEND_URL=http://localhost:5173
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 📂 File Structure Overview

```
Frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route pages
│   ├── features/        # Feature modules
│   ├── services/        # API & utility services
│   ├── lib/             # Helpers & configs
│   ├── sw.js           # Service worker
│   ├── App.jsx         # Main app + Navbar routing
│   └── routes.jsx      # Route definitions

Backend/
├── controllers/         # API handlers
├── models/             # Database schemas
├── routes/             # API endpoints
├── middlewares/        # Auth, error, rate limit
├── services/           # Email, utilities
├── config/             # Environment config
├── app.js             # Express setup
└── startServer.js     # Server entry
```

---

## 🎨 UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Navbar | `components/Navbar.jsx` | Single top navigation (imported in App.jsx) |
| NoteCard | `components/NoteCard.jsx` | Apple-style note card with pin/delete |
| TiptapEditor | `components/TiptapEditor.jsx` | Rich text editor |
| FolderTree | `components/FolderTree.jsx` | Sidebar folder navigation |
| Login/Signup | `components/` | Auth forms |
| AllNotes | `pages/AllNotes.jsx` | Main notes dashboard |
| CreatePage | `pages/CreatePage.jsx` | Create/edit notes |
| NotedetailPage | `pages/NotedetailPage.jsx` | View note details |

---

## 🔗 API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

### Auth
- `POST /auth/signup` - Register
- `POST /auth/login` - Login
- `POST /auth/forgot-password` - Reset password
- `POST /auth/reset-password/:token` - Confirm reset

### Notes
- `GET /notes` - All notes
- `POST /notes` - Create note
- `GET /notes/:id` - Get note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

### Folders
- `GET /folders` - All folders
- `POST /folders` - Create folder
- `PUT /folders/:id` - Update folder
- `DELETE /folders/:id` - Delete folder

### Tags
- `GET /tags` - All tags
- `POST /tags` - Create tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag

---

## 🔍 Debugging Tips

### Check if Navbar renders only once
Open DevTools → Elements → Look for only ONE `<nav>` at top

### Verify PWA Working
- DevTools → Application → Service Workers
- Should show "Active and running"
- Manifest: Application → Manifest

### Check Offline Sync
- DevTools → Application → IndexedDB
- Should have "NotesAppDB" database

### API Errors
- DevTools → Network tab
- Check headers for "Authorization: Bearer token"
- Verify CORS is not blocking

---

## 📦 Dependencies Summary

### Frontend Key Packages
- `react` - UI framework
- `vite` - Build tool
- `tailwindcss` - Styling
- `@tiptap/react` - Rich editor
- `axios` - HTTP client
- `vite-plugin-pwa` - PWA support
- `workbox-*` - Service worker
- `lucide-react` - Icons

### Backend Key Packages
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `nodemailer` - Email service
- `express-rate-limit` - Rate limiting
- `cors` - CORS support

---

## ✨ Features Showcase

### Apple Notes Style
- Clean, minimal interface
- Beautiful card-based layout
- Smooth animations
- Responsive design

### Smart Organization
- Organize notes in folders
- Pin important notes
- Tag notes for easy filtering
- Search across all notes

### Offline First
- Create/edit notes offline
- Auto-sync when online
- Works without internet
- Full local storage

### Security
- Encrypted passwords
- JWT authentication
- Rate limiting
- Email verification

### Performance
- Lightning-fast Vite builds
- Service worker caching
- Lazy route loading
- IndexedDB optimization

---

## 🎓 Learning Resources

- **Vite**: https://vitejs.dev
- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **Express**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **PWA**: https://web.dev/progressive-web-apps
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

**Ready to develop! 🎉**
