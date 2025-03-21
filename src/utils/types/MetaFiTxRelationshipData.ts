export type MetaFiTransactionType = 'erc20' | 'internal';

export interface MetaFiTxRelationshipData {
  txHash: string;
  chainId: number;
  count: number; // number of transactions done for address x against address y
  data: {
    hash: string;
    timestamp: string;
    chainId: number;
    blockNumber: number;
    blockHash: string;
    gas: number;
    gasUsed: number;
    gasPrice: string;
    effectiveGasPrice: string;
    nonce: number;
    cumulativeGasUsed: number;
    methodId: string;
    value: string;
    to: string;
    from: string;
    isError: boolean;
    valueTransfers: ValueTransfer[];
    logs: any[]; // Specify a type if logs structure is known
    transactionCategory: string;
    transactionProtocol: string;
    transactionType: MetaFiTransactionType;
    textFunctionSignature: string;
  };
}

interface ValueTransfer {
  from: string;
  to: string;
  amount: string;
  decimal: number;
  contractAddress: string;
  symbol: string;
  name: string;
  transferType: string;
  iconUrl: string;
}
