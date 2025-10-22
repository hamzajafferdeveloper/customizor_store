<?php

namespace App\Mail;

use App\Models\SoldPhysicalProduct;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmedAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public SoldPhysicalProduct $order;
    public User $admin;

    /**
     * Create a new message instance.
     */
    public function __construct(SoldPhysicalProduct $order, User $admin)
    {
        $this->order = $order;
        $this->admin = $admin;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Your Order is Confirmed')
                    ->markdown('emails.orders.admin.confirmed')
                    ->with([
                        'order' => $this->order,
                        'admin' => $this->admin
                    ]);
    }
}
