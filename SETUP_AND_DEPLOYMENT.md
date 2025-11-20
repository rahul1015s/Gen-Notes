# Notes App - Apple Notes Inspired

A beautiful, modern, and fully functional note-taking application inspired by Apple Notes. Built with React, Express, MongoDB, and featuring PWA capabilities with offline support.

![Notes App](https://img.shields.io/badge/React-19.1.1-blue)
![Express](https://img.shields.io/badge/Express-4.21.2-green)
![MongoDB](https://img.shields.io/badge/MongoDB-8.16.0-brightgreen)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.11-06B6D4)

## 🎯 Features

### Core Features
- ✅ **Create, Read, Update, Delete** notes with rich text editor
- ✅ **Organize notes** with folders and hierarchical structure
- ✅ **Pin important notes** for quick access
- ✅ **Tag system** for better organization
- ✅ **Search functionality** across all notes
- ✅ **Note previews** with card-based UI

### Advanced Features
- 🔒 **Secure authentication** with JWT tokens
- 📱 **Responsive design** - Works on desktop, tablet, and mobile
- 🔌 **Offline support** - Continue working offline with automatic sync
- ⚡ **PWA capabilities** - Install as app on any device
- 🌙 **Dark mode support** via DaisyUI themes
- 📧 **Email verification** for account security
- 🔐 **Password reset** functionality
- 🚀 **Rate limiting** for API protection

## 🏗️ Project Structure

```
Notes/
├── Backend/              # Express.js backend
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middlewares/     # Authentication, error handling, rate limiting
│   ├── services/        # Business logic (email, etc.)
│   ├── config/          # Configuration files
│   ├── app.js           # Express app setup
│   └── startServer.js   # Server entry point
├── Frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── features/    # Feature modules (folders, tags, etc.)
│   │   ├── services/    # API and utility services
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Library utilities
│   │   ├── context/     # React context
│   │   ├── theme/       # Theme configuration
│   │   ├── App.jsx      # Main app component
│   │   ├── main.jsx     # Entry point
│   │   └── sw.js        # Service worker
│   ├── public/          # Static assets
│   ├── vite.config.js   # Vite configuration
│   └── package.json     # Dependencies
└── package.json         # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB database (local or MongoDB Atlas)
- Git

### Backend Setup

1. **Navigate to Backend folder:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.development.local` file:**
   ```bash
   cp .env.example .env.development.local
   ```

4. **Update `.env.development.local` with your configuration:**
   ```env
   PORT=5000
   NODE_ENV=development
   DB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes_db
   JWT_SECRET=your_secret_key_here
   FRONTEND_URL=http://localhost:5173
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend folder:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.development` file:**
   ```bash
   cat > .env.development << EOF
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   EOF
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Notes
- `GET /api/v1/notes` - Get all user's notes
- `GET /api/v1/notes/:id` - Get specific note
- `POST /api/v1/notes` - Create new note
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
- `PUT /api/v1/users/profile` - Update user profile

## 🎨 UI Components

### Built with
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS component library
- **Lucide React** - Icon library
- **Tiptap** - Rich text editor
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly buttons and spacing

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Rate Limiting** - Protection against brute force attacks
- **CORS** - Cross-origin request handling
- **Input Validation** - Server-side validation
- **XSS Protection** - DOMPurify for sanitizing HTML
- **Email Verification** - Verify user email on signup

## 📱 PWA Features

The app is a Progressive Web App with:
- **Offline Support** - Works without internet connection
- **Service Worker** - Caches assets for faster loading
- **Installable** - Can be installed as native app
- **Manifest** - PWA metadata and app icons
- **Fast Loading** - Optimized performance
- **Responsive** - Works on all screen sizes

### Install Instructions
1. Open the app in a supported browser
2. Look for "Install" or "Add to Home Screen" prompt
3. Click to install as native app

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Note Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  content: String (HTML),
  folderId: ObjectId (optional),
  tags: [ObjectId],
  isPinned: Boolean,
  isArchived: Boolean,
  isLocked: Boolean,
  color: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Folder Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  icon: String,
  parentId: ObjectId (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Tag Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  color: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create new note
- [ ] Edit note
- [ ] Delete note
- [ ] Create folder
- [ ] Move note to folder
- [ ] Pin/Unpin note
- [ ] Add tags to note
- [ ] Search notes
- [ ] Work offline
- [ ] Sync when back online
- [ ] Test on mobile device
- [ ] Test dark mode
- [ ] Test PWA installation

## 🚢 Deployment

### Deploy Backend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Deploy Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_BASE_URL` environment variable
4. Deploy

### Deploy Backend (Traditional Server)
1. Build the app: `npm run build`
2. Upload to server
3. Install dependencies: `npm install --production`
4. Set environment variables
5. Start with PM2: `pm2 start startServer.js`

## 📚 Documentation Files

- `API_DOCUMENTATION.md` - Detailed API documentation
- `DEPLOYMENT_INSTRUCTIONS.md` - Step-by-step deployment guide
- `PIN_FEATURE_DOCUMENTATION_INDEX.md` - Pin feature details

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify environment variables
- Check if port 5000 is available

### Frontend won't load notes
- Verify `VITE_API_BASE_URL` is correct
- Check browser console for errors
- Ensure backend is running

### PWA not installing
- Use HTTPS in production
- Check manifest.webmanifest
- Clear browser cache

### Offline sync not working
- Check browser console
- Verify Service Worker registration
- Check IndexedDB in DevTools

## 📈 Performance Optimization

- Code splitting with React Router
- Image optimization
- Lazy loading
- Service Worker caching
- Database indexing
- API rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use this project

## 💬 Support

For support, email support@notesapp.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Inspired by Apple Notes
- Built with modern web technologies
- Thanks to all contributors

---

**Happy Note Taking! 📝**
