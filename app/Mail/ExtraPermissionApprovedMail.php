<?php

namespace App\Mail;

use App\Models\RequestExtraPermission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExtraPermissionApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $requestPermission;

    public function __construct(RequestExtraPermission $requestPermission)
    {
        $this->requestPermission = $requestPermission;
    }

    public function build()
    {
        return $this->subject('Your Extra Permission Request Has Been Approved')
            ->view('emails.extra-permission-approved');
    }
}
