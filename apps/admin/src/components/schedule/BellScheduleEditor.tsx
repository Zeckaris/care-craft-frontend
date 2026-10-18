import {
  Alert,
  Button,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { IScheduleBlock, ScheduleBlockType } from "@carecraft/types";
import {
  formatPeriodGroups,
  formatTime12Hour,
  parseTimeToMinutes,
  type ComputedSchedule,
} from "./scheduleUtils";

const { Text } = Typography;

interface BellScheduleEditorProps {
  startTime: string;
  onStartTimeChange: (value: string) => void;
  blocks: IScheduleBlock[];
  onChange: (blocks: IScheduleBlock[]) => void;
  computed: ComputedSchedule;
  /** Label shown above the period preview, e.g. "Weekday periods". */
  previewLabel?: string;
}

const toTimeValue = (value: string) => {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return null;
  return dayjs()
    .hour(Math.floor(minutes / 60))
    .minute(minutes % 60)
    .second(0)
    .millisecond(0);
};

export function BellScheduleEditor({
  startTime,
  onStartTimeChange,
  blocks,
  onChange,
  computed,
  previewLabel = "Periods",
}: BellScheduleEditorProps) {
  const updateBlock = (index: number, patch: Partial<IScheduleBlock>) => {
    onChange(blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addBlock = () => {
    onChange([
      ...blocks,
      { type: "period", durationMinutes: 50, label: null },
    ]);
  };

  return (
    <div>
      <Space align="center" wrap style={{ marginBottom: 12 }}>
        <Text strong>Start time</Text>
        <TimePicker
          format="h:mm A"
          use12Hours
          minuteStep={5}
          allowClear={false}
          value={toTimeValue(startTime)}
          onChange={(value) => onStartTimeChange(value ? value.format("HH:mm") : "")}
        />
        <Text type="secondary">Each duration is editable per block.</Text>
      </Space>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {blocks.map((block, index) => (
          <Space key={index} align="center" wrap>
            <Tag color={block.type === "period" ? "blue" : "default"}>
              {index + 1}
            </Tag>
            <Select<ScheduleBlockType>
              value={block.type}
              style={{ width: 110 }}
              onChange={(type) => updateBlock(index, { type })}
              options={[
                { label: "Period", value: "period" },
                { label: "Break", value: "break" },
              ]}
            />
            <InputNumber
              min={1}
              step={5}
              precision={0}
              addonAfter="min"
              style={{ width: 130 }}
              value={block.durationMinutes}
              onChange={(value) =>
                updateBlock(index, {
                  durationMinutes:
                    typeof value === "number" ? value : (0 as number),
                })
              }
            />
            <Input
              placeholder="Optional label"
              style={{ width: 180 }}
              value={block.label ?? ""}
              onChange={(e) =>
                updateBlock(index, { label: e.target.value || null })
              }
            />
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => moveBlock(index, -1)}
              aria-label="Move up"
            />
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={index === blocks.length - 1}
              onClick={() => moveBlock(index, 1)}
              aria-label="Move down"
            />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeBlock(index)}
              aria-label="Remove block"
            />
          </Space>
        ))}
      </div>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addBlock}
        style={{ marginTop: 12 }}
      >
        Add block
      </Button>

      <div style={{ marginTop: 20 }}>
        <Text strong>{previewLabel}</Text>
        <div style={{ marginTop: 8 }}>
          {computed.periods.length === 0 ? (
            <Text type="secondary">No periods to preview yet.</Text>
          ) : (
            <Space wrap size={[8, 8]}>
              {computed.periods.map((p, i) => (
                <Tag key={i}>
                  P{i + 1} {formatTime12Hour(p.start)} to {formatTime12Hour(p.end)}
                </Tag>
              ))}
            </Space>
          )}
        </div>

        <Space wrap size="large" style={{ marginTop: 12 }}>
          <Text>
            Periods: <Text strong>{computed.periodsPerDay}</Text>
          </Text>
          <Text>
            School day ends:{" "}
            <Text strong>
              {computed.finishTime ? formatTime12Hour(computed.finishTime) : "-"}
            </Text>
          </Text>
          <Text>
            Period blocks:{" "}
            <Text strong>
              {formatPeriodGroups(computed.groups) || "-"}
            </Text>
          </Text>
        </Space>
      </div>

      {computed.errors.length > 0 && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 16 }}
          message="Fix these before saving"
          description={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {computed.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          }
        />
      )}
    </div>
  );
}
