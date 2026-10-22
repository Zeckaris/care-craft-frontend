import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Space,
  Typography,
  Modal,
  Empty,
  Form,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { extractApiErrorMessage } from "@carecraft/query-core";
import type { IAcademicCalendar } from "@carecraft/types";
import { AcademicCalendarDrawer } from "@/components/calendar/AcademicCalendarDrawer";
import { AcademicStatusTag } from "@/components/calendar/AcademicStatusTag";
import { CurrentAcademicContextBanner } from "@/components/calendar/CurrentAcademicContextBanner";
import { TermsPanel } from "@/components/terms/TermsPanel";
import { useAcademicCalendars } from "@/hooks/useAcademicCalendars";
import { isAcademicCurrentHighlight } from "@/utils/academic";
import { toSchoolDate } from "@/utils/schoolDate";

const { Text } = Typography;

const DATE_FORMAT = "YYYY-MM-DD";

export default function AcademicCalendarPage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] =
    useState<IAcademicCalendar | null>(null);

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [pendingCalendar, setPendingCalendar] =
    useState<IAcademicCalendar | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    calendars,
    isLoading,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
  } = useAcademicCalendars();

  const formatDate = (date: string | Date | null | undefined) => {
    const schoolDate = toSchoolDate(date);
    return schoolDate ? dayjs(schoolDate).format("D MMMM YYYY") : "-";
  };

  const openDrawer = (calendar: IAcademicCalendar | null) => {
    setSelectedCalendar(calendar);
    if (calendar) {
      form.setFieldsValue({
        academicYear: calendar.academicYear,
        startDate: dayjs(toSchoolDate(calendar.startDate)),
        endDate: dayjs(toSchoolDate(calendar.endDate)),
        registrationStartDate: calendar.registrationStartDate
          ? dayjs(toSchoolDate(calendar.registrationStartDate))
          : null,
        registrationEndDate: calendar.registrationEndDate
          ? dayjs(toSchoolDate(calendar.registrationEndDate))
          : null,
        newStudentRegistrationStartDate:
          calendar.newStudentRegistrationStartDate
            ? dayjs(toSchoolDate(calendar.newStudentRegistrationStartDate))
            : null,
        newStudentRegistrationEndDate: calendar.newStudentRegistrationEndDate
          ? dayjs(toSchoolDate(calendar.newStudentRegistrationEndDate))
          : null,
        holidayDates: calendar.holidayDates.map((date) =>
          dayjs(toSchoolDate(date)),
        ),
      });
    } else {
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCalendar(null);
    form.resetFields();
  };

  const showDeleteConfirm = (calendar: IAcademicCalendar) => {
    setPendingCalendar(calendar);
    setDeleteError(null);
    setConfirmDeleteVisible(true);
  };

  const handleDeleteOk = async () => {
    if (!pendingCalendar) return;
    try {
      await remove(pendingCalendar._id);
      setConfirmDeleteVisible(false);
      setPendingCalendar(null);
      setDeleteError(null);
    } catch (err) {
      // The shared useApi handler already shows the backend message; keep the
      // modal open and repeat it here so the blockers stay visible.
      setDeleteError(extractApiErrorMessage(err));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const toDateString = (
        value: Dayjs | null | undefined,
      ): string | null => (value ? value.format(DATE_FORMAT) : null);

      const holidayDates = (
        (values.holidayDates ?? []) as Array<Dayjs | null | undefined>
      )
        .filter((date): date is Dayjs => Boolean(date))
        .map((date) => date.format(DATE_FORMAT));

      const payload = {
        academicYear: values.academicYear,
        startDate: toDateString(values.startDate) as string,
        endDate: toDateString(values.endDate) as string,
        registrationStartDate: toDateString(values.registrationStartDate),
        registrationEndDate: toDateString(values.registrationEndDate),
        newStudentRegistrationStartDate: toDateString(
          values.newStudentRegistrationStartDate,
        ),
        newStudentRegistrationEndDate: toDateString(
          values.newStudentRegistrationEndDate,
        ),
        holidayDates,
      };

      if (selectedCalendar) {
        await update(selectedCalendar._id, payload);
      } else {
        await create(payload);
      }

      closeDrawer();
    } catch (err) {
      const validationError = err as { errorFields?: unknown };
      if (validationError?.errorFields) return;

      const apiError = err as { response?: { status?: number } };
      if (apiError?.response?.status === 409) {
        form.setFields([
          {
            name: "academicYear",
            errors: [extractApiErrorMessage(err)],
          },
        ]);
      }
      // Non-validation failures are surfaced by the shared useApi handler.
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        Loading academic years...
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Academic Calendar</h2>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openDrawer(null)}
        >
          Add Academic Year
        </Button>
      </div>

      <CurrentAcademicContextBanner />

      {/* No calendars yet */}
      {calendars.length === 0 ? (
        <Empty
          description="No academic years found"
          style={{ margin: "60px 0" }}
        >
          <Button type="primary" onClick={() => openDrawer(null)}>
            Create First Academic Year
          </Button>
        </Empty>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {calendars
            .sort((a, b) => b.academicYear.localeCompare(a.academicYear))
            .map((cal) => {
              const isStrongCurrent = isAcademicCurrentHighlight(cal.status);

              return (
                <Card
                  key={cal._id}
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    background: isStrongCurrent
                      ? "var(--card-success-background)"
                      : undefined,
                  }}
                >
                  <div
                    style={{
                      padding: "16px 24px",
                      background: "var(--background)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space size="middle">
                        <h3
                          style={{ margin: 0, fontSize: 20, fontWeight: 600 }}
                        >
                          {cal.academicYear}
                        </h3>
                        <AcademicStatusTag
                          status={cal.status}
                          isCurrent={cal.isCurrent}
                        />
                      </Space>

                      <Space>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => openDrawer(cal)}
                        >
                          Edit
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteConfirm(cal)}
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        {formatDate(cal.startDate)} – {formatDate(cal.endDate)}
                      </Text>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid " }}>
                    <TermsPanel
                      academicYearId={cal._id}
                      academicYearName={cal.academicYear}
                      calendars={calendars}
                    />
                  </div>
                </Card>
              );
            })}
        </Space>
      )}

      {/* Drawer */}
      <AcademicCalendarDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        calendar={selectedCalendar}
        mode="edit"
        form={form}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
      />

      {/* Delete confirmation */}
      <Modal
        title={
          <>
            <ExclamationCircleOutlined
              style={{ color: "var(--danger)", marginRight: 8 }}
            />
            Delete Academic Year?
          </>
        }
        open={confirmDeleteVisible}
        onOk={handleDeleteOk}
        onCancel={() => {
          setConfirmDeleteVisible(false);
          setPendingCalendar(null);
          setDeleteError(null);
        }}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>
          <strong>{pendingCalendar?.academicYear}</strong> and all its terms
          will be permanently deleted.
        </p>
        {deleteError && (
          <Alert
            type="error"
            showIcon
            message={deleteError}
            style={{ marginTop: 16 }}
          />
        )}
      </Modal>
    </>
  );
}
