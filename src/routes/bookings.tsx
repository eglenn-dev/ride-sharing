import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/bookings')({
  component: Bookings,
})

const [bookings, setBookings] = useState([]);

function Bookings(){
    return (
        <>
        <main className="page-wrap px-4 pb-8 pt-14">
        <section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
            <h1>Your Bookings</h1>
            <section>
                if (bookings.length === 0) {
                    <p>You have no bookings</p>
                }
                {bookings.map((booking) => (
                    <div key={booking.id}>
                        <p>{booking.name}</p>
                        <p>{booking.date}</p>
                        <p>{booking.time}</p>
                    </div>
                ))}
            </section>
        </section>
        </main>
        </>
    )
    ;
}