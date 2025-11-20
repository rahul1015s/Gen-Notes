# Advanced Features Architecture

This document outlines the implementation of advanced features in the Notes application.

## Features Overview

### 1. Global Search (Super Fast) ⚡
**Location**: `src/features/search/`

**Components**:
- `Search.jsx` - Global search modal component
- `searchService.ts` - Search logic and algorithms

**Features**:
- Real-time search with 200ms debounce
- Search by: title, content, tags, dates
- Relevance-based sorting
- Search history (localStorage)
- Highlighted matches in results

**Usage**:
```javascript
import GlobalSearch from '@/features/search/Search';

<GlobalSearch 
  notes={allNotes}
  onSelectNote={(note) => navigate(`/note/${note._id}`)}
  onClose={() => setSearchOpen(false)}
/>
```

---

### 2. Tags + Custom Tags 🏷️
**Location**: `src/features/tags/`

**Services**:
- `tagsService.js` - Tag CRUD operations

**Components**:
- `TagManager.jsx` - Create, edit, delete tags
- Tag selector in note editor

**Features**:
- Create custom tags with colors
- Color-coded tags (15 predefined colors)
- Multi-tag support per note
- Tag suggestions based on frequency
- Usage counter for each tag

**API Endpoints**:
```
POST   /api/v1/tags
GET    /api/v1/tags
PUT    /api/v1/tags/:id
DELETE /api/v1/tags/:id
POST   /api/v1/notes/:noteId/tags
DELETE /api/v1/notes/:noteId/tags/:tagId
```

---

### 3. Folders & Sub-Folders 📂
**Location**: `src/features/folders/`

**Services**:
- `foldersService.js` - Folder management

**Components**:
- `FolderTree.jsx` - Hierarchical folder display

**Features**:
- Create unlimited nested folders
- Parent → child folder structure
- 20+ emoji icons for folders
- Expandable/collapsible tree view
- Rename and delete folders
- Move notes to folders

**API Endpoints**:
```
GET    /api/v1/folders
POST   /api/v1/folders
PUT    /api/v1/folders/:id
DELETE /api/v1/folders/:id
GET    /api/v1/folders/:id/notes
PATCH  /api/v1/folders/:id/notes
```

---

### 4. Drag & Drop Notes 🎯
**Planned with**: `react-beautiful-dnd` or `dnd-kit`

**Features**:
- Drag notes into folders
- Reorder notes within folders
- Multi-select and drag multiple notes
- Visual feedback during drag
- Smooth animations

**Implementation**:
- To be integrated with FolderTree component
- Drag dropzone areas for folders
- Auto-expand folders on hover

---

### 5. Pin Notes to Top 📌
**Location**: `src/services/pinService.js`

**Features**:
- Pin top 3 most important notes
- WhatsApp-style pinned section
- Toggle pin on any note
- Persistent across sessions

**Usage**:
```javascript
const pinnedNotes = pinService.getPinnedNotes(allNotes); // Max 3
const unpinnedNotes = pinService.getUnpinnedNotes(allNotes);
```

---

### 6. Reminders & Notifications 🔔
**Location**: `src/services/remindersService.js`

**Features**:
- **Time-based reminders**: Set specific date/time
- **Repeating reminders**: Daily, Weekly, Monthly
- **Snooze 10 mins**: Postpone reminder
- **Notifications API**: Browser notifications (PWA-ready)
- **Permission management**: Request notification access

**API Endpoints**:
```
POST   /api/v1/reminders
GET    /api/v1/reminders?noteId=
PUT    /api/v1/reminders/:id
DELETE /api/v1/reminders/:id
GET    /api/v1/reminders/upcoming
```

**Usage**:
```javascript
// Create reminder
await remindersService.createReminder(noteId, 'daily', dateTime, message);

// Request notifications
await remindersService.requestNotificationPermission();

// Send notification
remindersService.sendNotification('Note Reminder', {
  body: 'Your note reminder is here!',
  tag: 'note-reminder'
});

// Snooze
await remindersService.snoozeReminder(reminderId, 10); // 10 minutes
```

---

### 7. Lock Notes 🔐
**Location**: `src/services/lockService.js`

**Features**:
- **PIN Lock**: 4-digit PIN protection
- **Fingerprint**: WebAuthn biometric (device support)
- **Device Passkey**: Use device passkey authentication
- **Session Management**: Unlock once per session

