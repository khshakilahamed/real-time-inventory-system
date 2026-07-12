import express from "express";
import cors from "cors";
const app = express();
import router from './routes/index.js';
import errorHandler from "./middlewares/errorHandler.js";

app.use(express.json())

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/api/health", (req, res) =>
  res.status(200).json({
    success: true,
    message: "ok",
    errorMessage: [],
  }),
);

app.use("/api", router);

// Global error handler
app.use(errorHandler);

// handle not found route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    errorMessage: [
      {
        path: req.originalUrl,
        message: "API Not Found",
      },
    ],
  });
  next();
});

export default app;
