<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Store Access - {{ config('app.name') }}</title>
    <style>
        body {
            background-color: #f3f4f6;
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px 0;
            color: #111827;
        }
        .email-container {
            max-width: 600px;
            background: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }
        .email-header {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: #fff !important;

            text-align: center;
            padding: 40px 20px;
        }
        .email-header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }
        .email-body {
            padding: 35px;
        }
        .email-body h2 {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .email-body p {
            color: #374151;
            line-height: 1.6;
            margin-bottom: 20px;
            font-size: 15px;
        }
        .panel {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 18px 24px;
            margin: 20px 0;
        }
        .panel strong {
            display: block;
            color: #111827;
            font-size: 15px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            margin-top: 15px;
            transition: background 0.3s ease;
        }
        .button:hover {
            background: linear-gradient(135deg, #4338ca, #4f46e5);
        }
        .footer {
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            padding: 25px 20px;
            border-top: 1px solid #e5e7eb;
            background-color: #fafafa;
        }
        .footer a {
            color: #4f46e5;
            text-decoration: none;
        }
        .store-badge {
            display: inline-block;
            background: #eef2ff;
            color: #4338ca;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1 style="color: #ffffff">🎉 Welcome to {{ config('app.name') }}</h1>
        </div>

        <div class="email-body">
            <p>Hi <strong>{{ $user->name }}</strong>,</p>
            <p>You’ve been granted access to a store on <strong>{{ config('app.name') }}</strong>! Below is your temporary password — please change it after your first login for security reasons.</p>

            <div class="store-badge">Store Access Granted</div>

            <h2>🔐 Your Temporary Password</h2>
            <div class="panel">
                <strong>Password:</strong> {{ $password }}
            </div>

            {{-- <a href="{{ url('/login') }}" class="button">Login to Store</a> --}}
        </div>

        <div class="footer">
            {{-- <p>Need help? <a href="{{ url('/support') }}">Contact our support team</a>.</p> --}}
            <p>Thanks, <br><strong>The {{ config('app.name') }} Team</strong></p>
            <p style="margin-top:10px;">&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
