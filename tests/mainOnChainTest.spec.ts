import { Cell, toNano } from "ton-core";
import { HEX_ARTIFACTS_FOLDER, WRAPPERS_FOLDER } from "../constants";
import { TonClient } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Blockchain } from "@ton-community/sandbox";
import "@ton-community/test-utils";

describe("main.fc contract tests", () => {
  it("should pass", async () => {
    //**Setup Contract  */
    // Load compiled contract
    const hex = require(`../${HEX_ARTIFACTS_FOLDER}/main.compiled.json`).hex;
    // initialize ton rpc client on mainnet
    const endpoint = await getHttpEndpoint({ network: "mainnet" });
    const client = new TonClient({ endpoint });
    // Define initial state
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    const contractWrapper =
      require(`../${WRAPPERS_FOLDER}/MainContract.ts`).MainContract;
    const mainContract = client.open(contractWrapper.createFromConfig({}, codeCell)); 

    expect( (await mainContract.getLatestSenderAddress()).toString()).toBe("EQARCqze1X6Q5BwJ-MciXEc0mMg0K2JniZhmvp6Ev-DAQZIJ");
  });
});
