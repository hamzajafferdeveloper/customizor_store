<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Permission Approved</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            padding: 30px;
        }

        .container {
            background: white;
            max-width: 600px;
            margin: auto;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        h1 {
            color: #16a34a;
            font-size: 22px;
            margin-bottom: 15px;
        }

        p {
            line-height: 1.6;
        }

        .button {
            display: inline-block;
            padding: 10px 18px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 15px;
        }

        .footer {
            font-size: 12px;
            color: #64748b;
            text-align: center;
            margin-top: 25px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>🎉 Extra Permission Approved</h1>

        <p>Hello <strong>{{ $requestPermission->store->name }}</strong>,</p>

        <p>Your request for the following permission has been approved:</p>

        <p>
            <strong>Permission:</strong> {{ $requestPermission->permission->key }}<br>
            <strong>Description:</strong> {{ $requestPermission->permission->description }}
        </p>

        <p>You can now access this feature in your dashboard.</p>

        <a href="{{ route('store.profile', $requestPermission->store->id) }}" class="button">
            Go to Dashboard
        </a>

        <p class="footer">
            &copy; {{ date('Y') }} {{ config('app.name') }} — All rights reserved.
        </p>
    </div>
</body>

</html>
