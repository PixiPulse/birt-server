import { Router } from "express";
import {
  createNew,
  deleteOne,
  getMultiple,
  getSingle,
  updateOne,
} from "../controller/admin.controller";
import { verifyRoles } from "../middleware/verifyRoles";
import { ROLE_LIST } from "../lib/data";

const router = Router();

router
  .route("/")
  .get(verifyRoles(ROLE_LIST.superadmin), getMultiple) // get multiple admin
  .post(verifyRoles(ROLE_LIST.superadmin), createNew); // create new

router
  .route("/:id")
  .get(verifyRoles(ROLE_LIST.superadmin, ROLE_LIST.admin), getSingle) // get one
  .patch(verifyRoles(ROLE_LIST.superadmin), updateOne) // update one
  .delete(verifyRoles(ROLE_LIST.superadmin), deleteOne); // delete one

export default router;
