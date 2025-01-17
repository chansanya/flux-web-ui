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
        // Special handling for guidance_scale and num_inference_steps
        if (param.key === 'guidance_scale' || param.key === 'num_inference_steps') {
          const config = {
            guidance_scale: {
              min: 1,
              max: 10,
              step: 0.1,
              default: 3.5,
              decimals: 1
            },
            num_inference_steps: {
              min: 1,
              max: 50,
              step: 1,
              default: 35,
              decimals: 0
            }
          }[param.key];

          return (
            <div key={param.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={param.key}>
                  {param.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <span className="text-sm w-12 text-right">
                  {Number(value || config.default).toFixed(config.decimals)}
                </span>
              </div>
              <Input
                id={param.key}
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value || config.default}
                className="h-8"
                onChange={(e) => onChange(Number(e.target.value))}
              />
            </div>
          );
        }

        // Default number input for other numeric parameters
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
      
      case 'array':
        if (param.key === 'loras') {
          const loras = value as Array<{ path: string; scale: number }> || [];
          const MAX_LORAS = 3;
          
          return (
            <div key={param.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>LoRA Weights ({loras.length}/{MAX_LORAS})</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChange([...loras, { path: '', scale: 1 }])}
                  disabled={loras.length >= MAX_LORAS}
                >
                  Add LoRA
                </Button>
              </div>
              <div className="space-y-3">
                {loras.map((lora, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">LoRA #{index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          const newLoras = [...loras];
                          newLoras.splice(index, 1);
                          onChange(newLoras);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                    <div className="grid grid-cols-[2fr,1fr] gap-2">
                      <div className="space-y-1">
                        <Input
                          placeholder="Enter LoRA URL..."
                          value={lora.path}
                          className="h-8"
                          onChange={(e) => {
                            const newLoras = [...loras];
                            newLoras[index] = { ...lora, path: e.target.value };
                            onChange(newLoras);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Input
                            type="range"
                            min={0}
                            max={2}
                            step={0.1}
                            value={lora.scale}
                            className="h-8"
                            onChange={(e) => {
                              const newLoras = [...loras];
                              newLoras[index] = { ...lora, scale: Number(e.target.value) };
                              onChange(newLoras);
                            }}
                          />
                          <span className="text-sm w-12 text-right">
                            {lora.scale.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      
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