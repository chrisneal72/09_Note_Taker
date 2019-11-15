// Dependencies
// =============================================================
const express = require("express");
const fs = require("fs");
const util = require("util");
const path = require("path");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Promisify Modules
const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);

// Routes
// =============================================================
app.use(express.static(path.resolve('./public')));
// Basic route that sends the user first to the AJAX Page
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/notes", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

app.get("/api/notes", async function (req, res) {
  const db = JSON.parse(await readFileAsync(__dirname + "/db/db.json"));
  return res.json(db);
});

app.post("/api/notes", async function (req, res) {
  const db = JSON.parse(await readFileAsync(__dirname + "/db/db.json"));
  req.body.id = db.length ? db[db.length - 1].id + 1 : 1;
  db.push(req.body);
  await writeFileAsync(__dirname + "/db/db.json", JSON.stringify(db));
  return res.json(db);
});

app.delete("/api/notes/:id", async function (req, res) {
  const db = JSON.parse(await readFileAsync(__dirname + "/db/db.json"));
  let myFlag = true;
  let i = 0;
  while (myFlag) {
    switch (db[i].id) {
      case parseInt(req.params.id) :
        db.splice(i, 1);
        myFlag = !myFlag;
        break;
      default:
        i++;
    }
  }
  await writeFileAsync(__dirname + "/db/db.json", JSON.stringify(db));
  return res.json(db);
});

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});
// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});
