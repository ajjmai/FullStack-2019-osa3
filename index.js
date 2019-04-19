const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");

app.use(bodyParser.json());
morgan.token("data", req => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Martti Tienari",
    number: "040-123456",
    id: 2
  },
  {
    name: "Arto Järvinen",
    number: "040-123456",
    id: 3
  },
  {
    name: "Lea Kutvonen",
    number: "040-123456",
    id: 4
  }
];

app.get("/info", (req, res) => {
  const personsLength = persons.length;
  const time = new Date();
  const text =
    `<p>Puhelinluettelossa on ${personsLength} henkilön tiedot</p>` +
    `<p>${time}</p>`;
  res.send(text);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

const generateId = () => {
  const newId = Math.floor(Math.random() * Math.floor(100));
  return newId;
};

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "content missing" });
  }
  if (persons.map(p => p.name).includes(body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  };
  persons = persons.concat(person);
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
