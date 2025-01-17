'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fal } from "@fal-ai/client";

const API_KEY_STORAGE_KEY = 'fal-ai-api-key';

function configureFalClient(apiKey: string) {
  fal.config({
    credentials: apiKey,
  });
}

export function ApiKeyInput() {
  const [isVisible, setIsVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setHasStoredKey(true);
      configureFalClient(storedKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    const trimmedKey = apiKey.trim();
    localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);
    configureFalClient(trimmedKey);
    setHasStoredKey(true);
    setIsInputVisible(false);
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved successfully.",
    });
  };

  if (!isInputVisible) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsInputVisible(true)}
          className="gap-2"
        >
          <Key className="h-4 w-4" />
          {hasStoredKey ? (
            <span className="flex items-center gap-2">
              API Key Saved
              <Check className="h-4 w-4 text-green-500" />
            </span>
          ) : (
            "Set API Key"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Input
          type={isVisible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your FAL.AI API key"
          className="pr-8 w-[300px]"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsVisible(!isVisible)}
        title={isVisible ? "Hide API key" : "Show API key"}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
      >
        Save
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsInputVisible(false)}
      >
        Cancel
      </Button>
    </div>
  );
} 