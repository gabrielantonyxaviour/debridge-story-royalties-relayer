import {
  arbitrum,
  avalanche,
  base,
  bsc,
  Chain,
  mainnet,
  polygon,
} from "viem/chains";

const supportedChains: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
  [bsc.id]: bsc,
  [avalanche.id]: avalanche,
  [polygon.id]: polygon,
};

const debridgeRoyaltyRelayer = "0xa4b83a29904e61A50C5fE5eCA42a61A23CFa36e1";
const debridgeRoyaltyRelayerAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "receiverIpId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "payerIpId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RoyaltySettled",
    type: "event",
  },
  {
    inputs: [],
    name: "DLN_DESTINATION",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MULTICALL",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROYALTY_MODULE",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WIP",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "receiverIpId", type: "address" },
      { internalType: "address", name: "payerIpId", type: "address" },
    ],
    name: "settleRoyalties",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

export { supportedChains, debridgeRoyaltyRelayer, debridgeRoyaltyRelayerAbi };
