export interface Erc20TransferLog {
  // only the fields that are needed for the challenge control atm
  eventName: string;
  args: {
    from?: `0x${string}`;
    to?: `0x${string}`;
    value?: bigint;
  };
  transactionHash: `0x${string}`;
  blockNumber: bigint;
}
