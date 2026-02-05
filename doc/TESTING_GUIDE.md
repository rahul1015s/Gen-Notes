# GenNotes - Complete Testing Guide

## Overview
This guide covers manual testing of all major features in the GenNotes application after the recent fixes for folder filtering, drag & drop, tag filtering, and folder/tag selection in CreatePage.

---

## ✅ Test 1: Folder Filtering (CRITICAL FIX)

### What Was Fixed
- **Issue**: Clicking a folder in sidebar showed URL change but no notes appeared
- **Root Cause**: Backend was populating `folderId` as a full object, frontend tried comparing string with object
- **Solution**: Removed `.populate('folderId')` from `getAllNotes` endpoint - now returns just the ID string

### Test Steps
1. Navigate to `/all-notes`
2. Create a test note with title "Test Note 1" and assign it to a folder (e.g., "Work")
3. Create another test note "Test Note 2" without a folder
4. In left sidebar, click on "Work" folder
5. **Expected Result**: 
   - URL changes to `/all-notes/{folderId}`
   - Only "Test Note 1" appears
   - Header shows "Work" folder name
   - Note count shows "1 note"

### Rollback Info
- If filtering still doesn't work, check browser console for errors
- Verify backend response has `folderId` as string, not object
- Run `console.log(notes[0].folderId)` in browser - should be string ID, not `{name, icon}`

---

## ✅ Test 2: Drag & Drop Notes to Folders

### What Was Fixed
- Enhanced UI with visual feedback when dragging over folders
- Folder highlights with purple background when dragging over it
- State management with `dragOverFolder` tracks which folder is being dragged over

### Test Steps
1. Navigate to `/all-notes`
2. Create a note "Drag Test Note" in no specific folder
3. Create two folders: "Source" and "Target"
4. Move the note to "Source" folder (via CreatePage folder selection)
5. Drag "Drag Test Note" from notes grid
6. Hover over "Target" folder in sidebar
   - **Visual Feedback**: Folder should highlight with blue border and purple background
7. Drop the note on "Target" folder
8. **Expected Result**:
   - Toast shows "📂 Note moved to folder"
   - Refreshing page shows note is now in "Target" folder
   - Note disappears from "Source" folder view
   - Note count badges update

### Debugging Drag & Drop
- Open browser DevTools Network tab during drag operation
- Should see PUT request to `/api/v1/notes/{noteId}` with `{folderId: "targetId"}`
- Check response shows updated `folderId`

---

## ✅ Test 3: Tag Filtering

### What Was Fixed
- Tags now display as clickable filter pills in sidebar
- Clicking a tag filters notes to show only notes with that tag
- Enhanced `displayNotes` useMemo to filter by tag
- Click a selected tag again to deselect and show all notes

### Test Steps
1. Navigate to `/all-notes`
2. Create two tags: "Important" (red color) and "Review" (blue color)
3. Create 3 test notes:
   - Note A: title "Urgent Task", tags: ["Important"]
   - Note B: title "Code Review", tags: ["Review"]
   - Note C: title "Meeting Notes", tags: ["Important", "Review"]
4. In Tags sidebar section, click "Important" tag
   - **Expected**: Shows only Note A and Note C (2 notes)
5. Click "Review" tag
   - **Expected**: Shows only Note B and Note C (2 notes)
6. Click "Important" again to deselect
   - **Expected**: Shows all 3 notes again

### Tag Management
- Click "Edit Tags" dropdown to:
  - Edit tag names
  - Delete tags
  - View all tags in management view
- Deleting a tag clears any active tag filter

---

## ✅ Test 4: CreatePage Folder & Tag Selection

### What Was Fixed
- CreatePage now includes folder and tag selection dropdowns
- Can create new folders while creating notes
- Can create new tags while creating notes
- Can select existing folders and tags for new notes

### Test Steps
1. Navigate to `/create`
2. Fill in title: "Test Create with Folder"
3. In **Choose Folder** section:
   - Select an existing folder from dropdown
   - OR click "New Folder" and create one on the spot
4. In **Add Tags** section:
   - Click "Add tag..." dropdown and select existing tags
   - Selected tags appear as colored badges (clickable to remove)
   - OR click "New Tag" and create new tag with custom color
5. Write some content in editor
6. Click "Create Note"
7. **Expected Result**:
   - Toast shows "✅ Note Created!"
   - Page redirects to `/all-notes`
   - Note appears in the correct folder
   - Note has the correct tags applied
   - Folder note count updates

### Test with URL Parameter
1. Click a folder in sidebar to go to `/all-notes/{folderId}`
2. Click "New" button to create note from that folder
3. Should include `?folderId={folderId}` in URL
4. **Expected**: CreatePage should have that folder pre-selected

---

## ✅ Test 5: Combined Folder + Tag Filtering

### Advanced Scenario
1. Create notes across multiple folders with multiple tags:
   - Folder A: 3 notes with "Work" tag
   - Folder A: 2 notes with "Personal" tag
   - Folder B: 4 notes with "Work" tag
2. Click Folder A in sidebar
   - Shows 5 notes
3. Click "Work" tag while in Folder A
   - **Expected**: Shows only 3 notes (intersection of folder A AND Work tag)
4. Click "Personal" tag
   - **Expected**: Shows 2 notes (Folder A + Personal tag)
5. Go back to "/all-notes"
6. Click "Work" tag without selecting folder
   - **Expected**: Shows all notes with "Work" tag across all folders (7 total)

