import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { ImagePlus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 10;
/** Same types the API accepts (jpg/jpeg, png, webp). */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ImagePickerProps = {
  id?: string;
  /** Image that is already saved (edit mode). */
  currentUrl?: string | null;
  /** `undefined` = unchanged, `null` = removed, File = newly chosen. */
  file: File | null | undefined;
  onFileChange: (file: File | null | undefined) => void;
  aspect?: "square" | "video";
  /** Allow clearing the image (for optional images). */
  removable?: boolean;
  /** Shown when there is no image, instead of the upload prompt. */
  fallback?: ReactNode;
  invalid?: boolean;
};

/** Preview URL for a newly chosen file, created when the file is picked. */
function usePreviewUrl() {
  const urlRef = useRef<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const setFile = useCallback((file: File | null | undefined) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = file ? URL.createObjectURL(file) : null;
    setUrl(urlRef.current);
  }, []);

  // Free the last preview when the picker unmounts.
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return [url, setFile] as const;
}

export function ImagePicker({
  id,
  currentUrl,
  file,
  onFileChange,
  aspect = "square",
  removable = false,
  fallback,
  invalid,
}: ImagePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [fileUrl, setPreviewFile] = usePreviewUrl();
  const previewUrl =
    file === null ? null : file ? fileUrl : (currentUrl ?? null);

  function change(next: File | null | undefined) {
    setPreviewFile(next);
    onFileChange(next);
  }

  function accept(candidate: File | undefined) {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError("File harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran gambar maksimal ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError(null);
    change(candidate);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files[0]);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        aria-invalid={invalid || Boolean(error) || undefined}
        onChange={(event) => {
          accept(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden rounded-[24px] bg-muted",
          aspect === "square" ? "aspect-square" : "aspect-video",
          (invalid || error) && "ring-2 ring-destructive/40",
          dragging && "ring-2 ring-primary",
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Pratinjau gambar"
            className="size-full object-cover"
          />
        ) : fallback ? (
          fallback
        ) : (
          <button
            type="button"
            onClick={openPicker}
            className="flex size-full flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-primary/40 p-4 text-center outline-none hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex size-12 items-center justify-center rounded-[16px] bg-tint-amber text-primary-foreground">
              <ImagePlus aria-hidden className="size-5" />
            </span>
            <span className="text-sm font-bold text-foreground">
              Pilih atau seret gambar
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, atau WebP · maks. {MAX_SIZE_MB} MB
            </span>
          </button>
        )}
      </div>

      {(previewUrl || fallback) && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={openPicker}
            className="h-9 rounded-full border-0 px-4 font-bold"
          >
            {previewUrl ? <RefreshCw aria-hidden /> : <ImagePlus aria-hidden />}
            {previewUrl ? "Ganti gambar" : "Pilih gambar"}
          </Button>
          {removable && previewUrl && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => change(currentUrl ? null : undefined)}
              className="h-9 rounded-full px-4 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <X aria-hidden />
              Hapus gambar
            </Button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
