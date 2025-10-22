<?php

namespace App\Mail;

use App\Models\SoldPhysicalProduct;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public SoldPhysicalProduct $order;

    /**
     * Create a new message instance.
     */
    public function __construct(SoldPhysicalProduct $order)
    {
        $this->order = $order;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Your Order is Confirmed')
                    ->markdown('emails.orders.confirmed')
                    ->with([
                        'order' => $this->order,
                    ]);
    }
}
