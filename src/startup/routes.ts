import express, {Express, Request, Response} from 'express';
// const helmet = require('helmet');
import error from '../middlewares/error';
import transactions from '../routes/transactions';
import lastBlockNumbers from '../routes/lastBlockNumbers';

module.exports = function(app: Express) {
  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('public'));
  // app.use(helmet());

  // create out routes
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
  });

  // Routes
  app.use('/api/transactions', transactions);
  app.use('/api/lastBlockNumber', lastBlockNumbers);

  // Error handling
  app.use(error);
}
