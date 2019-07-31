const express = require('express');
const bodyParser = require('body-parser');
const redisMiddleware = require('./middleware/redis');
const ipAddressLookupMiddleware = require('./middleware/ipaddress-lookup');
const updateBlacklistRoute = require('./routes/update-blacklist');

const app = express();

app.use(bodyParser.json());
app.use(ipAddressLookupMiddleware);
app.use(redisMiddleware);

app.post('/webhook', updateBlacklistRoute);

module.exports = app;
