import { Router } from "express";
import {
  createNew,
  deleteOne,
  getMultiple,
  getSingle,
} from "../controller/language.controller";
import multer from "multer";
import path from "path";
import { languageSchema } from "../schema/language";

const UPLOAD_FOLDER = "./assets/language/";

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
      Date.now();

    callback(null, fileName + fileExt);
  },
});

const upload = multer({
  storage: storage,
  fileFilter(req, file, callback) {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("Only image format allowed!"));
    }
  },
});

router
  .route("/")
  .get(getMultiple) // get multiple
  .post(upload.single("imgPath"), createNew); // create new

router
  .route("/:id")
  .get(getSingle) // get one
  .delete(deleteOne); // delete one

export default router;
