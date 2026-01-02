export function Footer() {
  return (
    <footer className="min-w-[320px] p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Developed by <span className="font-medium text-gray-800 dark:text-gray-200">Mátyás Budavári</span>
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Source code on{' '}
            <a
              href="https://github.com/budavariam/chess-openings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
          </p>
          <span className="hidden sm:inline">•</span>
          <p>
            <a
              href="/chess-openings/storybook/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Component Docs
            </a>
          </p>
        </div>
        <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} All rights reserved
        </p>
      </div>
    </footer>
  );
}
