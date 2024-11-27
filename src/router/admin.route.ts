import { Router } from "express";
import { createNew, deleteOne, getMultiple, getSingle, updateOne } from "../controller/admin.controller";

const router = Router();

router
  .route("/")
  .get(getMultiple) // get multiple admin
  .post(createNew); // create new

router
  .route("/:id")
  .get(getSingle) // get one
  .patch(updateOne) // update one
  .delete(deleteOne); // delete one

export default router;
