require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
// mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// const Person = mongoose.model("Person", personSchema);

app.use(cors());
app.use(express.static("dist"));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  })
);

app.use(express.json());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${
      persons.length
    } people</p> <p>${new Date()}</p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (body.name === undefined && body.number === undefined) {
    return response.status(400).json({
      error: "name and number is missing",
    });
  }

  if (body.name === undefined) {
    return response.status(400).json({
      error: "name is missing",
    });
  }

  if (body.number === undefined) {
    return response.status(400).json({
      error: "number is missing",
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
