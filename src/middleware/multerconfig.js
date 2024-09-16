import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name from the module URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../public/uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Use the derived path directly
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter
});

const uploadDocsMiddleware = upload.fields([
    { name: 'landIndemnityBond' },
    { name: 'structureIndemnityBond'},
    { name: 'uploadAffidavit' },
    { name: 'aadhaarCard' },
    { name: 'panCard' },
    { name: 'chequeOrPassbook' },
    { name: 'photo' }
]);

export default uploadDocsMiddleware;
