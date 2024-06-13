db = db.getSiblingDB("mealistdb");
db.createUser({
  user: "admin",
  pwd: "admin",
  roles: [{ role: "readWrite", db: "mealistdb" }],
});
db.createCollection("restaurants");
db.createCollection("menus");
db.createCollection("codes");
