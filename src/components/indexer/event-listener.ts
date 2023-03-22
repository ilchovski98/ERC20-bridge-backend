import { signersAndBridgesByChain } from '../signers/signers';

// if the node is out of date sync

// after sync start listening for the events for each bridge

// separate
// create functions that will be called when an event occurs
// based on the event type deposit || claim will either
// deposit : get needed data from the event, create claimData and sign it, store the data and the signature in the transaction
// claim : get needed data from the event, identify the deposit transaction and populate the needed fields claimed and etc...

