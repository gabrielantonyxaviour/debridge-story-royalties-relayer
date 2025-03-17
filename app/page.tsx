"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [step, setStep] = useState(1);
  const [ipAddress, setIpAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [amount, setAmount] = useState("");
  const [tipStatus, setTipStatus] = useState("idle"); // idle, processing, completed
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);

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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Support IP Asset Creators
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Tip creators directly with cross-chain compatibility
            </p>
          </div>

          <Card className="border-none shadow-lg">
            <CardContent className="pt-6">
              {step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="ipAddress" className="text-base">
                      IP Asset Address
                    </Label>
                    <Input
                      id="ipAddress"
                      placeholder="0x..."
                      className="mt-2"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                    />
                    {ipAddress && !isValidEthereumAddress(ipAddress) && (
                      <p className="mt-2 text-sm text-red-500">
                        Please enter a valid Ethereum address
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full"
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
                      className="mt-2 bg-gray-50 dark:bg-gray-800"
                      value={ipAddress}
                      disabled
                    />
                  </div>

                  <div>
                    <Label className="text-base">Select Chain</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {chains.map((chain) => (
                        <div
                          key={chain.id}
                          className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${selectedChain === chain.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                          onClick={() => setSelectedChain(chain.id)}
                        >
                          <div className="h-8 w-8 mb-2 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            {/* Placeholder for chain logos */}
                            <span className="text-xs">
                              {chain.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm">{chain.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-base">
                      Amount
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.0"
                        min="0"
                        step="0.01"
                        className="pr-12"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {selectedChain ? selectedChain.toUpperCase() : "ETH"}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
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
                        ? "Tip Successfully Sent!"
                        : "Processing Your Tip"}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        IP Asset Address:
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[240px]">
                        {ipAddress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chain:</span>
                      <Badge variant="outline" className="capitalize">
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

                  <div className="border-t border-b py-4 my-4 border-gray-100 dark:border-gray-800">
                    <div className="space-y-4">
                      {processingSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center ${index <= currentProcessingStep
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-400 dark:text-gray-500"
                            }`}
                        >
                          {tipStatus === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          ) : index < currentProcessingStep ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          ) : index === currentProcessingStep ? (
                            <Loader2 className="h-5 w-5 text-blue-500 mr-3 animate-spin" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-700 mr-3" />
                          )}
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {tipStatus === "completed" && (
                    <div className="text-center">
                      <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                        Your tip has been successfully processed and royalties
                        paid to the IP Asset Address
                      </p>
                      <Button
                        className="mt-2"
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
