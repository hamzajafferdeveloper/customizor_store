<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Page Not Found</title>
    @vite(['resources/js/app.jsx'])
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(to bottom, #f9fafb, #ffffff);
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
            position: relative;
        }

        .container {
            text-align: center;
            position: relative;
            padding: 2rem;
            max-width: 600px;
        }

        .background-shape {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.4;
            animation: pulse 4s ease-in-out infinite;
        }

        .shape-blue {
            top: 20%;
            left: 25%;
            width: 160px;
            height: 160px;
            background: #bfdbfe;
        }

        .shape-indigo {
            bottom: 10%;
            right: 25%;
            width: 240px;
            height: 240px;
            background: #c7d2fe;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.1); opacity: 0.6; }
        }

        h1 {
            font-size: 100px;
            font-weight: 900;
            color: #1f2937;
            margin-bottom: 10px;
        }

        p.subtitle {
            font-size: 24px;
            font-weight: 600;
            color: #374151;
            margin: 0;
        }

        p.description {
            color: #6b7280;
            font-size: 16px;
            margin-top: 10px;
            line-height: 1.6;
        }

        a.button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #2563eb;
            color: #fff;
            padding: 12px 24px;
            margin-top: 25px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
            transition: all 0.3s ease;
        }

        a.button:hover {
            background: #1d4ed8;
            transform: scale(1.03);
        }

        a.button svg {
            width: 20px;
            height: 20px;
        }

        .wave {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
        }

        .wave svg {
            width: 100%;
            height: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="background-shape shape-blue"></div>
        <div class="background-shape shape-indigo"></div>

        <h1>404</h1>
        <p class="subtitle">Page Not Found</p>
        <p class="description">
            The page you’re looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div class="wave">
            <svg viewBox="0 0 1440 320">
                <path fill="#3b82f6" fill-opacity="0.08"
                      d="M0,64L48,85.3C96,107,192,149,288,149.3C384,149,480,107,576,80C672,53,768,43,864,53.3C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
        </div>
    </div>
</body>
</html>
