import { Cell, toNano } from "ton-core";
import { HEX_ARTIFACTS_FOLDER, WRAPPERS_FOLDER } from "../constants";
import { Blockchain } from "@ton-community/sandbox";
import "@ton-community/test-utils";

describe("main.fc contract tests", () => {
  it("should pass", async () => {
    // Load compiled contract
    const hex = require(`../${HEX_ARTIFACTS_FOLDER}/main.compiled.json`).hex;
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

    // Init local blockchain
    const blockchain = await Blockchain.create();

    // Get contract wrapper
    const MainContract = require(`../${WRAPPERS_FOLDER}/MainContract.ts`).MainContract;
    const mainContract = blockchain.openContract(
      await MainContract.createFromConfig({}, codeCell)
    );

    // Create sender actor
    const senderWallet = await blockchain.treasury("senderWallet");

    //** Test Actions */
    // We send an internal message
    const result = await mainContract.sendInternalMessage(
      senderWallet.getSender(),
      toNano("0.05")
    );
    // We expect to the message to cause a transaction in the contract
    expect(result.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: mainContract.address,
      success: true,
    });
  });
});
