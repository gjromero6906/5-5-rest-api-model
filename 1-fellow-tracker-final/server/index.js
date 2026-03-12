const express = require('express');
const path = require('path');

const app = express();
let pathToFrontend = path.join(__dirname, '../frontend');
if (process.env.NODE_ENV === 'production') {
  pathToFrontend = path.join(__dirname, '../frontend/dist');
}

// Auto-incrementing ID generator
let id = 1;
const getId = () => id++;

// In Memory Database
const fellows = [
  { name: 'Carmen', id: getId() },
  { name: 'Reuben', id: getId() },
  { name: 'Maya', id: getId() },
];

////////////////////////
// Middleware
////////////////////////

const logRoutes = (req, res, next) => {
  const time = (new Date()).toLocaleString();
  console.log(`${req.method}: ${req.originalUrl} - ${time}`);
  next();
};

app.use(logRoutes);
app.use(express.static(pathToFrontend));
app.use(express.json());

////////////////////////
// Endpoints
////////////////////////

// Get All (Read) GET /api/fellows
const listFellows = (req, res) => {
  res.send(fellows);
};

// Get One (Read) GET /api/fellows/5
const findFellow = (req, res) => {
  const { id } = req.params;
  const fellow = fellows.find((fellow) => fellow.id === Number(id));

  if (!fellow) {
    return res.status(404).send({ message: `No fellow with the id ${id}` });
  }
  res.send(fellow);
};

// Create POST /api/fellows + { "fellowName": "Carmen" }
const createFellow = (req, res) => {
  const { fellowName } = req.body;
  if (!fellowName) {
    return res.status(400).send({ message: 'Invalid Name' });
  }

  const newFellow = { name: fellowName, id: getId() };
  fellows.push(newFellow);
  res.status(201).send(newFellow);
};

// Update PATCH /api/fellows/5 + { fellowName: CARMEN! }
const updateFellow = (req, res) => {
  const { fellowName } = req.body; // the request has a body with a fellowName
  if (!fellowName) {
    return res.status(400).send({ message: 'Name is required' });
  }

  const { id } = req.params; // { postId, commentId }
  const fellow = fellows.find((fellow) => fellow.id === Number(id));

  if (!fellow) {
    return res.status(404).send({
      message: `No fellow with the id ${id}`
    });
  }

  fellow.name = fellowName;
  res.send(fellow);
};

// Delete
const deleteFellow = (req, res) => {
  const { id } = req.params;
  const fellowIndex = fellows.findIndex((fellow) => fellow.id === Number(id));

  if (fellowIndex < 0) {
    return res.status(404).send({ message: `No fellow with the id ${id}` });
  }

  fellows.splice(fellowIndex, 1);
  res.sendStatus(204);
};

app.get('/api/fellows', listFellows);
app.get('/api/fellows/:id', findFellow);
app.post('/api/fellows', createFellow);
app.patch('/api/fellows/:id', updateFellow);
app.delete('/api/fellows/:id', deleteFellow);

// PATCH /api/posts/5/comments/2
// app.patch('/api/posts/:postId/comments/:commentId', controller)

app.use((req, res) => {
  res.status(404).send({ error: `Not found: ${req.originalUrl}` });
});

const port = 8080;
app.listen(port, () => console.log(`listening at http://localhost:${port}`));
