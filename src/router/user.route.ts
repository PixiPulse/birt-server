import { Router } from "express";
import {
  createNew,
  getMultiple,
  getSingle,
  updateOne,
  deleteOne,
} from "../controller/user.controller";

const router = Router();

router
  .route("/")
  .get(getMultiple) // get multiple
  .post(createNew); // create new

router
  .route("/:id")
  .get(getSingle) // get one
  .patch(updateOne) // update one
  .delete(deleteOne); // delete one

export default router;
