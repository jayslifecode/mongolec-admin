"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  SingleImageUpload,
  SingleImageUploadRef,
} from "@/components/single-image-upload";
import {
  MultiImageUpload,
  MultiImageUploadRef,
} from "@/components/multi-image-upload";
import { Loader2, Save } from "lucide-react";
import { FormField, FormSection } from "@/components/admin";
import { validateProductForm } from "../lib/product-schema";
import { VariantBuilder } from "./variant-builder";
import {
  CREATE_MERCH_PRODUCT,
  UPDATE_MERCH_PRODUCT,
} from "@/graphql/mutations/merch";
import { GET_MERCH_CATEGORIES, GET_MERCH_DISCOUNTS } from "@/graphql/queries/merch";
import { AutocompleteSelectFilter } from "@/components/data-table/autocomplete-select-filter";
import { toast } from "sonner";
import type { MerchProduct } from "../types";

interface ProductOption {
  id: string;
  name: { en: string; mn: string };
  values: Array<{ en: string; mn: string }>;
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

interface MerchProductFormProps {
  mode?: "create" | "edit" | "view";
  language: "en" | "mn";
  /** Lets the form switch to English when the English name is missing. */
  onLanguageChange?: (language: "en" | "mn") => void;
  productId?: string;
  initialData?: MerchProduct;
}

function parseGalleryImages(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((u) => typeof u === "string");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === "string");
    } catch {
      // not valid JSON — ignore
    }
  }
  return [];
}

