import express, { Express } from 'express';
import cors from 'cors';

require('dotenv').config();

// Configure out app
const app: Express = express();
const port  = process.env.PORT || 8000;

app.use(cors());

require('./startup/db')();
require('./startup/config')();
require('./startup/routes')(app);

// Create the server
app.listen(port, () => {
  console.log('Our app is running on port ', port);
})
