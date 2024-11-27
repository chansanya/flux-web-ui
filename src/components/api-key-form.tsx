"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon, KeyIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem("fal_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("fal_api_key", apiKey);
    setIsSaved(true);
    toast({
      title: "Success",
      description: "Your FAL.AI API key has been saved successfully.",
      duration: 3000,
    });
  };

  return (
    <Card className="max-w-md w-full mx-auto shadow-lg">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center space-x-2">
          <KeyIcon className="h-5 w-5 text-primary" />
          <CardTitle>API Key Settings</CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your FAL.AI API key to access AI services. You can find your API key in your
          <a href="https://fal.ai/dashboard" target="_blank" rel="noopener noreferrer" 
             className="text-primary hover:underline ml-1">
            FAL.AI dashboard
          </a>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={isVisible ? "text" : "password"}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsSaved(false);
              }}
              className={cn(
                "pr-20 font-mono text-sm",
                isSaved && "border-green-500 focus-visible:ring-green-500"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSaved && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center space-x-1">
            <span>🔒</span>
            <span>Your API key is stored securely in your browser&apos;s local storage</span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="pb-4">
        <Button 
          onClick={handleSave} 
          className="w-full"
        >
          {isSaved ? 'Saved' : 'Save API Key'}
        </Button>
      </CardFooter>
    </Card>
  );
}