---

## ✅ Test 6: Offline Functionality

### What Still Works
- Notes are synced to IndexedDB for offline support
- Service Worker precaches app assets

### Test Steps
1. Create a note while online
2. Open DevTools → Network → set to "Offline"
3. Navigate to different pages
4. Create another note (should save to IndexedDB)
5. Go back online
6. Both notes should sync

---

## ✅ Test 7: Note Pinning & Deletion

### Test Steps
1. Create 3 test notes
2. Click pin icon on one note
   - Should move to "Pinned" section
   - Toast shows "📌 Pinned"
3. Click pin icon again
   - Should move back to "Notes" section
   - Toast shows "📌 Unpinned"
4. Click delete icon on a note
   - Note disappears
   - Toast shows "Note deleted"

---

## ✅ Test 8: Search Functionality

### Test Steps
1. Click search bar in header
2. Type to search for note by title or content
3. Click on search result to view full note
4. Search should work even with filtered folder/tag view

---

## ✅ Test 9: Note Detail View & Editing

### Test Steps
1. Click on any note card
2. Page should load with full note content
3. Click "Edit" button
4. Modify title and content
5. Click "Save"
   - **Expected**: Toast shows "Note updated ✅"
6. Click "Delete"
   - Confirmation modal appears
   - Deletes and redirects to `/all-notes`

---

## ✅ Test 10: Responsiveness

### Mobile (< 768px)
- Sidebar should be hidden by default
- Click menu icon to toggle sidebar
- Notes grid should show 1 column
- Floating "+" button appears at bottom right

### Tablet (768px - 1024px)
- Notes grid shows 2 columns
- Sidebar still toggleable

### Desktop (> 1024px)
- Sidebar always visible
- Notes grid shows 3 columns
- Navbar fixed at top

---

## 🐛 Debugging Checklist

### Folder Filtering Not Working
- [ ] Backend `getAllNotes` does NOT have `.populate('folderId')`
- [ ] Check browser console: `notes[0].folderId` should be string "507f1f77bcf86cd799439011"
- [ ] Check URL param: `/all-notes/507f1f77bcf86cd799439011`
- [ ] Network tab: GET `/api/v1/notes` returns notes with string `folderId`

### Drag & Drop Not Visual
- [ ] Hover over folder - should show blue border and purple background
- [ ] Check state: `dragOverFolder` should be set to folder._id
- [ ] Network tab: PUT request sent when dropping

### Tags Not Filtering
- [ ] Tags appear as badges in sidebar - if not, check `tags` state is populated
- [ ] Clicking tag should highlight it and filter notes
- [ ] Check `selectedTag` state is being set
- [ ] Browser console: `notes.filter(n => n.tags.some(t => t._id === selectedTag))` should return correct notes

### CreatePage Missing Folder/Tag UI
- [ ] Should see "Choose Folder" dropdown
- [ ] Should see "Add Tags" section with dropdown and color picker
- [ ] "New Folder" and "New Tag" buttons should appear below selections

---

## 📊 Performance Notes

### Expected Behavior
- All note operations should be instant (< 100ms)
- Folder/tag filtering done in-memory (useMemo)
- Drag & drop with smooth visual feedback
- Service worker caches assets for offline access

### Metrics to Monitor
- Page load time: should be < 2s
- Note fetch time: < 500ms
- Search response: < 100ms
- Create note: < 1s

---

## 🚀 Post-Testing Checklist

- [ ] All folder filtering tests pass
- [ ] All drag & drop tests pass
- [ ] All tag filtering tests pass
- [ ] CreatePage folder/tag selection works
- [ ] Combined folder + tag filtering works
- [ ] Offline sync functional
- [ ] Mobile responsive layout correct
- [ ] No console errors

---

## 📝 Known Limitations

1. **Multiple Folder Selection**: Currently can only view one folder at a time (by design)
2. **Bulk Operations**: No bulk move/delete across folders
3. **Tag Suggestions**: Tags don't suggest based on history yet
4. **Offline Editing**: Offline note creation syncs when online

---

## 🔄 Database Considerations

### Note Model Structure (After Fixes)
```javascript
{
  _id: ObjectId,
  title: String,
  content: String (HTML),
  folderId: ObjectId or null,  // Now stored as ID, not populated in list view
  tags: [ObjectId],
  userId: ObjectId,
  isPinned: Boolean,
  isArchived: Boolean,
  isLocked: Boolean,
  color: String,
  createdAt: Date,
  updatedAt: Date
}
```

### API Response Changes
- `GET /api/v1/notes` - No longer populates `folderId` (just returns ID)
- `GET /api/v1/notes/:id` - Still populates `folderId` for detail view
- `POST /api/v1/notes` - Accepts `folderId` as string ID
- `PUT /api/v1/notes/:id` - Can update `folderId` for move operation

---

## 💡 Tips for Testing

1. **Create Test Data First**: Generate 10-15 notes across 3-4 folders with 5+ tags
2. **Use Browser DevTools**: Network tab to see API calls, Console for state debugging
3. **Test in Private/Incognito**: Avoids service worker caching issues
4. **Clear Offline Data**: DevTools → Application → IndexedDB → Clear data between tests
5. **Check Mobile**: Use Chrome DevTools Device Emulation for responsive testing

---

## 📞 Report Issues

When reporting issues, include:
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior
- [ ] Browser console errors
- [ ] Network tab requests/responses
- [ ] Screenshot or video

