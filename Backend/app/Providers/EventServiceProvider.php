<?php
// File: Backend/app/Providers/EventServiceProvider.php

namespace App\Providers;

// Import bawaan Laravel
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

// ===== Import Event dan Listener Kustom Kita =====
use App\Events\OrderProcessed;
use App\Listeners\DecreaseStockListener;
// =================================================

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * Di sinilah kita memberitahu Laravel:
     * "Jika event X terjadi, panggil listener Y dan Z".
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Event bawaan Laravel untuk registrasi user
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        // ==== Mapping Event Kustom Kita ====
        // Jika event 'OrderProcessed' di-"fire"...
        OrderProcessed::class => [
            // ...maka panggil listener 'DecreaseStockListener'
            DecreaseStockListener::class,

            // Kamu bisa menambahkan listener lain di sini nanti
            // jika ada aksi lain yang harus terjadi saat order diproses.
            // Contoh:
            // \App\Listeners\SendOrderProcessedNotification::class,
            // \App\Listeners\GenerateInvoiceListener::class,
        ],
        // =====================================
    ];

    /**
     * Register any events for your application.
     * (Metode ini biasanya dibiarkan kosong kecuali
     * kamu punya kebutuhan registrasi event yang lebih kompleks).
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     * (Kita set 'false' karena kita mendaftarkannya secara manual
     * di array $listen di atas, ini lebih eksplisit).
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}