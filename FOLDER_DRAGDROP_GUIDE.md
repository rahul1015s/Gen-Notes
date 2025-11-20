# Folder Creation & Drag-and-Drop Guide

## Features Implemented ✅

### 1. Folder Creation Modal
- **Button Location:** Header, next to "New Note" button
- **Icon:** 📁 (FolderPlus)
- **Access:** Click "Folder" button or the FolderPlus icon

### 2. Modal Interface
```
┌─────────────────────────────────┐
│ 📁 Create New Folder            │
├─────────────────────────────────┤
│ Folder Name: [Input Field]      │
│ Folder Icon: [Icon Picker]      │
│                                 │
│          [Cancel] [Create]      │
└─────────────────────────────────┘
```

**Features:**
- Text input for folder name
- Icon picker with 6 emoji icons (📁 📂 📓 📔 📕 📖)
- Enter key to create (or click Create button)
- Cancel button to close modal
- Disabled state while creating
- Toast notifications for success/errors

### 3. Drag-and-Drop Functionality

#### What Can Be Dragged?
- All notes (pinned and unpinned)
- Notes from the main notes grid

#### Where Can You Drop?
- Folder items in the left sidebar
- Anywhere a folder appears in FolderTree

#### Visual Feedback During Drag
- Cursor changes to "move" cursor
- Note opacity may reduce
- Target folder highlights with:
  - Light blue background (bg-primary/20)
  - Left border accent (border-l-4 border-primary)

#### How It Works
1. **Click and drag** a note card
2. **Hover over** a folder in sidebar
3. **See highlight** on the folder
4. **Drop the note** into folder
5. **Toast appears** confirming move
6. **Offline sync** captures the change

### 4. Folder Management in Sidebar

Each folder shows:
- **Expand/Collapse arrow** (if has subfolders)
- **Folder icon** (customizable emoji)
- **Folder name** (editable)
- **Action buttons** (edit/delete, appear on hover)

#### Folder Actions
| Action | How | Result |
|--------|-----|--------|
| Select | Click folder name | Filter notes by folder |
| Expand | Click arrow | Show subfolders |
| Edit | Click edit icon (pencil) | Rename folder |
| Delete | Click delete icon (trash) | Remove folder (notes stay) |

### 5. File Structure

```
Frontend/src/
├── pages/
│   └── AllNotes.jsx (Updated)
│       - Folder modal state management
│       - Drag event handlers
│       - Folder CRUD operations
│
├── components/
│   └── FolderTree.jsx (New)
│       - Recursive folder rendering
│       - Drop zone support
│       - Edit/Delete functionality
│       - Visual feedback on drag-over
```

### 6. Key Components & Props

#### FolderTree.jsx Props
```javascript
FolderTree
├── folders: Array of folder objects
├── selectedFolder: Currently selected folder ID
├── onSelectFolder: (folderId) => void
├── onDragOver: (event) => void
├── onDropToFolder: (folderId) => void
├── onDeleteFolder: (folderId) => void
├── onUpdateFolder: (folderId, newName) => void
└── draggedNote: Current dragged note object
```

### 7. Handler Functions

#### handleCreateFolder()
- Validates folder name
- Calls `foldersService.createFolder()`
- Updates state with new folder
- Closes modal and resets form
- Shows toast notification

#### handleDragStart(e, note)
- Captures the note being dragged
- Sets dataTransfer effect to "move"
- Updates UI cursor feedback

#### handleDragOver(e)
- Prevents default behavior
- Enables drop zone
- Sets visual feedback

#### handleDropToFolder(folderId)
- Updates note with folderId
- Calls API: `PUT /api/v1/notes/{id}`
- Syncs to offline storage
- Updates local state
- Shows success toast

### 8. State Variables

```javascript
// Folder modal
const [showFolderModal, setShowFolderModal] = useState(false);
const [newFolderName, setNewFolderName] = useState('');
const [selectedIcon, setSelectedIcon] = useState(FOLDER_ICONS[0]);
const [isCreatingFolder, setIsCreatingFolder] = useState(false);

// Drag-drop
const [draggedNote, setDraggedNote] = useState(null);
```

### 9. Styling Classes Used

- **Modal backdrop:** `fixed inset-0 bg-black/50 z-50`
- **Modal container:** `bg-base-100 rounded-lg p-6 shadow-lg`
- **Folder items:** `hover:bg-base-300` (hover effect)
- **Drag-over state:** `bg-primary/20 border-l-4 border-primary`
- **Draggable notes:** `cursor-move` class applied
- **Buttons:** DaisyUI `btn btn-primary`, `btn btn-ghost` classes

### 10. Error Handling

All operations include:
- ✅ Try-catch blocks
- ✅ Toast error notifications
- ✅ User-friendly error messages
- ✅ Loading state management
- ✅ Disabled state during operations

### 11. Offline Support

All folder operations sync to offline storage:
- Notes moved to folders saved to IndexedDB
- Automatic sync when online
- Prevents data loss during offline use

### 12. Backend Requirements

To fully enable this feature, backend needs these endpoints:

**Folders**
```
POST   /api/v1/folders           - Create folder
GET    /api/v1/folders           - List all folders
GET    /api/v1/folders/:id       - Get folder details
PUT    /api/v1/folders/:id       - Update folder
DELETE /api/v1/folders/:id       - Delete folder
```

**Notes Update**
```
PUT    /api/v1/notes/:id         - Update note (including folderId)
```

See `IMPLEMENTATION_GUIDE.md` for complete backend code.

### 13. Testing Checklist

- [ ] Click "Folder" button → Modal appears
- [ ] Enter folder name and click Create → Folder appears in sidebar
- [ ] Try different emoji icons → Icon updates
- [ ] Click folder in sidebar → Notes filter by folder
- [ ] Drag note to folder → Note moves (check Network tab)
- [ ] Click edit icon on folder → Rename works
- [ ] Click delete icon → Folder deletes (notes unaffected)
- [ ] Test offline → Changes sync when online
- [ ] Test mobile → Touch drag-drop works (if supported)

### 14. Known Limitations

- Drag-drop with touch: May need additional touch event handlers
- Nested folders: Currently shows up to 3 levels deep
- Folder sorting: Default creation order (update coming)
- Bulk operations: Can't move multiple notes at once yet

### 15. Next Steps

1. **Implement backend endpoints** (see IMPLEMENTATION_GUIDE.md)
2. **Add folder icons selector** (currently fixed list)
3. **Enable nested folders** (create folders inside folders)
4. **Add folder sorting** (manual reorder or alphabetical)
5. **Bulk operations** (select multiple notes to move)
6. **Folder colors** (color-code folders for quick identification)
7. **Folder sharing** (optional, advanced feature)

---

## Quick Start

1. **Create a Folder:**
   - Click the "Folder" button in the header
   - Enter a name
   - Pick an icon
   - Click Create

2. **Move Notes to Folder:**
   - Drag any note card
   - Drop it on a folder in the sidebar
   - See the confirmation toast

3. **Manage Folders:**
   - Click a folder to see only its notes
   - Edit to rename (pencil icon)
   - Delete to remove (trash icon)
   - Folders with notes keep the notes when deleted

---

**Status:** ✅ Feature Complete (Frontend)
**Backend Status:** ⏳ Needs Implementation
**Last Updated:** Session Message 16+
