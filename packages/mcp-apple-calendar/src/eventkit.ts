/**
 * Thin bridge to the JXA/EventKit shim in native/find-events.jxa.js — the only place that knows
 * how to reach Apple Calendar. This module speaks the neutral capability-contract Event shape; see
 * docs/contracts/calendar.md for the contract this implements.
 */
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), 'native', 'find-events.jxa.js');

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface EventWindow {
  date?: string;
  dateRange?: DateRange;
}

interface ShimSuccess {
  ok: true;
  events: Event[];
}

interface ShimFailure {
  ok: false;
  reason: string;
  message: string;
}

type ShimResult = ShimSuccess | ShimFailure;

/** Run the JXA shim and parse its single-line JSON result. Never returns a partial/empty-on-error result. */
export async function findEvents(window: EventWindow): Promise<Event[]> {
  const stdout = await new Promise<string>((resolve, reject) => {
    execFile(
      'osascript',
      ['-l', 'JavaScript', SCRIPT_PATH, JSON.stringify(window)],
      { timeout: 35_000 },
      (error, out, stderr) => {
        if (error) reject(new Error(`osascript failed: ${stderr || error.message}`));
        else resolve(out);
      },
    );
  });

  let result: ShimResult;
  try {
    result = JSON.parse(stdout) as ShimResult;
  } catch {
    throw new Error(`Unparseable response from the calendar shim: ${stdout}`);
  }

  if (!result.ok) throw new Error(`[${result.reason}] ${result.message}`);
  return result.events;
}
