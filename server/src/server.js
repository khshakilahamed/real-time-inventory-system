import 'dotenv/config';
import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import sequelize from "./sequelize/index.js";
import router from './routes/index.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);


async function start() {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected");
    // alter:true adds missing columns to existing tables without dropping data
    await sequelize.sync({ alter: true });
    console.log("✓ Tables synced");

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

app.get("/api/health", (req, res) =>
  res.status(200).json({
    success: true,
    message: "ok",
    errorMessage: [],
  }),
);

app.use('/api', router);



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
