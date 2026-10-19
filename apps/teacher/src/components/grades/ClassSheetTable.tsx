/**
 * ClassSheetTable — the class sheet: sticky first/last name columns, one column
 * per assessment type (never assuming fixed names), then Total and Average.
 *
 * The table scrolls horizontally inside its own container so the page never
 * scrolls sideways; the name columns stay pinned on phones.
 */
import type { ClassSheetColumn, ClassSheetStudent } from '@carecraft/types';
import { conductedMaxTotal, orderColumns, stageStateLabel } from '@carecraft/grades';
import { cn } from '@/lib/utils';

const NAME_COL_PX = 104;
const NAME_COL_LEFT_PX = 104;

interface ClassSheetTableProps {
  columns: ClassSheetColumn[];
  students: ClassSheetStudent[];
  onSelectStudent?: (student: ClassSheetStudent) => void;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

function formatAverage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

export function ClassSheetTable({ columns, students, onSelectStudent }: ClassSheetTableProps) {
  const ordered = orderColumns(columns);
  const conductedMax = conductedMaxTotal(columns);

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left">
            <th
              scope="col"
              style={{ width: NAME_COL_PX, minWidth: NAME_COL_PX, left: 0 }}
              className="sticky z-20 bg-[var(--color-surface-raised)] px-3 py-2.5 text-xs font-bold text-[var(--color-text-secondary)]"
            >
              First name
            </th>
            <th
              scope="col"
              style={{ width: NAME_COL_PX, minWidth: NAME_COL_PX, left: NAME_COL_LEFT_PX }}
              className="sticky z-20 border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2.5 text-xs font-bold text-[var(--color-text-secondary)]"
            >
              Last name
            </th>

            {ordered.map((column) => (
              <th
                key={column.typeId}
                scope="col"
                className="min-w-[88px] px-2 py-2 text-center align-bottom"
              >
                <div className="text-xs font-bold text-[var(--color-text)]">{column.name}</div>
                <div className="text-[10px] font-medium text-[var(--color-text-muted)]">
                  out of {column.maxScore}
                </div>
                <div
                  className={cn(
                    'mt-0.5 text-[10px] font-semibold',
                    column.state === 'locked' && 'text-[var(--color-text-muted)]',
                    column.state === 'conducted' && 'text-[var(--color-success)]',
                    column.state === 'not-conducted' && 'text-[var(--color-warning)]',
                  )}
                >
                  {stageStateLabel(column.state)}
                </div>
              </th>
            ))}

            <th scope="col" className="min-w-[72px] px-3 py-2 text-center">
              <div className="text-xs font-bold text-[var(--color-text)]">Total</div>
              {conductedMax > 0 && (
                <div className="text-[10px] font-medium text-[var(--color-text-muted)]">
                  out of {conductedMax}
                </div>
              )}
            </th>
            <th scope="col" className="min-w-[72px] px-3 py-2 text-center text-xs font-bold text-[var(--color-text)]">
              Average
            </th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr
              key={student.studentId}
              className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-raised)]"
            >
              <th
                scope="row"
                style={{ width: NAME_COL_PX, minWidth: NAME_COL_PX, left: 0 }}
                className="sticky z-10 bg-[var(--color-surface)] px-3 py-2 text-left text-sm font-medium text-[var(--color-text)]"
              >
                <button
                  type="button"
                  className="block w-full truncate text-left"
                  onClick={() => onSelectStudent?.(student)}
                  title={`${student.firstName} ${student.lastName}`}
                >
                  {student.firstName}
                </button>
              </th>
              <th
                style={{ width: NAME_COL_PX, minWidth: NAME_COL_PX, left: NAME_COL_LEFT_PX }}
                className="sticky z-10 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm font-semibold text-[var(--color-text)]"
              >
                <span className="block truncate">{student.lastName}</span>
              </th>

              {ordered.map((column) => {
                const cell = student.scores[column.typeId];
                if (column.state === 'not-conducted') {
                  return (
                    <td
                      key={column.typeId}
                      className="px-2 py-2 text-center text-[var(--color-text-muted)]"
                    >
                      _
                    </td>
                  );
                }
                if (!cell?.entered) {
                  return (
                    <td
                      key={column.typeId}
                      className="px-2 py-2 text-center font-medium text-[var(--color-text-muted)]"
                    >
                      0
                    </td>
                  );
                }
                return (
                  <td
                    key={column.typeId}
                    className="px-2 py-2 text-center font-semibold tabular-nums text-[var(--color-text)]"
                  >
                    {cell.score == null ? '_' : formatNumber(cell.score)}
                  </td>
                );
              })}

              <td className="px-3 py-2 text-center font-semibold tabular-nums text-[var(--color-text)]">
                {student.total == null ? (
                  <span className="text-[var(--color-text-muted)]">_</span>
                ) : (
                  formatNumber(student.total)
                )}
              </td>
              <td className="px-3 py-2 text-center font-semibold tabular-nums text-[var(--color-text)]">
                {student.average == null ? (
                  <span className="text-[var(--color-text-muted)]">_</span>
                ) : (
                  formatAverage(student.average)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
