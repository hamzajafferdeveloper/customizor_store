<?php

namespace App\Mail;

use App\Models\RequestExtraPermission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RequestPermissionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $requestPermission;

    public function __construct(RequestExtraPermission $requestPermission)
    {
        $this->requestPermission = $requestPermission;
    }

    public function build()
    {
        return $this->subject('New Permission Request Received')
                    ->markdown('emails.request_permission', [
                        'requestPermission' => $this->requestPermission,
                    ]);
    }
}
