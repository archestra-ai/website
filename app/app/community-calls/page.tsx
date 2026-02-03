'use client';

import { TZDate } from '@date-fns/tz';
import { addDays, getDay, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns';
import { Bell, Calendar, Users, Video, Play } from 'lucide-react';
import Image from 'next/image';

import CommunityCallsNewsletterForm from '@components/CommunityCallsNewsletterForm';
import Footer from '@components/Footer';
import Header from '@components/Header';
import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import constants from '@constants';

const {
  website: { urls: websiteUrls },
  company: { name: companyName },
} = constants;

// Meeting Configuration
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

const MEETING_DETAILS = {
  agenda: [
    'Latest Archestra updates and features',
    'Community project showcases and demos',
    'Technical Q&A with the Archestra team',
    'Upcoming features and roadmap discussions',
  ],
};

// Generate description from agenda items
const MEETING_DESCRIPTION = `Join us for our bi-weekly community call!

Check the agenda in our Slack community: ${constants.slack.joinCommunityUrl}

Google Meet: ${MEETING_CONFIG.meetingLink}`;

const DESCRIPTION = `Join our bi-weekly community calls every other ${MEETING_CONFIG.dayOfWeek} at ${MEETING_CONFIG.time} (${MEETING_CONFIG.timezone}). Connect with the Archestra team and community members.`;

export default function CommunityCallsPage() {
  // Calculate next meeting date (2pm London time) - bi-weekly schedule
  const getNextMeetingDate = (): Date => {
    // Define a reference date for the bi-weekly schedule (a known meeting date)
    // Using February 3, 2026 as a reference Tuesday (midnight for date calculation)
    const referenceDate = new Date('2026-02-03T00:00:00Z');
    
    // Get current time in London timezone using TZDate
    const nowInLondon = TZDate.tz(MEETING_CONFIG.timezone);
    const nowTime = nowInLondon.getTime();
    
    // Calculate the number of days since the reference date
    const daysSinceReference = Math.floor((nowTime - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate the number of weeks since reference
    const weeksSinceReference = Math.floor(daysSinceReference / 7);
    
    // Determine if we're in an "on" week (even weeks) or "off" week (odd weeks)
    const isOnWeek = weeksSinceReference % 2 === 0;
    
    const londonDay = getDay(nowInLondon);
    let daysUntilMeeting = MEETING_CONFIG.dayNumber - londonDay;

    // If today is Tuesday in London
    if (londonDay === MEETING_CONFIG.dayNumber) {
      const londonHour = nowInLondon.getHours();
      const londonMinute = nowInLondon.getMinutes();
      
      const hasMeetingPassed = londonHour > MEETING_CONFIG.hour ||
        (londonHour === MEETING_CONFIG.hour && londonMinute >= MEETING_CONFIG.minute);
      
      if (isOnWeek && !hasMeetingPassed) {
        daysUntilMeeting = 0; // Today is a meeting day
      } else {
        // Next meeting is in 2 weeks if we're on an "on" week after meeting time,
        // or 1 week if we're on an "off" week
        daysUntilMeeting = isOnWeek ? 14 : 7;
      }
    } else if (daysUntilMeeting < 0) {
      // Tuesday has passed this week
      daysUntilMeeting += isOnWeek ? 14 : 7;
    } else {
      // Tuesday is coming up this week
      if (!isOnWeek) {
        daysUntilMeeting += 7; // Skip to next week's Tuesday
      }
    }

    // Create meeting date at 2pm London time using TZDate
    // TZDate properly handles timezone - all operations happen in London time
    let meetingDate = addDays(nowInLondon, daysUntilMeeting);
    meetingDate = setHours(meetingDate, MEETING_CONFIG.hour);
    meetingDate = setMinutes(meetingDate, MEETING_CONFIG.minute);
    meetingDate = setSeconds(meetingDate, 0);
    meetingDate = setMilliseconds(meetingDate, 0);

    // Convert TZDate to regular Date for display in user's local timezone
    // TZDate.getTime() returns the correct UTC timestamp
    return new Date(meetingDate.getTime());
  };

  const nextMeetingDate = getNextMeetingDate();

  // Check if meeting is within 30 minutes
  const now = new Date();
  const minutesUntilMeeting = Math.floor((nextMeetingDate.getTime() - now.getTime()) / (1000 * 60));
  const canJoinMeeting = minutesUntilMeeting <= 30 && minutesUntilMeeting >= -30; // Allow joining 30 min before and during

  // Format date for display
  const formatMeetingDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Get local time
  const getLocalTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get local timezone name
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTimezoneName = localTimezone.split('/').pop()?.replace(/_/g, ' ') || 'Your timezone';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Archestra Bi-Weekly Community Call',
    description: DESCRIPTION,
    startDate: nextMeetingDate.toISOString(),
    endDate: new Date(nextMeetingDate.getTime() + MEETING_CONFIG.durationMinutes * 60000).toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://meet.google.com/jvz-gupa-oid',
    },
    organizer: {
      '@type': 'Organization',
      name: companyName,
      url: websiteUrls.base,
    },
  };

  const handleCalendarDownload = () => {
    window.location.href = '/api/community-call-ics';
  };

  const getGoogleCalendarDate = () => {
    // Format for Google Calendar in UTC (YYYYMMDDTHHmmSSZ/YYYYMMDDTHHmmSSZ)
    const formatDateUTC = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };

    const endTime = new Date(nextMeetingDate.getTime() + MEETING_CONFIG.durationMinutes * 60000);

    return `${formatDateUTC(nextMeetingDate)}/${formatDateUTC(endTime)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header />

      <main className="flex-1 relative">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                Every Other {MEETING_CONFIG.dayOfWeek} at {getLocalTime(nextMeetingDate)} ({localTimezoneName})
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Bi-Weekly Community Calls</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Join us every other Tuesday for our community calls where we discuss Archestra, share updates, and connect
                with fellow developers and AI enthusiasts.
              </p>

              {/* Hero Image */}
              <div className="relative">
                <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/community-call.jpg"
                    alt="Archestra Community Call"
                    width={1200}
                    height={675}
                    className="w-full h-auto"
                    priority
                    quality={90}
                  />
                </div>
              </div>
            </div>

            {/* Main Content Cards */}
            <div className="grid gap-8 mb-12">
              {/* Meeting Details Card */}
              <Card className="border-2 hover:border-teal-200 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-teal-100 p-3 rounded-lg">
                      <Calendar className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">Next Meeting</h2>
                      <div className="space-y-3 text-gray-700">
                        <p>
                          {formatMeetingDate(nextMeetingDate)}, {getLocalTime(nextMeetingDate)} ({localTimezoneName}),{' '}
                          {MEETING_CONFIG.duration}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 pb-6">
                    <a
                      href={constants.slack.joinCommunityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Go to the Slack Community to check agenda →
                    </a>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div>
                      <div className="flex gap-3">
                        <a
                          href={canJoinMeeting ? MEETING_CONFIG.meetingLink : '#'}
                          target={canJoinMeeting ? '_blank' : undefined}
                          rel={canJoinMeeting ? 'noopener noreferrer' : undefined}
                          className={`inline-flex items-center font-medium py-2 px-4 rounded-lg transition-colors text-sm ${
                            canJoinMeeting
                              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          onClick={canJoinMeeting ? undefined : (e) => e.preventDefault()}
                        >
                          Join Meeting Now (Google Meet)
                        </a>
                        <Button
                          onClick={handleCalendarDownload}
                          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm h-auto"
                        >
                          <Calendar className="w-4 h-4 mr-1.5" />
                          Add to Calendar (.ics)
                        </Button>
                        <a
                          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(MEETING_CONFIG.title)}&dates=${getGoogleCalendarDate()}&details=${encodeURIComponent(MEETING_DESCRIPTION)}&location=${encodeURIComponent(MEETING_CONFIG.meetingLink)}&recur=${encodeURIComponent('RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z"
                              fill="#4285F4"
                            />
                            <path d="M7 10H9V12H7V10ZM11 10H13V12H11V10ZM15 10H17V12H15V10Z" fill="#4285F4" />
                          </svg>
                          Add to Google Calendar
                        </a>
                      </div>
                      {!canJoinMeeting && (
                        <p className="text-sm text-gray-500 mt-2">
                          Open the page 30 minutes before the call or add to your calendar to get a reminder.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Watch Past Recordings Section */}
              <Card className="border-2 hover:border-blue-200 transition-colors mb-8">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">Past Community Calls</h2>
                      <p className="text-gray-600 mb-4">
                        Watch recordings of our previous community calls to catch up on discussions, demos, and updates.
                      </p>
                    </div>
                  </div>

                  {/* YouTube Playlist Embed */}
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <iframe
                      src="https://www.youtube.com/embed/videoseries?list=PL2L0p-cygIJC8XSiOsLyCwN8D_uUakX75"
                      title="Archestra Community Calls Playlist"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Subscribe to our YouTube channel to get notified when new recordings are available.
                    </p>
                    <a
                      href="https://www.youtube.com/@ArchestraAI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      <Video className="w-4 h-4" />
                      View All Videos
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Email Notification Card */}
              <div className="grid grid-cols-1 gap-8">
                <Card className="border-2 hover:border-purple-200 transition-colors">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Bell className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">Get Notified</h2>
                        <p className="text-gray-600 mb-4">
                          Never miss a community call! Get email reminders about upcoming calls and important updates.
                        </p>
                        <CommunityCallsNewsletterForm />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center py-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                All community calls are conducted in English and are open to everyone.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
