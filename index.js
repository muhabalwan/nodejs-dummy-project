const express = require("express");
const config = require("config");
const app = express();
const Joi = require("@hapi/joi");
const authenticate = require("./authentication");
const helmet = require("helmet");
const morgan = require("morgan");

// template used is pug
app.set("view engine", "pug");
// path of views
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

console.log("config ->>", config.get("name"));
console.log("config ->>", config.get("mail.host"));
console.log("config ->>", config.get("mail.password"));

if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  console.log("MORGAN ENABLED");
}

app.use(authenticate);

app.use(helmet());

const GENERES = [
  { id: 1, name: "action" },
  { id: 2, name: "comedy" },
  { id: 3, name: "drama" },
  { id: 4, name: "romance" },
  { id: 5, name: "scifi" },
  { id: 6, name: "true story" },
];

app.get("/", (req, res) => {
  res.render("index", {
    title: "My dummy project ",
    message: "this is the message ",
  });
});

// get generes
app.get("/vidly/movie/generes", (req, res) => {
  res.send(GENERES);
});

// create generes
app.post("/vidly/movie/generes/create", (req, res) => {
  const error = validateSchema(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  var receivedGenre = req.body.name;
  const isExist = GENERES.find((gen) => gen.name === receivedGenre);
  if (isExist) return res.status(404).send("Generes already exist!");
  var newGenre = {
    id: GENERES.length + 1,
    name: req.body.name,
  };
  GENERES.push(newGenre);
  res.send(GENERES);
});

// update generes
app.put("/vidly/movie/generes/:id", (req, res) => {
  const error = validateSchema(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const genre = GENERES.find((gen) => gen.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send("Id not found");
  genre.name = req.body.name;
  res.send(GENERES);
});
// delete generes
app.delete("/vidly/movie/generes/:id", (req, res) => {
  const genre = GENERES.find((gen) => gen.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send("Id not found");
  const index = GENERES.indexOf(genre);
  GENERES.splice(index, 1);
  res.send(GENERES);
});
const port = process.env.port || 4000;
app.listen(port, () => {
  console.log(`Listening on port: ${port}... `);
});

const validateSchema = (body) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });
  const { error } = schema.validate(body);
  return error;
};
