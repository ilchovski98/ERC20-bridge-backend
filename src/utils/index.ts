import { ethers } from 'ethers';

export const validationForAddress = {
  validator: function(value: string) {
    return ethers.utils.isAddress(value) && value !== ethers.constants.AddressZero;
  },
  message: `The is not a valid address`
}
