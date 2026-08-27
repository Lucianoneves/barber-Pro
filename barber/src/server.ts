import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import routes from "./routes";

const app = express();

app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    // se a requisição for para o webhook, passa para o next
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(
  cors(
    process.env.FRONTEND_URL
      ? { origin: process.env.FRONTEND_URL }
      : undefined
  )
);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/webhook") {
    return express.raw({ type: "application/json" })(req, res, next);
  }

  return express.json()(req, res, next);
});

app.use(routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({
      // Erro do cliente
      error: err.message,
    });
  }
  return res.status(500).json({
    // Erro  doservidor interno
    status: "error",
    message: "Internal server error",
  });
});

const port = Number(process.env.PORT) || 3333;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server online porta ${port}`);
});



