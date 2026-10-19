/**
 * AssessmentResultsPage
 *
 * Read-only results sheet for admins and coordinators. A grade, section,
 * subject, school year and term are chosen by cascading selects; the sheet
 * loads once section, subject and term are set. The server only reveals marks
 * for locked stages. The only action here is reopening a locked stage.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  Empty,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import type { ClassSheetColumn, ISection } from "@carecraft/types";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import { useGSA } from "@/hooks/useGSA";
import {
  assessmentsApi,
  useCurrentTerm,
  useResults,
  useTerms,
} from "@/hooks/useAssessmentResults";
import { AssessmentResultsTable } from "@/components/assessments/AssessmentResultsTable";

const { Text } = Typography;

/** Normalises a grade level to a single, human-readable string. */
function gradeLevelLabel(level: string | null | undefined): string {
  const raw = String(level ?? "").trim();
  if (!raw) return "";
  if (/^grade\b/i.test(raw) || !/^\d/.test(raw)) return raw;
  return `Grade ${raw}`;
}

/** Canonical section label, e.g. "Grade 1A". */
function formatSectionLabel(section: ISection): string {
  const grade = gradeLevelLabel(section.gradeId?.level);
  const name = String(section.name ?? "")
    .replace(/^section\b[\s:.-]*/i, "")
    .trim();
  return `${grade}${name}`;
}

function errorMessage(error: unknown): string {
  return (error as Error)?.message || "Something went wrong. Please try again.";
}

