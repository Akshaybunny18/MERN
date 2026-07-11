const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const promClient = require('prom-client');
const dotenv = require('dotenv');
const { connectRedis } = require('./config/redis');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mern')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to Redis
connectRedis();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Prometheus Metrics Setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : req.path, code: res.statusCode });
  });
  next();
});

// Metrics endpoint with Basic Auth for Grafana Cloud
app.get('/metrics', async (req, res) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login && password && login === 'admin' && password === 'admin') {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } else {
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/organizers', require('./routes/organizerRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

// Add a basic route for /
app.get('/', (req, res) => {
  res.send('Infinium API is running');
});

// Seed Admin
const seedAdmin = require('./seed/adminSeed');
seedAdmin();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
