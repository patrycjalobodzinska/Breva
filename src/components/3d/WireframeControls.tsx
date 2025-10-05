"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WireframeControlsProps {
  onWireframeChange: (
    parts: "all" | "breast" | "torso" | "upper" | "none"
  ) => void;
  currentParts: "all" | "breast" | "torso" | "upper" | "none";
}

export const WireframeControls = ({
  onWireframeChange,
  currentParts,
}: WireframeControlsProps) => {
  const options = [
    { value: "none", label: "Brak siatki", description: "Tylko model" },
    { value: "breast", label: "Piersi", description: "Siatka na piersiach" },
    { value: "torso", label: "Tułów", description: "Siatka na tułowiu" },
    {
      value: "upper",
      label: "Górna część",
      description: "Siatka na górnej części ciała",
    },
    {
      value: "all",
      label: "Cały model",
      description: "Siatka na całym modelu",
    },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Kontrola siatki</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={currentParts === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onWireframeChange(option.value as any)}
              className="rounded-xl text-xs">
              {option.label}
            </Button>
          ))}
        </div>
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs">
            {options.find((opt) => opt.value === currentParts)?.description}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
