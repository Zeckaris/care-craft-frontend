import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  InputNumber,
  Radio,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { DayOfWeek, IBellSchedule, IScheduleBlock, IScheduleSettings } from "@carecraft/types";
import { useScheduleSettings } from "@/hooks/useScheduleSettings";
import { BellScheduleEditor } from "./BellScheduleEditor";
import {
  ALL_DAYS,
  DAY_LABELS,
  DEFAULT_START_TIME,
  SCHEDULE_PRESETS,
  WEEKDAYS,
  cloneBlocks,
  computeSchedule,
  dayLabel,
  defaultBellSchedule,
  formatTime12Hour,
  readDerived,
} from "./scheduleUtils";
import { getErrorMessage } from "@/components/sections/studentAssignmentUtils";

const { Text, Title } = Typography;

interface ScheduleSettingsPanelProps {
  schoolYear: string;
}

interface EditorState {
  enabledDays: DayOfWeek[];
  startTime: string;
  blocks: IScheduleBlock[];
  saturdayMode: "weekday" | "own";
  saturdayStartTime: string;
  saturdayBlocks: IScheduleBlock[];
  minimumFreePeriodsPerDay: number;
  maximumWeeklyTaughtPeriods: number | null;
  maximumConsecutivePeriods: number | null;
}

const buildDefaults = (): EditorState => ({
  enabledDays: [...WEEKDAYS],
  startTime: DEFAULT_START_TIME,
  blocks: cloneBlocks(defaultBellSchedule().blocks),
  saturdayMode: "weekday",
  saturdayStartTime: DEFAULT_START_TIME,
  saturdayBlocks: cloneBlocks(defaultBellSchedule().blocks),
  minimumFreePeriodsPerDay: 1,
  maximumWeeklyTaughtPeriods: null,
  maximumConsecutivePeriods: null,
});

const fromSettings = (settings: IScheduleSettings): EditorState => ({
  enabledDays: settings.enabledDays?.length
    ? [...settings.enabledDays]
    : [...WEEKDAYS],
  startTime: settings.bellSchedule?.startTime ?? DEFAULT_START_TIME,
  blocks: settings.bellSchedule?.blocks
    ? cloneBlocks(settings.bellSchedule.blocks)
    : cloneBlocks(defaultBellSchedule().blocks),
  saturdayMode: settings.saturdayBellSchedule ? "own" : "weekday",
  saturdayStartTime:
    settings.saturdayBellSchedule?.startTime ?? DEFAULT_START_TIME,
  saturdayBlocks: settings.saturdayBellSchedule?.blocks
    ? cloneBlocks(settings.saturdayBellSchedule.blocks)
    : cloneBlocks(defaultBellSchedule().blocks),
  minimumFreePeriodsPerDay: settings.minimumFreePeriodsPerDay ?? 1,
  maximumWeeklyTaughtPeriods: settings.maximumWeeklyTaughtPeriods ?? null,
  maximumConsecutivePeriods: settings.maximumConsecutivePeriods ?? null,
});