export default function AssessmentResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [year, setYear] = useState<string | undefined>(
    searchParams.get("year") ?? undefined
  );
  const [gradeId, setGradeId] = useState<string | undefined>(
    searchParams.get("grade") ?? undefined
  );
  const [sectionId, setSectionId] = useState<string | undefined>(
    searchParams.get("section") ?? undefined
  );
  const [subjectId, setSubjectId] = useState<string | undefined>(
    searchParams.get("subject") ?? undefined
  );
  const [termId, setTermId] = useState<string | undefined>(
    searchParams.get("term") ?? undefined
  );

  // Keep the selections in the URL so refresh and back navigation restore them.
  useEffect(() => {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (gradeId) params.set("grade", gradeId);
    if (sectionId) params.set("section", sectionId);
    if (subjectId) params.set("subject", subjectId);
    if (termId) params.set("term", termId);
    setSearchParams(params, { replace: true });
  }, [year, gradeId, sectionId, subjectId, termId, setSearchParams]);

  const { data: terms = [], isLoading: termsLoading } = useTerms();
  const { data: currentTerm } = useCurrentTerm();
  const { grades, isLoading: gradesLoading } = useGrades({
    pagination: { page: 1, pageSize: 200 },
  });
  const { sections, isLoading: sectionsLoading } = useSections({
    gradeId,
    schoolYear: year,
    pageSize: 500,
    enabled: Boolean(gradeId && year),
  });
  const { gsas, isLoading: subjectsLoading } = useGSA({
    gradeId,
    pagination: { page: 1, pageSize: 50 },
    enabled: Boolean(gradeId),
  });

  const years = useMemo(() => {
    const unique = new Set<string>();
    terms.forEach((term) => {
      const value = term.calendarId?.academicYear;
      if (value) unique.add(value);
    });
    return Array.from(unique).sort((a, b) => b.localeCompare(a));
  }, [terms]);

  const yearTerms = useMemo(
    () =>
      terms
        .filter((term) => term.calendarId?.academicYear === year)
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)),
    [terms, year]
  );

  const gradeOptions = useMemo(
    () => grades.map((grade) => ({ label: grade.level, value: grade._id })),
    [grades]
  );

  const sectionOptions = useMemo(
    () =>
      sections.map((section) => ({
        label: formatSectionLabel(section),
        value: section._id,
      })),
    [sections]
  );

  const subjectOptions = useMemo(
    () =>
      gsas.map((gsa) => ({
        label: gsa.assessmentSetupId?.name
          ? `${gsa.subjectId.name} (${gsa.assessmentSetupId.name})`
          : gsa.subjectId.name,
        value: gsa.subjectId._id,
      })),
    [gsas]
  );

  const termOptions = useMemo(
    () => yearTerms.map((term) => ({ label: term.name, value: term._id })),
    [yearTerms]
  );

  // Default the school year to the current term's year when possible, and drop
  // a year that no longer exists (for example from a stale shared URL).
  useEffect(() => {
    if (years.length === 0) return;
    if (year && years.includes(year)) return;
    const currentYear = currentTerm?.calendarId?.academicYear;
    setYear(currentYear && years.includes(currentYear) ? currentYear : years[0]);
  }, [year, years, currentTerm]);

  // Default the term to the current term when it belongs to the year, else the
  // first term of that year. Clears a term that no longer belongs to the year.
  useEffect(() => {
    if (!year || yearTerms.length === 0) return;
    if (termId && yearTerms.some((term) => term._id === termId)) return;
    const current = yearTerms.find((term) => term.isCurrent);
    setTermId(current?._id ?? yearTerms[0]._id);
  }, [year, yearTerms, termId]);

  // Drop a section that is not part of the chosen grade and year.
  useEffect(() => {
    if (!gradeId || !year || !sectionId || sectionsLoading) return;
    if (!sections.some((section) => section._id === sectionId)) {
      setSectionId(undefined);
    }
  }, [gradeId, year, sectionId, sections, sectionsLoading]);

  // Drop a subject that has no setup for the chosen grade.
  useEffect(() => {
    if (!gradeId || !subjectId || subjectsLoading) return;
    if (!subjectOptions.some((option) => option.value === subjectId)) {
      setSubjectId(undefined);
    }
  }, [gradeId, subjectId, subjectOptions, subjectsLoading]);

  const { data, isLoading, isFetching, isError, error, refetch } = useResults(
    sectionId,
    subjectId,
    termId
  );

  const selectionReady = Boolean(
    year && gradeId && sectionId && subjectId && termId
  );

  const [reopenColumn, setReopenColumn] = useState<ClassSheetColumn | null>(
    null
  );
  const [reopening, setReopening] = useState(false);

  const handleYearChange = (value: string | undefined) => {
    setYear(value);
    setSectionId(undefined);
    setTermId(undefined);
  };

  const handleGradeChange = (value: string | undefined) => {
    setGradeId(value);
    setSectionId(undefined);
    setSubjectId(undefined);
  };

  const handleReopen = async () => {
    if (!reopenColumn || !sectionId || !subjectId || !termId) return;
    setReopening(true);
    try {
      await assessmentsApi.reopenStage({
        sectionId,
        subjectId,
        academicTermId: termId,
        assessmentTypeId: reopenColumn.typeId,
      });
      message.success(`${reopenColumn.name} reopened`);
      setReopenColumn(null);
      await refetch();
    } catch (err) {
      message.error(errorMessage(err));
    } finally {
      setReopening(false);
    }
  };

  const selectedSection = sections.find((section) => section._id === sectionId);
  const selectedSubject = gsas.find((gsa) => gsa.subjectId._id === subjectId);
  const selectedTerm = terms.find((term) => term._id === termId);
  const summary = [
    selectedSection ? formatSectionLabel(selectedSection) : undefined,
    selectedSubject?.subjectId.name,
    selectedTerm?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Assessment Results</h2>
        <Text type="secondary">
          Open any section's class sheet for a subject and term.
        </Text>
      </div>

      <Space wrap size="middle" style={{ marginBottom: 16 }}>
        <div>
          <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            School year
          </Text>
          <Select<string>
            style={{ width: 160 }}
            placeholder="Select year"
            value={year}
            onChange={handleYearChange}
            options={years.map((value) => ({ label: value, value }))}
            loading={termsLoading}
            showSearch
            optionFilterProp="label"
          />
        </div>
        <div>
          <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            Grade
          </Text>
          <Select<string>
            style={{ width: 160 }}
            placeholder="Select grade"
            value={gradeId}
            onChange={handleGradeChange}
            options={gradeOptions}
            loading={gradesLoading}
            showSearch
            optionFilterProp="label"
          />
        </div>
        <div>
          <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            Section
          </Text>
          <Select<string>
            style={{ width: 180 }}
            placeholder="Select section"
            value={sectionId}
            onChange={setSectionId}
            options={sectionOptions}
            loading={sectionsLoading}
            disabled={!gradeId || !year}
            showSearch
            optionFilterProp="label"
          />
        </div>
        <div>
          <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            Subject
          </Text>
          <Select<string>
            style={{ width: 240 }}
            placeholder="Select subject"
            value={subjectId}
            onChange={setSubjectId}
            options={subjectOptions}
            loading={subjectsLoading}
            disabled={!gradeId}
            showSearch
            optionFilterProp="label"
          />
        </div>
        <div>
          <Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            Term
          </Text>
          <Select<string>
            style={{ width: 160 }}
            placeholder="Select term"
            value={termId}
            onChange={setTermId}
            options={termOptions}
            loading={termsLoading}
            disabled={!year}
          />
        </div>
      </Space>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Marks appear here once the subject teacher completes and locks each assessment. Totals and averages count completed assessments only."
      />

      {!selectionReady ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Select a grade, section and subject to view results."
        />
      ) : isLoading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Spin />
        </div>
      ) : isError && !data ? (
        <Alert
          type="error"
          showIcon
          message="Could not load the results"
          description={errorMessage(error)}
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      ) : data ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Text strong>{summary}</Text>
            {isFetching && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Refreshing...
              </Text>
            )}
          </div>

          {!data.hasLockedStages && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message="No assessment has been completed and locked yet"
              description="The columns below show each assessment's state. Marks become visible here as the subject teacher completes and locks each one."
            />
          )}

          {data.students.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No students are enrolled in this section."
            />
          ) : (
            <AssessmentResultsTable
              columns={data.columns}
              students={data.students}
              onReopen={setReopenColumn}
              reopeningTypeId={reopening ? reopenColumn?.typeId ?? null : null}
            />
          )}
        </>
      ) : null}

      <Modal
        open={reopenColumn != null}
        title={reopenColumn ? `Reopen ${reopenColumn.name}?` : "Reopen stage"}
        okText="Reopen"
        cancelText="Cancel"
        confirmLoading={reopening}
        onOk={() => void handleReopen()}
        onCancel={() => setReopenColumn(null)}
      >
        <p>
          The marks for this stage will be hidden from this view again until the
          subject teacher completes it again.
        </p>
        <p>
          The subject teacher will be able to edit the marks until they complete
          the stage again.
        </p>
      </Modal>
    </div>
  );
}
