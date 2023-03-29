## 🗄 Project description, structure and functionalities

Bridge Backend: https://github.com/ilchovski98/ERC20-bridge-backend
Bridge Smart Contract: https://github.com/ilchovski98/ERC20-bridge-smart-contract

## About the project

The application provides:
  - endpoint for all user historic transactions
  - endpoint for all user chain specific transactions
  - endpoint for signing and approving claim transactions
  - listening for new events => parsing => saving to database
  - after shutdown the application syncs and gathers the missed events and processes them

**Folders and files**

- `src` - Source code for the app, here is all the logic and functionalities
  - `components` - main processing, parsing and signing functionalities of the app
  - `middlewares` - middlewares used for the routing logic
  - `models` - Defining mongoose data structures and validation
  - `routes` - api endpoints
  - `startup` - logic used during the start of the application
  - `utils` - some helpers functions
    - `contract` - contracts abi
    - `types` - typescript contract types

## Porject Startup
1. Create .env file according to the .env.example
2. Add your desired hardcoded values in src/config.js for your desired contracts and chains
3. Run yarn start
