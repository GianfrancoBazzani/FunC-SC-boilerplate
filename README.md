# TON smart contracts development boilerplate

### Requirements
- Node.js v20.11.0
  - run: `nvm use`
- Yarn
  - run: `npm install --global yarn`

### Commands
- To install dependencies: `yarn`

### Project structure
- contracts: contains FunC contracts sources
- scripts: contains utilities scripts
- test: contains jest tests for FunC contracts
- wrappers: wrappers to interact with deployed contracts

### Compile a specific FunC source
- Place `<name>.fc` in `contracts` folder
- Run `yarn compile <name>`
- If compilation succeeds you will have compilation results as `<name>.compiled.json` inside `build` folder

### Deploy a specific FunC source
- Select mainnet or testnet in `constants.ts`.
- Run `yarn compile <name>`
- Setup a wrapper of the contract in `wrappers` named as `<Name>Contract.ts`
- Run `yarn deploy <name>`
