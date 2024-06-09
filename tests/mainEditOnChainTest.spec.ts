import { Cell, toNano, beginCell, Address, fromNano, SendMode } from "ton-core";
import { HEX_ARTIFACTS_FOLDER, WRAPPERS_FOLDER } from "../constants";
import { TonClient, WalletContractV4 } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import "@ton-community/test-utils";
require("dotenv").config();

describe("main.fc contract tests", () => {
  it("should pass", async () => {
    //**Setup Contract  */
    // Load compiled contract
    const hex =
      require(`../${HEX_ARTIFACTS_FOLDER}/mainEdit.compiled.json`).hex;
    // initialize ton rpc client on mainnet
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    const client = new TonClient({ endpoint });
    // Define initial state
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

    // Get contract wrapper
    const contractWrapper =
      require(`../${WRAPPERS_FOLDER}/MainEditContract.ts`).MainEditContract;
    const mainEditContract = client.open(
      await contractWrapper.createFromConfig({}, codeCell)
    );
    const mainEditContractProvider = client.provider(mainEditContract.address, {
      code: codeCell,
      data: mainEditContract.init.data,
    });

    //** Setup Wallet */
    const mnemonic = process.env.MNEMONIC || "";
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0,
    });
    const walletContract = await client.open(wallet);
    const walletSender = await walletContract.sender(key.secretKey);

    //** Test Actions */
    // Msg1
    let currentTotalValue = await mainEditContract.getSum();
    let currentSqno = await walletContract.getSeqno();
    await mainEditContractProvider.internal(walletSender, {
      value: toNano("0.001"),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(2, 32).endCell(),
    });
    
    while (currentSqno === await walletContract.getSeqno()) {
        await sleep(1000);
    }

    expect(await mainEditContract.getSum()).toBe(currentTotalValue + 2);
  }, 100000);
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));