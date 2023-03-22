import express, { Request, Response } from 'express';
import _ from 'lodash';
import { Signer } from 'ethers';

import { LastBlockNumber, validateLastBlockNumber } from '../models/lastBlockNumber';
import { LastBlockNumberData } from '../types';
import { asyncMiddleware } from '../middlewares/async';
import { infoByChain } from '../config';

const router = express.Router();

export const createLastBlockNumber = async (data: LastBlockNumberData) => {
  const { error } = validateLastBlockNumber(data);
  if (error) {
    console.error(error);
    return error;
  }
  try {
    const lastBlockNumberTx = new LastBlockNumber(data);
    await lastBlockNumberTx.save();
    return true;
  } catch (error) {
    console.error(error);
    return error;
  }
}

// Todo get blockNumber dynamically
export const createLastBlockPerChainIfNotPresent = async (chain: number | any, signer: Signer) => {
  const chainLastValidatedBlockNumber = await LastBlockNumber.find({chain});

  if (!(chainLastValidatedBlockNumber.length > 0)) {
    try {
      await createLastBlockNumber({
        chain: chain,
        bridgeAddress: infoByChain[chain].bridgeAddress || '',
        lastBlockNumber: infoByChain[chain].bridgeDeployedBlockNumber || 0
      });
    } catch (error) {
      console.error(error);
    }
  }
}

// create
// Todo if I need lodash or not - add value that is not present in the validation see what happens
router.post('/', asyncMiddleware(async (req: Request, res: Response) => {
  const { error } = validateLastBlockNumber(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const lastBlockNumberTx = new LastBlockNumber(req.body);
  await lastBlockNumberTx.save();
  res.send(lastBlockNumberTx);
}));

// read all
router.get('/', asyncMiddleware(async (req: Request, res: Response) => {
  const lastBlockNumbers = await LastBlockNumber.find({});
  res.send(lastBlockNumbers);
}));

// read by chain
router.get('/:chainId', asyncMiddleware(async (req: Request, res: Response) => {
  const lastBlockNumbers = await LastBlockNumber.find({ chain: req.params.chainId });
  res.send(lastBlockNumbers);
}));

// update
// Todo validation is not good here
router.put('/:chainId', asyncMiddleware(async (req: Request, res: Response) => {
  if (!req.body.lastBlockNumber) {
    return res.status(400).send("Invalid lastBlockNumber input");
  }
  const lastBlockNumber = await LastBlockNumber.findOneAndUpdate({ chain: req.params.chainId }, { lastBlockNumber: req.body.lastBlockNumber });
  await lastBlockNumber?.save();
  res.send(true);
}));

// delete for testing
router.delete('/all', asyncMiddleware(async (req: Request, res: Response) => {
  const result = await LastBlockNumber.deleteMany({});
  res.send(result);
}));

export default router;
