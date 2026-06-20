"use client";

import { FileText, ImageUp, RotateCcw, Trash2 } from "lucide-react";
import { type DragEvent, type ChangeEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";
import { countWords } from "@/lib/utils";

export function TextAnalysisEditor({
  value,
  onChange,
  onAnalyze,
  loading,
}: {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}) {
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const words = useMemo(() => countWords(value), [value]);
  const tooShort = value.trim().length > 0 && value.trim().length < 50;

  function handleFile(file: File) {
    const isImage = file.type.startsWith("image/");
    const isTxt = file.name.endsWith(".txt");
    const isDocx = file.name.endsWith(".docx");
    if (!isImage && !isTxt && !isDocx) {
      setUploadMessage("Unsupported file. Use .txt, .docx, or an image.");
      return;
    }
    setUploadMessage(isImage ? "Image received. OCR is mocked in this frontend demo." : "Document received. Parser is mocked in this frontend demo.");
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
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm" aria-labelledby="editor-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 id="editor-heading" className="text-2xl font-bold">Analyze Taglish content</h1>
          <p className="mt-1 text-sm text-muted">Paste election-related content or upload text/image material for a mock OCR-ready flow.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => onChange(brand.sampleText)}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Load sample
          </Button>
          <Button variant="ghost" onClick={() => onChange("")} disabled={!value}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Clear
          </Button>
        </div>
      </div>
      <textarea
        aria-describedby="editor-help editor-count"
        className="mt-4 min-h-[320px] w-full resize-y rounded-xl border border-border bg-canvas p-4 leading-7 text-ink shadow-inner transition placeholder:text-muted focus:border-primary"
        placeholder="Paste a Taglish election-related post, caption, or thread excerpt..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div id="editor-count" className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
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
        className={`mt-4 rounded-xl border border-dashed p-4 text-sm transition ${dragging ? "border-primary bg-primary/5" : "border-border bg-canvas"}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ImageUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-muted">Drop `.txt`, `.docx`, or image files here. Image OCR is mocked for now.</p>
          </div>
          <input ref={fileRef} type="file" accept=".txt,.docx,image/*" className="sr-only" onChange={onFileChange} aria-label="Upload file" />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
            Upload file
          </Button>
        </div>
        {uploadMessage ? <p className="mt-3 text-sm text-primary" role="status">{uploadMessage}</p> : null}
      </div>
      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-border bg-surface p-4 sm:static sm:border-0 sm:p-0">
        <Button onClick={onAnalyze} disabled={loading || value.trim().length < 50} className="w-full sm:w-auto">
          {loading ? "Analyzing..." : "Analyze credibility"}
        </Button>
      </div>
    </section>
  );
}
