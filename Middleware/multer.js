import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const storageLocal = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/certificates"); // folder
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

/* EXCEL FILE FILTER */
const excelFileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files allowed"), false);
  }
};

/* IMAGE FILE FILTER */
const imageFileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG and JPG images allowed"), false);
  }
};

/* EXCEL UPLOAD */
export const uploadExcel = multer({
  storage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

/* CERTIFICATE IMAGE UPLOAD */
export const uploadCertificateImage = multer({
  storage: storageLocal,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});
