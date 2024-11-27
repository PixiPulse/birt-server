import { Router } from "express";

const router = Router();

router
  .route("/")
  .get() // get multiple
  .post(); // create new

router
  .route("/:id")
  .get() // get one
  .patch() // update one
  .delete(); // delete one

export default router;
