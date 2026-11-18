"use client";

import { useState, useRef } from "react";
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
import { FormSection } from "@/components/admin";
import { Loader2, Save } from "lucide-react";
import {
  CREATE_RALLY,
  UPDATE_RALLY,
} from "@/graphql/mutations/rallies";
import { toast } from "sonner";
import { EMPTY_TERMS_FORM, termsFromForm, termsToForm } from "@/features/rallies/lib/acceptance-terms";
import type { Rally } from "../types";

interface RallyFormProps {
  mode?: "create" | "edit" | "view";
  language: "en" | "mn";
  rallyId?: string;
  initialData?: Rally;
}

export function RallyForm({
  mode = "create",
  language,
  rallyId,
  initialData,
}: RallyFormProps) {
  const router = useRouter();
  const [createRally, { loading: isCreating }] = useMutation(CREATE_RALLY);
  const [updateRally, { loading: isUpdating }] = useMutation(UPDATE_RALLY);
  const isSubmitting = isCreating || isUpdating;
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
        duration: initialData.duration || 0,
        maxParticipants: initialData.maxParticipants || 0,
        heroImage: initialData.heroImage || "",
        heroVideo: initialData.heroVideo || "",
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
      duration: 0,
      maxParticipants: 0,
      heroImage: "",
      heroVideo: "",
      photoCredit: "",
      isPlaceholder: false,
      terms: EMPTY_TERMS_FORM,
      isRecruiting: false,
      applicationDeadline: "",
      status: "DRAFT",
    };
  });

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: { ...prev.title, [language]: value },
      slug: mode === "create" ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) return;

    try {
      // Upload hero image first if one was selected
      let heroImageUrl: string | null = initialData?.heroImage || null;
      if (heroImageRef.current && heroImageFile) {
        toast.info("Uploading image...");
        heroImageUrl = await heroImageRef.current.uploadImage();
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
        duration: formData.duration || 0,
        maxParticipants: formData.maxParticipants || null,
        heroImage: heroImageUrl,
        heroVideo: formData.heroVideo || null,
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
            slug: formData.slug || generateSlug(formData.title.en || formData.title.mn || "rally"),
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
      console.error("Failed to save rally:", error);
      if (error instanceof Error) {
        toast.error(
          error.message ||
            `Failed to ${mode === "edit" ? "update" : "create"} rally`
        );
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rally Information */}
      <FormSection
        title="Rally Information"
        description={isReadOnly ? "Rally details" : "Add rally details"}
      >
          <div className="space-y-2">
            <Label htmlFor={`title-${language}`}>Title *</Label>
            <Input
              id={`title-${language}`}
              value={formData.title[language]}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={
                language === "en" ? "Enter rally title" : "Раллийн нэр"
              }
              required={!isReadOnly}
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="rally-url-slug"
              disabled={isReadOnly}
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly version of the title. Auto-generated from title.
            </p>
          </div>

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
                  ? "Rally description..."
                  : "Раллийн тодорхойлолт..."
              }
              rows={6}
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`location-${language}`}>Location</Label>
            <Input
              id={`location-${language}`}
              value={formData.location[language]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: {
                    ...prev.location,
                    [language]: e.target.value,
                  },
                }))
              }
              placeholder={
                language === "en" ? "Event location" : "Үйл ажиллагааны байршил"
              }
              disabled={isReadOnly}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`targetAudience-${language}`}>Target Audience</Label>
              <Input
                id={`targetAudience-${language}`}
                value={formData.targetAudience[language]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetAudience: {
                      ...prev.targetAudience,
                      [language]: e.target.value,
                    },
                  }))
                }
                placeholder={
                  language === "en" ? "e.g., Youth, Professionals" : "жишээлбэл, Залуучууд, Мэргэжилтнүүд"
                }
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isReadOnly}
              />
            </div>
          </div>
      </FormSection>

      {/* Dates */}
      <FormSection title="Dates & Schedule">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                required={!isReadOnly}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                required={!isReadOnly}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    applicationDeadline: e.target.value,
                  }))
                }
                disabled={isReadOnly}
              />
            </div>
          </div>
      </FormSection>

      {/* Participants */}
      <FormSection title="Participants">
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Maximum Participants</Label>
          <Input
            id="maxParticipants"
            type="number"
            min="0"
            value={formData.maxParticipants}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxParticipants: parseInt(e.target.value) || 0,
              }))
            }
            placeholder="Leave empty for unlimited"
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Hero Image */}
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

      {/* Hero Video URL */}
      <FormSection title="Hero Video" description="Add a video URL (YouTube, Vimeo, etc.)">
        <div className="space-y-2">
          <Label htmlFor="heroVideo">Video URL</Label>
          <Input
            id="heroVideo"
            type="url"
            value={formData.heroVideo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, heroVideo: e.target.value }))
            }
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Photo credit (round 4) */}
      <FormSection title="Photo credit" description='Shown under the gallery as "Photos by: …"'>
        <div className="space-y-2">
          <Label htmlFor="photoCredit">Photos by</Label>
          <Input
            id="photoCredit"
            value={formData.photoCredit}
            onChange={(e) => setFormData((prev) => ({ ...prev, photoCredit: e.target.value }))}
            placeholder="e.g. Temuujin Otgonbayar"
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Acceptance letter amounts (round 4) */}
      <FormSection
        title="Acceptance letter"
        description="Amounts quoted in the letter approved riders sign. Leave empty to omit them."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["minimumContribution", "Minimum contribution", "11000"],
              ["deposit", "Deposit", "5750"],
              ["nonRefundable", "Non-refundable part of deposit", "4000"],
              ["currency", "Currency", "USD"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`terms-${key}`}>{label}</Label>
              <Input
                id={`terms-${key}`}
                inputMode={key === "currency" ? "text" : "numeric"}
                value={formData.terms[key]}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, terms: { ...prev.terms, [key]: e.target.value } }))
                }
                placeholder={placeholder}
                disabled={isReadOnly}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="terms-finalPaymentDue">Final payment due</Label>
            <Input
              id="terms-finalPaymentDue"
              type="date"
              value={formData.terms.finalPaymentDue}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, terms: { ...prev.terms, finalPaymentDue: e.target.value } }))
              }
              disabled={isReadOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terms-startCity">Start city (riders travel to and from)</Label>
            <Input
              id="terms-startCity"
              value={formData.terms.startCity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, terms: { ...prev.terms, startCity: e.target.value } }))
              }
              placeholder="Ulaanbaatar, Mongolia"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </FormSection>

      {/* Rally Settings */}
      <FormSection title="Rally Settings">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
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

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isRecruiting">Open for Applications</Label>
            <p className="text-sm text-muted-foreground">
              Allow users to apply for this rally
            </p>
          </div>
          <Switch
            id="isRecruiting"
            checked={formData.isRecruiting}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isRecruiting: checked }))
            }
            disabled={isReadOnly}
          />
        </div>

        <div className="flex items-center justify-between">
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
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isPlaceholder: checked }))
            }
            disabled={isReadOnly}
          />
        </div>
      </FormSection>

      {/* Form Actions */}
      <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {mode === "create" ? "Create Rally" : "Update Rally"}
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
