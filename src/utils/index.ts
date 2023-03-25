import { MultiCall } from '@limechain/multicall';
import { ethers, Wallet } from 'ethers';

import permitERC20ABI from './contract/abi/PermitERC20.json';

export const validationForAddress = {
  validator: function(value: string) {
    return ethers.utils.isAddress(value) && value !== ethers.constants.AddressZero;
  },
  message: `The is not a valid address`
}

/*
  Example usage:
  multicallTokenData('tokenAddress', ['methodName1', 'methodName2', 'methodName3'], [[methodArgs1], [methodArgs2], [methodArgs3]], signer/provider);
*/
export const multicallTokenData = async (coinAddress: string, methodNames: string[], methodArguments: any, signer: ethers.providers.Provider) => {
  //Make a new class using signer/provider:
  const multi = new MultiCall(signer);
  // Array for the prepared encoded inputs
  const inputs = [];
  // Array for the decoded results with the balance of each token
  const outputs = [];

  for (let i = 0; i < methodNames.length; i++) {
    inputs.push({ target: coinAddress, function: methodNames[i], args: methodArguments[i] });
  }

  // We are calling then the multicall method passing the ABI of the contract as well as encoded inputs:
  const tokenData = await multi.multiCall(permitERC20ABI.abi, inputs);
  // We need to decode the result after the result is returned and we are using the first index of every element as follows:
  for (let i = 0; i < inputs.length; i++) {
    outputs[i] = tokenData[1][i];
  }

  return outputs;
};
