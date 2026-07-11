"use client";

import { Eye, EyeOff, FileText, ImageUp, RotateCcw, Trash2, Type } from "lucide-react";
import { type DragEvent, type ChangeEvent, useMemo, useRef, useState } from "react";
import { OverflowActions } from "@/components/beui/overflow-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/beui/tabs";
import { brand } from "@/config/brand";
import { cn, countWords } from "@/lib/utils";
import { InlineHighlightedText } from "@/components/results/InlineHighlightedText";
import type { AnalysisResult } from "@/types/analysis";

export function TextAnalysisEditor({
  value,
  onChange,
  onAnalyze,
  onLoadSample,
  loading,
  result,
}: {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onLoadSample: () => void;
  loading: boolean;
  result?: AnalysisResult | null;
}) {
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  const [highlightMode, setHighlightMode] = useState<"before" | "after">("after");
  const [actionsOpen, setActionsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const words = useMemo(() => countWords(value), [value]);
  const tooShort = value.trim().length > 0 && value.trim().length < 50;
  const uploadAccept = inputMode === "image" ? "image/*" : ".txt,.docx";
  const uploadDescription =
    inputMode === "image"
      ? "Attach an image file with readable text. OCR is mocked for now."
      : "Attach `.txt` or `.docx` files. Document parsing is mocked for now.";
  const UploadIcon = inputMode === "image" ? ImageUp : FileText;

  function handleFile(file: File) {
    const isImage = file.type.startsWith("image/");
    const isTxt = file.name.endsWith(".txt");
    const isDocx = file.name.endsWith(".docx");
    if (inputMode === "image" && isImage) {
      setUploadMessage("Image received. OCR is mocked in this frontend demo.");
      onChange(`${brand.sampleText}\n\n[Mocked content extracted from ${file.name}]`);
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
    <section className="rounded-[1.75rem] border border-border/70 bg-white p-4 sm:p-5" aria-labelledby="editor-heading">
      <div className="flex flex-col items-center gap-3 text-center">
        <div>
          <h1 id="editor-heading" className="text-2xl font-black tracking-[0.015em] sm:text-3xl">Check Taglish content</h1>
          <p className="mt-1 text-sm text-muted">Paste election-related content or import a document/image for a mock OCR-ready flow.</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-between">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Tabs value={inputMode} onValueChange={(next) => setInputMode(next as "text" | "image")}>
            <TabsList aria-label="Input type">
              <TabsTrigger value="text" className="min-h-10 px-3 sm:px-4">
                <Type className={cn("h-4 w-4", inputMode === "text" ? "mr-2" : "sm:mr-2")} aria-hidden="true" />
                <span className={cn(inputMode !== "text" && "sr-only sm:not-sr-only")}>Text</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="min-h-10 px-3 sm:px-4">
                <ImageUp className={cn("h-4 w-4", inputMode === "image" ? "mr-2" : "sm:mr-2")} aria-hidden="true" />
                <span className={cn(inputMode !== "image" && "sr-only sm:not-sr-only")}>Image</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {result ? (
            <Tabs value={highlightMode} onValueChange={(next) => setHighlightMode(next as "before" | "after")}>
              <TabsList aria-label="Highlight mode">
                <TabsTrigger value="before" className="min-h-10 px-3 sm:px-4">
                  <EyeOff className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Before</span>
                </TabsTrigger>
                <TabsTrigger value="after" className="min-h-10 px-3 sm:px-4">
                  <Eye className="h-4 w-4 sm:mr-2" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">After</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}
        </div>
        <div className="sm:hidden">
          <OverflowActions
            expanded={actionsOpen}
            onExpandedChange={setActionsOpen}
            primaryActions={[
              {
                id: "load-sample",
                label: "Sample",
                icon: <RotateCcw className="h-4 w-4" aria-hidden="true" />,
                onClick: onLoadSample,
                ariaLabel: "Load sample",
              },
            ]}
            overflowActions={[
              {
                id: "clear",
                label: "Clear",
                icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
                onClick: () => onChange(""),
                disabled: !value,
                ariaLabel: "Clear",
              },
              {
                id: "upload",
                label: inputMode === "image" ? "Image" : "File",
                icon: <UploadIcon className="h-4 w-4" aria-hidden="true" />,
                onClick: () => fileRef.current?.click(),
                ariaLabel: inputMode === "image" ? "Upload image" : "Upload file",
              },
            ]}
          />
        </div>
      </div>
      {inputMode === "text" ? (
        <>
          <div className="relative mt-4">
            <div className="absolute right-4 top-4 z-10 hidden flex-wrap justify-end gap-2 sm:flex">
              <Button variant="secondary" className="min-h-9 px-3 py-1.5" onClick={onLoadSample}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Load sample
              </Button>
              <Button variant="ghost" className="min-h-9 px-3 py-1.5" onClick={() => onChange("")} disabled={!value}>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            </div>
            {result && highlightMode === "after" ? (
              <InlineHighlightedText
                text={value}
                spans={result.highlightedSpans}
                onChange={onChange}
                className="max-h-[300px] min-h-[240px] w-full overflow-y-auto rounded-[1.5rem] border border-border bg-white p-5 pt-5 text-ink sm:max-h-none sm:min-h-[360px] sm:pt-16"
              />
            ) : (
              <textarea
                aria-describedby="editor-help editor-count"
                className="max-h-[300px] min-h-[240px] w-full resize-y rounded-[1.5rem] border border-border bg-white p-5 pt-5 leading-7 text-ink transition placeholder:text-muted focus:border-primary sm:max-h-none sm:min-h-[360px] sm:pt-16"
                placeholder="Paste a Taglish election-related post, caption, or thread excerpt..."
                value={value}
                onChange={(event) => onChange(event.target.value)}
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
          className={`mt-4 grid min-h-[240px] place-items-center rounded-[1.5rem] border border-dashed p-5 text-center transition sm:min-h-[360px] sm:p-6 ${dragging ? "border-primary bg-white/70" : "border-white/80 bg-white/45"}`}
        >
          <div>
            <ImageUp className="mx-auto h-9 w-9 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">Upload an image with text</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">Drag a screenshot or social media image here. OCR is mocked for now, but the interface is ready for backend extraction.</p>
            <Button variant="secondary" className="mt-5" onClick={() => fileRef.current?.click()}>
              Choose image
            </Button>
          </div>
        </div>
      )}
      <div id="editor-count" className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>{words} words - {value.length} characters</span>
        <span id="editor-help">{tooShort ? "Add more context for a clearer estimate." : "Minimum guidance: aim for at least 50 characters."}</span>
      </div>
      <div className="mt-4 flex justify-center sm:mt-5">
        <Button onClick={onAnalyze} disabled={loading || value.trim().length < 50} className="w-full sm:w-auto sm:min-w-56">
          {loading ? "Analyzing..." : "Run suspiciousness check"}
        </Button>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-4 hidden rounded-[1.25rem] border border-dashed p-4 text-sm transition sm:block ${dragging ? "border-primary bg-white/70" : "border-white/80 bg-white/45"}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <UploadIcon className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-xs text-muted">{uploadDescription}</p>
          </div>
          <input ref={fileRef} type="file" accept={uploadAccept} className="sr-only" onChange={onFileChange} aria-label={inputMode === "image" ? "Upload image" : "Upload document"} />
          <Button variant="secondary" className="whitespace-nowrap" onClick={() => fileRef.current?.click()}>
            <UploadIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {inputMode === "image" ? "Upload image" : "Upload file"}
          </Button>
        </div>
        {uploadMessage ? <p className="mt-3 text-sm text-primary" role="status">{uploadMessage}</p> : null}
      </div>
    </section>
  );
}
