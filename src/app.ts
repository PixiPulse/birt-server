import express from 'express';
import cors from "cors";
import path from "path";
import { config } from "dotenv";


config();

export const app = express()

// cors
app.use(cors());

// middlewares
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

