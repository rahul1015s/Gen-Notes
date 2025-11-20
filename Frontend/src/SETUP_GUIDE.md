# 🚀 Advanced Features Setup Guide

This guide helps you integrate all the new advanced features into your Notes application.

## Quick Start

### 1. Install Required Dependencies (if needed)

```bash
npm install react-hot-toast lucide-react
```

Already included:
- ✅ Axios (for API calls)
- ✅ React Router (for navigation)
- ✅ DaisyUI (for styling)

### 2. Backend API Setup

Before using the frontend features, implement these API endpoints:

#### Tags Endpoints
```javascript
// Backend routes/tags.routes.js
POST   /api/v1/tags              // Create tag
GET    /api/v1/tags              // Get all tags
GET    /api/v1/tags/frequent     // Get frequent tags
PUT    /api/v1/tags/:id          // Update tag
DELETE /api/v1/tags/:id          // Delete tag
POST   /api/v1/notes/:noteId/tags            // Add tag to note
DELETE /api/v1/notes/:noteId/tags/:tagId     // Remove tag from note
```

#### Folders Endpoints
```javascript
// Backend routes/folders.routes.js
POST   /api/v1/folders                       // Create folder
GET    /api/v1/folders                       // Get all folders
PUT    /api/v1/folders/:id                   // Update folder
DELETE /api/v1/folders/:id                   // Delete folder
GET    /api/v1/folders/:id/notes             // Get notes in folder
PATCH  /api/v1/folders/:id/notes             // Move notes to folder
```

#### Pins Endpoints
```javascript
// Add to Backend routes/notes.routes.js
PATCH  /api/v1/notes/:id/pin                 // Toggle pin
POST   /api/v1/notes/:id/pin                 // Pin note
DELETE /api/v1/notes/:id/pin                 // Unpin note
```

#### Reminders Endpoints
```javascript
// Backend routes/reminders.routes.js
POST   /api/v1/reminders                     // Create reminder
GET    /api/v1/reminders                     // Get reminders
GET    /api/v1/reminders/upcoming            // Get upcoming
PUT    /api/v1/reminders/:id                 // Update reminder
DELETE /api/v1/reminders/:id                 // Delete reminder
```

#### Locks Endpoints
```javascript
// Add to Backend routes/notes.routes.js
POST   /api/v1/notes/:id/lock                // Lock note
GET    /api/v1/notes/:id/lock                // Get lock status
POST   /api/v1/notes/:id/unlock              // Unlock note
DELETE /api/v1/notes/:id/lock                // Remove lock
```

#### Journal Endpoints
```javascript
// Backend routes/journal.routes.js
GET    /api/v1/journal/today                 // Get today's journal
POST   /api/v1/journal/morning                // Save morning entry
POST   /api/v1/journal/evening                // Save evening entry
GET    /api/v1/journal/entries                // Get entries (date range)
GET    /api/v1/journal/templates              // Get templates
```

### 3. Update Note Model

Add these fields to your Note schema:

