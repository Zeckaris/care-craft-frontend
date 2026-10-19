import { useState } from "react";
import { Button, Spin, Empty, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { IAcademicCalendar, IAcademicTerm } from "@carecraft/types";
import { TermRow } from "./TermRow";
import {
  AcademicTermDrawer,
  type AcademicTermFormValues,
} from "./AcademicTermDrawer";
import { useAcademicTerms } from "@/hooks/useAcademicTerms";
import { normalizeCalendarId } from "@/utils/academic";
import { toSchoolDate } from "@/utils/schoolDate";

interface TermsPanelProps {
  academicYearId: string;
  academicYearName: string;
  calendars: IAcademicCalendar[];
}

export const TermsPanel = ({
  academicYearId,
  academicYearName,
  calendars,
}: TermsPanelProps) => {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("edit");
  const [selectedTerm, setSelectedTerm] = useState<IAcademicTerm | null>(null);

  const { terms, isLoading, create, update, remove, isCreating, isUpdating } =
    useAcademicTerms(academicYearId);

  const nextSequence =
    terms.length > 0 ? Math.max(...terms.map((term) => term.sequence || 0)) + 1 : 1;

  const openDrawer = (term: IAcademicTerm | null, mode: "view" | "edit") => {
    setSelectedTerm(term);
    setDrawerMode(mode);

    if (term && mode === "edit") {
      form.setFieldsValue({
        calendarId: normalizeCalendarId(term.calendarId) || academicYearId,
        name: term.name,
        sequence: term.sequence,
        startDate: dayjs(toSchoolDate(term.startDate)),
        endDate: dayjs(toSchoolDate(term.endDate)),
      });
    } else {
      form.resetFields();
      if (mode === "edit") {
        form.setFieldsValue({
          calendarId: academicYearId,
          sequence: nextSequence,
        });
      }
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedTerm(null);
    form.resetFields();
  };

  const handleSubmit = async (values: AcademicTermFormValues) => {
    const payload = {
      calendarId: values.calendarId,
      name: values.name,
      sequence: values.sequence,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
    };

    try {
      if (selectedTerm) {
        await update(selectedTerm._id, payload);
      } else {
        await create(payload);
      }
      closeDrawer();
    } catch {
      // The shared useApi error handler surfaces the backend message.
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch {
      // The shared useApi error handler surfaces the backend message.
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
      {/* Terms List */}
      <div style={{ padding: "0 16px" }}>
        {terms.length === 0 ? (
          <Empty description="No terms yet" style={{ margin: "32px 0" }} />
        ) : (
          terms.map((term) => (
            <TermRow
              key={term._id}
              term={term}
              onEdit={(item) => openDrawer(item, "edit")}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Add Term Button */}
      <div style={{ padding: "12px 16px", borderTop: "1px dashed #d9d9d9" }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          block
          onClick={() => openDrawer(null, "edit")}
        >
          Add Term
        </Button>
      </div>

      {/* Drawer */}
      <AcademicTermDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        term={selectedTerm}
        mode={drawerMode}
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
        academicYear={academicYearName}
        calendars={calendars}
        terms={terms}
      />
    </div>
  );
};
