<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Permission Request</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f7f8fa;
      margin: 0;
      padding: 0;
      color: #333;
    }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #eaeaea;
    }

    .header {
      background: #2563eb;
      color: #ffffff;
      text-align: center;
      padding: 24px !important;
    }

    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .content {
      padding: 30px !important;
    }

    .content p {
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 18px;
      color: #444;

    }

    .info-box {
      background-color: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
      margin-bottom: 20px;
    }

    .info-box p {
      margin: 6px 0;
      font-size: 14px;
      color: #333;
    }

    .info-box strong {
      color: #111;
    }

    .button-wrapper {
      text-align: center;
      margin-top: 25px;
    }

    .btn {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      padding: 12px 22px;
      border-radius: 8px;
      font-size: 15px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.3s ease;
    }

    .btn:hover {
      background: #1d4ed8;
    }

    .footer {
      text-align: center;
      padding: 16px;
      font-size: 13px;
      color: #888;
      border-top: 1px solid #eee;
    }

    @media (max-width: 600px) {
      .content {
        padding: 20px;
      }

      .header h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🔔 New Permission Request</h1>
    </div>

    <div class="content">
      <p>Hello Admin,</p>
      <p>
        A store has requested access to an additional permission. Please review
        the details below:
      </p>

      <div class="info-box">
        <p><strong>Store ID:</strong> {{ $requestPermission->store_id }}</p>
        <p><strong>Permission ID:</strong> {{ $requestPermission->permission_id }}</p>
        <p><strong>Status:</strong> {{ ucfirst($requestPermission->status) }}</p>
      </div>

      <div class="button-wrapper">
        <a href="{{ url('/get-extra-permission-request') }}" class="btn">View Request</a>
      </div>

      <p style="margin-top: 25px;">Thank you,<br><strong>{{ config('app.name') }}</strong></p>
    </div>

    <div class="footer">
      &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
    </div>
  </div>
</body>
</html>
