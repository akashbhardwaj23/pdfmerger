'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, FileText, Scissors, Loader2 } from 'lucide-react'

interface PDFFile extends File {
  preview?: string
}

export function PDFSplitter() {
  const [file, setFile] = useState<PDFFile | null>(null)
  const [splitting, setSplitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pageRange, setPageRange] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0])
      }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const removeFile = () => {
    if (file) {
      URL.revokeObjectURL(file.preview as string)
    }
    setFile(null)
  }

  const splitPDF = async () => {
    if (!file || !pageRange) return

    try {
      setSplitting(true)
      setProgress(0)

      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Find all occurrences of "stream" and "endstream" in the PDF
      const streamPositions = findAllOccurrences(uint8Array, stringToUint8Array('stream'))
      const endstreamPositions = findAllOccurrences(uint8Array, stringToUint8Array('endstream'))

      if (streamPositions.length !== endstreamPositions.length) {
        throw new Error('Invalid PDF structure')
      }

      const ranges = pageRange.split(',').map(range => range.trim().split('-').map(Number))
      const validRanges = ranges.filter(range => range.every(num => !isNaN(num) && num > 0 && num <= streamPositions.length))

      for (let i = 0; i < validRanges.length; i++) {
        const range = validRanges[i]
        const start = range[0] - 1
        const end = range[1] ? range[1] - 1 : start

        // Create a new PDF with the selected pages
        const newPdfParts = [
          stringToUint8Array('%PDF-1.7\n'),
        ]

        for (let j = start; j <= end; j++) {
          const pageContent = uint8Array.slice(streamPositions[j], endstreamPositions[j] + 9)
          newPdfParts.push(pageContent)
        }

        // Add a simple PDF trailer
        newPdfParts.push(stringToUint8Array('\n%%EOF\n'))

        // Combine all parts into a single Uint8Array
        const newPdfUint8Array = concatenateUint8Arrays(newPdfParts)

        // Create a blob and download the new PDF
        const blob = new Blob([newPdfUint8Array], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `split_${i + 1}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setProgress(((i + 1) / validRanges.length) * 100)
      }

      setSplitting(false)
      setProgress(0)
    } catch (error) {
      console.error('Error splitting PDF:', error)
      setSplitting(false)
      setProgress(0)
    }
  }

  // Helper function to find all occurrences of a subarray in a Uint8Array
  function findAllOccurrences(array: Uint8Array, subarray: Uint8Array): number[] {
    const positions: number[] = []
    for (let i = 0; i < array.length; i++) {
      if (array.slice(i, i + subarray.length).every((value, index) => value === subarray[index])) {
        positions.push(i)
      }
    }
    return positions
  }

  // Helper function to convert a string to a Uint8Array
  function stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str)
  }

  // Helper function to concatenate multiple Uint8Arrays
  function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((acc, array) => acc + array.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const array of arrays) {
      result.set(array, offset)
      offset += array.length
    }
    return result
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select a file
            </p>
          </div>
        </div>
      </div>

      {file && (
        <div className="mt-8">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">{file.name}</span>
              <span className="text-sm text-gray-500">
                ({Math.round(file.size / 1024)} KB)
              </span>
            </div>
            <button
              onClick={removeFile}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
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
              <p className="text-sm text-gray-500 mt-2 text-center">
                Splitting PDF... {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              onClick={splitPDF}
              disabled={!file || !pageRange || splitting}
              className="flex items-center gap-2"
            >
              {splitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Scissors className="w-4 h-4" />
              )}
              {splitting ? 'Splitting...' : 'Split PDF'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

