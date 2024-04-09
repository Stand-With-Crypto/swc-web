export const ERC_721_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'claim',
    inputs: [
      {
        type: 'address',
        name: '_receiver',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_quantity',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_currency',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_pricePerToken',
        internalType: 'uint256',
      },
      {
        type: 'tuple',
        name: '_allowlistProof',
        components: [
          {
            type: 'bytes32[]',
            name: 'proof',
            internalType: 'bytes32[]',
          },
          {
            type: 'uint256',
            name: 'quantityLimitPerWallet',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'pricePerToken',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
        ],
        internalType: 'struct IDrop.AllowlistProof',
      },
      {
        type: 'bytes',
        name: '_data',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
] as const
