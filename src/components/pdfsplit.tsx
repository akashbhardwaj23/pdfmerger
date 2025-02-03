"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, FileText, Scissors, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

interface PDFFile extends File {
  preview?: string
}

export function PDFSplitter() {
  const [file, setFile] = useState<PDFFile | null>(null)
  const [splitting, setSplitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pageRange, setPageRange] = useState("")
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadPDF = async (file: File) => {
    try {
      setLoading(true)
      setError(null)

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      setPdfDocument(pdf)
      setNumPages(pdf.getPageCount())
      setCurrentPage(1)

      await renderPage(pdf, 1)

      setLoading(false)
    } catch (err) {
      console.error("Error loading PDF:", err)
      setError(`Failed to load PDF: ${err instanceof Error ? err.message : "Unknown error"}`)
      setLoading(false)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const pdfFile = acceptedFiles[0]
        setFile(Object.assign(pdfFile, { preview: URL.createObjectURL(pdfFile) }))
        await loadPDF(pdfFile)
      }
    },
    [loadPDF],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  })

  const removeFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setFile(null)
    setNumPages(0)
    setCurrentPage(1)
    setError(null)
    setPdfDocument(null)
  }

  const renderPage = async (pdf: PDFDocument, pageNum: number) => {
    if (!canvasRef.current) return

    try {
      const page = pdf.getPage(pageNum - 1)
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Unable to get canvas context")
      }

      const { width, height } = page.getSize()
      const scale = 2 
      canvas.width = width * scale
      canvas.height = height * scale
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.save()
      context.scale(scale, scale)

      context.fillStyle = "rgba(255,255,255,0.1)"
      context.fillRect(0, 0, width, height)

      //@ts-ignore
      const svgContent = await page.svg()
      const img = new Image()
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        context.drawImage(img, 0, 0, width, height)
        context.restore()
        URL.revokeObjectURL(url)
      }

      img.src = url
    } catch (err) {
      console.error("Error rendering page:", err)
      setError(`Failed to render page: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const changePage = async (delta: number) => {
    if (!pdfDocument) return

    const newPage = currentPage + delta
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage)
      await renderPage(pdfDocument, newPage)
    }
  }

  const splitPDF = async () => {
    if (!file || !pageRange || !pdfDocument) return

    try {
      setSplitting(true)
      setProgress(0)

      const totalPages = pdfDocument.getPageCount()

      const ranges = pageRange.split(",").map((range) => {
        const [start, end] = range
          .trim()
          .split("-")
          .map((num) => Number.parseInt(num))
        return end ? { start, end } : { start, end: start }
      })

      const validRanges = ranges.filter(
        (range) =>
          !isNaN(range.start) &&
          !isNaN(range.end) &&
          range.start > 0 &&
          range.end > 0 &&
          range.start <= totalPages &&
          range.end <= totalPages &&
          range.start <= range.end,
      )

      if (validRanges.length === 0) {
        throw new Error("Please enter valid page ranges")
      }

      for (let i = 0; i < validRanges.length; i++) {
        const range = validRanges[i]
        const newPdf = await PDFDocument.create()

        for (let j = range.start - 1; j < range.end; j++) {
          const [copiedPage] = await newPdf.copyPages(pdfDocument, [j])
          newPdf.addPage(copiedPage)
        }

        const newPdfBytes = await newPdf.save()
        const blob = new Blob([newPdfBytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        const fileName =
          validRanges.length === 1
            ? `${file.name.replace(".pdf", "")}_split.pdf`
            : `${file.name.replace(".pdf", "")}_part${i + 1}.pdf`

        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setProgress(((i + 1) / validRanges.length) * 100)
      }

      setSplitting(false)
      setProgress(0)
      setError(null)
    } catch (error) {
      console.error("Error splitting PDF:", error)
      setError(error instanceof Error ? error.message : "Failed to split PDF")
      setSplitting(false)
      setProgress(0)
    }
  }

  useEffect(() => {
    return () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
    }
  }, [file])

  return (
    <div className="max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">{isDragActive ? "Drop your PDF here" : "Drag & drop a PDF here"}</p>
            <p className="text-sm text-gray-500 mt-1">or click to select a file</p>
          </div>
        </div>
      </div>

      {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {file && (
        <div className="mt-8">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">{file.name}</span>
              <span className="text-sm text-gray-500">({Math.round(file.size / 1024)} KB)</span>
            </div>
            <button onClick={removeFile} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <div className="relative bg-white p-4 rounded-lg shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <>
                  <canvas ref={canvasRef} className="mx-auto rounded-lg" />
                  {numPages > 0 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                      <Button
                        onClick={() => changePage(-1)}
                        disabled={currentPage <= 1 || loading}
                        size="sm"
                        variant="secondary"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        Page {currentPage} of {numPages}
                      </span>
                      <Button
                        onClick={() => changePage(1)}
                        disabled={currentPage >= numPages || loading}
                        size="sm"
                        variant="secondary"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="pageRange">Page Range</Label>
            <Input
              id="pageRange"
              placeholder="e.g., 1-3, 5, 7-9"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter page numbers or ranges separated by commas (e.g., 1-3, 5, 7-9)
            </p>
          </div>

          {splitting && (
            <div className="mt-6">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-2 text-center">Splitting PDF... {Math.round(progress)}%</p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button onClick={splitPDF} disabled={!file || !pageRange || splitting} className="flex items-center gap-2">
              {splitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
              {splitting ? "Splitting..." : "Split PDF"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

