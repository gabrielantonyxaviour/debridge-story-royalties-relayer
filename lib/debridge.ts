
import {
    encodeFunctionData,
    Hex,
} from "viem";
export default async function getBridgeTxData({
    senderAddress,
    receiverIpId,
    payerIpId,
    amount,
    srcChainId
}: {
    senderAddress: Hex,
    receiverIpId: Hex,
    payerIpId: Hex,
    amount: string,
    srcChainId: number

}) {

    const settleRoyaltiesTxData = encodeFunctionData({
        abi: [
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
        ],
        functionName: "settleRoyalties",
        args: [receiverIpId, payerIpId],
    });
    console.log(settleRoyaltiesTxData);

    const debridgeRoyaltyRelayer = "0xa4b83a29904e61A50C5fE5eCA42a61A23CFa36e1";
    const requestUrl = `https://dln.debridge.finance/v1.0/dln/order/create-tx?srcChainId=${srcChainId}&srcChainTokenIn=0x0000000000000000000000000000000000000000&srcChainTokenInAmount=${amount}&dstChainId=100000013&dstChainTokenOut=0x0000000000000000000000000000000000000000&dstChainTokenOutAmount=auto&dstChainTokenOutRecipient=${debridgeRoyaltyRelayer}&senderAddress=${senderAddress}&srcChainOrderAuthorityAddress=${senderAddress}&affiliateFeePercent=0&dstChainOrderAuthorityAddress=${senderAddress}&enableEstimate=true&dlnHook=%7B%22type%22%3A%22evm_transaction_call%22%2C%22data%22%3A%7B%22to%22%3A%22${debridgeRoyaltyRelayer}%22%2C%22calldata%22%3A%22${settleRoyaltiesTxData}%22%7D%7D&prependOperatingExpenses=false&skipSolanaRecipientValidation=false`;
    const response = await fetch(requestUrl);
    const { errorMessage, tx } = await response.json();

    if (errorMessage) {
        console.log(errorMessage);
        return {
            to: '',
            data: '',
            value: BigInt("0"),
        }
    } else {
        console.log("Transaction:", {
            to: tx.to,
            data: tx.data,
            value: BigInt(tx.value),
        });
        // const hash = await baseWalletClient.sendTransaction({
        //   to: tx.to,
        //   data: tx.data,
        //   value: BigInt(tx.value),
        // });

        // console.log(`Transaction hash: ${hash}`);
        return {
            to: tx.to,
            data: tx.data,
            value: BigInt(tx.value),
        }
    }
};
