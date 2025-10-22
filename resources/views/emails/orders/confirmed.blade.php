<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Order Confirmation</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin:0; padding:0;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

                    {{-- Header --}}
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: #8D35E3; color: #ffffff;">
                            <h1 style="margin:0; font-size:24px; color: #ffffff;">Hi {{ $order->name }},</h1>
                            <p style="margin:5px 0 0 0; font-size:16px;">Thank you for your order! Your payment has been
                                successfully received.</p>
                        </td>
                    </tr>

                    {{-- Order Summary --}}
                    <tr>
                        <td style="padding: 20px;">

                            {{-- Header --}}
                            <h2 style="font-size:20px; margin-bottom:15px; color:#333; text-align:center;">Order Summary
                            </h2>

                            {{-- Uploaded SVG/Image --}}
                            @if ($order->file)
                                <div style="text-align:center; margin-bottom:20px;">
                                    <img src="{{ asset('storage/' . $order->file) }}" alt="Order File"
                                        style="max-width:100%; height:auto; border:1px solid #ddd; border-radius:6px; padding:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                                </div>
                            @endif

                            {{-- Order Table --}}
                            <table width="100%" cellpadding="10" cellspacing="0"
                                style="border:1px solid #ddd; border-radius:6px; border-collapse:collapse; font-family:Arial, sans-serif;">

                                <tr style="background-color:#f9f9f9;">
                                    <th align="left" style="border-bottom:1px solid #ddd; padding:10px;">Item</th>
                                    <th align="left" style="border-bottom:1px solid #ddd; padding:10px;">Details</th>
                                </tr>

                                <tr>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">Order ID</td>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">#{{ $order->id }}</td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">Product</td>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">
                                        {{ $order->product->title ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">Price</td>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">
                                        ${{ number_format($order->price, 2) }}</td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">Email</td>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">{{ $order->email }}</td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">Phone Number</td>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">{{ $order->number }}</td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">Address</td>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">{{ $order->address }}</td>
                                </tr>
                                @if ($order->has_delivery_address)
                                    <tr>
                                        <td style="border-bottom:1px solid #ddd; padding:10px;">Delivery Address</td>
                                        <td style="border-bottom:1px solid #ddd; padding:10px;">
                                            {{ $order->delivery_address }}</td>
                                    </tr>
                                @endif
                                <tr>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">Country</td>
                                    <td style="border-bottom:1px solid #ddd; padding:10px;">{{ $order->country }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;">Payment Status</td>
                                    <td style="padding:10px;">{{ ucfirst($order->payment_status) }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>


                    {{-- Footer --}}
                    <tr>
                        <td style="padding:20px; text-align:center; font-size:14px; color:#888;">
                            Thanks,<br>
                            <strong>{{ config('app.name') }}</strong>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>

</html>
