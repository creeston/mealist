import { Router, Request, Response } from "express";
import { Restaurant } from "../models/restaurant";

const router = Router();
let restaurants: Restaurant[] = [];

router.post("/", (req: Request, res: Response) => {
  const restaurant: Restaurant = {
    id: restaurants.length + 1,
    name: req.body.name,
    description: req.body.description,
    address: req.body.address,
    city: req.body.city,
    mapsView: req.body.mapsView,
    wifiName: req.body.wifiName,
    wifiPassword: req.body.wifiPassword,
    instagramUrl: req.body.instagramUrl,
    vkUrl: req.body.vkUrl,
    facebookUrl: req.body.facebookUrl,
    tripAdvisorUrl: req.body.tripAdvisorUrl,
  };

  restaurants.push(restaurant);
  res.status(201).json(restaurant);
});

router.get("/", (req: Request, res: Response) => {
  res.json(restaurants);
});

router.get("/:id", (req: Request, res: Response) => {
  const task = restaurants.find((t) => t.id === parseInt(req.params.id));

  if (!task) {
    res.status(404).send("Task not found");
  } else {
    res.json(task);
  }
});

router.put("/:id", (req: Request, res: Response) => {
  const restaurant = restaurants.find((t) => t.id === parseInt(req.params.id));

  if (!restaurant) {
    res.status(404).send("Task not found");
  } else {
    restaurant.name = req.body.name;
    restaurant.description = req.body.description;
    restaurant.address = req.body.address;
    restaurant.city = req.body.city;
    restaurant.mapsView = req.body.mapsView;
    restaurant.wifiName = req.body.wifiName;
    restaurant.wifiPassword = req.body.wifiPassword;
    restaurant.instagramUrl = req.body.instagramUrl;
    restaurant.vkUrl = req.body.vkUrl;
    restaurant.facebookUrl = req.body.facebookUrl;
    restaurant.tripAdvisorUrl = req.body.tripAdvisorUrl;

    res.json(restaurant);
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  const index = restaurants.findIndex((t) => t.id === parseInt(req.params.id));

  if (index === -1) {
    res.status(404).send("Restaurant not found");
  } else {
    restaurants.splice(index, 1);
    res.status(204).send();
  }
});

export default router;
