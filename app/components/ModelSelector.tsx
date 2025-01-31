import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect, useCallback } from "react";
import { Model, ModelSelectorProps } from "../types/types";

const MemoizedModelSelector = React.memo(function ModelSelector({
  onModelSelect,
  currentModel,
  defaultModel = "llama3.2:latest",
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the onModelSelect function
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch("http://192.168.2.23:11434/api/tags");
      if (!response.ok) {
        throw new Error(`HTTP error! status:${response.status}`);
      }
      const data = await response.json();

      setModels(data.models);

      // Only set the model if there's no currentModel and models are fetched
      if (!currentModel && data.models.length > 0) {
        // First try to find the specified default model
        const preferredModel = data.models.find((m: Model) => m.name === defaultModel);
        // Fall back to first available model if default not found
        onModelSelect(preferredModel?.name || data.models[0].name);
      }

      // Set the model only when there's no currentModel and models are fetched
      if (!currentModel && data.models.length > 0) {
        // First try to find the specified default model
        const preferredModel = data.models.find((m: Model) => m.name === defaultModel);
        // Fall back to first available model if default not found
        onModelSelect(preferredModel?.name || data.models[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch models");
    } finally {
      setLoading(false);
    }
  }, [currentModel, defaultModel, onModelSelect]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  if (!models.length && loading) return <div className="text-gray-500">Loading models...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Select value={currentModel || defaultModel} onValueChange={onModelSelect}>
      <SelectTrigger className="w-full max-w-xs border-none">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.name} value={model.name}>
            {model.name} ({model.details.parameter_size})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

export default MemoizedModelSelector;