export function MerchProductForm({
  mode = "create",
  language,
  onLanguageChange,
  productId,
  initialData,
}: MerchProductFormProps) {
  const router = useRouter();
  const [createProduct, { loading: isCreating }] =
    useMutation(CREATE_MERCH_PRODUCT);
  const [updateProduct, { loading: isUpdating }] =
    useMutation(UPDATE_MERCH_PRODUCT);
  const { data: categoriesData } = useQuery<{
    getMerchCategories: Array<{ id: string; name: string | { en?: string; mn?: string }; slug: string }>;
  }>(GET_MERCH_CATEGORIES, { variables: { language } });
  const categories = categoriesData?.getMerchCategories ?? [];
  const [isWorking, setIsWorking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Uploads count as saving.
  const isSubmitting = isCreating || isUpdating || isWorking;
  const isReadOnly = mode === "view";

  const featuredImageRef = useRef<SingleImageUploadRef>(null);
  const galleryRef = useRef<MultiImageUploadRef>(null);

  const normalizeLangField = (field: string | { en: string; mn: string } | undefined) => {
    if (!field) return { en: "", mn: "" };
    if (typeof field === "string") return { en: field, mn: field };
    return field;
  };

  const [formData, setFormData] = useState({
    name: mode !== "create" && initialData ? normalizeLangField(initialData.name) : { en: "", mn: "" },
    description: mode !== "create" && initialData ? normalizeLangField(initialData.description) : { en: "", mn: "" },
    shortDescription: mode !== "create" && initialData ? normalizeLangField(initialData.shortDescription) : { en: "", mn: "" },
    price: mode !== "create" && initialData ? String(initialData.price ?? "") : "",
    compareAtPrice: mode !== "create" && initialData && initialData.compareAtPrice ? String(initialData.compareAtPrice) : "",
    currency: mode !== "create" && initialData ? initialData.currency || "USD" : "USD",
    status: mode !== "create" && initialData ? initialData.status || "DRAFT" : "DRAFT",
    inventory: mode !== "create" && initialData ? String(initialData.inventory ?? 0) : "0",
    minStock: mode !== "create" && initialData && initialData.minStock ? String(initialData.minStock) : "",
    trackInventory: mode !== "create" && initialData ? initialData.trackInventory ?? true : true,
    isFeatured: mode !== "create" && initialData ? initialData.isFeatured ?? false : false,
    hasVariants: mode !== "create" && initialData ? initialData.hasVariants ?? false : false,
    categoryId: mode !== "create" && initialData ? initialData.category?.id || "" : "",
  });

  const [discountIds, setDiscountIds] = useState<string[]>(
    mode !== "create" && initialData
      ? ((initialData as any).discounts ?? []).map((d: { id: string }) => d.id)
      : []
  );

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [initialGalleryUrls, setInitialGalleryUrls] = useState<string[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  // Initialize form with existing product data
  useEffect(() => {
    if (initialData && mode !== "create") {
      setFormData({
        name: normalizeLangField(initialData.name),
        description: normalizeLangField(initialData.description),
        shortDescription: normalizeLangField(initialData.shortDescription),
        price: String(initialData.price ?? ""),
        compareAtPrice: initialData.compareAtPrice ? String(initialData.compareAtPrice) : "",
        currency: initialData.currency || "USD",
        status: initialData.status || "DRAFT",
        inventory: String(initialData.inventory ?? 0),
        minStock: initialData.minStock ? String(initialData.minStock) : "",
        trackInventory: initialData.trackInventory ?? true,
        isFeatured: initialData.isFeatured ?? false,
        hasVariants: initialData.hasVariants ?? false,
        categoryId: initialData.category?.id || "",
      });

      setInitialGalleryUrls(parseGalleryImages(initialData.images));

      if (initialData.options) {
        const rawOpts = initialData.options as ProductOption[]
        setOptions(rawOpts.map((opt, i) => ({ ...opt, id: opt.id || `option-${i}` })))
      }

      if (initialData.variants) {
        setVariants(
          initialData.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku || "",
            title: v.title,
            optionValues: v.optionValues || [],
            price: v.price || 0,
            compareAtPrice: v.compareAtPrice,
            inventory: v.inventory || 0,
            image: v.image,
            position: v.position || 0,
          }))
        );
      }
    }
  }, [initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) return;

    const { fieldErrors, data: parsed } = validateProductForm({
      nameEn: formData.name.en,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice,
      hasOptions: options.length > 0,
      trackInventory: formData.trackInventory,
      inventory: formData.inventory,
      minStock: formData.minStock,
      variants,
    });
    setErrors(fieldErrors);
    if (!parsed) {
      focusFirstInvalid(fieldErrors);
      return;
    }

    setIsWorking(true);
    try {
      // Upload featured image first if one was selected
      let featuredImageUrl: string | null = initialData?.featuredImage || null;
      if (featuredImageRef.current && featuredImageFile) {
        toast.info("Uploading images...");
        featuredImageUrl = await featuredImageRef.current.uploadImage();
        if (!featuredImageUrl) {
          toast.error("Failed to upload featured image");
          return;
        }
      }

      // Upload gallery images
      let galleryImages: string[] = [];
      if (galleryRef.current) {
        galleryImages = await galleryRef.current.uploadImages();
      }

      // Prepare variant data for GraphQL
      const variantsInput = variants.map((v) => ({
        sku: v.sku.trim(),
        title: v.title,
        optionValues: v.optionValues,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        inventory: v.inventory,
        image: v.image,
        position: v.position,
        isAvailable: true,
      }));

      // Generate SKU from product name (only for create mode)
      const generateSKU = (name: string) => {
        const prefix = name
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z]/g, "X");
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}-${timestamp}`;
      };

      const input = {
        sku:
          mode === "create"
            ? generateSKU(formData.name.en || formData.name.mn || "PRODUCT")
            : initialData?.sku,
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: parsed.price,
        compareAtPrice: parsed.compareAtPrice,
        currency: formData.currency,
        inventory: parsed.inventory,
        trackInventory: formData.trackInventory,
        minStock: parsed.minStock,
        status: formData.status,
        isFeatured: formData.isFeatured,
        featuredImage: featuredImageUrl,
        images: galleryImages.length > 0 ? galleryImages : null,
        categoryId: formData.categoryId || null,
        hasVariants: options.length > 0,
        options:
          options.length > 0
            ? options.map((opt) => ({
                name: opt.name,
                values: opt.values,
              }))
            : null,
        variants: variantsInput.length > 0 ? variantsInput : null,
        discountIds: discountIds.length > 0 ? discountIds : null,
      };

      if (mode === "edit" && productId) {
        await updateProduct({
          variables: { id: productId, input },
          refetchQueries: ["GetMerchProducts", "GetMerchProductById"],
        });
        toast.success("Product updated successfully");
      } else {
        await createProduct({
          variables: { input },
          refetchQueries: ["GetMerchProducts"],
        });
        toast.success("Product created successfully");
      }

      router.push("/merch");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : `Failed to ${mode === "edit" ? "update" : "create"} product`
      );
    } finally {
      setIsWorking(false);
    }
  };

  // Moves focus to the first invalid field, switching to English when the English name is the problem.
  const focusFirstInvalid = (fieldErrors: Record<string, string>) => {
    const order = ["name", "price", "compareAtPrice", "inventory", "minStock"];
    const first = order.find((key) => fieldErrors[key]);
    let targetId: string | null = null;
    if (first === "name") {
      if (language !== "en") onLanguageChange?.("en");
      targetId = "name-en";
    } else if (first) {
      targetId = first;
    } else {
      const variantKey = Object.keys(fieldErrors).find((k) => k.startsWith("variant."));
      if (variantKey) {
        const [, index, field] = variantKey.split(".");
        targetId = `variant-${index}-${field}`;
      }
    }
    if (targetId) setTimeout(() => document.getElementById(targetId)?.focus(), 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormSection
        title="Product Information"
        description={isReadOnly ? "Product details" : "Add product details"}
      >
          <FormField
            id={`name-${language}`}
            label="Product name"
            required={language === "en" && !isReadOnly}
            error={language === "en" ? errors.name : undefined}
            description={language === "mn" ? "The English name is required; Mongolian is optional." : undefined}
          >
            {(control) => (
              <Input
                {...control}
                value={formData.name[language]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: { ...prev.name, [language]: e.target.value },
                  }))
                }
                placeholder={
                  language === "en" ? "Enter product name" : "Бүтээгдэхүүний нэр"
                }
                disabled={isReadOnly}
              />
            )}
          </FormField>

          <div className="space-y-2">
            <Label htmlFor={`description-${language}`}>Description</Label>
            <Textarea
              id={`description-${language}`}
              value={formData.description[language]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: {
                    ...prev.description,
                    [language]: e.target.value,
                  },
                }))
              }
              placeholder={
                language === "en"
                  ? "Product description..."
                  : "Бүтээгдэхүүний тодорхойлолт..."
              }
              rows={4}
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`short-description-${language}`}>
              Short Description
            </Label>
            <Textarea
              id={`short-description-${language}`}
              value={formData.shortDescription[language]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shortDescription: {
                    ...prev.shortDescription,
                    [language]: e.target.value,
                  },
                }))
              }
              placeholder={
                language === "en"
                  ? "Brief product description..."
                  : "Товч тодорхойлолт..."
              }
              rows={2}
              disabled={isReadOnly}
            />
          </div>
      </FormSection>

      <FormSection
        title="Featured Image"
        description={
          isReadOnly
            ? "Product featured image"
            : mode === "edit"
            ? "Update product image (leave empty to keep current image)"
            : "Image will be uploaded when you save the product"
        }
      >
          {isReadOnly && initialData?.featuredImage ? (
            <div className="relative w-full max-w-xs aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={initialData.featuredImage}
                alt={typeof initialData.name === "string" ? initialData.name : initialData.name?.en || "Product"}
                className="object-cover w-full h-full"
              />
            </div>
          ) : !isReadOnly ? (
            <SingleImageUpload
              ref={featuredImageRef}
              onFileSelect={setFeaturedImageFile}
              initialUrl={initialData?.featuredImage}
            />
          ) : (
            <div className="text-sm text-muted-foreground">No image</div>
          )}
      </FormSection>

      <FormSection
        title="Gallery Images"
        description={
          isReadOnly
            ? "Product gallery photos"
            : "Add additional product photos (front, back, detail views)"
        }
      >
        {isReadOnly ? (
          initialGalleryUrls.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {initialGalleryUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 flex-shrink-0">
                  <div className="relative w-full h-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={url}
                      alt={`Gallery image ${i + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No gallery images</div>
          )
        ) : (
          <MultiImageUpload
            ref={galleryRef}
            initialUrls={initialGalleryUrls}
          />
        )}
      </FormSection>

      <FormSection
        title="Pricing"
        description={
          options.length > 0
            ? "Base price - variants can have different prices"
            : "Set product pricing"
        }
      >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField id="price" label="Price" required={!isReadOnly} error={errors.price}>
              {(control) => (
                <Input
                  {...control}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  disabled={isReadOnly}
                />
              )}
            </FormField>

            <FormField
              id="compareAtPrice"
              label="Compare at price"
              error={errors.compareAtPrice}
              description="Optional. The original price, shown crossed out."
            >
              {(control) => (
                <Input
                  {...control}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, compareAtPrice: e.target.value }))}
                  disabled={isReadOnly}
                />
              )}
            </FormField>

            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
                disabled={isReadOnly}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="MNT">MNT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
      </FormSection>

      {/* Variants */}
      <VariantBuilder
        options={options}
        variants={variants}
        basePrice={Number(formData.price) || 0}
        language={language}
        onOptionsChange={setOptions}
        onVariantsChange={setVariants}
        errors={errors}
      />
      {errors.variants && (
        <p role="alert" className="text-destructive text-sm">
          {errors.variants}
        </p>
      )}

      {/* Inventory - Only show if no variants */}
      {options.length === 0 && (
        <FormSection title="Inventory">
            <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
              <div>
                <Label htmlFor="trackInventory" className="text-sm font-medium">Track inventory</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Enable inventory tracking for this product</p>
              </div>
              <Switch
                id="trackInventory"
                checked={formData.trackInventory}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, trackInventory: checked }))
                }
              />
            </div>

            {formData.trackInventory && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="inventory" label="Current stock" required error={errors.inventory}>
                  {(control) => (
                    <Input
                      {...control}
                      type="number"
                      inputMode="numeric"
                      step="1"
                      value={formData.inventory}
                      onChange={(e) => setFormData((prev) => ({ ...prev, inventory: e.target.value }))}
                    />
                  )}
                </FormField>

                <FormField
                  id="minStock"
                  label="Minimum stock"
                  error={errors.minStock}
                  description="Optional. Below this the product shows as low stock."
                >
                  {(control) => (
                    <Input
                      {...control}
                      type="number"
                      inputMode="numeric"
                      step="1"
                      value={formData.minStock}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minStock: e.target.value }))}
                    />
                  )}
                </FormField>
              </div>
            )}
        </FormSection>
      )}

      <FormSection title="Product Settings">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED" }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryId: value === "none" ? "" : value,
                }))
              }
              disabled={isReadOnly}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {typeof cat.name === "string" ? cat.name : cat.name?.en || cat.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
            <div>
              <Label htmlFor="isFeatured" className="text-sm font-medium">Featured product</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Display this product on the homepage</p>
            </div>
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isFeatured: checked }))
              }
            />
          </div>
      </FormSection>

      <FormSection
        title="Discounts"
        description="Attach discounts to apply promotional pricing to this product"
      >
        <div className="space-y-2">
          <Label id="applied-discounts-label">Applied discounts</Label>
          <AutocompleteSelectFilter
            value={discountIds}
            onChange={(v) => setDiscountIds(Array.isArray(v) ? v : v ? [v] : [])}
            customQuery={{
              query: GET_MERCH_DISCOUNTS,
              dataPath: "getMerchDiscounts",
              totalCountPath: "getMerchDiscounts.length",
              labelField: "name",
              valueField: "id",
              searchField: "name",
              pageSize: 100,
            }}
            isMulti
            placeholder="Search and select discounts…"
          />
        </div>
      </FormSection>

      <div className="sticky bottom-0 z-10 border-t bg-background">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {mode === "create" ? "Create Product" : "Update Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
