import multer from "multer";
import path from "path";

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const cvStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/cvs/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (!file) {
            return cb(new Error("No file uploaded"));
        }
        const filetypes = /jpeg|jpg|png|avif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Only images (jpeg, jpg, png, avif, webp) are allowed"));
        }
    },
});

export const uploadCV = multer({
    storage: cvStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (!file) {
            return cb(new Error("No file uploaded"));
        }
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype === "application/pdf";
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
});