<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f1f1f1; margin: 0; padding: 0; color: #000;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f1f1; padding:20px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px;">
            
            <!-- Header -->
            <tr>
              <td align="center" bgcolor="#000000" style="padding:15px; border-radius:8px 8px 0 0;">
                <h1 style="margin:0; font-size:24px; color:#ffffff; text-align:center;">Checkout Successful</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding:20px; line-height:1.6; color:#000000; font-size:16px;">
                <p style="margin-bottom:15px;">Dear Customer,</p>
                <p style="margin-bottom:15px;">Thank you for your purchase! Your payment has been successfully processed.</p>
                <p style="margin-bottom:15px;">You can view your order details by clicking the button below:</p>
                
                <!-- Button -->
                {{-- <p style="margin-bottom:25px; text-align:center;">
                  <a href="{{ $url }}" style="display:inline-block; background-color:#000000; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:5px; font-size:16px;">
                    View Order
                  </a>
                </p> --}}
                
                <p style="margin-bottom:15px;">If you have any questions, feel free to contact us at 
                  <a href="mailto:support@example.com" style="color:#000000; text-decoration:underline;">support@example.com</a>.
                </p>
                <p style="margin-bottom:0;">Thank you for choosing us!</p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="text-align:center; font-size:14px; color:#777777; padding:15px;">
                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
