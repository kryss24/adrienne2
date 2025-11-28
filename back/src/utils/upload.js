const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const REQUESTS_DIR = path.join(UPLOAD_DIR, 'requests');
if (!fs.existsSync(REQUESTS_DIR)) fs.mkdirSync(REQUESTS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, REQUESTS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const allowed = /pdf|jpg|jpeg|png|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext.replace('.', ''))) cb(null, true);
  else cb(new Error('Type de fichier non autorisé'));
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

module.exports = upload;
