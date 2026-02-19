import { useNavigate } from "react-router-dom";

interface ModeCardProps {
  title: string;
  icon: string;
  description: string;
  features: string[];
  route: string;
  color: string;
}

function ModeCard({ title, icon, description, features, route, color }: ModeCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(route)}
      className={`cursor-pointer p-6 rounded-lg border-2 ${color} bg-white dark:bg-gray-800 transition-all hover:shadow-lg hover:scale-105`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{icon}</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <span className="text-green-500 mt-0.5">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingPage() {
  const modes: ModeCardProps[] = [
    {
      title: "Practice Mode",
      icon: "🎯",
      description: "Learn chess openings through interactive practice",
      features: [
        "Play through opening moves step by step",
        "Get instant feedback on your moves",
        "Learn both white and black sides",
        "Build muscle memory for key positions",
      ],
      route: "/practice",
      color: "border-blue-300 dark:border-blue-700",
    },
    {
      title: "Explore Mode",
      icon: "🔍",
      description: "Freely explore opening variations and branches",
      features: [
        "Navigate backward and forward through moves",
        "Try different variations and branches",
        "Click-to-move for easy exploration",
        "See all possible moves at each position",
      ],
      route: "/explore",
      color: "border-purple-300 dark:border-purple-700",
    },
    {
      title: "Search",
      icon: "🔎",
      description: "Find specific openings by name or code",
      features: [
        "Search by opening name or ECO code",
        "Browse through 3000+ chess openings",
        "Filter and find variations quickly",
        "Start practicing from search results",
      ],
      route: "/search",
      color: "border-green-300 dark:border-green-700",
    },
    {
      title: "Sight Training",
      icon: "🎯",
      description: "Train board vision by clicking the correct target square",
      features: [
        "Level 1: click the announced square instantly",
        "Level 2: random position + SAN move challenge",
        "Build fast square recognition",
        "Improve SAN-to-board translation speed",
      ],
      route: "/sight-training",
      color: "border-indigo-300 dark:border-indigo-700",
    },
    {
      title: "Popular Openings",
      icon: "⭐",
      description: "Study the most common and important openings",
      features: [
        "Curated list of popular openings",
        "Sorted by frequency in master games",
        "Focus on what matters most",
        "Perfect for beginners and intermediate players",
      ],
      route: "/popular",
      color: "border-yellow-300 dark:border-yellow-700",
    },
    {
      title: "Favourites",
      icon: "❤️",
      description: "Access your saved openings for quick practice",
      features: [
        "Save openings you want to master",
        "Quick access to your repertoire",
        "Track your study progress",
        "Build your personal opening collection",
      ],
      route: "/favourites",
      color: "border-red-300 dark:border-red-700",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Chess Openings Trainer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Master chess openings with interactive practice, exploration tools, and a comprehensive database of 3000+ openings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {modes.map((mode) => (
          <ModeCard key={mode.route} {...mode} />
        ))}
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Getting Started
        </h3>
        <ol className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[1.5rem]">1.</span>
            <span>Choose a mode above to start learning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[1.5rem]">2.</span>
            <span>Select an opening from the list or search for one</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[1.5rem]">3.</span>
            <span>Practice by making moves on the board or use click-to-move</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[1.5rem]">4.</span>
            <span>Save your favorite openings for quick access later</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
