import * as express from "express";

const app = express();

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello, World!",
  });
});

app.get("/error", (req, res, next) => {
  const err = new Error();
  return next(err);
});

app.use((req, res, next) => {
  return res.status(404).json({
    message: "Not Found",
  });
});

app.use(((err, req, res, next) => {
  return res.status(500).json({
    message: "Internal Server Error",
  });
}) as express.ErrorRequestHandler);

export { app };
