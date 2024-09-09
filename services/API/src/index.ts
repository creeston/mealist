import express, { Request, Response } from "express";
import cors from "cors";
import { initialize } from "express-openapi";
import { resolve } from "path";
import swaggerUi from "swagger-ui-express";
import multer from "multer";
import { connectToDatabase } from "./repositories/connection";
import { connectoToRabbitMQ } from "./queue/connection";
import { listenToMenuParsingStatusQueue, listenToMenuOcrStatusQueue } from "./presentation/routes/menus";


const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:4200"],
};
app.use(cors(corsOptions));
app.use(express.json());

initialize({
  apiDoc: "./src/presentation/api-doc.yaml",
  // apiDoc: "./API/src/api-doc.yaml",
  app: app,
  promiseMode: true,
  paths: resolve(__dirname, "presentation", "routes"),
  // paths: "./src/routes",
  routesGlob: "**/*.{ts,js}",
  routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
  consumesMiddleware: {
    'multipart/form-data': function (req, res, next) {
      multer().any()(req, res, function (err) {
        if (err) return next(err);
        if (req.files) {
          (req.files as any).forEach(function (f: any) {
            req.body[f.fieldname] = ''; // Set to empty string to satisfy OpenAPI spec validation
          });
        }
        return next();
      });
    }
  }
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
    connectoToRabbitMQ()
      .then(() => {
        app.listen(port, () => {
          console.log(`Server running at http://localhost:${port}`);
        });
        listenToMenuParsingStatusQueue();
        listenToMenuOcrStatusQueue();
      }).catch((error: Error) => {
        console.error("RabbitMQ connection failed", error);
        process.exit();
      });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
