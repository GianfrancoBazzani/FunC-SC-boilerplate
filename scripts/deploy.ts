import * as fs from "fs";
import process from "process";
import {
  Cell,
  SendMode,
} from "ton-core";
import {
  WalletContractV4,
  TonClient,
  fromNano,
  toNano,

} from "ton";
import { mnemonicToWalletKey } from "ton-crypto";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { HEX_ARTIFACTS_FOLDER, WRAPPERS_FOLDER,NETWORK } from "../constants";
require("dotenv").config();

// Sanity check
const sourceFileName = process.argv[2];
if (!sourceFileName) {
  console.error("Please specify the contract that you want to compile");
  process.exit(1);
} else if (
  !fs.existsSync(`${HEX_ARTIFACTS_FOLDER}/${sourceFileName}.compiled.json`)
) {
  console.error(
    `File, ${sourceFileName}.compiled.json is not present in ${HEX_ARTIFACTS_FOLDER} folder. Please check the file name and try again.`
  );
  process.exit(1);
}

async function deployScript() {
  console.log("Deploying contract: ", `${sourceFileName}.fc`);

  //**Setup Contract  */
  // Load compiled contract
  const hex = require(`../${HEX_ARTIFACTS_FOLDER}/${sourceFileName}.compiled.json`).hex;
  // Define initial state
  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const WrapperName = sourceFileName.charAt(0).toUpperCase() + sourceFileName.slice(1)
  const contractWrapper = require(`../${WRAPPERS_FOLDER}/${WrapperName}Contract.ts`)[`${WrapperName}Contract`];
  const contractToDeploy = contractWrapper.createFromConfig({}, codeCell); 

  //** Setup deployer wallet */
  // Deploy contract
  const mnemonic = process.env.MNEMONIC || "";
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });
  // initialize ton rpc client on mainnet
  const endpoint = await getHttpEndpoint({ network: NETWORK });
  const client = new TonClient({ endpoint });
  const walletContract = await client.open(wallet);
  const walletSender = await walletContract.sender(key.secretKey);
  console.log("Deployer Wallet Info");
  console.log("Address:", wallet.address);
  console.log("Balance :", fromNano(await client.getBalance(wallet.address)));

  //** Deploy */
  if (await client.isContractDeployed(contractToDeploy.address)) {
    console.log("Contract is already deployed");
    process.exit(0);
  }
  const contractProvider = client.provider(contractToDeploy.address, {
    code: codeCell,
    data: contractToDeploy.init.data,
  });
  await contractProvider.internal(walletSender, {
    value: toNano("0.002"),
    sendMode: SendMode.PAY_GAS_SEPARATELY,
    body: new Cell(),
  });
  // await until contract is deployed
  while (!(await client.isContractDeployed(contractToDeploy.address))) {
    console.log("Contract not deployed yet, checking again in 1.5 seconds");
    await sleep(1500);
  }

  //** Finalize */
  console.log("Deployment successful");
  console.log(
    "Compiled code saved in: ",
    `${HEX_ARTIFACTS_FOLDER}/${sourceFileName}.compiled.json`
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

deployScript();
