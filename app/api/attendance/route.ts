import { NextResponse } from 'next/server';
import { currentSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import { Role } from '@prisma/client'; // adjust import path

// ------------------------------------------------------------------
// 1. Office location & allowed clock-out window
// ------------------------------------------------------------------
const OFFICE_LOCATION = {
  latitude: 6.221484342770615,   // ← your office latitude
  longitude: 7.082727350925336,  // ← your office longitude
};
const MAX_DISTANCE_METERS = 100; // 100 meters

// Clock‑out allowed only between 15:00 (3 PM) and 18:00 (6 PM) – local server time
const CLOCK_OUT_START_HOUR = 15; // 3 PM
const CLOCK_OUT_END_HOUR = 18;   // 6 PM

// Google Apps Script web app URL – store in .env
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!;

// ------------------------------------------------------------------
// 2. Haversine formula (distance in meters)
// ------------------------------------------------------------------
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ------------------------------------------------------------------
// 3. Helper: send attendance record to Google Sheets
// ------------------------------------------------------------------
async function logToGoogleSheets(
  staffId: string,
  staffName: string,
  clockInTime?: Date,
  clockOutTime?: Date
) {
  console.log('📤 Sending to Google Sheets:', { staffId, staffName, clockInTime, clockOutTime });
  
  if (!APPS_SCRIPT_URL) {
    console.error('APPS_SCRIPT_URL is not defined in environment');
    return;
  }

  const payload = {
    action: clockOutTime ? 'clockout' : 'clockin',
    staffId,
    staffName,
    clockIn: clockInTime?.toISOString(),
    clockOut: clockOutTime?.toISOString(),
  };

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    console.log('✅ Google Sheets response:', text);
  } catch (err) {
    console.error('❌ Failed to log to Google Sheets:', err);
  }
}
// ------------------------------------------------------------------
// 4. GET: list attendance for current user (or all if admin)
// ------------------------------------------------------------------
export async function GET() {
  const session = currentSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Determine if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  const isAdmin = user?.role === 'admin';

  const attendance = await prisma.attendanceLog.findMany({
    where: isAdmin ? {} : { userId: session.userId },
    include: {
      user: {
        select: { fullName: true, staffId: true },
      },
    },
    orderBy: { attendanceDate: 'desc' },
  });

  return NextResponse.json({ ok: true, attendance });
}

// ------------------------------------------------------------------
// 5. POST: check-in / check-out with location & time restrictions
// ------------------------------------------------------------------
export async function POST(req: Request) {
  const session = currentSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Check permissions using role or custom logic – adjust as needed
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, fullName: true, staffId: true },
  });
  if (!user) {
    return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });
  }

  // Allow attendance only for 'staff' or 'admin' (adjust roles)
  // Define which roles are allowed to use attendance
const allowedRoles = [
  'operations officer',
  'loans officer',
  'digital_officer',
  'marketer',
  'manager',
  'account officer',
  'social media manager',
  'admin supervisor',
  'admin' // keep if you still use 'admin' somewhere
];

if (!allowedRoles.includes(user.role)) {
  return NextResponse.json({ ok: false, message: 'Forbidden: Your role does not have attendance permission' }, { status: 403 });
}

  const body = (await req.json()) as {
    action?: 'check_in' | 'check_out';
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    note?: string;
  };

  // --- Require location data ---
  if (body.latitude == null || body.longitude == null) {
    return NextResponse.json(
      { ok: false, message: 'Location data (latitude, longitude) is required' },
      { status: 400 }
    );
  }

  // --- Distance validation ---
  const distance = haversineDistance(
    body.latitude,
    body.longitude,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude
  );
  if (distance > MAX_DISTANCE_METERS) {
    return NextResponse.json(
      {
        ok: false,
        message: `You are ${Math.round(distance)} meters away. Must be within ${MAX_DISTANCE_METERS}m of the office.`,
      },
      { status: 400 }
    );
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // --- CHECK IN ---
  if (body.action === 'check_in') {
    // Check if already checked in today without checkout
    const existing = await prisma.attendanceLog.findFirst({
      where: {
        userId: session.userId,
        attendanceDate: today,
        clockOut: null,
      },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'You already have an open check‑in for today. Please check out first.' },
        { status: 400 }
      );
    }

    // Create new attendance record
    const newLog = await prisma.attendanceLog.create({
      data: {
        userId: session.userId,
        attendanceDate: today,
        clockIn: now,
        latitude: body.latitude,
        longitude: body.longitude,
        accuracyMeters: body.accuracyMeters,
        note: body.note,
        status: 'Present', // default
      },
    });

    // Send to Google Sheets (clock-in)
    await logToGoogleSheets(user.staffId, user.fullName, now, undefined);

    return NextResponse.json({ ok: true, attendance: newLog, message: 'Checked in successfully' });
  }

  // --- CHECK OUT ---
  if (body.action === 'check_out') {
    // Enforce check-out time window (3 PM – 6 PM)
    const hour = now.getHours();
    if (hour < CLOCK_OUT_START_HOUR || hour >= CLOCK_OUT_END_HOUR) {
      return NextResponse.json(
        {
          ok: false,
          message: `Check‑out is only allowed between ${CLOCK_OUT_START_HOUR}:00 and ${CLOCK_OUT_END_HOUR}:00.`,
        },
        { status: 400 }
      );
    }

    // Find open attendance record for today
    const openRecord = await prisma.attendanceLog.findFirst({
      where: {
        userId: session.userId,
        attendanceDate: today,
        clockOut: null,
      },
    });
    if (!openRecord) {
      return NextResponse.json(
        { ok: false, message: 'No open check‑in found for today. Please check in first.' },
        { status: 400 }
      );
    }

    // Update with clock-out time
    const updated = await prisma.attendanceLog.update({
      where: { id: openRecord.id },
      data: {
        clockOut: now,
        // Optionally update location again (can also store separate out-location)
        latitude: body.latitude,
        longitude: body.longitude,
        accuracyMeters: body.accuracyMeters,
        note: body.note,
      },
    });

    // Send to Google Sheets (clock-out)
    await logToGoogleSheets(user.staffId, user.fullName, openRecord.clockIn ?? undefined, now);

    return NextResponse.json({ ok: true, attendance: updated, message: 'Checked out successfully' });
  }

  return NextResponse.json({ ok: false, message: 'Invalid action' }, { status: 400 });
}