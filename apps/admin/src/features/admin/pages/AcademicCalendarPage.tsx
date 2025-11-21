import { useState } from "react";
import {
  Button,
  Card,
  Space,
  Typography,
  Tag,
  message,
  Modal,
  Empty,
  Form,
} from "antd";
import {
  PlusOutlined,
  CrownOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { AcademicCalendarDrawer } from "@/components/calendar/AcademicCalendarDrawer";
import { TermsPanel } from "@/components/terms/TermsPanel";
import {
  useAcademicCalendars,
  type IAcademicCalendar,
} from "@/hooks/useAcademicCalendars";

const { Text } = Typography;
const { confirm } = Modal; // We'll replace static usage with controlled for compatibility

export default function AcademicCalendarPage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] =
    useState<IAcademicCalendar | null>(null);

  // Add states for controlled modals to avoid React 19 / Next.js issues with static modals
  const [confirmCurrentVisible, setConfirmCurrentVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [pendingCalendar, setPendingCalendar] =
    useState<IAcademicCalendar | null>(null);

  const {
    calendars,
    currentCalendar,
    isLoading,
    create,
    update,
    remove,
    setCurrent,
    isCreating,
    isUpdating,
  } = useAcademicCalendars();

  const openDrawer = (calendar: IAcademicCalendar | null) => {
    setSelectedCalendar(calendar);
    if (calendar) {
      form.setFieldsValue({
        academicYear: calendar.academicYear,
        startDate: dayjs(calendar.startDate),
        endDate: dayjs(calendar.endDate),
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

  // Open confirm for set current
  const showSetCurrentConfirm = (calendar: IAcademicCalendar) => {
    setPendingCalendar(calendar);
    setConfirmCurrentVisible(true);
  };

  // Handle set current confirm OK
  const handleSetCurrentOk = async () => {
    if (!pendingCalendar) return;
    try {
      await setCurrent(pendingCalendar._id);
      message.success(
        `${pendingCalendar.academicYear} is now the current year`
      );
    } catch (err: any) {
      message.error("Failed to set current year");
      console.error(err);
    } finally {
      setConfirmCurrentVisible(false);
      setPendingCalendar(null);
    }
  };

  // Open confirm for delete
  const showDeleteConfirm = (calendar: IAcademicCalendar) => {
    setPendingCalendar(calendar);
    setConfirmDeleteVisible(true);
  };

  // Handle delete confirm OK
  const handleDeleteOk = async () => {
    if (!pendingCalendar) return;
    try {
      await remove(pendingCalendar._id);
      message.success("Academic year deleted");
    } catch {
      message.error("Failed to delete");
    } finally {
      setConfirmDeleteVisible(false);
      setPendingCalendar(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        academicYear: values.academicYear,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        isCurrent: false, // backend will handle this
      };

      if (selectedCalendar) {
        await update(selectedCalendar._id, payload);
        message.success("Academic year updated");
      } else {
        await create(payload);
        message.success("Academic year created");
      }
      closeDrawer();
    } catch (err: any) {
      if (!err.errorFields) message.error("Please check your input");
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
          {currentCalendar && (
            <Text type="secondary">
              Current Year:{" "}
              <Tag icon={<CrownOutlined />} color="green">
                {currentCalendar.academicYear}
              </Tag>
            </Text>
          )}
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openDrawer(null)}
        >
          Add Academic Year
        </Button>
      </div>

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
              const isCurrent = cal._id === currentCalendar?._id;

              return (
                <Card
                  key={cal._id}
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    background: isCurrent
                      ? "var(--card-success-background)"
                      : undefined,
                  }}
                >
                  {/* Header */}
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
                        {isCurrent && (
                          <Tag icon={<CrownOutlined />} color="success">
                            CURRENT YEAR
                          </Tag>
                        )}
                      </Space>

                      <Space>
                        {!isCurrent && (
                          <Button
                            type="primary"
                            ghost
                            onClick={() => showSetCurrentConfirm(cal)}
                          >
                            Set as Current
                          </Button>
                        )}
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => openDrawer(cal)}
                        >
                          Edit
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          disabled={isCurrent}
                          onClick={() => {
                            if (!isCurrent) showDeleteConfirm(cal);
                          }}
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        {dayjs(cal.startDate).format("D MMMM YYYY")} –{" "}
                        {dayjs(cal.endDate).format("D MMMM YYYY")}
                      </Text>
                    </div>
                  </div>

                  {/* Terms Panel */}
                  <div style={{ borderTop: "1px solid " }}>
                    <TermsPanel
                      academicYearId={cal._id}
                      academicYearName={cal.academicYear}
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

      {/* Controlled Set Current Modal */}
      <Modal
        title={
          <>
            <ExclamationCircleOutlined
              style={{ color: "var(--warning)", marginRight: 8 }}
            />
            Set as Current Year?
          </>
        }
        open={confirmCurrentVisible}
        onOk={handleSetCurrentOk}
        onCancel={() => setConfirmCurrentVisible(false)}
        okText="Yes, Set Current"
        cancelText="Cancel"
      >
        <p>
          This will make <strong>{pendingCalendar?.academicYear}</strong> the
          active academic year.
        </p>
      </Modal>

      {/* Controlled Delete Modal */}
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
        onCancel={() => setConfirmDeleteVisible(false)}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>
          <strong>{pendingCalendar?.academicYear}</strong> and all its terms
          will be permanently deleted.
        </p>
      </Modal>
    </>
  );
}
