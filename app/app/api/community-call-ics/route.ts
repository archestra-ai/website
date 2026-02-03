import { NextResponse } from 'next/server';

// Meeting Configuration (same as in the page component)
const MEETING_CONFIG = {
  title: '👋 Archestra Community Call',
  dayOfWeek: 'Tuesday',
  dayNumber: 2, // Tuesday is day 2 (0 = Sunday, 1 = Monday, etc.)
  time: '2:00 PM',
  endTime: '2:30 PM',
  timezone: 'Europe/London',
  duration: '30 minutes',
  meetingLink: 'https://meet.google.com/jvz-gupa-oid',
  hour: 14, // 24-hour format for 2:00 PM
  minute: 0,
  durationMinutes: 30,
};

// Generate description
const MEETING_DESCRIPTION = `Join us for our bi-weekly community call!\\n\\nCheck the agenda in our Slack community: https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg\\n\\nGoogle Meet: ${MEETING_CONFIG.meetingLink}\\n\\nMore info: https://archestra.ai/community-calls`;

export async function GET() {
  // Get the next meeting day
  const getNextMeetingDay = () => {
    const now = new Date();
    const meetingDay = MEETING_CONFIG.dayNumber;

    // Create a date for today at 2:00 PM London time
    const londonTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const currentDay = londonTime.getDay();

    // Calculate days until next meeting day
    let daysUntilMeeting = meetingDay - currentDay;

    // If today is the meeting day, check if the time has passed
    if (currentDay === meetingDay) {
      const meetingTime = new Date(londonTime);
      meetingTime.setHours(MEETING_CONFIG.hour, MEETING_CONFIG.minute, 0, 0);

      // If it's past meeting time on the meeting day, get next week's meeting
      if (londonTime >= meetingTime) {
        daysUntilMeeting = 7;
      } else {
        daysUntilMeeting = 0; // Today's meeting day, before meeting time
      }
    } else if (daysUntilMeeting < 0) {
      // If meeting day has already passed this week
      daysUntilMeeting += 7;
    }

    // Create the date for the next meeting
    const nextMeeting = new Date(now);
    nextMeeting.setDate(now.getDate() + daysUntilMeeting);

    // Set to 2:00 PM London time (we'll handle timezone in the ICS format)
    // For ICS, we need to use UTC time
    const year = nextMeeting.getFullYear();
    const month = nextMeeting.getMonth();
    const date = nextMeeting.getDate();

    // Create a date at 2:00 PM London time
    const londonMeetingTime = new Date(
      `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}T14:00:00`
    );

    // Convert to UTC for ICS file (London is UTC+0 in winter, UTC+1 in summer)
    // We'll use the actual timezone info
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // For simplicity, we'll create the event with Europe/London timezone
    return {
      year,
      month: month + 1,
      date,
    };
  };

  const nextMeeting = getNextMeetingDay();

  // Format date for ICS (YYYYMMDD)
  const formatDate = (year: number, month: number, date: number) => {
    return `${year}${String(month).padStart(2, '0')}${String(date).padStart(2, '0')}`;
  };

  const eventDate = formatDate(nextMeeting.year, nextMeeting.month, nextMeeting.date);

  // Create ICS content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Archestra//Community Call//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VTIMEZONE
TZID:Europe/London
TZURL:http://tzurl.org/zoneinfo-outlook/Europe/London
X-LIC-LOCATION:Europe/London
BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:archestra-community-call-recurring@archestra.ai
DTSTAMP:${new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')}Z
DTSTART;TZID=Europe/London:${eventDate}T${String(MEETING_CONFIG.hour).padStart(2, '0')}${String(MEETING_CONFIG.minute).padStart(2, '0')}00
DTEND;TZID=Europe/London:${eventDate}T${String(MEETING_CONFIG.hour).padStart(2, '0')}${String(MEETING_CONFIG.minute + MEETING_CONFIG.durationMinutes).padStart(2, '0')}00
RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU
SUMMARY:${MEETING_CONFIG.title}
DESCRIPTION:${MEETING_DESCRIPTION}
LOCATION:${MEETING_CONFIG.meetingLink}
URL:${MEETING_CONFIG.meetingLink}
STATUS:CONFIRMED
ORGANIZER;CN=Archestra:mailto:team@archestra.ai
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Archestra Community Call starting in 15 minutes
TRIGGER:-PT15M
END:VALARM
END:VEVENT
END:VCALENDAR`;

  // Return the ICS file
  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': 'attachment; filename="archestra-community-call.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
