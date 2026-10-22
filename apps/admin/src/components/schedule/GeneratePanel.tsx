import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Descriptions,
  InputNumber,
  Progress,
  Space,
  Tag,
  Typography,
} from "antd";
import { ExperimentOutlined, ReloadOutlined } from "@ant-design/icons";
import type {
  IGenerateSchedulePayload,
  IGenerationJobError,
  IGenerationJobResult,
  IPrecheckResult,
  IDraftConflict,
} from "@carecraft/types";
import { useQueryClient } from "@tanstack/react-query";
import { useScheduleGenerate } from "@/hooks/useScheduleGenerate";
import { useGenerationJob, isTerminalJobStatus } from "@/hooks/useGenerationJob";
import {
  getErrorMessage,
  getErrorStatus,
} from "@/components/sections/studentAssignmentUtils";
import { IssueList } from "./ReadinessPanel";
import { phaseLabel } from "./timetableUtils";

const { Text } = Typography;

interface GeneratePanelProps {
  schoolYear: string;
  /** False while the Timetable tab is hidden; stops polling. */
  active: boolean;
  onCompleted: (scheduleId: string) => void;
  onGoToReadiness: () => void;
}

interface ApiErrorData {
  precheck?: IPrecheckResult;
  jobId?: string;
  status?: string;
  scheduleId?: string;
}

const readErrorData = (err: unknown): ApiErrorData | undefined =>
  (err as { response?: { data?: { data?: ApiErrorData } } })?.response?.data
    ?.data;

