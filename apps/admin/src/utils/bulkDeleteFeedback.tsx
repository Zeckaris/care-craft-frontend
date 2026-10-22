import { Modal, Typography, message } from "antd";
import type { BatchMutationResult } from "@carecraft/query-core";

const { Text } = Typography;

const pluralize = (label: string, count: number) => {
  if (count === 1) return label;
  if (label.endsWith("y")) return `${label.slice(0, -1)}ies`;
  return `${label}s`;
};

/**
 * Reports the outcome of a fan-out bulk delete:
 *   • all succeeded       → success toast
 *   • all failed          → error toast with the first backend message
 *   • partially succeeded → warning modal listing the failures
 *
 * `removeMany` uses `Promise.allSettled` under the hood, so partial failures are
 * surfaced instead of being collapsed into a single generic error.
 */
export function reportBulkDelete(
  result: BatchMutationResult,
  label: string,
): void {
  if (result.failedCount === 0) {
    message.success(
      `${result.successCount} ${pluralize(label, result.successCount)} deleted`,
    );
    return;
  }

  if (result.successCount === 0) {
    const firstError = result.errors[0];
    message.error(
      `Failed to delete ${result.failedCount} ${pluralize(
        label,
        result.failedCount,
      )}${firstError ? `: ${firstError}` : ""}`,
    );
    return;
  }

  const shownErrors = result.errors.slice(0, 10);

  Modal.warning({
    title: `Deleted ${result.successCount} of ${result.total} ${pluralize(
      label,
      result.total,
    )}`,
    width: 520,
    content: (
      <div>
        <p>{result.failedCount} could not be deleted:</p>
        {shownErrors.length > 0 && (
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {shownErrors.map((error, index) => (
              <li key={index}>
                <Text>{error}</Text>
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
  });
}
