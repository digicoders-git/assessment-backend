import multer from "multer";

const storage = multer.memoryStorage();

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
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});
