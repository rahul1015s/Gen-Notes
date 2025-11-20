# 🍎 Apple Notes Clone - Complete Setup Guide

This is a beautiful, fully-functional note-taking app inspired by Apple Notes. It's a **Progressive Web App (PWA)** with offline support, beautiful modern UI, and full backend integration.

## ✨ Features

- ✅ **Apple Notes Style UI** - Clean, minimalist design inspired by Apple Notes
- ✅ **Full PWA Support** - Works offline, installable on all devices
- ✅ **Rich Text Editor** - Format text with bold, italic, lists, links, etc.
- ✅ **Folder Organization** - Organize notes into folders with custom icons
- ✅ **Pin Notes** - Pin important notes to the top
- ✅ **Tags & Search** - Tag notes and search across all notes
- ✅ **Offline Sync** - Changes sync automatically when you're back online
- ✅ **Secure Authentication** - JWT-based auth with password reset
- ✅ **Responsive Design** - Works beautifully on mobile, tablet, and desktop
- ✅ **Dark Mode Support** - Full dark mode with theme switcher
- ✅ **Rate Limiting** - Protected against abuse with smart rate limiting

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16+)
- **MongoDB** (local or cloud database)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to Backend folder**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.development.local
   ```

4. **Configure environment variables**
   Edit `.env.development.local`:
   ```
   PORT=5000
   NODE_ENV=development
   DB_URI=mongodb://localhost:27017/notes_db
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE_IN=7d
   FRONTEND_URL=http://localhost:5173
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_SECURE=false
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password
   ALLOWED_ORIGINS=http://localhost:5173
   ```

5. **Start the backend**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend folder**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   Edit `.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

5. **Start the frontend**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

6. **Open in browser**
   Visit `http://localhost:5173`

---

## 📋 Project Structure

```
Notes/
├── Backend/
│   ├── controllers/        # API route handlers
│   │   ├── auth.controller.js
│   │   ├── notes.controller.js
│   │   ├── folder.controller.js
│   │   ├── tag.controller.js
│   │   └── user.controller.js
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middlewares/       # Auth, error handling, rate limiting
│   ├── services/          # Email service
│   ├── database/          # DB connection
│   ├── app.js            # Express app setup
│   └── startServer.js    # Server entry point
│
└── Frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   │   ├── Navbar.jsx
    │   │   ├── NoteCard.jsx
    │   │   ├── TiptapEditor.jsx
    │   │   ├── FolderTree.jsx
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── pages/         # Route pages
    │   │   ├── Home.jsx
    │   │   ├── AllNotes.jsx
    │   │   ├── NotedetailPage.jsx
    │   │   ├── CreatePage.jsx
    │   │   └── ForgotPassword.jsx
    │   ├── features/      # Feature modules
    │   │   ├── folders/
    │   │   ├── tags/
    │   │   ├── search/
    │   │   ├── reminders/
    │   │   └── locks/
    │   ├── services/      # API & utility services
    │   │   ├── offlineSyncService.js
    │   │   ├── foldersService.js
    │   │   ├── pinService.js
    │   │   └── tagsService.js
    │   ├── lib/
    │   │   ├── axios.js   # API client
    │   │   └── utils.js
    │   ├── sw.js         # Service worker
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/           # Static assets
    ├── index.html
    └── vite.config.js    # PWA & build config
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Notes
- `GET /api/v1/notes` - Get all user notes
- `GET /api/v1/notes/:id` - Get specific note
- `POST /api/v1/notes` - Create note
- `PUT /api/v1/notes/:id` - Update note
- `DELETE /api/v1/notes/:id` - Delete note

### Folders
- `GET /api/v1/folders` - Get all folders
- `POST /api/v1/folders` - Create folder
- `PUT /api/v1/folders/:id` - Update folder
- `DELETE /api/v1/folders/:id` - Delete folder

### Tags
- `GET /api/v1/tags` - Get all tags
- `POST /api/v1/tags` - Create tag
- `PUT /api/v1/tags/:id` - Update tag
- `DELETE /api/v1/tags/:id` - Delete tag

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `DELETE /api/v1/users/profile` - Delete account

---

## 🛠️ Building for Production

### Backend Production Build
```bash
cd Backend
npm install
# Set NODE_ENV=production in your .env file
npm start
```

### Frontend Production Build
```bash
cd Frontend
npm install
npm run build
```

Build output will be in `Frontend/dist/` - deploy this to any static hosting (Vercel, Netlify, AWS S3, etc.)

---

## 📱 PWA Installation

The app is a Progressive Web App and can be installed:

1. **On Desktop**
   - Click the "Install" button in your browser's address bar
   - Or use the app menu → "Install app"

2. **On Mobile**
   - Open in Safari/Chrome → Share → "Add to Home Screen"
   - Or use the browser menu → "Install app"

Once installed, it works offline and has full access to your device's storage!

---

## 🔐 Security Features

✅ **JWT Authentication** - Secure token-based auth
✅ **Password Hashing** - bcrypt for password security
✅ **CORS Protection** - Configured for safe cross-origin requests
✅ **Rate Limiting** - Prevents abuse (100 requests/15 mins)
✅ **Input Validation** - All inputs validated and sanitized
✅ **XSS Protection** - DOMPurify for safe HTML rendering
✅ **Email Verification** - OTP for password reset
✅ **Offline Data Protection** - IndexedDB stores encrypted locally

---

## 🌐 Deployment

### Deploy Frontend to Vercel
```bash
cd Frontend
npm install -g vercel
vercel
```

### Deploy Backend to Vercel
1. Create `Backend/vercel.json` (already included)
2. Set environment variables in Vercel dashboard
3. Deploy:
   ```bash
   cd Backend
   vercel
   ```

### Deploy to Heroku
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
git push heroku main
```

### Deploy to Railway.app
1. Connect your GitHub repo
2. Set environment variables
3. Deploy with one click

---

## 📊 Database Schema

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Note
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  content: String (HTML),
  folderId: ObjectId (ref: Folder, optional),
  tags: [ObjectId] (ref: Tag),
  color: String,
  isPinned: Boolean,
  isArchived: Boolean,
  isLocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Folder
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  icon: String (emoji),
  parentFolderId: ObjectId (for nesting),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### CORS Error
- Make sure `FRONTEND_URL` in backend matches your frontend URL
- Check `ALLOWED_ORIGINS` includes your frontend URL

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `DB_URI` is correct
- For MongoDB Atlas, whitelist your IP

### Service Worker Not Working
- Try clearing browser cache (Ctrl+Shift+Delete)
- Check DevTools → Application → Service Workers
- Ensure HTTPS in production

### Notes Not Syncing Offline
- Check IndexedDB in DevTools → Application
- Try clearing app cache and reloading
- Check network tab for API errors

---

## 📚 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **DaisyUI** - Component library
- **Tiptap** - Rich text editor
- **Lucide React** - Icons
- **React Router v7** - Routing
- **Axios** - HTTP client
- **Workbox** - Service worker library

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **CORS** - Cross-origin support
- **Express Rate Limit** - Rate limiting

---

## 🚦 Performance Tips

1. **Compress Images** - Images are cached for 30 days
2. **Code Splitting** - Routes are lazy loaded
3. **Offline First** - App works without internet
4. **IndexedDB Caching** - Notes cached locally
5. **Service Worker** - Assets cached efficiently

---

## 📝 License

MIT License - Feel free to use this project for personal or commercial use.

---

## 🤝 Contributing

Found a bug or want to add a feature? 
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@notes.app

---

**Happy Note-Taking! 🎉**
