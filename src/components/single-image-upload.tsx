"use client";

import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { CREATE_PRESIGNED_UPLOAD_URL } from "@/graphql/mutations/merch";
import { toast } from "sonner";
import { Loader2, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SingleImageUploadProps {
  onFileSelect?: (file: File | null) => void;
  onUpload?: (fileUrl: string) => void;
  initialUrl?: string;
  className?: string;
  autoUpload?: boolean;
  compact?: boolean;
  /** Told when an upload starts and ends, so a form can stay disabled until the photo is saved. */
  onUploadingChange?: (uploading: boolean) => void;
}

export interface SingleImageUploadRef {
  uploadImage: () => Promise<string | null>;
}

export const SingleImageUpload = forwardRef<SingleImageUploadRef, SingleImageUploadProps>(
  ({ onFileSelect, onUpload, initialUrl, className, autoUpload = false, compact = false, onUploadingChange }, ref) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(initialUrl || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      onUploadingChange?.(uploading);
    }, [uploading, onUploadingChange]);

    const [createPresignedUrl] = useMutation(CREATE_PRESIGNED_UPLOAD_URL);

    // Expose upload method to parent
    useImperativeHandle(ref, () => ({
      uploadImage: async () => {
        if (!file) return initialUrl || null;
        return await handleUpload(file);
      },
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      setFile(selectedFile);
      onFileSelect?.(selectedFile);

      // Create preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      // Auto-upload if enabled
      if (autoUpload || onUpload) {
        const uploadedUrl = await handleUpload(selectedFile);
        if (uploadedUrl && onUpload) {
          onUpload(uploadedUrl);
        }
      }
    };

    const handleUpload = async (fileToUpload: File): Promise<string | null> => {
      setUploading(true);

      try {
        // Get presigned URL from backend
        const { data } = await createPresignedUrl({
          variables: { fileType: fileToUpload.type },
        });

        if (!data) {
          throw new Error("Failed to get presigned URL");
        }

        const { uploadUrl, fileUrl } = (data as any).createPresignedUploadUrl;

        // Upload to B2
        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: fileToUpload,
          headers: {
            "Content-Type": fileToUpload.type,
          },
        });

        if (response.ok) {
          setPreview(fileUrl);
          return fileUrl;
        } else {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
      } catch (error: unknown) {
        console.error("Upload failed:", error);
        if (error instanceof Error) {
          toast.error(error.message || "Failed to upload image");
        } else {
          toast.error("An unknown error occurred during upload");
        }
        return null;
      } finally {
        setUploading(false);
      }
    };

    const handleRemove = () => {
      setFile(null);
      setPreview(null);
      onFileSelect?.(null);
      onUpload?.("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleClick = () => {
      fileInputRef.current?.click();
    };

    if (compact) {
      return (
        <div className={cn("inline-block", className)}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          {preview ? (
            <div className="relative w-12 h-12 group">
              <div className="relative w-full h-full overflow-hidden rounded border bg-muted">
                <Image
                  src={preview}
                  alt="Variant"
                  fill
                  className="object-cover"
                  unoptimized={preview.startsWith("data:")}
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                )}
              </div>
              {!uploading && (
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={handleRemove}
                  className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" aria-hidden="true" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClick}
              disabled={uploading}
              className={cn(
                "relative w-12 h-12 rounded border-2 border-dashed",
                "hover:border-primary hover:bg-muted/50 transition-colors",
                "flex items-center justify-center",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                uploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={cn("space-y-4", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {preview ? (
          <div className="relative w-full max-w-xs group">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized={preview.startsWith("data:")}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
            {!uploading && (
              <Button
                type="button"
                aria-label="Remove image"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className={cn(
              "relative w-full max-w-xs aspect-square rounded-lg border-2 border-dashed",
              "hover:border-primary hover:bg-muted/50 transition-colors",
              "flex flex-col items-center justify-center gap-2",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload image</p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
          </button>
        )}
      </div>
    );
  }
);

SingleImageUpload.displayName = "SingleImageUpload";
