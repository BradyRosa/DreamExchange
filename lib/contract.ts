export const DREAM_EXCHANGE_ADDRESS =
  "0x3329f998C90Bae05f05032C1cb2159a2FDa672ed" as const;

export const dreamExchangeAbi = [
  {
    type: "function",
    name: "createDream",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "mood", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "editDream",
    stateMutability: "nonpayable",
    inputs: [
      { name: "dreamId", type: "uint256" },
      { name: "newTitle", type: "string" },
      { name: "newDescription", type: "string" },
      { name: "newMood", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "fuseDreams",
    stateMutability: "nonpayable",
    inputs: [
      { name: "dreamA", type: "uint256" },
      { name: "dreamB", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "deleteDream",
    stateMutability: "nonpayable",
    inputs: [{ name: "dreamId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "resetDreams",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "dreamCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "interactionCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getDream",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "dreamId", type: "uint256" },
    ],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "mood", type: "string" },
      { name: "fusionCount", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
  },
] as const;

export type DreamRecord = {
  id: bigint;
  title: string;
  description: string;
  mood: string;
  fusionCount: bigint;
  createdAt: bigint;
  exists: boolean;
};
