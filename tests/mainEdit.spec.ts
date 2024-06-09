import { Cell, beginCell, toNano } from "ton-core";
import { HEX_ARTIFACTS_FOLDER, WRAPPERS_FOLDER } from "../constants";
import { Blockchain } from "@ton-community/sandbox";
import "@ton-community/test-utils";

describe("mainEdit.fc contract tests", () => {
  it("should pass", async () => {
    // Load compiled contract
    const hex =
      require(`../${HEX_ARTIFACTS_FOLDER}/mainEdit.compiled.json`).hex;
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

    // Init local blockchain
    const blockchain = await Blockchain.create();

    // Create sender actor
    const senderWallet = await blockchain.treasury("senderWallet");

    // Get contract wrapper
    const MainEditContract =
      require(`../${WRAPPERS_FOLDER}/MainEditContract.ts`).MainEditContract;
    const mainEditContract = blockchain.openContract(
      await MainEditContract.createFromConfig(
        {},
        codeCell,
        0,
        beginCell()
          .storeAddress(senderWallet.getSender().address)
          .storeUint(0, 32)
          .endCell()
      )
    );

    //** Test Actions */
    // Msg1
    const result = await mainEditContract.sendInternalMessage(
      senderWallet.getSender(),
      toNano("1"),
      beginCell().storeUint(2, 32).endCell()
    );
    expect(result.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: mainEditContract.address,
      success: true,
    });

    const latestSenderAddress = await mainEditContract.getLatestSenderAddress();
    expect(latestSenderAddress.toString()).toBe(
      senderWallet.address.toString()
    );
    expect(await mainEditContract.getSum()).toBe(2);

    // Msg2
    const senderWallet1 = await blockchain.treasury("senderWallet1");
    const result1 = await mainEditContract.sendInternalMessage(
      senderWallet1.getSender(),
      toNano("1"),
      beginCell().storeUint(4, 32).endCell()
    );
    expect(result1.transactions).toHaveTransaction({
      from: senderWallet1.address,
      to: mainEditContract.address,
      success: true,
    });

    const latestSenderAddress1 =
      await mainEditContract.getLatestSenderAddress();
    expect(latestSenderAddress1.toString()).toBe(
      senderWallet1.address.toString()
    );
    expect(await mainEditContract.getSum()).toBe(6);
  });
});
