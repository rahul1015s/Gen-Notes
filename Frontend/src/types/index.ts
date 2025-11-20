// Note Types
export interface Note {
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
  isTemplate?: boolean;
}

// Tag Types
export interface Tag {
  _id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
}

// Folder Types
export interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Reminder Types
export interface Reminder {
  _id: string;
  noteId: string;
  type: 'once' | 'daily' | 'weekly' | 'monthly';
  dateTime: string;
  message?: string;
  notified?: boolean;
}

// Lock Types
export interface NoteLock {
  _id: string;
  noteId: string;
  type: 'pin' | 'fingerprint' | 'passkey';
  pinHash?: string;
  createdAt: string;
}

// Search Types
export interface SearchResult {
  note: Note;
  matches: {
    field: 'title' | 'content' | 'tags';
    positions: number[];
  }[];
  relevance: number;
}

// Sync Types
export interface SyncQueue {
  _id: string;
  noteId: string;
  action: 'create' | 'update' | 'delete';
  data: Partial<Note>;
  timestamp: number;
  synced: boolean;
}
