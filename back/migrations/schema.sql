PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  matricule TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('student', 'admin', 'superadmin')) NOT NULL,
  classId TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  adminId TEXT NOT NULL,
  studentCount INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  studentName TEXT NOT NULL,
  studentMatricule TEXT NOT NULL,
  classId TEXT NOT NULL,
  className TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT CHECK(type IN ('note_manquante', 'erreur_saisie', 'incoherence', 'autre')) NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'in_progress', 'validated', 'rejected', 'transmitted')) DEFAULT 'pending',
  attachments TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  processedBy TEXT,
  processedAt TEXT,
  rejectionReason TEXT,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  requestId TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (requestId) REFERENCES requests(id) ON DELETE CASCADE
);
