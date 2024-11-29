import { Router } from "express";
import { createNew, deleteOne, getMultiple, getSingle } from "../controller/place.controller";

const router = Router();

router
  .route("/")
  .get(getMultiple) // get multiple
  .post(createNew); // create new

router
  .route("/:id")
  .get(getSingle) // get one
  .delete(deleteOne); // delete one

export default router;
