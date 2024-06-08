# TON smart contracts development boilerplate

### Requirements
- Node.js v20.11.0
  - run: `nvm use`
- Yarn
  - run: `npm install --global yarn`

### Commands
- To install dependencies: `yarn`

### Compile a specific FunC source
- Place `<name>.fc` in `contracts` folder
- Run `yarn compile <main>`
- If compilation succeeds you will have compilation results as `<name>.compiled.json` inside `build` folder