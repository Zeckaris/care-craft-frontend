import {
  Drawer,
  Descriptions,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  Select,
  InputNumber,
  Typography,
  type FormInstance,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import type { IAcademicCalendar, IAcademicTerm } from "@carecraft/types";
import { normalizeCalendarId } from "@/utils/academic";
import { toSchoolDate } from "@/utils/schoolDate";
import { AcademicStatusTag } from "@/components/calendar/AcademicStatusTag";

const { Text } = Typography;
const DATE_FORMAT = "YYYY-MM-DD";

export interface AcademicTermFormValues {
  calendarId: string;
  name: string;
  sequence: number;
  startDate: Dayjs;
  endDate: Dayjs;
}

interface AcademicTermDrawerProps {
  open: boolean;
  onClose: () => void;
  term: IAcademicTerm | null;
  mode: "view" | "edit";
  form: FormInstance;
  onSubmit: (values: AcademicTermFormValues) => void;
  loading?: boolean;
  academicYear?: string;
  calendars: IAcademicCalendar[];
  terms: IAcademicTerm[];
}

export function AcademicTermDrawer({
  open,
  onClose,
  term,
  mode,
  form,
  onSubmit,
  loading = false,
  academicYear,
  calendars,
  terms,
}: AcademicTermDrawerProps) {
  const isView = mode === "view";
  const selectedCalendarId = Form.useWatch("calendarId", form);
  const selectedCalendar = calendars.find(
    (calendar) => calendar._id === selectedCalendarId,
  );

  const formatDate = (date: string | Date | null | undefined): string => {
    const schoolDate = toSchoolDate(date);
    return schoolDate ? dayjs(schoolDate).format("DD MMMM YYYY") : "-";
  };

  const termCalendarId = normalizeCalendarId(term?.calendarId);
  const termCalendar = calendars.find(
    (calendar) => calendar._id === termCalendarId,
  );

  const otherTermsFor = (calendarId: string) =>
    terms.filter(
      (item) =>
        item._id !== term?._id &&
        normalizeCalendarId(item.calendarId) === calendarId,
    );

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {isView
              ? "Term Details"
              : term?._id
                ? "Edit Term"
                : "Create New Term"}
            {academicYear && !isView && (
              <span style={{ marginLeft: 8, opacity: 0.7 }}>
                — {academicYear}
              </span>
            )}
          </span>
          <CloseOutlined
            onClick={onClose}
            style={{ cursor: "pointer", fontSize: 16 }}
          />
        </div>
      }
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      closeIcon={null}
      footer={
        !isView && (
          <div style={{ textAlign: "right", padding: "8px 0" }}>
            <Space>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="primary"
                loading={loading}
                onClick={() => form.submit()}
              >
                {term?._id ? "Update" : "Create"}
              </Button>
            </Space>
          </div>
        )
      }
    >
      {isView ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Calendar">
            {termCalendar?.academicYear ??
              (typeof term?.calendarId === "string"
                ? term.calendarId
                : term?.calendarId?.academicYear) ??
              "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Term Name">
            <strong>{term?.name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {term?.status ? (
              <AcademicStatusTag
                status={term.status}
                isCurrent={term.isCurrent}
              />
            ) : (
              "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Sequence">
            {term?.sequence ?? "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">
            {formatDate(term?.startDate)}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {formatDate(term?.endDate)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            name="calendarId"
            label="Calendar"
            rules={[{ required: true, message: "Please select a calendar" }]}
          >
            <Select
              placeholder="Select academic year"
              options={calendars.map((calendar) => ({
                label: calendar.academicYear,
                value: calendar._id,
              }))}
              disabled={loading}
            />
          </Form.Item>

          {selectedCalendar && (
            <div style={{ marginTop: -12, marginBottom: 16 }}>
              <Text type="secondary">
                Calendar dates: {formatDate(selectedCalendar.startDate)} –{" "}
                {formatDate(selectedCalendar.endDate)}
              </Text>
            </div>
          )}

          <Form.Item
            name="name"
            label="Term Name"
            dependencies={["calendarId"]}
            rules={[
              { required: true, message: "Please enter term name" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const calendarId = getFieldValue("calendarId");
                  const duplicate = otherTermsFor(calendarId).some(
                    (item) =>
                      item.name.trim().toLowerCase() ===
                      String(value).trim().toLowerCase(),
                  );
                  if (duplicate) {
                    return Promise.reject(
                      new Error(
                        "A term with this name already exists in the selected calendar",
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="e.g. Term 1, Semester 2" />
          </Form.Item>

          <Form.Item
            name="sequence"
            label="Sequence"
            dependencies={["calendarId"]}
            rules={[
              { required: true, message: "Please enter sequence number" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value === undefined || value === null) {
                    return Promise.resolve();
                  }
                  if (!Number.isInteger(value) || value < 1) {
                    return Promise.reject(
                      new Error("Sequence must be a positive whole number"),
                    );
                  }
                  const calendarId = getFieldValue("calendarId");
                  const duplicate = otherTermsFor(calendarId).some(
                    (item) => item.sequence === value,
                  );
                  if (duplicate) {
                    return Promise.reject(
                      new Error(
                        "Another term in this calendar already uses this sequence",
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              min={1}
              precision={0}
              style={{ width: "100%" }}
              placeholder="e.g. 1, 2, 3..."
            />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            dependencies={["endDate", "calendarId"]}
            rules={[
              { required: true, message: "Please select start date" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const endDate = getFieldValue("endDate");
                  if (endDate && !value.isBefore(endDate, "day")) {
                    return Promise.reject(
                      new Error("Start date must be before end date"),
                    );
                  }
                  const calendar = calendars.find(
                    (item) => item._id === getFieldValue("calendarId"),
                  );
                  if (calendar) {
                    const calendarStart = dayjs(
                      toSchoolDate(calendar.startDate),
                    );
                    if (value.isBefore(calendarStart, "day")) {
                      return Promise.reject(
                        new Error(
                          "Term must start on or after the calendar start date",
                        ),
                      );
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format={DATE_FORMAT}
              placeholder={DATE_FORMAT}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            dependencies={["startDate", "calendarId"]}
            rules={[
              { required: true, message: "Please select end date" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const startDate = getFieldValue("startDate");
                  if (startDate && !value.isAfter(startDate, "day")) {
                    return Promise.reject(
                      new Error("End date must be after start date"),
                    );
                  }

                  const calendarId = getFieldValue("calendarId");
                  const calendar = calendars.find(
                    (item) => item._id === calendarId,
                  );
                  if (calendar) {
                    const calendarEnd = dayjs(toSchoolDate(calendar.endDate));
                    if (value.isAfter(calendarEnd, "day")) {
                      return Promise.reject(
                        new Error(
                          "Term must end on or before the calendar end date",
                        ),
                      );
                    }
                  }

                  if (startDate) {
                    const overlap = otherTermsFor(calendarId).some((item) => {
                      const existingStart = dayjs(toSchoolDate(item.startDate));
                      const existingEnd = dayjs(toSchoolDate(item.endDate));
                      return (
                        !startDate.isAfter(existingEnd, "day") &&
                        !value.isBefore(existingStart, "day")
                      );
                    });
                    if (overlap) {
                      return Promise.reject(
                        new Error(
                          "Term dates overlap another term in the selected calendar",
                        ),
                      );
                    }
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format={DATE_FORMAT}
              placeholder={DATE_FORMAT}
            />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
