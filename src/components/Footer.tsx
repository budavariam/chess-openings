export function Footer() {
  return (
    <footer className="min-w-[320px] p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
        <a
          href="https://github.com/budavariam/chess-openings"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          GitHub
        </a>
        <span className="hidden sm:inline">•</span>
        <a
          href="/chess-openings/storybook/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Storybook
        </a>
      </div>
    </footer>
  );
}
