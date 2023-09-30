const express = require('express');
const client = require('prom-client');

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

const app = express();
const PORT = 3009;

const arr = [];

const counter = new client.Counter({
  name: 'metric_name',
  help: 'metric_help',
});

const counterLabeled = new client.Counter({
  name: 'counter_with_label',
  help: 'testing counters with labels',
  labelNames: ['label']
});

const gauge = new client.Gauge ({
  name: 'gauge_test',
  help: 'just a test gauge'
});

app.get("/", (req, res) => {
  counter.inc(); // Increment by 1
  res.json({
    message: "incremented"
  })
})

app.get("/inc-gauge", function(req, res) {
  arr.push(undefined);
  gauge.inc();
  res.send("increment gauge");
});

app.get("/inc-label", function(req, res) {
  const label = req.query.label ?? null;
  console.log("label: ", label);
  arr.push(undefined);
  counterLabeled.labels({label}).inc();
  res.send("increment label");
});

app.get("/dec-gauge", function(req, res) {
  arr.pop();
  gauge.dec();
  res.send("decrement gauge")

});

app.get('/metrics', async function (req, res) {
  res.set('Content-Type', client.register.contentType);
  const result = await client.register.metrics();
  res.end(result);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})