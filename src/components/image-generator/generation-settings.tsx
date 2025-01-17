'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Model, ModelParameter } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface GenerationSettingsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  model: Model;
  parameters: Record<string, any>;
  setParameters: (params: Record<string, any>) => void;
}

export function GenerationSettings({ 
  prompt, 
  setPrompt, 
  onGenerate, 
  isGenerating, 
  model,
  parameters,
  setParameters 
}: GenerationSettingsProps) {
  function renderParameter(param: ModelParameter) {
    const value = parameters[param.key] ?? param.default;
    const onChange = (newValue: any) => {
      setParameters({ ...parameters, [param.key]: newValue });
    };

    if (param.key === 'prompt') return null; // Handled separately

    switch (param.type) {
      case 'enum':
        return (
          <div key={param.key} className="space-y-2">
            <Label htmlFor={param.key}>{param.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
            <Select value={value?.toString()} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(param.options as string[])?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'boolean':
        return (
          <div key={param.key} className="flex items-center justify-between space-x-2">
            <Label htmlFor={param.key}>{param.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
            <Switch
              id={param.key}
              checked={value}
              onCheckedChange={onChange}
            />
          </div>
        );
      
      case 'number':
        return (
          <div key={param.key} className="space-y-2">
            <Label htmlFor={param.key}>{param.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
            <Input
              id={param.key}
              type="number"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
            />
          </div>
        );
      
      default:
        return null;
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure your image generation for {model.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Enter your image generation prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        {model.inputSchema.map(renderParameter)}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onGenerate}
          disabled={isGenerating || !prompt}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </Button>
      </CardFooter>
    </Card>
  );
} 