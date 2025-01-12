import { ChevronRight, Link } from "lucide-react";

export function FeatureCard({ icon, title, description } : {icon : any, title : string, description : string}) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    )
  }
  

  
export function HomeCard({ icon, title, description, link } : { icon : any, title : string, description : string, link : string}) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
              {icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
          <p className="text-gray-600 mb-4">{description}</p>
          <Link href={link} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
            Get Started <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    )
  }