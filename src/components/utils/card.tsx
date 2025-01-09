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
  