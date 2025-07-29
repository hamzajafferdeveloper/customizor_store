<?php

namespace App\Console\Commands;

use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DeactivateExpiredStores extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:deactivate-expired-stores';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deactivate stores whose plans have expired';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredStores = Store::where('plan_expiry_date', '<', Carbon::now())
            ->where('status', 'active')
            ->get();

        foreach ($expiredStores as $store) {
            $store->update(['status' => 'inactive']);
        }

        $this->info('Expired stores have been deactivated successfully.');
    }
}
