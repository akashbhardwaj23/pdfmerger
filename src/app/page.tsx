import Link from 'next/link'
import { FileText, Scissors } from 'lucide-react'
import { Button } from "@/components/ui/button"
import FloatingShape from '@/components/floating'
import { HomeCard } from '@/components/utils/card'

export default function Page() {
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
              <div className="text-2xl font-bold text-indigo-600">PDF Tools</div>
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition duration-200">
                  Login
                </Link>
                <Button asChild variant="outline">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
              Powerful PDF Tools at Your Fingertips
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Merge, split, and manage your PDFs with ease. Fast, secure, and free to use.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/merge">Start Merging</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/split">Try Splitting</Link>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <HomeCard 
              icon={<FileText className="w-6 h-6" />}
              title="PDF Merger"
              description="Combine multiple PDF files into a single document. Perfect for reports, ebooks, or any set of related documents."
              link="/merge"
            />
            <HomeCard 
              icon={<Scissors className="w-6 h-6" />}
              title="PDF Splitter"
              description="Extract pages or split a PDF into multiple files. Ideal for separating chapters or creating smaller, focused documents."
              link="/split"
            />
          </div>
        </main>
      </div>
    </div>
  )
}


