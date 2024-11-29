import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import path from "path";
import { config } from "dotenv";
import { ROLE_LIST } from "./lib/data";
import {
  adminRouter,
  audioRouter,
  authRouter,
  languageRouter,
  placeRouter,
  userRouter,
} from "./router";
import { verifyToken } from "./middleware/verifyToken";
import { verifyRoles } from "./middleware/verifyRoles";
import fileUpload from 'express-fileupload';

// config dotenv
config();

export const app = express();

// cors
app.use(cors());

// middlewares
app.use(fileUpload())
app.use(express.static(path.join(__dirname, "..", "assets")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// api endpoints
// auth
app.use("/api/v1/login", authRouter);

// verify token for following endpoints
app.use(verifyToken);

// only superadmin
app.use("/api/v1/admin", verifyRoles(ROLE_LIST.superadmin), adminRouter);

// superadmin and admin
app.use(verifyRoles(ROLE_LIST.superadmin, ROLE_LIST.admin));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/place", placeRouter);
app.use("/api/v1/language", languageRouter);
app.use("/api/v1/audio", audioRouter);

// error handling middleware
const errorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something wrong!";

  res.status(errorStatus).send(errorMessage);
};

app.use(errorHandler);