**Usage**:
```javascript
// Lock with PIN
await lockService.lockNoteWithPIN(noteId, '1234');

// Verify PIN
const isValid = await lockService.verifyPIN(noteId, '1234');

// Check fingerprint support
const hasFingerprint = await lockService.isBiometricAvailable();

// Session unlock tracking
lockService.setUnlockedNote(noteId);
lockService.isNoteUnlocked(noteId); // true/false
```

---

### 8. Offline Sync + Cloud Backup ☁️
**Location**: `src/services/offlineSyncService.js`

**Features**:
- **IndexedDB Storage**: Persistent offline storage
- **Auto-Sync**: Sync when online
- **Conflict Resolution**: Last-write-wins strategy
- **Sync Queue**: Track pending changes
- **All CRUD Operations**: Create, Update, Delete offline

**Stores**:
- `notes` - Offline note cache
- `syncQueue` - Pending operations
- `tags` - Offline tags
- `folders` - Offline folders

**Usage**:
```javascript
// Initialize
await offlineSyncService.initDB();

// Save offline
await offlineSyncService.saveNoteOffline(note);

// Get pending sync items
const pending = await offlineSyncService.getPendingSyncItems();

// Listen for online/offline
window.addEventListener('app:online', () => {
  // Trigger sync
});
```

---

### 9. Daily Journal Mode 📔
**Location**: `src/services/journalService.js`

**Features**:
- **Auto-create daily notes**: One note per day
- **Morning entry**: Goals, gratitude
- **Evening entry**: Accomplishments, reflection
- **Templates**: Predefined prompts
- **Streak tracking**: Consecutive days

**Templates Included**:

**Morning Template**:
- Today's Goals (3 bullets)
- Gratitude (3 items)

**Evening Template**:
- Today's Accomplishments
- What I Learned
- How I Felt
- Tomorrow's Intentions

**API Endpoints**:
```
GET    /api/v1/journal/today
POST   /api/v1/journal/morning
POST   /api/v1/journal/evening
GET    /api/v1/journal/entries?startDate=&endDate=
GET    /api/v1/journal/templates
```

---

## Utility Helpers

**Location**: `src/utils/helpers.ts`

### Available Functions:

```javascript
// Debounce/Throttle
debounce(fn, delay)
throttle(fn, limit)

// Text Processing
highlightMatches(text, query, className)
extractTextFromHTML(html)

// Search
calculateRelevance(query, titleMatches, contentMatches, tagMatches)

// Formatting
formatDateShort(date)
getRandomTagColor()

// Hashing
await hashString(str) // SHA-256

// Object Utilities
deepCopy(obj)
isDeepEqual(obj1, obj2)
```

---

## Custom React Hooks

**Location**: `src/hooks/index.js`

### Available Hooks:

```javascript
// Search
useDebounceSearch(items, delay = 200)
  → { query, results, setQuery }

// Online Status
useOnlineStatus()
  → boolean

// Offline Storage
useOfflineNotes()
  → { isReady, saveNoteOffline, ... }

// Notifications
useNotifications()
  → { canNotify, requestPermission }

// State Management
useDebouncedState(initialValue, delay)
  → [value, debouncedValue, setValue]

useLocalStorage(key, initialValue)
  → [value, setValue]

// Async Operations
useAsync(asyncFn, deps)
  → { data, loading, error, execute }

// Utilities
usePrevious(value)
  → previousValue
```

---

## Types

**Location**: `src/types/index.ts`

```typescript
interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  folderId?: string;
  tags?: string[];
  isLocked?: boolean;
  reminder?: Reminder;
}

interface Tag {
  _id: string;
  name: string;
  color: string;
  usageCount: number;
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  icon?: string;
}

interface Reminder {
  _id: string;
  noteId: string;
  type: 'once' | 'daily' | 'weekly' | 'monthly';
  dateTime: string;
}
```

---

## Integration Guide

### Step 1: Add Global Search to Navbar
```javascript
import GlobalSearch from '@/features/search/Search';

function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setSearchOpen(true)}>
        <Search /> Search
      </button>
      {searchOpen && (
        <GlobalSearch
          notes={notes}
          onSelectNote={handleSelectNote}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}
```

