"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedKey = localStorage.getItem("fal_api_key");
    if (savedKey) setApiKey(savedKey);
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
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
        <CardDescription>
          Enter your FAL.AI API key to get started. You can find your API key in your
          FAL.AI dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Your API key is stored securely in your browser&apos;s local storage.
          </p>
        </div>
        <Button onClick={handleSave} className="w-full">
          Save API Key
        </Button>
      </CardContent>
    </Card>
  );
}