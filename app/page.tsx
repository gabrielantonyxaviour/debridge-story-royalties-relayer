"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ChevronRight, Loader2, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [step, setStep] = useState(1);
  const [ipAddress, setIpAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [amount, setAmount] = useState("");
  const [tipStatus, setTipStatus] = useState("idle"); // idle, processing, completed
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const { primaryWallet, user, setShowAuthFlow } = useDynamicContext();

  const chains = [
    { id: "ethereum", name: "Ethereum", logo: "/eth.png" },
    { id: "base", name: "Base", logo: "/base.jpeg" },
    { id: "polygon", name: "Polygon", logo: "/polygon.jpeg" },
    { id: "bnb", name: "BNB", logo: "/bnb.png" },
    { id: "arbitrum", name: "Arbitrum", logo: "/arbitrum.png" },
    { id: "avalanche", name: "Avalanche", logo: "/avax.png" },
  ];

  const processingSteps = [
    "Initiating transaction on selected chain",
    "Bridging funds to Story chain",
    "Processing royalty payment to IP address",
    "Finalizing transaction",
  ];

  const handleNextStep = () => {
    if (step === 1 && ipAddress) {
      setStep(2);
    } else if (step === 2 && selectedChain && amount) {
      setStep(3);
      // Simulate processing
      simulateProcessing();
    }
  };

  const simulateProcessing = () => {
    setTipStatus("processing");
    setCurrentProcessingStep(0);

    // Simulate the steps with timeouts
    const stepTimes = [2000, 3000, 2500, 1500];

    let cumulativeTime = 0;
    processingSteps.forEach((_, index) => {
      cumulativeTime += stepTimes[index];
      setTimeout(() => {
        setCurrentProcessingStep(index);
      }, cumulativeTime);
    });

    // Complete the process after all steps
    setTimeout(() => {
      setTipStatus("completed");
    }, cumulativeTime + 1000);
  };

  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isWalletConnected = !!primaryWallet && !!user;

  return (
    <div className="w-full min-h-screen bg-black text-white">
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
            <h1 className="text-3xl font-bold text-white">
              deBridge x Story
            </h1>
            <p className="mt-3 text-gray-300">
              Tip creators directly with cross-chain compatibility
            </p>
          </div>

          <Card className="border-none shadow-lg bg- text-white">
            <CardContent className="pt-6">
              {!isWalletConnected ? (
                <div className="space-y-6 py-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Wallet className="h-16 w-16 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
                  <p className="text-gray-300">
                    Please connect your wallet to continue with tipping IP Asset creators
                  </p>
                  {/* This button will trigger Dynamic wallet connect modal */}
                  <Button
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white"
                    onClick={() => {
                      setShowAuthFlow(true)
                    }}
                  >
                    Log in or sign up
                  </Button>
                </div>
              ) : step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="ipAddress" className="text-base text-white">
                      IP Asset Address
                    </Label>
                    <Input
                      id="ipAddress"
                      placeholder="0x..."
                      className="mt-2 bg-gray-800 border-gray-800 text-white"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                    />
                    {ipAddress && !isValidEthereumAddress(ipAddress) && (
                      <p className="mt-2 text-sm text-red-400">
                        Please enter a valid Ethereum address
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!ipAddress || !isValidEthereumAddress(ipAddress)}
                    onClick={handleNextStep}
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : step === 2 ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="disabledIpAddress" className="text-base text-white">
                      IP Asset Address
                    </Label>
                    <Input
                      id="disabledIpAddress"
                      className="mt-2 bg-gray-800 text-gray-300"
                      value={ipAddress}
                      disabled
                    />
                  </div>

                  <div>
                    <Label className="text-base text-white">Select Chain</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {chains.map((chain) => (
                        <div
                          key={chain.id}
                          className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${selectedChain === chain.id
                            ? "border-blue-500 bg-blue-900"
                            : "border-gray-600 hover:border-blue-500"
                            }`}
                          onClick={() => setSelectedChain(chain.id)}
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
                    <Label htmlFor="amount" className="text-base text-white">
                      Amount
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.0"
                        min="0"
                        step="0.01"
                        className="pr-12 bg-gray-800 border-gray-700 text-white"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300">
                        {selectedChain ? selectedChain.toUpperCase() : "ETH"}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={
                      !selectedChain || !amount || parseFloat(amount) <= 0
                    }
                    onClick={handleNextStep}
                  >
                    Send Royalties <ChevronRight className="ml-2 h-4 w-4" />
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
                      <span className="text-sm text-gray-300 truncate max-w-[240px]">
                        {ipAddress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chain:</span>
                      <Badge variant="outline" className="capitalize border-gray-600 text-gray-300">
                        {selectedChain}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="text-sm">
                        {amount}{" "}
                        {selectedChain ? selectedChain.toUpperCase() : "ETH"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-b py-4 my-4 border-gray-700">
                    <div className="space-y-4">
                      {processingSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center ${index <= currentProcessingStep
                            ? "text-white"
                            : "text-gray-500"
                            }`}
                        >
                          {tipStatus === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          ) : index < currentProcessingStep ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          ) : index === currentProcessingStep ? (
                            <Loader2 className="h-5 w-5 text-blue-500 mr-3 animate-spin" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-600 mr-3" />
                          )}
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {tipStatus === "completed" && (
                    <div className="text-center">
                      <p className="text-sm text-green-400 mb-4">
                        Your payment has been successfully processed and royalties
                        paid to the IP Asset Address
                      </p>
                      <Button
                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setStep(1);
                          setIpAddress("");
                          setSelectedChain("");
                          setAmount("");
                          setTipStatus("idle");
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