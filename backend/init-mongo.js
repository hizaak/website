db = db.getSiblingDB("mongodb");

// Because MongoDB doesn't allow to create a collection in a non-existing database, we need to create a collection first.
// And this collection needs to contain at least one document...
// ffs.
db.photos.insertOne({
  title: "Photo test",
  date: new Date(),
  year: new Date().getFullYear(),
});

db.createUser({
  user: "mongodb",
  pwd: "mongodb",
  roles: [
    {
      role: "readWrite",
      db: "mongodb",
    },
  ],
});

db.photos.deleteOne({
  title: "Photo test",
});
