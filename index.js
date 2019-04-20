if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const Person = require("./models/person");

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("build"));

// morgan
const morgan = require("morgan");
morgan.token("data", req => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

// GET info page
app.get("/info", (req, res) => {
  const time = new Date();
  Person.countDocuments().then(result => {
    res.send(
      `<div><p>Puhelinluettelossa on ${result} henkilön tiedot</p><p>${time}</p></div>`
    );
  });
});

// GET list of persons
app.get("/api/persons", (req, res) => {
  Person.find({}).then(people => {
    res.json(people.map(p => p.toJSON()));
  });
});

// GET single person
app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(p => {
      if (p) {
        res.json(p.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

// ADD new person to database
app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person
    .save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON());
    })
    .catch(error => next(error));
});

// UPDATE new number to exiting name
app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true }).then(
    updatedPerson => {
      res.json(updatedPerson.toJSON()).catch(error => next(error));
    }
  );
});

// DELETE person from database
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

// Unknown address
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

// Errorhandling
const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);

// listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
