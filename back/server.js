require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(path.join(UPLOAD_DIR, 'requests'))) fs.mkdirSync(path.join(UPLOAD_DIR, 'requests'), { recursive: true });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
