import Link from 'next/link'
import { PDFMerger } from "@/components/pdfmerge"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold text-red-500">PDF Merger</div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/signup" className="text-gray-600 hover:text-gray-900 font-semibold">
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Merge PDF files in seconds
          </h1>
          <p className="text-xl text-gray-600">
            Combine multiple PDFs into one file for free. Drag and drop your files below to get started.
          </p>
        </div>
        <PDFMerger />
      </main>
    </div>
  )
}
