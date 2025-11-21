import { useState } from "react";
import { Button, Space, Spin, Empty, message, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { TermRow } from "./TermRow";
import { AcademicTermDrawer } from "./AcademicTermDrawer";
import { useAcademicTerms, type IAcademicTerm } from "@/hooks/useAcademicTerms";
import dayjs from "dayjs";

interface TermsPanelProps {
  academicYearId: string;
  academicYearName: string;
}

export const TermsPanel = ({
  academicYearId,
  academicYearName,
}: TermsPanelProps) => {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("edit");
  const [selectedTerm, setSelectedTerm] = useState<IAcademicTerm | null>(null);

  const {
    terms,
    currentTerm,
    isLoading,
    create,
    update,
    remove,
    setCurrent,
    isCreating,
    isUpdating,
  } = useAcademicTerms(academicYearId);

  const openDrawer = (term: IAcademicTerm | null, mode: "view" | "edit") => {
    setSelectedTerm(term);
    setDrawerMode(mode);

    if (term && mode === "edit") {
      form.setFieldsValue({
        name: term.name,
        startDate: dayjs(term.startDate),
        endDate: dayjs(term.endDate),
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedTerm(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      // Count existing terms to generate next sequence
      const nextSequence =
        terms.length > 0
          ? Math.max(...terms.map((t) => t.sequence || 0)) + 1
          : 1;

      const payload = {
        calendarId: academicYearId, // correct field name
        name: values.name,
        sequence: nextSequence, // THIS WAS MISSING → causes 400
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        isCurrent: values.isCurrent || false,
      };

      if (selectedTerm) {
        await update(selectedTerm._id, payload);
        message.success("Term updated successfully");
      } else {
        await create(payload);
        message.success("Term created successfully");
      }
      closeDrawer();
    } catch (err: any) {
      console.error("Term save failed:", err);
      message.error(err?.response?.data?.message || "Failed to save term");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      message.success("Term deleted");
    } catch {
      message.error("Failed to delete term");
    }
  };

  const handleSetCurrent = async (id: string) => {
    try {
      await setCurrent(id);
      message.success("Current term updated");
    } catch {
      message.error("Failed to set current term");
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
              isCurrentTerm={currentTerm?._id === term._id}
              onEdit={(t) => openDrawer(t, "edit")}
              onDelete={handleDelete}
              onSetCurrent={handleSetCurrent}
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
      />
    </div>
  );
};
