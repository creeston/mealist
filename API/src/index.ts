import express, { Request, Response } from "express";
import cors from "cors";
import { initialize } from "express-openapi";
import { resolve } from "path";
import swaggerUi from "swagger-ui-express";
import { connectToDatabase } from "./db/connection";

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:4200"],
};
app.use(cors(corsOptions));
app.use(express.json());

initialize({
  apiDoc: "./src/api-doc.yaml",
  app: app,
  promiseMode: true,
  paths: resolve(__dirname, "routes"),
  routesGlob: "**/*.{ts,js}",
  routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.get("/api/GetUserProfile", (req: Request, res: Response) => {
  res.json({
    email: "mityy2012@gmail.com",
    userId: "1",
  });
});

app.use(
  "/api-documentation",
  swaggerUi.serve,
  swaggerUi.setup(
    {},
    {
      swaggerOptions: {
        url: "http://localhost:3000/api-docs",
      },
    }
  )
);

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
