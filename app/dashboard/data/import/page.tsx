"use client";

import { useState, useRef } from "react";
import { Upload, FileJson, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

export default function DataImportPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const importData = () => {
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setResult({ success: true, message: "Import completed successfully. 0 items imported." });
      setTimeout(() => setResult(null), 4000);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Import Data</h1>
        <p className="text-sm text-muted-foreground">Import data from other platforms or backups</p>
      </div>

      <div className="glass card-section">
        <h3 className="text-sm font-semibold text-white mb-4">Upload File</h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-[#d8b36a] bg-[#d8b36a]/5" : file ? "border-[#59d499] bg-[#59d499]/5" : "border-white/10 hover:border-white/20"}`}>
          <input ref={inputRef} type="file" accept=".json,.csv,.tsv" onChange={handleFile} className="hidden" />
          {file ? (
            <>
              <CheckCircle size={40} className="mx-auto mb-3 text-[#59d499]" />
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <Upload size={40} className="mx-auto mb-3" style={{ color: "#7b7e84" }} />
              <p className="text-sm text-muted-foreground">Drag and drop a file here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Supports JSON, CSV</p>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className={`glass card-section flex items-center gap-3 ${result.success ? "border-[#59d499]/30" : "border-red-400/30"}`}>
          {result.success ? <CheckCircle size={16} className="text-[#59d499]" /> : <AlertCircle size={16} className="text-red-400" />}
          <p className="text-sm text-white">{result.message}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={importData} disabled={!file || importing}
          className="btn btn-primary px-6 py-2 text-sm">{importing ? "Importing..." : "Import Data"}</button>
      </div>
    </div>
  );
}
