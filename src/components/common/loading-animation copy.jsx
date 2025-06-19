"use client";

export const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      <div className="relative">
        {/* Road */}
        <div className="absolute bottom-2 w-full h-2 bg-yellow-200 dark:bg-yellow-900/30 rounded-full animate-pulse"></div>

        {/* Bus */}
        <div className="relative animate-drive transform-gpu">
          <div className="w-32 h-16 bg-yellow-500 rounded-lg relative">
            {/* Windows */}
            <div className="absolute top-2 left-16 right-2 h-6 bg-sky-200 dark:bg-sky-400/30 rounded-lg grid grid-cols-3 gap-1 p-1">
              <div className="bg-sky-100 dark:bg-sky-300/30 rounded"></div>
              <div className="bg-sky-100 dark:bg-sky-300/30 rounded"></div>
              <div className="bg-sky-100 dark:bg-sky-300/30 rounded"></div>
            </div>
            {/* Front window */}
            <div className="absolute top-2 left-2 w-12 h-6 bg-sky-200 dark:bg-sky-400/30 rounded-lg"></div>
            {/* Wheels */}
            <div className="absolute -bottom-2 left-4 w-6 h-6 bg-zinc-700 rounded-full border-4 border-zinc-800 animate-spin"></div>
            <div className="absolute -bottom-2 right-4 w-6 h-6 bg-zinc-700 rounded-full border-4 border-zinc-800 animate-spin"></div>
          </div>
        </div>

        {/* Smoke animation */}
        <div className="absolute -left-4 bottom-6 space-y-2">
          <div className="w-3 h-3 bg-zinc-200 dark:bg-zinc-600 rounded-full animate-smoke-1 opacity-0"></div>
          <div className="w-3 h-3 bg-zinc-200 dark:bg-zinc-600 rounded-full animate-smoke-2 opacity-0"></div>
          <div className="w-3 h-3 bg-zinc-200 dark:bg-zinc-600 rounded-full animate-smoke-3 opacity-0"></div>
        </div>
      </div>
      <p className="mt-8 text-lg font-medium text-yellow-600 dark:text-yellow-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
};
