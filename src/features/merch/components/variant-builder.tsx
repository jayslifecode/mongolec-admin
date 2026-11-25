"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SingleImageUpload } from "@/components/single-image-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface OptionValue {
  en: string;
  mn: string;
}

interface ProductOption {
  id: string;
  name: { en: string; mn: string };
  values: OptionValue[];
}

interface Variant {
  id: string;
  sku: string;
  title?: { en: string; mn: string };
  optionValues: Array<{
    option: { en: string; mn: string };
    value: { en: string; mn: string };
  }>;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  image?: string;
  position: number;
}

interface VariantBuilderProps {
  options: ProductOption[];
  variants: Variant[];
  basePrice: number;
  language: "en" | "mn";
  onOptionsChange: (options: ProductOption[]) => void;
  onVariantsChange: (variants: Variant[]) => void;
  /** Validation messages keyed like `variant.<index>.sku` (see product-schema). */
  errors?: Record<string, string>;
}

type PendingConfirm =
  | { kind: "clear-values"; optionId: string }
  | { kind: "delete-option"; optionId: string }
  | null;

export function VariantBuilder({
  options,
  variants,
  basePrice,
  language,
  onOptionsChange,
  onVariantsChange,
  errors = {},
}: VariantBuilderProps) {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const [newOptionName, setNewOptionName] = useState({ en: "", mn: "" });
  const [newOptionValue, setNewOptionValue] = useState<
    Record<string, { en: string; mn: string }>
  >({});
  const [expandedOptions, setExpandedOptions] = useState<string[]>([]);

  // Generate all variant combinations from options
  const generateVariants = (opts: ProductOption[]): Variant[] => {
    if (opts.length === 0 || opts.some((opt) => opt.values.length === 0)) {
      return [];
    }

    // Generate all combinations
    const combinations: OptionValue[][] = [[]];

    for (const option of opts) {
      const newCombinations: OptionValue[][] = [];
      for (const combination of combinations) {
        for (const value of option.values) {
          newCombinations.push([...combination, value]);
        }
      }
      combinations.length = 0;
      combinations.push(...newCombinations);
    }

    // Create variants from combinations
    return combinations.map((combination, index) => {
      const optionValues = combination.map((value, idx) => ({
        option: opts[idx].name,
        value: value,
      }));

      // Generate title from option values
      const titleEn = combination.map((v) => v.en).join(" / ");
      const titleMn = combination.map((v) => v.mn).join(" / ");

      // Generate SKU from combination
      const skuParts = combination.map((v) =>
        v.en
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
      );
      const generatedSku =
        skuParts.join("-") + `-${String(index + 1).padStart(3, "0")}`;

      // Check if variant already exists
      const existingVariant = variants.find(
        (v) => JSON.stringify(v.optionValues) === JSON.stringify(optionValues)
      );

      return (
        existingVariant || {
          id: `temp-${Date.now()}-${index}`,
          sku: generatedSku,
          title: { en: titleEn, mn: titleMn },
          optionValues,
          price: basePrice,
          inventory: 0,
          position: index,
        }
      );
    });
  };

  // Auto-generate variants when options change
  useEffect(() => {
    if (options.length > 0) {
      const newVariants = generateVariants(options);
      onVariantsChange(newVariants);
    } else {
      onVariantsChange([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const addOption = () => {
    if (!newOptionName.en.trim() || !newOptionName.mn.trim()) return;

    const newOption: ProductOption = {
      id: `option-${Date.now()}`,
      name: { en: newOptionName.en.trim(), mn: newOptionName.mn.trim() },
      values: [],
    };

    onOptionsChange([...options, newOption]);
    setNewOptionName({ en: "", mn: "" });
    setExpandedOptions([newOption.id]);
  };

  const removeOption = (optionId: string) => {
    onOptionsChange(options.filter((opt) => opt.id !== optionId));
    setExpandedOptions((prev) => prev.filter((id) => id !== optionId));
  };

  const addOptionValue = (optionId: string) => {
    const value = newOptionValue[optionId];
    if (!value?.en?.trim() || !value?.mn?.trim()) return;

    onOptionsChange(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              values: [
                ...opt.values,
                { en: value.en.trim(), mn: value.mn.trim() },
              ],
            }
          : opt
      )
    );

    setNewOptionValue((prev) => ({ ...prev, [optionId]: { en: "", mn: "" } }));
  };

  const removeOptionValue = (optionId: string, valueIndex: number) => {
    onOptionsChange(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              values: opt.values.filter((_, idx) => idx !== valueIndex),
            }
          : opt
      )
    );
  };

  const updateVariant = (variantId: string, updates: Partial<Variant>) => {
    onVariantsChange(
      variants.map((v) => (v.id === variantId ? { ...v, ...updates } : v))
    );
  };

  const isOptionValid = newOptionName.en.trim() && newOptionName.mn.trim();
  const isOptionValueValid = (optionId: string) => {
    const value = newOptionValue[optionId];
    return value?.en?.trim() && value?.mn?.trim();
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            options.length === 0
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <span className="text-sm font-medium">1. Define Options</span>
          {options.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {options.length}
            </Badge>
          )}
        </div>

        <Separator className="flex-1" />

        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            options.length > 0 && variants.length > 0
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <span className="text-sm font-medium">2. Configure Variants</span>
          {variants.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {variants.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Options Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Options</CardTitle>
          <CardDescription>
            Define product variations like Size, Color, or Material
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Option Form */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <Label className="text-sm font-medium">Add New Option</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor={`option-name-${language}`}>Option Name *</Label>
                <Input
                  id={`option-name-${language}`}
                  placeholder={
                    language === "en"
                      ? "e.g., Color, Size, Material"
                      : "жнь: Өнгө, Хэмжээ, Материал"
                  }
                  value={newOptionName[language]}
                  onChange={(e) =>
                    setNewOptionName((prev) => ({
                      ...prev,
                      [language]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isOptionValid) {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`option-name-${language === "en" ? "mn" : "en"}`}
                  className="text-sm text-muted-foreground"
                >
                  Translation ({language === "en" ? "Mongolian" : "English"})
                </Label>
                <Input
                  id={`option-name-${language === "en" ? "mn" : "en"}`}
                  placeholder={
                    language === "en"
                      ? "жнь: Өнгө, Хэмжээ, Материал"
                      : "e.g., Color, Size, Material"
                  }
                  value={newOptionName[language === "en" ? "mn" : "en"]}
                  onChange={(e) =>
                    setNewOptionName((prev) => ({
                      ...prev,
                      [language === "en" ? "mn" : "en"]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isOptionValid) {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  className="h-9"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={addOption}
              disabled={!isOptionValid}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          {/* Existing Options */}
          {options.length > 0 ? (
            <div className="space-y-4">
              <Separator />
              <Label className="text-sm font-medium">
                Your Options ({options.length})
              </Label>
              <Accordion
                type="multiple"
                value={expandedOptions}
                onValueChange={setExpandedOptions}
                className="space-y-3"
              >
                {options.map((option, index) => (
                  <AccordionItem
                    key={option.id}
                    value={option.id}
                    className="rounded-lg border bg-card"
                  >
                    <div className="flex items-center pr-2">
                      <div className="min-w-0 flex-1">
                        <AccordionTrigger className="hover:no-underline py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              #{index + 1}
                            </Badge>
                            <div className="text-left">
                              <div className="font-medium">{option.name[language]}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.values.length}{" "}
                                {option.values.length === 1 ? "value" : "values"}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete option ${option.name[language]}`}
                        onClick={() =>
                          setPendingConfirm({ kind: "delete-option", optionId: option.id })
                        }
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <AccordionContent className="pb-4 px-4">
                      <div className="space-y-4">
                        {/* Option Values Display */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              Values
                            </Label>
                            {option.values.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setPendingConfirm({ kind: "clear-values", optionId: option.id })
                                }
                                className="h-auto py-1 px-2 text-xs"
                              >
                                Clear all
                              </Button>
                            )}
                          </div>

                          {option.values.length === 0 ? (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                Add at least one value to generate variants
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {option.values.map((value, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="px-3 py-1.5 text-sm group relative"
                                >
                                  <span>{value[language]}</span>
                                  <button
                                    type="button"
                                    aria-label={`Remove value ${value[language]}`}
                                    onClick={() =>
                                      removeOptionValue(option.id, idx)
                                    }
                                    className="ml-2 hover:text-destructive transition-colors"
                                  >
                                    <X className="h-3 w-3" aria-hidden="true" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Add Value Form */}
                        <div className="space-y-3 p-3 rounded-md bg-muted/30">
                          <Label className="text-sm font-medium">
                            Add New Value
                          </Label>
                          <div className="space-y-2">
                            <div className="space-y-1.5">
                              <Input
                                aria-label={`New value for ${option.name[language]}`}
                                placeholder={
                                  language === "en"
                                    ? "e.g., Blue, Large"
                                    : "жнь: Цэнхэр, Том"
                                }
                                value={
                                  newOptionValue[option.id]?.[language] || ""
                                }
                                onChange={(e) =>
                                  setNewOptionValue((prev) => ({
                                    ...prev,
                                    [option.id]: {
                                      ...prev[option.id],
                                      [language]: e.target.value,
                                    },
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    isOptionValueValid(option.id)
                                  ) {
                                    e.preventDefault();
                                    addOptionValue(option.id);
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Translation ({language === "en" ? "MN" : "EN"})
                              </Label>
                              <Input
                                aria-label={`New value translation for ${option.name[language]}`}
                                placeholder={
                                  language === "en"
                                    ? "жнь: Цэнхэр, Том"
                                    : "e.g., Blue, Large"
                                }
                                value={
                                  newOptionValue[option.id]?.[
                                    language === "en" ? "mn" : "en"
                                  ] || ""
                                }
                                onChange={(e) =>
                                  setNewOptionValue((prev) => ({
                                    ...prev,
                                    [option.id]: {
                                      ...prev[option.id],
                                      [language === "en" ? "mn" : "en"]:
                                        e.target.value,
                                    },
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    isOptionValueValid(option.id)
                                  ) {
                                    e.preventDefault();
                                    addOptionValue(option.id);
                                  }
                                }}
                                className="h-9"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Press Enter to add quickly
                            </p>
                            <Button
                              type="button"
                              onClick={() => addOptionValue(option.id)}
                              size="sm"
                              disabled={!isOptionValueValid(option.id)}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No options yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Create product options to generate variants automatically
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants Table */}
      {variants.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Generated Variants</CardTitle>
            <CardDescription>
              {variants.length} combination{variants.length === 1 ? "" : "s"}{" "}
              from {options.length} option{options.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]"></TableHead>
                    <TableHead className="min-w-[200px]">Variant</TableHead>
                    <TableHead className="min-w-[140px]">SKU</TableHead>
                    <TableHead className="min-w-[120px]">Price</TableHead>
                    <TableHead className="min-w-[120px]">Compare At</TableHead>
                    <TableHead className="min-w-[100px]">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant, variantIndex) => {
                    const skuError = errors[`variant.${variantIndex}.sku`];
                    const priceError = errors[`variant.${variantIndex}.price`];
                    const stockError = errors[`variant.${variantIndex}.inventory`];
                    const variantLabel = variant.title?.[language] || variant.sku || `variant ${variantIndex + 1}`;
                    return (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <SingleImageUpload
                          onUpload={(url) =>
                            updateVariant(variant.id, { image: url })
                          }
                          initialUrl={variant.image}
                          compact
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="font-medium text-sm">
                            {variant.title?.[language]}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {variant.optionValues.map((ov, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {ov.value[language]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          id={`variant-${variantIndex}-sku`}
                          aria-label={`SKU for ${variantLabel}`}
                          aria-invalid={skuError ? true : undefined}
                          aria-describedby={skuError ? `variant-${variantIndex}-sku-error` : undefined}
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariant(variant.id, { sku: e.target.value })
                          }
                          className="h-9 text-sm font-mono"
                          placeholder="SKU"
                        />
                        {skuError && (
                          <p id={`variant-${variantIndex}-sku-error`} role="alert" className="text-destructive mt-1 text-xs">
                            {skuError}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            ₮
                          </span>
                          <Input
                            id={`variant-${variantIndex}-price`}
                            aria-label={`Price for ${variantLabel}`}
                            aria-invalid={priceError ? true : undefined}
                            aria-describedby={priceError ? `variant-${variantIndex}-price-error` : undefined}
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(variant.id, {
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-9 text-sm pl-7"
                            placeholder="0.00"
                          />
                        </div>
                        {priceError && (
                          <p id={`variant-${variantIndex}-price-error`} role="alert" className="text-destructive mt-1 text-xs">
                            {priceError}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            ₮
                          </span>
                          <Input
                            aria-label={`Compare-at price for ${variantLabel}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.compareAtPrice || ""}
                            onChange={(e) =>
                              updateVariant(variant.id, {
                                compareAtPrice: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              })
                            }
                            className="h-9 text-sm pl-7"
                            placeholder="--"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          id={`variant-${variantIndex}-inventory`}
                          aria-label={`Stock for ${variantLabel}`}
                          aria-invalid={stockError ? true : undefined}
                          aria-describedby={stockError ? `variant-${variantIndex}-inventory-error` : undefined}
                          type="number"
                          min="0"
                          step="1"
                          value={variant.inventory}
                          onChange={(e) =>
                            updateVariant(variant.id, {
                              inventory: parseInt(e.target.value) || 0,
                            })
                          }
                          className="h-9 text-sm"
                          placeholder="0"
                        />
                        {stockError && (
                          <p id={`variant-${variantIndex}-inventory-error`} role="alert" className="text-destructive mt-1 text-xs">
                            {stockError}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Summary Footer */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <div>
                Total inventory:{" "}
                <span className="font-medium text-foreground">
                  {variants.reduce((sum, v) => sum + v.inventory, 0)}
                </span>{" "}
                units
              </div>
              <div>
                Average price:{" "}
                <span className="font-medium text-foreground">
                  ₮
                  {(
                    variants.reduce((sum, v) => sum + v.price, 0) /
                    variants.length
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        options.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Add at least one value to each option to generate variants
            </AlertDescription>
          </Alert>
        )
      )}

      <ConfirmDialog
        open={pendingConfirm !== null}
        onOpenChange={(open) => !open && setPendingConfirm(null)}
        title={pendingConfirm?.kind === "delete-option" ? "Delete this option?" : "Remove all values?"}
        description={
          pendingConfirm?.kind === "delete-option"
            ? "The option and all its values are removed, and the variants built from it are regenerated. SKUs, prices and stock you entered for those variants are lost."
            : "All values of this option are removed. The variants built from it are regenerated and the prices and stock you entered for them are lost."
        }
        confirmLabel={pendingConfirm?.kind === "delete-option" ? "Delete option" : "Remove values"}
        onConfirm={() => {
          if (!pendingConfirm) return;
          if (pendingConfirm.kind === "delete-option") removeOption(pendingConfirm.optionId);
          else
            onOptionsChange(
              options.map((opt) =>
                opt.id === pendingConfirm.optionId ? { ...opt, values: [] } : opt
              )
            );
          setPendingConfirm(null);
        }}
      />
    </div>
  );
}
