import { Router } from "express";
import {
  createNew,
  deleteOne,
  getMultiple,
  getSingle,
  updateOne,
} from "../controller/place.controller";
import multer from "multer";
import path from "path";
import { verifyRoles } from "../middleware/verifyRoles";
import { ROLE_LIST } from "../lib/data";

const UPLOAD_FOLDER = "./assets/place/";

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
      req.body?.name;

    callback(null, fileName + fileExt);
  },
});

const upload = multer({
  storage: storage,
  fileFilter(req, file, callback) {
    if (!req.body?.name) {
      callback(new Error("Enter name"));
    } else if (file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("Only image format allowed!"));
    }
  },
});

router
  .route("/")
  .get(verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin), getMultiple) // get multiple
  .post(
    verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin),
    upload.single("imgPath"),
    createNew
  ); // create new

router
  .route("/:id")
  .get(
    verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin, ROLE_LIST.user),
    getSingle
  ) // get one
  .put(
    verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin),
    upload.single("imgPath"),
    updateOne
  )
  .delete(verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin), deleteOne); // delete one

export default router;