export function GeneratePanel({
  schoolYear,
  active,
  onCompleted,
  onGoToReadiness,
}: GeneratePanelProps) {
  const queryClient = useQueryClient();
  const { generate, isGenerating } = useScheduleGenerate();

  const [jobId, setJobId] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [iterationBudget, setIterationBudget] = useState<number | null>(null);
  const [timeBudgetMs, setTimeBudgetMs] = useState<number | null>(null);

  const [precheckFailure, setPrecheckFailure] = useState<IPrecheckResult | null>(
    null
  );
  const [draftConflict, setDraftConflict] = useState<IDraftConflict | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [startWarnings, setStartWarnings] = useState<number>(0);
  const [lastError, setLastError] = useState<IGenerationJobError | null>(null);
  const [lastResult, setLastResult] = useState<IGenerationJobResult | null>(null);

  const handledJobRef = useRef<string | null>(null);

  const { job } = useGenerationJob(jobId, active);

  // Reset everything when the school year changes.
  useEffect(() => {
    setJobId(null);
    setPrecheckFailure(null);
    setDraftConflict(null);
    setResumeNotice(null);
    setStartWarnings(0);
    setLastError(null);
    setLastResult(null);
    handledJobRef.current = null;
  }, [schoolYear]);

  // Mirror terminal job outcomes into local state and load the new draft once.
  useEffect(() => {
    if (!job || handledJobRef.current === job.jobId) return;

    if (job.status === "completed" && job.result) {
      handledJobRef.current = job.jobId;
      setLastResult(job.result);
      setLastError(null);
      queryClient.invalidateQueries({ queryKey: ["/schedule/schedules"] });
      onCompleted(job.result.scheduleId);
    } else if (job.status === "failed") {
      handledJobRef.current = job.jobId;
      setLastError(
        job.error ?? { message: "Generation failed.", code: "GENERATION_ERROR" }
      );
    } else if (job.status === "cancelled") {
      handledJobRef.current = job.jobId;
    }
  }, [job, onCompleted, queryClient]);

  const buildPayload = (replace: boolean): IGenerateSchedulePayload => {
    const payload: IGenerateSchedulePayload = { schoolYear };
    if (seed != null) payload.seed = seed;
    if (iterationBudget != null) payload.iterationBudget = iterationBudget;
    if (timeBudgetMs != null) payload.timeBudgetMs = timeBudgetMs;
    if (replace) payload.replaceExistingDraft = true;
    return payload;
  };

  const start = async (replace: boolean) => {
    setPrecheckFailure(null);
    setDraftConflict(null);
    setResumeNotice(null);
    setLastError(null);
    setLastResult(null);
    setStartWarnings(0);

    try {
      const started = await generate(buildPayload(replace));
      if (started?.jobId) {
        setJobId(started.jobId);
        setStartWarnings(started.precheck?.warnings?.length ?? 0);
      }
    } catch (err) {
      const status = getErrorStatus(err);
      const data = readErrorData(err);

      if (status === 400 && data?.precheck) {
        setPrecheckFailure(data.precheck);
        return;
      }
      if (status === 409 && data?.jobId) {
        setJobId(data.jobId);
        setResumeNotice(
          "A generation is already running for this school year. Resuming its progress."
        );
        return;
      }
      if (status === 409 && data?.scheduleId) {
        setDraftConflict({ scheduleId: data.scheduleId });
        return;
      }

      setLastError({
        message: getErrorMessage(err),
        code: status ? `HTTP_${status}` : "GENERATION_ERROR",
      });
    }
  };

  const running = !!jobId && !!job && !isTerminalJobStatus(job.status);
  const busy = isGenerating || running;

  const advancedItems = [
    {
      key: "advanced",
      label: "Advanced options",
      children: (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Space wrap>
            <Text strong>Seed</Text>
            <InputNumber
              min={0}
              precision={0}
              placeholder="Random"
              value={seed}
              onChange={(value) =>
                setSeed(typeof value === "number" ? value : null)
              }
              style={{ width: 180 }}
            />
            <Text type="secondary">
              Reuse a seed for a reproducible result.
            </Text>
          </Space>
          <Space wrap>
            <Text strong>Iteration budget</Text>
            <InputNumber
              min={1}
              precision={0}
              placeholder="Solver default"
              value={iterationBudget}
              onChange={(value) =>
                setIterationBudget(typeof value === "number" ? value : null)
              }
              style={{ width: 180 }}
            />
            <Text type="secondary">Leave blank to use the default.</Text>
          </Space>
          <Space wrap>
            <Text strong>Time budget (ms)</Text>
            <InputNumber
              min={1}
              precision={0}
              placeholder="Solver default"
              value={timeBudgetMs}
              onChange={(value) =>
                setTimeBudgetMs(typeof value === "number" ? value : null)
              }
              style={{ width: 180 }}
            />
            <Text type="secondary">
              Stop the solver after this many milliseconds.
            </Text>
          </Space>
        </Space>
      ),
    },
  ];

  const progressStatus: "success" | "exception" | "active" =
    job?.status === "failed"
      ? "exception"
      : job?.status === "completed"
        ? "success"
        : "active";

  return (
    <Card
      title={
        <Space>
          <ExperimentOutlined style={{ color: "#1677ff" }} />
          <span>Generate schedule</span>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space wrap align="center">
          <Text strong>School year</Text>
          <Tag color="blue">{schoolYear}</Tag>
          <Button
            type="primary"
            loading={isGenerating}
            disabled={busy}
            onClick={() => start(false)}
          >
            Generate
          </Button>
          {busy && <Text type="secondary">Generation in progress…</Text>}
        </Space>

        <Collapse ghost items={advancedItems} />

        {resumeNotice && (
          <Alert type="info" showIcon message={resumeNotice} />
        )}

        {startWarnings > 0 && !precheckFailure && (
          <Alert
            type="warning"
            showIcon
            message={`Readiness reported ${startWarnings} warning${
              startWarnings === 1 ? "" : "s"
            }`}
            description="The solver will continue; review the Readiness tab for details."
            action={
              <Button size="small" onClick={onGoToReadiness}>
                Open Readiness
              </Button>
            }
          />
        )}

        {precheckFailure && (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Alert
              type="error"
              showIcon
              message="Readiness check failed"
              description="The schedule was not generated. Fix the errors below, then try again."
              action={
                <Button size="small" onClick={onGoToReadiness}>
                  Open Readiness
                </Button>
              }
            />
            <IssueList title="Errors" items={precheckFailure.errors} color="red" />
            <IssueList
              title="Warnings"
              items={precheckFailure.warnings}
              color="gold"
            />
          </Space>
        )}

        {draftConflict && (
          <Alert
            type="warning"
            showIcon
            message="A draft already exists for this school year"
            description={
              <span>
                Generating again replaces the existing draft (id{" "}
                <Text code>{draftConflict.scheduleId}</Text>) and all of its
                placed lessons. The replacement keeps any locked lessons.
              </span>
            }
            action={
              <Button
                danger
                onClick={() => start(true)}
                disabled={busy}
              >
                Replace draft and generate
              </Button>
            }
          />
        )}

        {job && (
          <Card size="small" title="Progress">
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space wrap>
                <Tag
                  color={
                    job.status === "failed"
                      ? "red"
                      : job.status === "completed"
                        ? "green"
                        : "blue"
                  }
                >
                  {job.status}
                </Tag>
                <Text>{phaseLabel(job.progress)}</Text>
              </Space>
              <Progress
                percent={job.progress?.percent ?? 0}
                status={progressStatus}
              />
              {job.progress?.message && (
                <Text type="secondary">{job.progress.message}</Text>
              )}

              {lastResult && (
                <Descriptions size="small" column={2} style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Placed lessons">
                    {lastResult.entryCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Unplaced">
                    {lastResult.unplacedCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Schedule">
                    {lastResult.scheduleId}
                  </Descriptions.Item>
                  {lastResult.droppedLocked?.length ? (
                    <Descriptions.Item label="Dropped locks">
                      {lastResult.droppedLocked.length}
                    </Descriptions.Item>
                  ) : null}
                </Descriptions>
              )}
            </Space>
          </Card>
        )}

        {lastError && (
          <Alert
            type="error"
            showIcon
            message="Generation failed"
            description={
              <span>
                {lastError.message}
                <br />
                <Text type="secondary">Code: {lastError.code}</Text>
              </span>
            }
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => start(false)}
                disabled={busy}
              >
                Retry
              </Button>
            }
          />
        )}

        {!job && !precheckFailure && !draftConflict && !lastError && (
          <Text type="secondary">
            Generation solves the whole school at once for the selected year.
            Check the Readiness tab first to avoid a failed run.
          </Text>
        )}
      </Space>
    </Card>
  );
}
