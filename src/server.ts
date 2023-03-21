
// const app: Express = express();
// const port = 3000;

// app.get('/', (req: Request, res: Response)=>{
  //   res.send('Hello, this is Express + TypeScript');
// });

// app.listen(port, ()=> {
  //   console.log(`[Server]: I am running at https://localhost:${port}`);
  // });

import express, {Express, Request, Response} from 'express';

require('dotenv').config();

// Configure out app
const app: Express = express();
const port  = process.env.PORT || 8000;

require('./startup/db')();
// require('./startup/config')();
// require('./startup/routes')(app);

// Create the server
app.listen(port, () => {
  console.log('Our app is running on port ', port);
})
