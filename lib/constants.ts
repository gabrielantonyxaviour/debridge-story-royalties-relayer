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

const debridgeRoyaltyRelayer = "0x5A61F881a94B41905B899243aB204e281D149FCc";
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
      {
        indexed: false,
        internalType: "bytes32",
        name: "uniqueSalt",
        type: "bytes32",
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
      { internalType: "bytes32", name: "uniqueSalt", type: "bytes32" },
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
