import { arbitrum, avalanche, base, bsc, Chain, mainnet, polygon } from "viem/chains";

const supportedChains: Record<number, Chain> = {
    [mainnet.id]: mainnet,
    [base.id]: base,
    [arbitrum.id]: arbitrum,
    [bsc.id]: bsc,
    [avalanche.id]: avalanche,
    [polygon.id]: polygon,
}


export {
    supportedChains
}