### Step 2: Add Folder Sidebar
```javascript
import FolderTree from '@/features/folders/FolderTree';

function AllNotes() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <aside className="col-span-1">
        <FolderTree
          folders={folders}
          onSelectFolder={setSelectedFolder}
        />
      </aside>
      <main className="col-span-3">
        {/* Notes list */}
      </main>
    </div>
  );
}
```

### Step 3: Add Pinned Notes Section
```javascript
import pinService from '@/services/pinService';

function NotesList() {
  const pinnedNotes = pinService.getPinnedNotes(notes);
  const unpinnedNotes = pinService.getUnpinnedNotes(notes);
  
  return (
    <>
      {pinnedNotes.length > 0 && (
        <section className="mb-6">
          <h2>📌 Pinned Notes</h2>
          {pinnedNotes.map(note => <NoteCard key={note._id} note={note} />)}
        </section>
      )}
      
      <section>
        <h2>All Notes</h2>
        {unpinnedNotes.map(note => <NoteCard key={note._id} note={note} />)}
      </section>
    </>
  );
}
```

### Step 4: Initialize Offline Sync
```javascript
import offlineSyncService from '@/services/offlineSyncService';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    offlineSyncService.initDB();
  }, []);
  
  return <YourApp />;
}
```

---

## Folder Structure

```
src/
├── features/
│   ├── search/
│   │   ├── Search.jsx
│   │   └── Search.css
│   ├── tags/
│   │   ├── TagManager.jsx
│   │   └── TagManager.css
│   ├── folders/
│   │   ├── FolderTree.jsx
│   │   └── FolderTree.css
│   ├── reminders/
│   ├── locks/
│   ├── sync/
│   └── journal/
├── services/
│   ├── searchService.ts
│   ├── tagsService.js
│   ├── foldersService.js
│   ├── pinService.js
│   ├── remindersService.js
│   ├── lockService.js
│   ├── offlineSyncService.js
│   └── journalService.js
├── hooks/
│   └── index.js
├── utils/
│   └── helpers.ts
├── types/
│   └── index.ts
└── constants/
    └── (future use)
```

---

## Backend API Requirements

The following API endpoints need to be implemented in the backend:

### Tags
- `POST /api/v1/tags`
- `GET /api/v1/tags`
- `GET /api/v1/tags/frequent?limit=10`
- `PUT /api/v1/tags/:id`
- `DELETE /api/v1/tags/:id`
- `POST /api/v1/notes/:noteId/tags`
- `DELETE /api/v1/notes/:noteId/tags/:tagId`

### Folders
- `POST /api/v1/folders`
- `GET /api/v1/folders`
- `PUT /api/v1/folders/:id`
- `DELETE /api/v1/folders/:id`
- `GET /api/v1/folders/:id/notes?recursive=true`
- `PATCH /api/v1/folders/:id/notes`

### Pins
- `PATCH /api/v1/notes/:noteId/pin`
- `POST /api/v1/notes/:noteId/pin`
- `DELETE /api/v1/notes/:noteId/pin`

### Reminders
- `POST /api/v1/reminders`
- `GET /api/v1/reminders?noteId=`
- `GET /api/v1/reminders/upcoming`
- `PUT /api/v1/reminders/:id`
- `DELETE /api/v1/reminders/:id`

### Locks
- `POST /api/v1/notes/:noteId/lock`
- `GET /api/v1/notes/:noteId/lock`
- `POST /api/v1/notes/:noteId/unlock`
- `DELETE /api/v1/notes/:noteId/lock`

### Journal
- `GET /api/v1/journal/today`
- `POST /api/v1/journal/morning`
- `POST /api/v1/journal/evening`
- `GET /api/v1/journal/entries?startDate=&endDate=`
- `GET /api/v1/journal/templates`

---

## Next Steps

1. ✅ Create folder structure and services
2. ✅ Implement all core services
3. ⏳ Create UI components for each feature
4. ⏳ Implement backend API endpoints
5. ⏳ Add integration tests
6. ⏳ Add E2E tests
7. ⏳ Deploy to production

---

## Development Notes

- All services use Axios (`../lib/axios.js`) for API calls
- All UI components use DaisyUI for consistent styling
- Error handling uses `react-hot-toast` for notifications
- All operations have loading and error states
- Offline-first design: IndexedDB cache + cloud sync
- TypeScript types available in `src/types/index.ts`

---

**Created**: November 20, 2025
**Last Updated**: November 20, 2025
