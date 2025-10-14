<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Not Found</title>
    @vite(['resources/js/app.jsx'])
</head>
<body>
    <div class="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white text-center px-6 overflow-hidden">
    <!-- Subtle floating shapes -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
        <div class="absolute top-20 left-1/4 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div class="absolute bottom-10 right-1/4 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
    </div>

    <!-- Big 404 Text -->
    <h1 class="text-[90px] md:text-[120px] font-extrabold text-gray-800 leading-none tracking-tight">404</h1>

    <!-- Subtitle -->
    <p class="mt-4 text-2xl font-semibold text-gray-700">Page Not Found</p>

    <!-- Description -->
    <p class="mt-2 text-gray-500 max-w-md">
        The page you’re looking for might have been removed, had its name changed, or is temporarily unavailable.
    </p>

    <!-- Back to Home Button -->
    <div class="mt-8">
        <a href="{{ url('/') }}"
           class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v8m0 0H7m6 0h6" />
            </svg>
            Back to Homepage
        </a>
    </div>

    <!-- Decorative Wave -->
    <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 320" class="w-full h-32">
            <path fill="#3b82f6" fill-opacity="0.08"
                  d="M0,64L48,85.3C96,107,192,149,288,149.3C384,149,480,107,576,80C672,53,768,43,864,53.3C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    </div>
</div>

</body>
</html>
