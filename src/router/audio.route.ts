import { Router } from "express";
import { createNew } from "../controller/audio.controller";

const router = Router();

router
  .route("/")
  .get() // get multiple
  .post(createNew); // create new

router
  .route("/:id")
  .get() // get one
  .patch() // update one
  .delete(); // delete one

export default router;
