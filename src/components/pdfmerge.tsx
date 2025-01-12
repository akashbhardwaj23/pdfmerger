'use client'

import { useState, useCallback, DragEvent } from 'react'
import { useDropzone } from 'react-dropzone'
import { PDFDocument } from 'pdf-lib'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { X, FileText, ArrowDown, Loader2, GripVertical } from 'lucide-react'

interface PDFFile extends File {
  preview?: string
}

export function PDFMerger() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [merging, setMerging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => 
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      )
    ])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  })

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles]
      URL.revokeObjectURL(newFiles[index].preview as string)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const mergePDFs = async () => {
    if (files.length < 2) return

    try {
      setMerging(true)
      setProgress(0)

      const mergedPdf = await PDFDocument.create()
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileArrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(fileArrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page)
        })
        setProgress(((i + 1) / files.length) * 100)
      }

      const mergedPdfFile = await mergedPdf.save()
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'merged-document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setMerging(false)
      setProgress(0)
    } catch (error) {
      console.error('Error merging PDFs:', error)
      setMerging(false)
      setProgress(0)
    }
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
    e.currentTarget.style.opacity = '0.4'
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.add('bg-gray-100')
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-gray-100')
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-gray-100')
    if (draggedItem === null) return

    const newFiles = [...files]
    const [reorderedItem] = newFiles.splice(draggedItem, 1)
    newFiles.splice(index, 0, reorderedItem)
    setFiles(newFiles)
    setDraggedItem(null)
  }

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1'
    setDraggedItem(null)
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
              {isDragActive ? 'Drop your PDFs here' : 'Drag & drop PDFs here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select files
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <div className="space-y-4">
            {files.map((file, index) => (
              <div
                key={file.name + index}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e)}
                onDragEnter={(e) => handleDragEnter(e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {merging && (
            <div className="mt-6">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Merging PDFs... {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              onClick={mergePDFs}
              disabled={files.length < 2 || merging}
              className="flex items-center gap-2"
            >
              {merging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {merging ? 'Merging...' : 'Merge PDFs'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

