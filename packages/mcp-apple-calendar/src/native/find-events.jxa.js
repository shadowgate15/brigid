/* eslint-disable */
// JXA (JavaScript for Automation) script, run via `osascript -l JavaScript`. Not compiled by tsc —
// copied verbatim to dist by the build (see project.json assets). Bridges into macOS EventKit to
// read calendar events. Always returns exactly one line of JSON on stdout, even on failure; never
// throws uncaught, so the Node side (../eventkit.ts) has a single, reliable parse path.
//
// Contract with the Node caller: argv[0] is `{"date":"YYYY-MM-DD"}` or
// `{"dateRange":{"from":"YYYY-MM-DD","to":"YYYY-MM-DD"}}`. Output is
// `{"ok":true,"events":[...]}` or `{"ok":false,"reason":"...","message":"..."}`.
ObjC.import('EventKit');

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function parseWindow(input) {
  if (input.date && input.dateRange) {
    throw { reason: 'bad-input', message: '"date" and "dateRange" are mutually exclusive.' };
  }
  if (!input.date && !input.dateRange) {
    throw { reason: 'bad-input', message: 'One of "date" or "dateRange" is required.' };
  }
  if (input.dateRange && (!input.dateRange.from || !input.dateRange.to)) {
    throw { reason: 'bad-input', message: 'dateRange requires both "from" and "to".' };
  }
  // Reject reversed bounds: an inverted predicate window returns [] on EventKit, which would
  // masquerade as a genuinely empty result and break the "empty means truly empty" guarantee.
  if (input.dateRange && input.dateRange.from > input.dateRange.to) {
    throw { reason: 'bad-input', message: 'dateRange "from" must not be after "to".' };
  }
  return input.date ? { from: input.date, to: input.date } : input.dateRange;
}

function localMidnight(isoDate) {
  var parts = isoDate.split('-').map(Number);
  var comps = $.NSDateComponents.alloc.init;
  comps.year = parts[0];
  comps.month = parts[1];
  comps.day = parts[2];
  comps.hour = 0;
  comps.minute = 0;
  comps.second = 0;
  var date = $.NSCalendar.currentCalendar.dateFromComponents(comps);
  if (!date) throw { reason: 'bad-input', message: 'Invalid date: ' + isoDate };
  return date;
}

function addDays(date, n) {
  var comps = $.NSDateComponents.alloc.init;
  comps.day = n;
  return $.NSCalendar.currentCalendar.dateByAddingComponentsToDateOptions(comps, date, 0);
}

function ymd(date) {
  var units = $.NSCalendarUnitYear | $.NSCalendarUnitMonth | $.NSCalendarUnitDay;
  var comps = $.NSCalendar.currentCalendar.componentsFromDate(units, date);
  return comps.year + '-' + pad(comps.month) + '-' + pad(comps.day);
}

/** Authorized/fullAccess is EKAuthorizationStatus 3 on every macOS version that supports it. */
function isAuthorized(status) {
  return Number(status) === 3;
}

/**
 * Ensure calendar read access, prompting the user if this is the first run. Returns once resolved;
 * throws a structured {reason, message} on denial or on an unresolved prompt (no UI session, or the
 * user hasn't responded within the bound). Never hangs indefinitely.
 */
function ensureAccess(store) {
  var status = $.EKEventStore.authorizationStatusForEntityType($.EKEntityTypeEvent);
  if (isAuthorized(status)) return;

  var granted = null;
  store.requestAccessToEntityTypeCompletion($.EKEntityTypeEvent, function (g) {
    granted = g;
  });

  var waited = 0;
  var boundSeconds = 30;
  while (granted === null && waited < boundSeconds) {
    delay(0.25);
    waited += 0.25;
  }

  if (granted === null) {
    throw {
      reason: 'permission-timeout',
      message:
        'Calendar access prompt did not resolve within ' +
        boundSeconds +
        's. Grant access in System Settings → Privacy & Security → Calendars, then retry.',
    };
  }
  if (!granted) {
    throw {
      reason: 'permission-denied',
      message:
        'Calendar access was not granted. Enable it in System Settings → Privacy & Security → Calendars.',
    };
  }
}

function findEvents(input) {
  var window = parseWindow(input);
  var store = $.EKEventStore.alloc.init;

  ensureAccess(store);

  var calendars = store.calendarsForEntityType($.EKEntityTypeEvent);
  if (calendars.count === 0) {
    throw {
      reason: 'no-calendars',
      message: 'Calendar access is granted but no calendars are available to read.',
    };
  }

  var start = localMidnight(window.from);
  var end = addDays(localMidnight(window.to), 1);

  var predicate = store.predicateForEventsWithStartDateEndDateCalendars(start, end, calendars);
  var events = store.eventsMatchingPredicate(predicate);

  var isoFmt = $.NSISO8601DateFormatter.alloc.init;
  isoFmt.formatOptions =
    $.NSISO8601DateFormatWithInternetDateTime | $.NSISO8601DateFormatWithColonSeparatorInTimeZone;
  isoFmt.timeZone = $.NSTimeZone.localTimeZone;

  var out = [];
  for (var i = 0; i < events.count; i++) {
    var ev = events.objectAtIndex(i);
    var allDay = Boolean(ObjC.unwrap(ev.isAllDay));
    var location = ev.location;
    var event = {
      id: ObjC.unwrap(ev.eventIdentifier),
      title: ObjC.unwrap(ev.title),
      allDay: allDay,
      start: allDay ? ymd(ev.startDate) : isoFmt.stringFromDate(ev.startDate).js,
      end: allDay ? ymd(ev.endDate) : isoFmt.stringFromDate(ev.endDate).js,
    };
    if (location) event.location = ObjC.unwrap(location);
    out.push(event);
  }

  return out;
}

function run(argv) {
  try {
    var input = JSON.parse(argv[0] || '{}');
    var events = findEvents(input);
    return JSON.stringify({ ok: true, events: events });
  } catch (error) {
    if (error && error.reason) {
      return JSON.stringify({ ok: false, reason: error.reason, message: error.message });
    }
    return JSON.stringify({ ok: false, reason: 'error', message: String(error) });
  }
}
