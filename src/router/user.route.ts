import { Router } from "express";
import {
  createNew,
  getMultiple,
  getSingle,
  updateOne,
  deleteOne,
} from "../controller/user.controller";
import { verifyRoles } from "../middleware/verifyRoles";
import { ROLE_LIST } from "../lib/data";

const router = Router();

router
  .route("/")
  .get(verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin, ROLE_LIST.user), getMultiple) // get multiple
  .post(verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin, ROLE_LIST.user), createNew); // create new

router
  .route("/:id")
  .get(verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin, ROLE_LIST.user) ,getSingle) // get one
  .patch(verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin, ROLE_LIST.user), updateOne) // update one
  .delete( verifyRoles(ROLE_LIST.admin, ROLE_LIST.superadmin, ROLE_LIST.user), deleteOne); // delete one

export default router;
