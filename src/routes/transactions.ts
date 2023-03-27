import express, { Request, Response } from 'express';
import _ from 'lodash';
import { ethers } from 'ethers';

import { Transaction, validateTransaction } from '../models/transaction';
import { TransactionData } from '../utils/types';
import { asyncMiddleware } from '../middlewares/async';
import { signersAndBridgesByChain } from '../components/signers/signers';

const router = express.Router();

export const createTransaction = async (data: TransactionData) => {
  const { error } = validateTransaction(data);
  if (error) {
    console.error(error);
    return error
  }
  try {
    const transaction = new Transaction(data);
    await transaction.save();
    return true;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const getTransactionById = async (id: string) => {
  return await Transaction.findOne({ id });
}

export const findTransactionAndUpdate = async (find: Object, update: Object) => {
  const transaction = await Transaction.findOneAndUpdate(find, update);
  await transaction?.save();
}

// get specific user chain transactions
router.get('/claim/:transactionId', asyncMiddleware(async (req: Request, res: Response) => {
  const transaction = await Transaction.findOne({ id: req.params.transactionId });

  if (!transaction) {
    return res.status(400).send('There is no such transaction');
  }

  // check if already claimed on the blockchain
  const sourceData = transaction.claimData.sourceTxData;
  const transactionDataHash = ethers.utils.solidityKeccak256(['bytes32', 'bytes32', 'uint256'], [sourceData.transactionHash, sourceData.blockHash, sourceData.logIndex]);
  const signerAndBridgesByChain =  signersAndBridgesByChain[transaction.toChain];
  const isClaimed = await signerAndBridgesByChain.bridge.isClaimed(transactionDataHash);

  console.log('isClaimed', isClaimed);

  // yes - throw error
  if (isClaimed) {
    return res.status(400).send('Transaction is already claimed!');
  }

  // sign
  const claimSignature = await signerAndBridgesByChain.signClaimData(transaction.claimData);

  // send result
  res.send(claimSignature);
}));

// get specific user chain transactions
router.get('/:userAddress', asyncMiddleware(async (req: Request, res: Response) => {
  if (!ethers.utils.isAddress(req.params.userAddress)) return res.status(400).send('Provided user address is invalid!');
  const transactions = await Transaction
    .find({ fromAddress: req.params.userAddress })
    .sort({ blockNumber: -1});

  res.send(transactions);
}));

router.get('/:userAddress/:chainId', asyncMiddleware(async (req: Request, res: Response) => {
  if (!ethers.utils.isAddress(req.params.userAddress)) return res.status(400).send('Provided user address is invalid!');
  if (!(Number(req.params.chainId) > 0)) return res.status(400).send('Provided chainId is invalid!');
  const transactions = await Transaction
    .find({ fromAddress: req.params.userAddress, toChain: req.params.chainId })
    .sort({ blockNumber: -1});

  res.send(transactions);
}));

// get all user transactions

// read
router.get('/', asyncMiddleware(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({});
  res.send(transactions);
}));

// delete for testing
router.delete('/all', asyncMiddleware(async (req: Request, res: Response) => {
  const result = await Transaction.deleteMany({});
  res.send(result);
}));

export default router;
