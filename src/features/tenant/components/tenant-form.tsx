"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { CREATE_TENANT, UPDATE_TENANT } from "@/graphql/mutations/tenant";
import { FormField, FormSection } from "@/components/admin";
import { toast } from "sonner";
import type { Tenant, TenantStatus, TenantPlan } from "../types";
import { normalizeDomain, validateTenantForm } from "../lib/tenant-schema";

interface TenantFormProps {
  mode?: "create" | "edit";
  tenantId?: string;
  initialData?: Tenant;
}

const FIELD_IDS = { name: "name", slug: "slug", domain: "domain" } as const;

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TenantForm({
  mode = "create",
  tenantId,
  initialData,
}: TenantFormProps) {
  const router = useRouter();
  const [createTenant, { loading: isCreating }] = useMutation(CREATE_TENANT);
  const [updateTenant, { loading: isUpdating }] = useMutation(UPDATE_TENANT);
  const isSubmitting = isCreating || isUpdating;

  // Initial values come straight from the loaded tenant (the edit page only renders the form once it has loaded).
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    domain: initialData?.domain ?? "",
    isActive: initialData?.isActive ?? true,
    status: (initialData?.status ?? "ACTIVE") as TenantStatus,
    plan: (initialData?.plan ?? "FREE") as TenantPlan,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: mode === "create" ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { fieldErrors, data } = validateTenantForm(formData);
    setErrors(fieldErrors);
    const firstInvalid = Object.values(FIELD_IDS).find((id) => fieldErrors[id]);
    if (firstInvalid || !data) {
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }

    try {
      const input = {
        name: data.name,
        slug: data.slug,
        domain: data.domain || null,
        isActive: formData.isActive,
        status: formData.status,
        plan: formData.plan,
      };

      if (mode === "edit" && tenantId) {
        await updateTenant({
          variables: { id: tenantId, input },
          refetchQueries: ["GetTenants", "GetTenantById"],
        });
        toast.success("Tenant updated successfully");
      } else {
        await createTenant({
          variables: { input },
          refetchQueries: ["GetTenants"],
        });
        toast.success("Tenant created successfully");
      }

      router.push("/tenants");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : `Failed to ${mode === "edit" ? "update" : "create"} tenant`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormSection
        title="Basic Information"
        description="Organization details and identifiers"
      >
        <FormField id={FIELD_IDS.name} label="Organization name" required error={errors.name}>
          {(control) => (
            <Input
              {...control}
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter organization name"
              disabled={isSubmitting}
            />
          )}
        </FormField>

        <FormField
          id={FIELD_IDS.slug}
          label="URL name (slug)"
          required
          error={errors.slug}
          description="Lowercase letters, numbers and dashes only."
        >
          {(control) => (
            <Input
              {...control}
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="organization-slug"
              disabled={isSubmitting}
            />
          )}
        </FormField>

        <FormField
          id={FIELD_IDS.domain}
          label="Custom domain"
          error={errors.domain}
          description="Optional. Just the domain, for example example.com."
        >
          {(control) => (
            <Input
              {...control}
              value={formData.domain}
              onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
              onBlur={() => setFormData((prev) => ({ ...prev, domain: normalizeDomain(prev.domain) }))}
              placeholder="example.com"
              autoComplete="off"
              inputMode="url"
              disabled={isSubmitting}
            />
          )}
        </FormField>
      </FormSection>

      <FormSection
        title="Status & Plan"
        description="Organization status and subscription plan"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: TenantStatus) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan">Plan</Label>
            <Select
              value={formData.plan}
              onValueChange={(value: TenantPlan) =>
                setFormData((prev) => ({ ...prev, plan: value }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
          <div>
            <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Enable or disable this organization</p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
            disabled={isSubmitting}
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
            {mode === "create" ? "Create Tenant" : "Update Tenant"}
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
