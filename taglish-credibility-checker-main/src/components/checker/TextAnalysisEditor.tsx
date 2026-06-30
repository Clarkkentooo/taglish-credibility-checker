"use client";

import { Eye, EyeOff, FileText, ImageUp, RotateCcw, Trash2, Type } from "lucide-react";
import { type DragEvent, type ChangeEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { countWords } from "@/lib/utils";
import { InlineHighlightedText } from "@/components/results/InlineHighlightedText";
import type { AnalysisResult } from "@/types/analysis";

export function TextAnalysisEditor({
  value,
  onChange,
  onAnalyze,
  onImageAnalyze,
  onLoadSample,
  onClear,
  loading,
  result,
}: {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onImageAnalyze: (base64Image: string, mimeType: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
  loading: boolean;
  result?: AnalysisResult | null;
}) {
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  const [highlightMode, setHighlightMode] = useState<"before" | "after">("after");
  const fileRef = useRef<HTMLInputElement>(null);
  const words = useMemo(() => countWords(value), [value]);
  const tooShort = value.trim().length > 0 && value.trim().length < 50;

  function handleFile(file: File) {
    const isImage = file.type.startsWith("image/");
    const isTxt = file.name.endsWith(".txt");
    const isDocx = file.name.endsWith(".docx");
    if (inputMode === "image" && isImage) {
      setUploadMessage(`Reading ${file.name}…`);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // dataUrl = "data:<mimeType>;base64,<data>"
        const base64 = dataUrl.split(",")[1] ?? "";
        onImageAnalyze(base64, file.type);
        setUploadMessage("");
      };
      reader.readAsDataURL(file);
      return;
    }
    if (!isTxt && !isDocx) {
      setUploadMessage("Unsupported file. Use .txt or .docx.");
      return;
    }
    setUploadMessage("Document received. Parser is mocked in this frontend demo.");
    if (isTxt) {
      void file.text().then((content) => onChange(content));
      return;
    }
    onChange(`${brand.sampleText}\n\n[Mocked content extracted from ${file.name}]`);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-white p-5" aria-labelledby="editor-heading">
      <div className="flex flex-col items-center gap-3 text-center">
        <div>
          <h1 id="editor-heading" className="text-3xl font-black tracking-[0.015em]">Check Taglish content</h1>
          <p className="mt-1 text-sm text-muted">Paste election-related content or upload text/image material for a mock OCR-ready flow.</p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-fit rounded-full border border-border bg-white p-1" role="tablist" aria-label="Input type">
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === "text"}
            onClick={() => setInputMode("text")}
            className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${inputMode === "text" ? "bg-ink text-white" : "text-muted hover:bg-canvas hover:text-ink"}`}
          >
            <Type className="mr-2 h-4 w-4" aria-hidden="true" />
            Text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === "image"}
            onClick={() => setInputMode("image")}
            className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${inputMode === "image" ? "bg-ink text-white" : "text-muted hover:bg-canvas hover:text-ink"}`}
          >
            <ImageUp className="mr-2 h-4 w-4" aria-hidden="true" />
            Image
          </button>
        </div>
        {result ? (
          <div className="flex rounded-full border border-border bg-white p-1" aria-label="Highlight mode">
            <button
              type="button"
              onClick={() => setHighlightMode("before")}
              className={`inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold transition-colors ${highlightMode === "before" ? "bg-ink text-white" : "text-muted hover:bg-canvas hover:text-ink"}`}
            >
              <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
              Before
            </button>
            <button
              type="button"
              onClick={() => setHighlightMode("after")}
              className={`inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold transition-colors ${highlightMode === "after" ? "bg-ink text-white" : "text-muted hover:bg-canvas hover:text-ink"}`}
            >
              <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
              After
            </button>
          </div>
        ) : null}
      </div>
      {inputMode === "text" ? (
        <>
          <div className="relative mt-4">
            <div className="absolute right-4 top-4 z-10 flex flex-wrap justify-end gap-2">
              <Button variant="secondary" className="min-h-9 px-3 py-1.5" onClick={onLoadSample}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Load sample
              </Button>
              <Button variant="ghost" className="min-h-9 px-3 py-1.5" onClick={onClear} disabled={!value && !result}>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            </div>
            {result && highlightMode === "after" ? (
              <InlineHighlightedText
                text={value}
                spans={result.highlightedSpans}
                onChange={onChange}
                className="min-h-[360px] w-full rounded-[1.5rem] border border-border bg-white p-5 pt-16 text-ink"
              />
            ) : (
              <textarea
                aria-describedby="editor-help editor-count"
                className="min-h-[360px] w-full resize-y rounded-[1.5rem] border border-border bg-white p-5 pt-16 leading-7 text-ink transition placeholder:text-muted focus:border-primary"
                placeholder="Paste a Taglish election-related post, caption, or thread excerpt..."
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onPaste={(event) => {
                  event.preventDefault();
                  const plain = event.clipboardData.getData("text/plain");
                  onChange(plain);
                }}
                readOnly={Boolean(result && highlightMode === "before")}
              />
            )}
          </div>
        </>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-4 grid min-h-[360px] place-items-center rounded-[1.5rem] border border-dashed p-6 text-center transition ${dragging ? "border-primary bg-white/70" : "border-white/80 bg-white/45"}`}
        >
          <div>
            <ImageUp className="mx-auto h-9 w-9 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">Upload an image with text</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">Drag a screenshot or social media image here. The text will be extracted and analyzed automatically.</p>
            <Button variant="secondary" className="mt-5" onClick={() => fileRef.current?.click()} disabled={loading}>
              {loading ? "Analyzing…" : "Choose image"}
            </Button>
            {uploadMessage ? <p className="mt-3 text-sm text-primary" role="status">{uploadMessage}</p> : null}
          </div>
        </div>
      )}
      <div id="editor-count" className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>{words} words · {value.length} characters</span>
        <span id="editor-help">{tooShort ? "Add more context for a clearer estimate." : "Minimum guidance: aim for at least 50 characters."}</span>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-4 rounded-[1.25rem] border border-dashed p-4 text-sm transition ${dragging ? "border-primary bg-white/70" : "border-white/80 bg-white/45"}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ImageUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-xs text-muted">Attach `.txt` or `.docx` files. Document parsing is mocked for now.</p>
          </div>
          <input ref={fileRef} type="file" accept={inputMode === "image" ? "image/*" : ".txt,.docx"} className="sr-only" onChange={onFileChange} aria-label="Upload file" />
          <Button variant="secondary" className="whitespace-nowrap" onClick={() => fileRef.current?.click()}>
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            Upload file
          </Button>
        </div>
        {uploadMessage ? <p className="mt-3 text-sm text-primary" role="status">{uploadMessage}</p> : null}
      </div>
      <div className="mt-5 flex justify-center">
        <Button onClick={onAnalyze} disabled={loading || value.trim().length < 50} className="w-full sm:w-auto sm:min-w-56">
          {loading ? "Analyzing..." : "Run suspiciousness check"}
        </Button>
      </div>
    </section>
  );
}
