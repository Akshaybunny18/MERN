# Future Architecture Improvements

This document outlines features and architectural changes that can be implemented in future iterations of the Event Management System.

## 1. Automatic Event Status Updates (Cron Jobs)
Currently, an event's `status` (e.g., "Published", "Ongoing", "Completed") relies on manual intervention by the Organizer or Admin. 

**Can it be automated?** Yes! 
The standard industry practice for automatically changing states based on dates is to use a **Cron Job**. 

**Implementation Strategy:**
- We can use a Node.js package called `node-cron`.
- We would write a script that runs automatically every midnight (or every hour).
- The script would run a MongoDB query:
  ```javascript
  // Move past events to Completed
  await Event.updateMany(
    { endDate: { $lt: new Date() }, status: { $ne: 'Completed' } },
    { $set: { status: 'Completed' } }
  );
  
  // Also update associated tickets
  await Ticket.updateMany(
    { event: { $in: completedEventIds }, status: 'Registered' },
    { $set: { status: 'Completed' } }
  );
  ```
- This ensures that if you visit the dashboard *after* an event has finished, your ticket automatically moves from the "Upcoming / Normal" tab into the "Completed" tab without any human intervention.

## 2. "Canceled" State vs Cascade Delete
Currently, if an Admin deletes an event, it performs a **Cascade Delete**—completely erasing the event and all associated tickets from the database. This causes the tickets to silently disappear from the user's dashboard.

**Future Improvement (Soft Delete):**
- Instead of using `Event.deleteOne()`, we implement a "Soft Delete".
- When an admin deletes an event, the backend simply changes the event's status: `event.status = 'Cancelled'`.
- The backend then cascades this status to the tickets: `await Ticket.updateMany({ event: event._id }, { $set: { status: 'Cancelled' } })`.
- This provides a much better User Experience, as users will see the ticket in their "Cancelled/Rejected" tab with a clear explanation, rather than wondering why their ticket vanished.

## 3. Payment Gateway Integration
Currently, merchandise purchases and paid event registrations immediately assume the payment is successful.
- We will integrate **Stripe Checkout**.
- The `POST /api/tickets/register` route will return a Stripe Checkout URL.
- The ticket will be created with `status: 'Pending Payment'`.
- A Stripe Webhook endpoint will listen for `checkout.session.completed`, and only then update the ticket to `Registered` and decrement the `stockQuantity`.
