"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowUpRightFromSquare,
  CheckCircle,
  ChevronRight,
  Loader2,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";
import Link from "next/link";
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  mainnet,
  polygon,
  story,
} from "viem/chains";
import { formatAddress } from "@/lib/utils";
import { createPublicClient, formatEther, Hex, http, zeroAddress } from "viem";
import { debridgeRoyaltyRelayer, supportedChains } from "@/lib/constants";
import { toast } from "sonner";
import getBridgeTxData from "@/lib/debridge";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

export default function Home() {
  const [step, setStep] = useState(1);
  const [ipAddress, setIpAddress] = useState(
    "0x8F7a0fe18D747399E623ca0F92Bd0159148c5776"
  );
  const [selectedChain, setSelectedChain] = useState(0);
  const [amount, setAmount] = useState("");
  const [tipStatus, setTipStatus] = useState("idle"); // idle, processing, completed
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const { primaryWallet, user, setShowAuthFlow } = useDynamicContext();
  const [sourceTx, setSourceTx] = useState("");
  const [destTx, setDestTx] = useState("");
  const [userBalance, setUserBalance] = useState("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const chains = [
    { id: mainnet.id, name: "Ethereum", logo: "/eth.png", currency: "ETH" },
    { id: base.id, name: "Base", logo: "/base.jpeg", currency: "ETH" },
    { id: polygon.id, name: "Polygon", logo: "/polygon.jpeg", currency: "POL" },
    { id: bsc.id, name: "BNB", logo: "/bnb.png", currency: "BNB" },
    {
      id: arbitrum.id,
      name: "Arbitrum",
      logo: "/arbitrum.png",
      currency: "ETH",
    },
    {
      id: avalanche.id,
      name: "Avalanche",
      logo: "/avax.png",
      currency: "AVAX",
    },
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      if (!primaryWallet || !user) return;
      setIsLoadingBalance(true);
      const publicClient = createPublicClient({
        chain: supportedChains[chains[selectedChain].id],
        transport: http(
          supportedChains[chains[selectedChain].id].rpcUrls.default.http[0]
        ),
      });
      const balance = await publicClient.getBalance({
        address: primaryWallet.address as Hex,
      });
      setUserBalance(parseFloat(formatEther(balance)).toFixed(4));
      setIsLoadingBalance(false);
    };

    fetchBalance();
  }, [selectedChain, primaryWallet, user]);

  const processingSteps = [
    "Initiating transaction on ",
    "Waiting for confirmation on ",
    "Bridging royalties to Story",
    "Waiting for confirmation on Story",
    "Royalties successfully bridged to the IPA",
  ];

  useEffect(() => {
    if (primaryWallet && primaryWallet.connector.supportsNetworkSwitching()) {
      primaryWallet.switchNetwork(mainnet.id);
    }
  }, [primaryWallet]);

  const handleNextStep = async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to continue",
      });
      return;
    }

    console.log(step, ipAddress, selectedChain, amount);
    if (step === 1 && ipAddress) {
      setStep(2);
    } else if (step === 2 && amount) {
      setStep(3);
      setTipStatus("processing");
      setCurrentProcessingStep(0);

      const { to, data, value, error } = await getBridgeTxData({
        senderAddress: primaryWallet?.address as Hex,
        receiverIpId: ipAddress as Hex,
        payerIpId: zeroAddress,
        amount,
        srcChainId: chains[selectedChain].id,
      });
      if (error) {
        toast.error("Tx Estimation Error", {
          description: error,
        });
        return;
      }
      const publicClient = await primaryWallet.getPublicClient();
      const walletClient = await primaryWallet.getWalletClient();
      const hash = await walletClient.sendTransaction({
        to,
        data,
        value,
      });
      setCurrentProcessingStep(1);
      console.log("Source Tx:", hash);

      await publicClient.waitForTransactionReceipt({
        hash,
      });
      setCurrentProcessingStep(2);
      setSourceTx(hash);
      listenForRoyaltySettledEvent();
    }
  };

  const listenForRoyaltySettledEvent = async () => {
    try {
      const storyChainClient = createPublicClient({
        chain: story,
        transport: http(),
      });

      console.log(
        `Listening for RoyaltySettled events for receiver: ${ipAddress}`
      );

      const unwatch = storyChainClient.watchEvent({
        address: debridgeRoyaltyRelayer,
        event: {
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
        onLogs: (logs) => {
          for (const log of logs) {
            const { receiverIpId, payerIpId, amount } = log.args;

            console.log("RoyaltySettled event detected:", {
              receiverIpId,
              payerIpId,
              amount,
            });

            if (receiverIpId?.toLowerCase() === ipAddress.toLowerCase()) {
              console.log(
                "✅ Match found! RoyaltySettled for the correct receiver",
                {
                  receiverIpId,
                  payerIpId,
                  amount: amount ? formatEther(amount) : "0",
                }
              );

              setCurrentProcessingStep(4);
              setTipStatus("success");
              setDestTx(log.transactionHash);

              unwatch();
              return;
            }
          }
        },
        onError: (error) => {
          console.error(
            "Error while listening for RoyaltySettled events:",
            error
          );
          toast.error("Event Listening Error", {
            description: "Failed to detect the completion of your transaction.",
          });
          unwatch();
        },
      });

      // Set a timeout for the event listening (e.g., 5 minutes)
      setTimeout(() => {
        console.log("Event listening timeout reached");
        unwatch();

        // Check if we're still in the processing state
        if (tipStatus === "processing") {
          toast.warning("Transaction Status Unknown", {
            description:
              "We couldn't confirm if your transaction was completed on the destination chain. Please check manually.",
          });
        }
      }, 5 * 60 * 1000); // 5 minutes timeout
    } catch (error) {
      console.error("Failed to set up event listener:", error);
      toast.error("Setup Error", {
        description: "Failed to set up event monitoring for your transaction.",
      });
    }
  };

  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isWalletConnected = !!primaryWallet && !!user;

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center items-center gap-2 mr-4 mb-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/debridge.jpeg"
                alt="Debridge Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <Image
                src="/story.png"
                alt="Story Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              deBridge x Story
            </h1>
            <p className="mt-3 text-stone-600 dark:text-gray-300">
              Tip creators on any EVM chain with deBridge
            </p>
          </div>

          <Card className="border-none shadow-lg bg-white dark:bg-transparent text-black dark:text-white">
            <CardContent className="pt-6">
              {!isWalletConnected ? (
                <div className="space-y-6 py-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Wallet className="h-16 w-16 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Please connect your wallet to continue with tipping IP Asset
                    creators
                  </p>
                  {/* This button will trigger Dynamic wallet connect modal */}
                  <Button
                    className="w-full bg-stone-200 hover:bg-stone-300 dark:bg-stone-900 dark:hover:bg-stone-800 text-black dark:text-white"
                    onClick={() => {
                      setShowAuthFlow(true);
                    }}
                  >
                    Log in or sign up
                  </Button>
                </div>
              ) : step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="ipAddress" className="text-base">
                      IP Asset Address
                    </Label>
                    <Input
                      id="ipAddress"
                      placeholder="0x..."
                      className="mt-2 bg-stone-100 dark:bg-gray-800 border-stone-300 dark:border-gray-800 text-black dark:text-white"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                    />
                    {ipAddress && !isValidEthereumAddress(ipAddress) && (
                      <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                        Please enter a valid Ethereum address
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full bg-stone-600 hover:bg-stone-700 dark:bg-stone-600 dark:hover:bg-stone-700 text-white font-semibold"
                    disabled={!ipAddress || !isValidEthereumAddress(ipAddress)}
                    onClick={handleNextStep}
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : step === 2 ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="disabledIpAddress" className="text-base">
                      IP Asset Address
                    </Label>
                    <Input
                      id="disabledIpAddress"
                      className="mt-2 bg-stone-100 dark:bg-gray-800 text-stone-600 dark:text-gray-300"
                      value={ipAddress}
                      disabled
                    />
                  </div>

                  <div>
                    <Label className="text-base">Select Chain</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {chains.map((chain, idx) => (
                        <div
                          key={chain.id}
                          className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                            selectedChain === idx
                              ? "border-stone-500 bg-stone-100 dark:bg-stone-900"
                              : "border-stone-300 dark:border-gray-600 hover:border-stone-500 dark:hover:border-stone-500"
                          }`}
                          onClick={async () => {
                            if (
                              primaryWallet?.connector.supportsNetworkSwitching()
                            ) {
                              setIsLoadingBalance(true);
                              await primaryWallet.switchNetwork(chain.id);
                              setSelectedChain(idx);
                            }
                          }}
                        >
                          <div className="h-8 w-8 mb-2 rounded-full overflow-hidden relative">
                            <Image
                              src={chain.logo}
                              alt={chain.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-sm">{chain.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="amount" className="text-base">
                        Amount
                      </Label>
                      <div className="flex items-center text-sm text-stone-600 dark:text-gray-300">
                        <span className="mr-2">Balance:</span>
                        {isLoadingBalance ? (
                          <Loader2 className="h-4 w-4 animate-spin text-stone-500 dark:text-blue-400" />
                        ) : (
                          <span>
                            {userBalance} {chains[selectedChain].currency}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative mt-2">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.0"
                        min="0"
                        step="0.01"
                        className="pr-12 bg-stone-100 dark:bg-gray-800 border-stone-300 dark:border-gray-700 text-black dark:text-white"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-500 dark:text-gray-300">
                        {selectedChain ? chains[selectedChain].currency : "ETH"}
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => setAmount(userBalance)}
                      >
                        Use max
                      </button>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-stone-600 hover:bg-stone-700 dark:bg-stone-600 dark:hover:bg-stone-700 text-white"
                    disabled={
                      !amount ||
                      amount >= userBalance ||
                      parseFloat(amount) <= 0
                    }
                    onClick={handleNextStep}
                  >
                    {amount >= userBalance
                      ? "Insufficient Balance"
                      : "Send Royalties"}{" "}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-6">
                      {tipStatus === "completed"
                        ? "Royalties Successfully Sent!"
                        : "Processing Your Payment"}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        IP Asset Address:
                      </span>
                      <span className="text-sm text-stone-600 dark:text-gray-300 truncate max-w-[240px]">
                        {formatAddress(ipAddress)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chain:</span>
                      <Badge
                        variant="outline"
                        className="capitalize border-stone-300 dark:border-gray-600 text-stone-600 dark:text-gray-300"
                      >
                        {chains[selectedChain].name}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="text-sm">
                        {amount}{" "}
                        {selectedChain ? chains[selectedChain].currency : "ETH"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-b py-4 my-4 border-stone-200 dark:border-gray-700">
                    <div className="space-y-4">
                      {processingSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center w-full ${
                            index <= currentProcessingStep
                              ? "text-black dark:text-white"
                              : "text-stone-400 dark:text-gray-500"
                          }`}
                        >
                          {tipStatus === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mr-3" />
                          ) : index < currentProcessingStep ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mr-3" />
                          ) : index === currentProcessingStep ? (
                            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-500 mr-3 animate-spin" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-stone-300 dark:border-gray-600 mr-3" />
                          )}
                          <span className="text-sm">
                            {step +
                              (index == 0 || index == 1
                                ? chains[selectedChain].name
                                : "")}
                          </span>
                          {(sourceTx != "" && index == 0) ||
                            (destTx != "" && index == 4 && (
                              <div
                                onClick={() => {
                                  window.open(
                                    "https://etherscan.io/tx/",
                                    "_blank"
                                  );
                                }}
                                className="flex-1 flex justify-end items-center text-xs space-x-1 cursor-pointer hover:font-semibold"
                              >
                                <p>View Tx</p>{" "}
                                <ArrowUpRightFromSquare className="w-3 h-3" />{" "}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {tipStatus === "completed" && (
                    <div className="text-center">
                      <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                        Your payment has been successfully processed and
                        royalties paid to the IP Asset Address
                      </p>
                      <Button
                        className="mt-2 bg-stone-600 hover:bg-stone-700 dark:bg-stone-600 dark:hover:bg-stone-700 text-white font-semibold"
                        onClick={() => {
                          setStep(1);
                          setIpAddress("");
                          setSelectedChain(0);
                          setAmount("");
                          setTipStatus("idle");
                          setCurrentProcessingStep(0);
                        }}
                      >
                        Tip Another Creator
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
