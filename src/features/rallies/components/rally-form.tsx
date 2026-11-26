"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
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
import { FormField, FormSection } from "@/components/admin";
import { RallyVideoUpload } from "./rally-video-upload";
import { Loader2, Save } from "lucide-react";
import {
  CREATE_RALLY,
  UPDATE_RALLY,
} from "@/graphql/mutations/rallies";
import { toast } from "sonner";
import { EMPTY_TERMS_FORM, termsFromForm, termsToForm } from "@/features/rallies/lib/acceptance-terms";
import { generateSlug, validateRallyForm, type RallyFormValues } from "../lib/rally-schema";
import type { Rally } from "../types";

type FieldKey = keyof RallyFormValues;

/** Order fields appear on the page, so the first invalid one gets focus. */
const FIELD_ORDER: FieldKey[] = [
  "titleEn", "slug", "duration", "startDate", "endDate", "applicationDeadline", "maxParticipants",
  "heroVideo", "photoCredit", "minimumContribution", "deposit", "nonRefundable", "currency", "finalPaymentDue",
];

const FIELD_DOM_ID: Record<FieldKey, string> = {
  titleEn: "title-en", slug: "slug", duration: "duration", startDate: "startDate", endDate: "endDate",
  applicationDeadline: "applicationDeadline", maxParticipants: "maxParticipants", heroVideo: "heroVideo", isFeatured: "isFeatured",
  photoCredit: "photoCredit", minimumContribution: "terms-minimumContribution", deposit: "terms-deposit",
  nonRefundable: "terms-nonRefundable", currency: "terms-currency", finalPaymentDue: "terms-finalPaymentDue",
};

interface RallyFormProps {
  mode?: "create" | "edit" | "view";
  language: "en" | "mn";
  /** Lets the form switch to English when the English title is missing. */
  onLanguageChange?: (language: "en" | "mn") => void;
  rallyId?: string;
  initialData?: Rally;
}

