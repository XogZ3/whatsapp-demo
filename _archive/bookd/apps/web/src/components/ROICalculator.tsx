import { useState } from "react";

export default function ROICalculator() {
  const [bookingsPerWeek, setBookingsPerWeek] = useState(50);
  const [noShowRate, setNoShowRate] = useState(20);
  const [avgTicket, setAvgTicket] = useState(120);

  const weeklyNoShows = Math.round(bookingsPerWeek * (noShowRate / 100));
  const weeklyLoss = weeklyNoShows * avgTicket;
  const monthlyLoss = weeklyLoss * 4;
  const recoveryRate = 0.6; // 60% reduction in no-shows with reminders
  const monthlySaved = Math.round(monthlyLoss * recoveryRate);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        No-Show Cost Calculator
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        See how much no-shows are costing you
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Bookings per week: {bookingsPerWeek}
          </label>
          <input
            type="range"
            min={10}
            max={200}
            value={bookingsPerWeek}
            onChange={(e) => setBookingsPerWeek(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            No-show rate: {noShowRate}%
          </label>
          <input
            type="range"
            min={5}
            max={40}
            value={noShowRate}
            onChange={(e) => setNoShowRate(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Average ticket: AED {avgTicket}
          </label>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={avgTicket}
            onChange={(e) => setAvgTicket(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-red-50 p-4">
        <div className="text-sm text-red-600">You're losing monthly</div>
        <div className="text-3xl font-bold text-red-700">
          AED {monthlyLoss.toLocaleString()}
        </div>
        <div className="text-sm text-red-500">
          {weeklyNoShows * 4} no-shows/month
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-emerald-50 p-4">
        <div className="text-sm text-emerald-600">
          With Bookd reminders, save
        </div>
        <div className="text-3xl font-bold text-emerald-700">
          AED {monthlySaved.toLocaleString()}/mo
        </div>
        <div className="text-sm text-emerald-500">
          60% no-show reduction via WhatsApp reminders
        </div>
      </div>
    </div>
  );
}