export function ScheduleSettingsPanel({ schoolYear }: ScheduleSettingsPanelProps) {
  const {
    settings,
    derived,
    isLoading,
    isError,
    fetchError,
    refetch,
    save,
    isSaving,
  } = useScheduleSettings(schoolYear);

  const [editing, setEditing] = useState(false);
  const [state, setState] = useState<EditorState>(buildDefaults);
  const seededYearRef = useRef<string | null>(null);

  const patch = (values: Partial<EditorState>) =>
    setState((prev) => ({ ...prev, ...values }));

  // Reset to defaults whenever the selected year changes.
  useEffect(() => {
    setEditing(false);
    setState(buildDefaults());
    seededYearRef.current = null;
  }, [schoolYear]);

  // Seed the editor from the server once per school year.
  useEffect(() => {
    if (isLoading) return;
    if (settings && seededYearRef.current !== schoolYear) {
      setState(fromSettings(settings));
      seededYearRef.current = schoolYear;
      setEditing(true);
    }
  }, [settings, isLoading, schoolYear]);

  const saturdayEnabled = state.enabledDays.includes("saturday");

  const weekdayComputed = useMemo(
    () =>
      computeSchedule(
        { startTime: state.startTime, blocks: state.blocks },
        { minPeriods: 5, maxPeriods: 8 }
      ),
    [state.startTime, state.blocks]
  );

  const saturdayComputed = useMemo(
    () =>
      computeSchedule(
        { startTime: state.saturdayStartTime, blocks: state.saturdayBlocks },
        { minPeriods: 1, maxPeriods: 8 }
      ),
    [state.saturdayStartTime, state.saturdayBlocks]
  );

  const formValid =
    state.enabledDays.length > 0 &&
    weekdayComputed.valid &&
    (!saturdayEnabled ||
      state.saturdayMode === "weekday" ||
      saturdayComputed.valid);

  const applyPreset = (blocks: IScheduleBlock[]) => {
    patch({ startTime: DEFAULT_START_TIME, blocks: cloneBlocks(blocks) });
  };

  const handleSave = async () => {
    if (!formValid) return;
    try {
      const saturdayBellSchedule: IBellSchedule | null =
        saturdayEnabled && state.saturdayMode === "own"
          ? { startTime: state.saturdayStartTime, blocks: state.saturdayBlocks }
          : null;

      await save({
        schoolYear,
        enabledDays: state.enabledDays,
        bellSchedule: { startTime: state.startTime, blocks: state.blocks },
        saturdayBellSchedule,
        minimumFreePeriodsPerDay: state.minimumFreePeriodsPerDay,
        maximumWeeklyTaughtPeriods: state.maximumWeeklyTaughtPeriods,
        maximumConsecutivePeriods: state.maximumConsecutivePeriods,
      });
      message.success("Schedule settings saved");
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not load schedule settings"
        description={getErrorMessage(fetchError)}
        action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  const normalizedDerived = readDerived(derived);

  if (!settings && !editing) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <>
              <Title level={4} style={{ marginBottom: 4 }}>
                No schedule configured for {schoolYear}
              </Title>
              <Text type="secondary">
                Start from Monday to Friday and a preset bell schedule, then adjust
                anything you need.
              </Text>
            </>
          }
        />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button type="primary" onClick={() => setEditing(true)}>
            Configure schedule
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card
        title="Enabled days"
        size="small"
        extra={
          <Text type="secondary">
            Saturday can use the weekday schedule or its own.
          </Text>
        }
      >
        <Checkbox.Group
          options={ALL_DAYS.map((day) => ({
            label: DAY_LABELS[day],
            value: day,
          }))}
          value={state.enabledDays}
          onChange={(values) => patch({ enabledDays: values as DayOfWeek[] })}
        />
        {state.enabledDays.length === 0 && (
          <Text type="danger" style={{ display: "block", marginTop: 8 }}>
            Select at least one day.
          </Text>
        )}
      </Card>

      <Card
        title="Bell schedule"
        extra={
          <Space wrap>
            <Text type="secondary">Presets (start 08:30):</Text>
            {SCHEDULE_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                size="small"
                onClick={() => applyPreset(preset.blocks)}
              >
                {preset.label}
              </Button>
            ))}
          </Space>
        }
      >
        <BellScheduleEditor
          startTime={state.startTime}
          onStartTimeChange={(value) => patch({ startTime: value })}
          blocks={state.blocks}
          onChange={(blocks) => patch({ blocks })}
          computed={weekdayComputed}
          previewLabel="Weekday periods"
        />
      </Card>

      {saturdayEnabled && (
        <Card title="Saturday schedule" size="small">
          <Radio.Group
            value={state.saturdayMode}
            onChange={(e) => patch({ saturdayMode: e.target.value })}
            options={[
              { label: "Use the weekday schedule", value: "weekday" },
              { label: "Give Saturday its own schedule", value: "own" },
            ]}
          />
          {state.saturdayMode === "own" && (
            <div style={{ marginTop: 16 }}>
              <BellScheduleEditor
                startTime={state.saturdayStartTime}
                onStartTimeChange={(value) =>
                  patch({ saturdayStartTime: value })
                }
                blocks={state.saturdayBlocks}
                onChange={(blocks) => patch({ saturdayBlocks: blocks })}
                computed={saturdayComputed}
                previewLabel="Saturday periods"
              />
            </div>
          )}
        </Card>
      )}

      <Card title="Teacher limits" size="small">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Space align="center">
              <Text strong>Minimum free periods per day</Text>
              <InputNumber
                min={0}
                precision={0}
                value={state.minimumFreePeriodsPerDay}
                onChange={(value) =>
                  patch({ minimumFreePeriodsPerDay: value ?? 0 })
                }
              />
            </Space>
            <div>
              <Text type="secondary">
                Free (non-teaching) periods a teacher should keep each day.
              </Text>
            </div>
          </div>

          <div>
            <Space align="center">
              <Text strong>Maximum weekly taught periods</Text>
              <InputNumber
                min={1}
                precision={0}
                value={state.maximumWeeklyTaughtPeriods}
                onChange={(value) =>
                  patch({ maximumWeeklyTaughtPeriods: value ?? null })
                }
                placeholder="No limit"
              />
            </Space>
            <div>
              <Text type="secondary">
                Optional. Leave blank for no weekly limit.
              </Text>
            </div>
          </div>

          <div>
            <Space align="center">
              <Text strong>Maximum consecutive periods</Text>
              <InputNumber
                min={1}
                precision={0}
                value={state.maximumConsecutivePeriods}
                onChange={(value) =>
                  patch({ maximumConsecutivePeriods: value ?? null })
                }
                placeholder="No limit"
              />
            </Space>
            <div>
              <Text type="secondary">
                Optional. Leave blank for no consecutive limit.
              </Text>
            </div>
          </div>
        </Space>

        <Divider style={{ margin: "16px 0" }} />

        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isSaving}
          disabled={!formValid}
        >
          Save settings
        </Button>
        {!formValid && (
          <Text type="secondary" style={{ marginLeft: 12 }}>
            Resolve the validation errors before saving.
          </Text>
        )}
      </Card>

      {normalizedDerived && (
        <Card title="Saved results" size="small">
          <Space size="large" wrap>
            <Statistic
              title="Weekly slot count"
              value={normalizedDerived.weeklySlotCount}
            />
            <Statistic
              title="Periods / day"
              value={normalizedDerived.periodsPerDay}
            />
            <Statistic
              title="Daily teaching cap"
              value={normalizedDerived.dailyTeachingCap}
            />
            {normalizedDerived.periods[0] && (
              <Statistic
                title="School day starts"
                value={formatTime12Hour(normalizedDerived.periods[0].start)}
              />
            )}
            <Statistic
              title="School day ends"
              value={formatTime12Hour(normalizedDerived.finishTime)}
            />
          </Space>

          <div style={{ marginTop: 16 }}>
            <Text strong>Periods and daily teaching cap per day</Text>
            <div style={{ marginTop: 8 }}>
              {normalizedDerived.perDay.length === 0 ? (
                <Text type="secondary">-</Text>
              ) : (
                <Space wrap>
                  {normalizedDerived.perDay.map((day) => (
                    <Tag key={day.day}>
                      {dayLabel(day.day)}: {day.periodsPerDay} periods · cap{" "}
                      {day.dailyTeachingCap}
                    </Tag>
                  ))}
                </Space>
              )}
            </div>
          </div>

          {normalizedDerived.saturday && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">
                Saturday:{" "}
                {!normalizedDerived.saturday.enabled
                  ? "not enabled"
                  : normalizedDerived.saturday.usedFallbackToWeekday
                    ? "uses the weekday schedule"
                    : "has its own schedule"}
                {normalizedDerived.saturday.enabled &&
                  normalizedDerived.saturday.dailyTeachingCap != null &&
                  ` · daily cap ${normalizedDerived.saturday.dailyTeachingCap}`}
              </Text>
            </div>
          )}
        </Card>
      )}
    </Space>
  );
}
