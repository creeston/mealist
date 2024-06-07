import express, { Request, Response } from "express";
import cors from "cors";
import restaurantRoutes from "./routes/restaurants";
import menuRoutes from "./routes/menus";
import codesRoutes from "./routes/codes";
const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:4200"],
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.get("/api/GetUserProfile", (req: Request, res: Response) => {
  res.json({
    email: "mityy2012@gmail.com",
    userId: "1",
  });
});

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/codes", codesRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
