import {
  Cell,
  Address,
  contractAddress,
  Contract,
  beginCell,
  ContractProvider,
  Sender,
  SendMode,
} from "ton-core";

export class MainEditContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init: { code: Cell; data: Cell }
  ) {}

  static createFromConfig(
    config: any,
    code: Cell,
    workchain = 0,
    data = beginCell()
      .storeAddress(
        Address.parse("EQARCqze1X6Q5BwJ-MciXEc0mMg0K2JniZhmvp6Ev-DAQZIJ")
      )
      .storeUint(0, 32)
      .endCell()
  ) {
    const init = { code, data };
    const address = contractAddress(workchain, init);
    return new MainEditContract(address, init);
  }

  async sendInternalMessage(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    body = new Cell()
  ) {
    await provider.internal(sender, {
      value,
      sendMode: SendMode.IGNORE_ERRORS,
      body: body,
    });
  }

  async getLatestSenderAddress(provider: ContractProvider) {
    const { stack } = await provider.get("get_latest_sender_address", []);
    return stack.readAddress();
  }

  async getSum(provider: ContractProvider) {
    const { stack } = await provider.get("get_sum", []);
    return stack.readNumber();
  }
}
