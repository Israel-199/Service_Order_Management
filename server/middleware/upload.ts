import multer from "multer";
import path from "path";
import fs from "fs";

// Destination folder for uploaded files
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Prevent collisions by prefixing timestamp
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// Convert multer File object to relative DB path
export function toDbFilePath(file: Express.Multer.File) {
  return path.relative(process.cwd(), file.path).replace(/\\/g, "/");
}