export function RallyForm({
  mode = "create",
  language,
  onLanguageChange,
  rallyId,
  initialData,
}: RallyFormProps) {
  const router = useRouter();
  const [createRally, { loading: isCreating }] = useMutation(CREATE_RALLY);
  const [updateRally, { loading: isUpdating }] = useMutation(UPDATE_RALLY);
  const [isUploading, setIsUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const isSubmitting = isCreating || isUpdating || isUploading || isVideoUploading;
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [isSlugEdited, setIsSlugEdited] = useState(mode !== "create");
  const isReadOnly = mode === "view";

  const heroImageRef = useRef<SingleImageUploadRef>(null);

  const normalizeLangField = (field: string | { en: string; mn: string } | undefined) => {
    if (!field) return { en: "", mn: "" };
    if (typeof field === "string") return { en: field, mn: field };
    return field;
  };

  const [formData, setFormData] = useState(() => {
    if (initialData && mode !== "create") {
      return {
        title: normalizeLangField(initialData.title),
        slug: initialData.slug || "",
        description: normalizeLangField(initialData.description),
        location: normalizeLangField(initialData.location),
        targetAudience: normalizeLangField(initialData.targetAudience),
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : "",
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
        duration: String(initialData.duration ?? 0),
        maxParticipants: initialData.maxParticipants ? String(initialData.maxParticipants) : "",
        heroImage: initialData.heroImage || "",
        heroVideo: initialData.heroVideo || "",
        isFeatured: initialData.isFeatured ?? false,
        photoCredit: initialData.photoCredit || "",
        isPlaceholder: initialData.isPlaceholder ?? false,
        terms: termsToForm(initialData.acceptanceTerms),
        isRecruiting: initialData.isRecruiting ?? false,
        applicationDeadline: initialData.applicationDeadline ? initialData.applicationDeadline.split('T')[0] : "",
        status: initialData.status || "DRAFT",
      };
    }
    return {
      title: { en: "", mn: "" },
      slug: "",
      description: { en: "", mn: "" },
      location: { en: "", mn: "" },
      targetAudience: { en: "", mn: "" },
      startDate: "",
      endDate: "",
      duration: "",
      maxParticipants: "",
      heroImage: "",
      heroVideo: "",
      isFeatured: false,
      photoCredit: "",
      isPlaceholder: false,
      terms: EMPTY_TERMS_FORM,
      isRecruiting: false,
      applicationDeadline: "",
      status: "DRAFT",
    };
  });

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  const clearError = (key: FieldKey) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const setField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K], errorKey?: FieldKey) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errorKey) clearError(errorKey);
  };

  const setTerm = (key: keyof typeof formData.terms, value: string) => {
    setFormData((prev) => ({ ...prev, terms: { ...prev.terms, [key]: value } }));
    clearError(key as FieldKey);
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: { ...prev.title, [language]: value },
      // Slug follows the English title until someone edits it by hand.
      slug: !isSlugEdited && language === "en" ? generateSlug(value) : prev.slug,
    }));
    if (language === "en") {
      clearError("titleEn");
      if (!isSlugEdited) clearError("slug");
    }
  };

  const focusField = useCallback((key: FieldKey) => {
    window.setTimeout(() => document.getElementById(FIELD_DOM_ID[key])?.focus(), 0);
  }, []);

  const toFormValues = (): RallyFormValues => ({
    titleEn: formData.title.en,
    slug: formData.slug,
    startDate: formData.startDate,
    endDate: formData.endDate,
    applicationDeadline: formData.applicationDeadline,
    duration: formData.duration,
    maxParticipants: formData.maxParticipants,
    photoCredit: formData.photoCredit,
    heroVideo: formData.heroVideo.trim(),
    isFeatured: formData.isFeatured,
    ...formData.terms,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly || isSubmitting) return;

    const { errors: found } = validateRallyForm(toFormValues());
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      if (firstInvalid === "titleEn" && language !== "en") onLanguageChange?.("en");
      toast.error(found[firstInvalid] ?? "Please fix the highlighted fields");
      focusField(firstInvalid);
      return;
    }

    try {
      // Upload hero image first if one was selected
      let heroImageUrl: string | null = initialData?.heroImage || null;
      if (heroImageRef.current && heroImageFile) {
        setIsUploading(true);
        try {
          heroImageUrl = await heroImageRef.current.uploadImage();
        } finally {
          setIsUploading(false);
        }
        if (!heroImageUrl) {
          toast.error("Failed to upload hero image");
          return;
        }
      }

      const baseInput = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        targetAudience: formData.targetAudience,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        duration: Number(formData.duration) || 0,
        maxParticipants: formData.maxParticipants.trim() ? Number(formData.maxParticipants) : null,
        heroImage: heroImageUrl,
        heroVideo: formData.heroVideo.trim() || null,
        isFeatured: formData.isFeatured,
        photoCredit: formData.photoCredit.trim() || null,
        isPlaceholder: formData.isPlaceholder,
        acceptanceTerms: termsFromForm(formData.terms),
        isRecruiting: formData.isRecruiting,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null,
      };

      const input = mode === "edit"
        ? { ...baseInput, slug: formData.slug, status: formData.status }
        : {
            ...baseInput,
            slug: formData.slug,
            status: formData.status,
            impactOverview: { en: "", mn: "" },
            conservationActivities: { en: "", mn: "" },
            rangerPartnerships: { en: "", mn: "" },
          };

      if (mode === "edit" && rallyId) {
        await updateRally({
          variables: { id: rallyId, input },
          refetchQueries: ["GetRallies", "GetRallyById"],
        });
        toast.success("Rally updated successfully");
      } else {
        await createRally({
          variables: { input },
          refetchQueries: ["GetRallies"],
        });
        toast.success("Rally created successfully");
      }

      router.push("/rallies");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : `Failed to ${mode === "edit" ? "update" : "create"} rally`
      );
    }
  };

  const ph = (en: string, mn: string) => (language === "en" ? en : mn);
  const sub = (key: "description" | "location" | "targetAudience") => (value: string) =>
    setFormData((prev) => ({ ...prev, [key]: { ...prev[key], [language]: value } }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <FormSection
        title="Rally Information"
        description={isReadOnly ? "Rally details" : "Add rally details"}
      >
        <FormField
          id={`title-${language}`}
          label={language === "en" ? "Title (English)" : "Title (Mongolian)"}
          required={language === "en" && !isReadOnly}
          error={language === "en" ? errors.titleEn : undefined}
        >
          {(c) => (
            <Input
              {...c}
              value={formData.title[language]}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={ph("Enter rally title", "Раллийн нэр")}
              disabled={isReadOnly}
            />
          )}
        </FormField>

        <FormField
          id="slug"
          label="Slug"
          error={errors.slug}
          description="URL-friendly version of the title. Follows the English title until you edit it."
        >
          {(c) => (
            <Input
              {...c}
              value={formData.slug}
              onChange={(e) => {
                setIsSlugEdited(true);
                setField("slug", e.target.value, "slug");
              }}
              placeholder="rally-url-slug"
              disabled={isReadOnly}
            />
          )}
        </FormField>

        <FormField id={`description-${language}`} label="Description">
          {(c) => (
            <Textarea
              {...c}
              value={formData.description[language]}
              onChange={(e) => sub("description")(e.target.value)}
              placeholder={ph("Rally description...", "Раллийн тодорхойлолт...")}
              rows={6}
              disabled={isReadOnly}
            />
          )}
        </FormField>

        <FormField id={`location-${language}`} label="Location">
          {(c) => (
            <Input
              {...c}
              value={formData.location[language]}
              onChange={(e) => sub("location")(e.target.value)}
              placeholder={ph("Event location", "Үйл ажиллагааны байршил")}
              disabled={isReadOnly}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id={`targetAudience-${language}`} label="Target Audience">
            {(c) => (
              <Input
                {...c}
                value={formData.targetAudience[language]}
                onChange={(e) => sub("targetAudience")(e.target.value)}
                placeholder={ph("e.g., Youth, Professionals", "жишээлбэл, Залуучууд, Мэргэжилтнүүд")}
                disabled={isReadOnly}
              />
            )}
          </FormField>

          <FormField id="duration" label="Duration (hours)" error={errors.duration}>
            {(c) => (
              <Input
                {...c}
                type="number"
                min="0"
                step="1"
                value={formData.duration}
                onChange={(e) => setField("duration", e.target.value, "duration")}
                disabled={isReadOnly}
              />
            )}
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Dates & Schedule">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField id="startDate" label="Start Date" required={!isReadOnly} error={errors.startDate}>
            {(c) => (
              <Input
                {...c}
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setField("startDate", e.target.value, "startDate");
                  clearError("endDate");
                  clearError("applicationDeadline");
                }}
                disabled={isReadOnly}
              />
            )}
          </FormField>

          <FormField id="endDate" label="End Date" required={!isReadOnly} error={errors.endDate}>
            {(c) => (
              <Input
                {...c}
                type="date"
                min={formData.startDate || undefined}
                value={formData.endDate}
                onChange={(e) => setField("endDate", e.target.value, "endDate")}
                disabled={isReadOnly}
              />
            )}
          </FormField>

          <FormField id="applicationDeadline" label="Application Deadline" error={errors.applicationDeadline}>
            {(c) => (
              <Input
                {...c}
                type="date"
                max={formData.startDate || undefined}
                value={formData.applicationDeadline}
                onChange={(e) => setField("applicationDeadline", e.target.value, "applicationDeadline")}
                disabled={isReadOnly}
              />
            )}
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Participants">
        <FormField id="maxParticipants" label="Maximum Participants" error={errors.maxParticipants}>
          {(c) => (
            <Input
              {...c}
              type="number"
              min="1"
              step="1"
              value={formData.maxParticipants}
              onChange={(e) => setField("maxParticipants", e.target.value, "maxParticipants")}
              placeholder="Leave empty for unlimited"
              disabled={isReadOnly}
            />
          )}
        </FormField>
      </FormSection>

      <FormSection
        title="Hero Image"
        description={
          isReadOnly
            ? "Rally hero image"
            : mode === "edit"
            ? "Update rally image (leave empty to keep current image)"
            : "Image will be uploaded when you save the rally"
        }
      >
        {isReadOnly && initialData?.heroImage ? (
          <div className="relative w-full max-w-xs aspect-video overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={initialData.heroImage}
              alt={typeof initialData.title === "string" ? initialData.title : initialData.title?.en || "Rally"}
              className="object-cover w-full h-full"
            />
          </div>
        ) : !isReadOnly ? (
          <SingleImageUpload
            ref={heroImageRef}
            onFileSelect={setHeroImageFile}
            initialUrl={initialData?.heroImage}
          />
        ) : (
          <div className="text-sm text-muted-foreground">No image</div>
        )}
      </FormSection>

      <FormSection title="Featured video">
        <RallyVideoUpload
          id="heroVideo"
          value={formData.heroVideo}
          onChange={(url) => setField("heroVideo", url, "heroVideo")}
          onUploadingChange={setIsVideoUploading}
          error={errors.heroVideo}
          disabled={isReadOnly}
        />
      </FormSection>

      <FormSection title="Photo credit" description='Shown under the gallery as "Photos by: …"'>
        <FormField id="photoCredit" label="Photos by" error={errors.photoCredit}>
          {(c) => (
            <Input
              {...c}
              value={formData.photoCredit}
              onChange={(e) => setField("photoCredit", e.target.value, "photoCredit")}
              placeholder="e.g. Temuujin Otgonbayar"
              disabled={isReadOnly}
            />
          )}
        </FormField>
      </FormSection>

      <FormSection
        title="Acceptance letter"
        description="Amounts quoted in the letter approved riders sign. Leave empty to omit them."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ["minimumContribution", "Minimum contribution", "11000"],
              ["deposit", "Deposit", "5750"],
              ["nonRefundable", "Non-refundable part of deposit", "4000"],
              ["currency", "Currency", "USD"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <FormField key={key} id={`terms-${key}`} label={label} error={errors[key]}>
              {(c) => (
                <Input
                  {...c}
                  inputMode={key === "currency" ? "text" : "decimal"}
                  maxLength={key === "currency" ? 3 : undefined}
                  value={formData.terms[key]}
                  onChange={(e) => setTerm(key, e.target.value)}
                  placeholder={placeholder}
                  disabled={isReadOnly}
                />
              )}
            </FormField>
          ))}
          <FormField id="terms-finalPaymentDue" label="Final payment due" error={errors.finalPaymentDue}>
            {(c) => (
              <Input
                {...c}
                type="date"
                value={formData.terms.finalPaymentDue}
                onChange={(e) => setTerm("finalPaymentDue", e.target.value)}
                disabled={isReadOnly}
              />
            )}
          </FormField>
          <FormField id="terms-startCity" label="Start city (riders travel to and from)">
            {(c) => (
              <Input
                {...c}
                value={formData.terms.startCity}
                onChange={(e) => setTerm("startCity", e.target.value)}
                placeholder="Ulaanbaatar, Mongolia"
                disabled={isReadOnly}
              />
            )}
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Rally Settings">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setField("status", value)}
            disabled={isReadOnly}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="isRecruiting">Open for Applications</Label>
            <p className="text-sm text-muted-foreground">Allow users to apply for this rally</p>
          </div>
          <Switch
            id="isRecruiting"
            checked={formData.isRecruiting}
            onCheckedChange={(checked) => setField("isRecruiting", checked)}
            disabled={isReadOnly}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="isPlaceholder">Details coming (simple tile)</Label>
            <p className="text-sm text-muted-foreground">
              Upcoming: a &quot;Coming soon&quot; card. Past: a simple tile with no rally page, until photos and
              info are added.
            </p>
          </div>
          <Switch
            id="isPlaceholder"
            checked={formData.isPlaceholder}
            onCheckedChange={(checked) => setField("isPlaceholder", checked)}
            disabled={isReadOnly}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="isFeatured">Feature on home page</Label>
            <p id="isFeatured-description" className="text-sm text-muted-foreground">
              Only one rally is featured at a time; turning this on replaces the current one.
            </p>
          </div>
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setField("isFeatured", checked)}
            aria-describedby="isFeatured-description"
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {!isReadOnly && (
        <div className="sticky bottom-0 z-10 border-t bg-background">
          <div className="flex items-center gap-3 py-4">
            <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {isUploading ? "Uploading image…" : isVideoUploading ? "Uploading video…" : mode === "create" ? "Create Rally" : "Update Rally"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