```javascript
// Backend models/note.model.js
const noteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  userId: { type: ObjectId, ref: 'User', required: true },
  
  // New fields
  tags: [{ type: ObjectId, ref: 'Tag' }],
  folderId: { type: ObjectId, ref: 'Folder' },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  reminder: { type: ObjectId, ref: 'Reminder' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 4. Create New Models (Backend)

```javascript
// Backend models/tag.model.js
const tagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  color: String,
  usageCount: { type: Number, default: 0 },
  userId: { type: ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Backend models/folder.model.js
const folderSchema = new Schema({
  name: { type: String, required: true },
  parentId: { type: ObjectId, ref: 'Folder' },
  userId: { type: ObjectId, ref: 'User', required: true },
  icon: String,
  color: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Backend models/reminder.model.js
const reminderSchema = new Schema({
  noteId: { type: ObjectId, ref: 'Note', required: true },
  type: { type: String, enum: ['once', 'daily', 'weekly', 'monthly'] },
  dateTime: Date,
  message: String,
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Backend models/noteLock.model.js
const noteLockSchema = new Schema({
  noteId: { type: ObjectId, ref: 'Note', required: true },
  type: { type: String, enum: ['pin', 'fingerprint', 'passkey'] },
  pinHash: String,
  createdAt: { type: Date, default: Date.now }
});

// Backend models/journal.model.js
const journalSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  morningEntry: String,
  eveningEntry: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## Integration Steps

### Step 1: Update AllNotes Page

```javascript
// Frontend src/pages/AllNotes.jsx
import GlobalSearch from '../features/search/Search';
import FolderTree from '../features/folders/FolderTree';
import TagManager from '../features/tags/TagManager';
import { useDebounceSearch, useOnlineStatus } from '../hooks';

export default function AllNotes() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const isOnline = useOnlineStatus();
  
  // ... rest of component
}
```

### Step 2: Add Search to Navbar

```javascript
// Frontend src/components/Navbar.jsx
import { Search } from 'lucide-react';
import GlobalSearch from '../features/search/Search';

export default function Navbar({ notes }) {
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <nav>
      {/* ... other navbar items ... */}
      
      <button
        onClick={() => setSearchOpen(true)}
        className="btn btn-ghost gap-2"
      >
        <Search className="w-5 h-5" />
        Search
      </button>
      
      {searchOpen && (
        <GlobalSearch
          notes={notes}
          onSelectNote={(note) => {
            navigate(`/note/${note._id}`);
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </nav>
  );
}
```

### Step 3: Add Offline Sync Initialization

```javascript
// Frontend src/App.jsx
import offlineSyncService from './services/offlineSyncService';

export default function App() {
  useEffect(() => {
    // Initialize IndexedDB
    offlineSyncService.initDB();
    
    // Listen for online/offline events
    window.addEventListener('app:online', handleSync);
    window.addEventListener('app:offline', handleOffline);
    
    return () => {
      window.removeEventListener('app:online', handleSync);
      window.removeEventListener('app:offline', handleOffline);
    };
  }, []);
  
  return <YourApp />;
}
```

### Step 4: Add Notification Permission Request

```javascript
// Frontend src/App.jsx or main layout
import remindersService from './services/remindersService';

export default function App() {
  useEffect(() => {
    remindersService.requestNotificationPermission();
  }, []);
  
  return <YourApp />;
}
```

### Step 5: Create Pinned Notes Display

```javascript
// Frontend src/components/PinnedNotesSection.jsx
import pinService from '../services/pinService';

export default function PinnedNotesSection({ notes, onSelectNote }) {
  const pinnedNotes = pinService.getPinnedNotes(notes);
  
  if (pinnedNotes.length === 0) return null;
  
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">📌 Pinned Notes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pinnedNotes.map(note => (
          <NoteCard
            key={note._id}
            note={note}
            onSelect={() => onSelectNote(note)}
          />
        ))}
      </div>
    </section>
  );
}
```

### Step 6: Add Lock Modal Component (Optional)

```javascript
// Frontend src/features/locks/LockModal.jsx
import { useState } from 'react';
import lockService from '../../services/lockService';

export default function LockModal({ note, isLocked, onUnlock }) {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await lockService.verifyPIN(note._id, pin);
      lockService.setUnlockedNote(note._id);
      onUnlock();
    } catch (error) {
      alert('Invalid PIN');
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <dialog open className="modal">
      <div className="modal-box space-y-4">
        <h3 className="text-lg font-bold">🔐 Enter PIN</h3>
        <input
          type="password"
          inputMode="numeric"
          maxLength="4"
          className="input input-bordered w-full"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
        />
        <button
          className="btn btn-primary w-full"
          onClick={handleVerify}
          disabled={isVerifying || pin.length !== 4}
        >
          Unlock
        </button>
      </div>
    </dialog>
  );
}
```

---

## File Structure After Integration

```
Frontend/src/
├── features/
│   ├── search/
│   │   ├── Search.jsx          ✅ Complete
│   │   └── Search.css          ✅ Complete
│   ├── tags/
│   │   ├── TagManager.jsx      ✅ Complete
│   │   └── TagManager.css      ✅ Complete
│   ├── folders/
│   │   ├── FolderTree.jsx      ✅ Complete
│   │   └── FolderTree.css      ✅ Complete
│   ├── reminders/              📝 To implement
│   ├── locks/                  📝 To implement
│   ├── sync/                   📝 To implement
│   └── journal/                📝 To implement
├── services/
│   ├── searchService.ts        ✅ Complete
│   ├── tagsService.js          ✅ Complete
│   ├── foldersService.js       ✅ Complete
│   ├── pinService.js           ✅ Complete
│   ├── remindersService.js     ✅ Complete
│   ├── lockService.js          ✅ Complete
│   ├── offlineSyncService.js   ✅ Complete
│   └── journalService.js       ✅ Complete
├── hooks/
│   └── index.js                ✅ Complete
├── utils/
│   └── helpers.ts              ✅ Complete
├── types/
│   └── index.ts                ✅ Complete
├── FEATURES_ARCHITECTURE.md    ✅ Complete
└── pages/
    └── AllNotesExample.jsx     ✅ Complete
```

---

## Testing Checklist

- [ ] Global Search works with debounce
- [ ] Tags can be created, updated, deleted
- [ ] Folders can be nested and expanded
- [ ] Notes can be pinned/unpinned
- [ ] Reminders can be set and triggered
- [ ] Offline mode saves notes locally
- [ ] Online sync works correctly
- [ ] Notifications display properly
- [ ] Journal entries auto-create daily

---

## Common Issues & Solutions

### Issue: `Cannot read property 'initDB'`
**Solution**: Make sure `offlineSyncService.initDB()` is called before other operations
```javascript
await offlineSyncService.initDB();
```

### Issue: Search not debouncing
**Solution**: Check that `useDebounceSearch` hook is imported from `src/hooks`

### Issue: Folders not displaying
**Solution**: Ensure folders data structure has `parentId` field

### Issue: Notifications not showing
**Solution**: Request permission first:
```javascript
await remindersService.requestNotificationPermission();
```

### Issue: Lock PIN not working
**Solution**: Ensure `hashString` utility is working:
```javascript
import { hashString } from '../utils/helpers';
```

---

## Performance Tips

1. **Search**: Debounce delays already set to 200ms (optimal)
2. **Folders**: Tree rendering only expands when needed
3. **Offline Sync**: Batch operations when possible
4. **Reminders**: Use service worker for background notifications
5. **Storage**: Clear old sync queue items regularly

---

## Security Notes

1. **PIN Hashing**: Always hash pins before sending (SHA-256)
2. **Session Locks**: Clear unlocked notes on logout
3. **Offline Data**: Encrypt sensitive data in IndexedDB
4. **API**: Always validate user ownership on backend

---

## Next: Backend Implementation

See the Backend folder for implementing:
- ✅ Tag routes
- ✅ Folder routes with nesting
- ✅ Pin endpoints
- ✅ Reminder scheduling
- ✅ Lock verification
- ✅ Journal auto-creation
- ✅ Offline sync conflict resolution

---

**Last Updated**: November 20, 2025
**Status**: Frontend implementation complete ✅
**Backend Status**: Awaiting implementation 📋
