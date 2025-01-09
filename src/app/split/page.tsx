import { PDFSplitter } from "@/components/pdfsplit"
import FloatingShape from "@/components/floating"
import Link from 'next/link'
import { ChevronLeft, Scissors, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { FeatureCard } from "@/components/utils/card"

export default function SplitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-100 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <FloatingShape color="#818cf8" top="10%" left="5%" size={60} duration={15} />
        <FloatingShape color="#34d399" top="20%" right="10%" size={80} duration={20} />
        <FloatingShape color="#fbbf24" bottom="15%" left="10%" size={70} duration={18} />
        <FloatingShape color="#f472b6" bottom="20%" right="5%" size={50} duration={13} />
      </div>
      
      <div className="relative z-10">
        <header className="border-b bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-indigo-600 flex items-center">
                <ChevronLeft className="w-6 h-6 mr-2" />
                PDF Tools
              </Link>
              <Button variant="outline" asChild>
                <Link href="/merge">Try Merging</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
              Split PDF
            </h1>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 animate-fade-in">
              <div className="flex items-start mb-4">
                <Info className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  Extract specific pages or split your PDF into multiple files. Upload your PDF, specify the page ranges you want to extract, and click "Split PDF" to create your new documents.
                </p>
              </div>
              <PDFSplitter />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard
                icon={<Scissors className="w-6 h-6" />}
                title="Precise Splitting"
                description="Split your PDF by specifying exact page ranges or individual pages."
              />
              <FeatureCard
                icon={<Scissors className="w-6 h-6" />}
                title="Multiple Outputs"
                description="Create multiple PDF files from a single source document in one operation."
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
