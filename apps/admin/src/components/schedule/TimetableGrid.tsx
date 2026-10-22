import type { CSSProperties, ReactNode } from "react";
import { LockOutlined } from "@ant-design/icons";
import type { ISchedule, IScheduleEntry } from "@carecraft/types";
import { dayLabel, formatTime12Hour } from "./scheduleUtils";
import {
  bellScheduleForDay,
  buildDayRows,
  formatRowTime,
  saturdayGridDays,
  weekdayGridDays,
  type DayRow,
} from "./timetableUtils";

export type TimetableGridVariant = "section" | "teacher";

export interface TimetableCellSelection {
  day: string;
  period: number;
}

interface TimetableGridProps {
  schedule: ISchedule;
  entries: IScheduleEntry[];
  /** What a filled cell shows: subject+teacher, or subject+grade+section. */
  variant: TimetableGridVariant;
  /**
   * Read-only for now. A later phase flips this off and supplies
   * `onSelectCell` to enable picking and editing without changing the layout.
   */
  readOnly?: boolean;
  selectedCell?: TimetableCellSelection | null;
  onSelectCell?: (selection: TimetableCellSelection) => void;
  /** Print stylesheet hook; drops screen-only fills when true. */
  printable?: boolean;
}

const entryKey = (day: string, period: number) => `${day}|${period}`;

const formatEntryTime = (entry: IScheduleEntry): string =>
  `${formatTime12Hour(entry.startTime)} to ${formatTime12Hour(entry.endTime)}`;

/**
 * Reusable timetable grid. Rows come from the bell schedule for the days being
 * drawn: weekday periods with 12-hour start/end times and labelled break rows
 * between them. When Saturday has its own bell schedule it is drawn as a
 * separate block below the weekday grid with its own rows.
 */
export function TimetableGrid({
  schedule,
  entries,
  variant,
  readOnly = true,
  selectedCell = null,
  onSelectCell,
  printable = false,
}: TimetableGridProps) {
  const snapshot = schedule.settingsSnapshot;
  const weekdayDays = weekdayGridDays(snapshot);
  const saturdayDays = saturdayGridDays(snapshot);

  const entryMap = new Map<string, IScheduleEntry>();
  for (const entry of entries) {
    entryMap.set(entryKey(entry.day, entry.period), entry);
  }

  const baseCell: CSSProperties = {
    border: "1px solid #d9d9d9",
    padding: "6px 8px",
    verticalAlign: "top",
    minWidth: 140,
  };

  const headerCell: CSSProperties = {
    ...baseCell,
    background: printable ? "#fff" : "#fafafa",
    fontWeight: 600,
    textAlign: "center",
  };

  const labelCell: CSSProperties = {
    ...baseCell,
    background: printable ? "#fff" : "#fafafa",
    width: 128,
    whiteSpace: "nowrap",
  };

  const breakCell: CSSProperties = {
    ...baseCell,
    background: printable ? "#fff" : "#f6ffed",
    color: "#5b8c00",
    fontSize: 12,
    textAlign: "center",
  };

  const renderTable = (days: string[], rows: DayRow[]): ReactNode => (
    <table
      className="carecraft-timetable"
      style={{ borderCollapse: "collapse", width: "100%" }}
    >
      <thead>
        <tr>
          <th style={headerCell}>Period</th>
          {days.map((day) => (
            <th key={day} style={headerCell}>
              {dayLabel(day)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          if (row.kind === "break") {
            return (
              <tr key={row.key}>
                <td style={breakCell} colSpan={days.length + 1}>
                  {row.label} · {formatRowTime(row)}
                </td>
              </tr>
            );
          }

          const period = row.period as number;

          return (
            <tr key={row.key}>
              <th scope="row" style={labelCell}>
                <div style={{ fontWeight: 600 }}>P{period}</div>
                <div style={{ fontSize: 11, color: "#8c8c8c" }}>
                  {formatRowTime(row)}
                </div>
              </th>

              {days.map((day) => {
                const entry = entryMap.get(entryKey(day, period));
                const above = entryMap.get(entryKey(day, period - 1));
                const below = entryMap.get(entryKey(day, period + 1));
                const joinedAbove =
                  !!entry?.doubleGroupId &&
                  above?.doubleGroupId === entry.doubleGroupId;
                const joinedBelow =
                  !!entry?.doubleGroupId &&
                  below?.doubleGroupId === entry.doubleGroupId;

                const selected =
                  selectedCell?.day === day && selectedCell?.period === period;

                const cellStyle: CSSProperties = {
                  ...baseCell,
                  cursor: !readOnly && onSelectCell ? "pointer" : "default",
                  borderTop: joinedAbove
                    ? "1px solid transparent"
                    : baseCell.border,
                  borderBottom: joinedBelow
                    ? "1px solid transparent"
                    : baseCell.border,
                  outline: selected ? "2px solid #1677ff" : undefined,
                  outlineOffset: selected ? -2 : undefined,
                  background: entry
                    ? printable
                      ? "#fff"
                      : joinedAbove || joinedBelow
                        ? "#f0f5ff"
                        : "#fff"
                    : undefined,
                };

                const handleClick = () => {
                  if (readOnly || !onSelectCell) return;
                  onSelectCell({ day, period });
                };

                return (
                  <td key={day} style={cellStyle} onClick={handleClick}>
                    {entry ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {entry.subjectName || entry.subjectId}
                        </div>
                        <div style={{ fontSize: 12, color: "#595959" }}>
                          {variant === "section"
                            ? entry.teacherName || entry.teacherId
                            : `${entry.gradeLevel} · ${
                                entry.sectionName || entry.sectionId
                              }`}
                        </div>
                        <div style={{ fontSize: 11, color: "#8c8c8c" }}>
                          {formatEntryTime(entry)}
                        </div>
                        {entry.locked && (
                          <LockOutlined
                            title="Locked"
                            style={{ fontSize: 11, color: "#8c8c8c" }}
                          />
                        )}
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const saturdaySchedule = bellScheduleForDay(snapshot, "saturday");
  const weekdayRows = buildDayRows(snapshot.bellSchedule);
  const saturdayRows = buildDayRows(saturdaySchedule, {
    minPeriods: 1,
    maxPeriods: 8,
  });

  return (
    <div style={{ overflowX: "auto" }}>
      {weekdayDays.length > 0 && renderTable(weekdayDays, weekdayRows)}

      {saturdayDays.length > 0 && (
        <div style={{ marginTop: weekdayDays.length > 0 ? 20 : 0 }}>
          <div
            style={{
              fontWeight: 600,
              marginBottom: 6,
              color: "#595959",
            }}
          >
            Saturday
            <span
              style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}
            >
              (its own bell schedule)
            </span>
          </div>
          {renderTable(saturdayDays, saturdayRows)}
        </div>
      )}
    </div>
  );
}
