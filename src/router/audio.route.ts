import { Router } from "express";
import {
  createNew,
  deleteOne,
  getMultiple,
  getSingle,
} from "../controller/audio.controller";
import multer from "multer";
import path from "path";

const UPLOAD_FOLDER = "./assets/audio/";

const router = Router();

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, UPLOAD_FOLDER);
  },
  filename(req, file, callback) {
    const fileExt = path.extname(file.originalname);
    const fileName =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      req.body?.placeId +
      "-" +
      req.body?.languageId;

    callback(null, fileName + fileExt);
  },
});

const upload = multer({
  storage: storage,
  fileFilter(req, file, callback) {
    if (!req.body?.placeId && !req.body?.languageId) {
      callback(new Error("Enter placeId, languageId"));
    } else if (file.fieldname === "imgPath") {
      if (file.mimetype.startsWith("image/")) {
        callback(null, true);
      } else {
        callback(new Error("Only image format allowed!"));
      }
    } else if (file.fieldname === "filePath") {
      if (file.mimetype.startsWith("audio/") || file.mimetype === "video/mp4") {
        callback(null, true);
      } else {
        callback(new Error("Only image format allowed!"));
      }
    }
  },
});

router
  .route("/")
  .get(getMultiple) // get multiple
  .post(
    upload.fields([
      { name: "imgPath", maxCount: 5 },
      { name: "filePath", maxCount: 1 },
    ]),
    createNew,
  ); // create new

router
  .route("/:id")
  .get(getSingle) // get one
  .delete(deleteOne); // delete one

export default router;
