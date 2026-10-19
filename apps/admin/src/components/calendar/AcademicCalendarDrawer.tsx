import {
  Drawer,
  Descriptions,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  type FormInstance,
} from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { IAcademicCalendar } from "@carecraft/types";
import { toSchoolDate } from "@/utils/schoolDate";
import { AcademicStatusTag } from "./AcademicStatusTag";

interface AcademicCalendarDrawerProps {
  open: boolean;
  onClose: () => void;
  calendar: IAcademicCalendar | null;
  mode: "view" | "edit";
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
}

const DATE_FORMAT = "YYYY-MM-DD";

export function AcademicCalendarDrawer({
  open,
  onClose,
  calendar,
  mode,
  form,
  onSubmit,
  loading = false,
}: AcademicCalendarDrawerProps) {
  const isView = mode === "view";

  const formatDate = (date: string | Date | null | undefined): string => {
    const schoolDate = toSchoolDate(date);
    return schoolDate ? dayjs(schoolDate).format("DD MMMM YYYY") : "-";
  };

  const formatDateArray = (dates: string[] | undefined): string => {
    if (!dates || dates.length === 0) return "-";
    return dates.map((date) => formatDate(date)).join(", ");
  };

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
              ? "Academic Year Details"
              : calendar?._id
                ? "Edit Academic Year"
                : "Create Academic Year"}
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
              <Button type="primary" onClick={onSubmit} loading={loading}>
                {calendar?._id ? "Update" : "Create"}
              </Button>
            </Space>
          </div>
        )
      }
    >
      {isView ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Academic Year">
            <strong>{calendar?.academicYear}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {calendar?.status ? (
              <AcademicStatusTag
                status={calendar.status}
                isCurrent={calendar.isCurrent}
              />
            ) : (
              "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">
            {formatDate(calendar?.startDate)}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {formatDate(calendar?.endDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Registration Start">
            {formatDate(calendar?.registrationStartDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Registration End">
            {formatDate(calendar?.registrationEndDate)}
          </Descriptions.Item>
          <Descriptions.Item label="New Student Reg. Start">
            {formatDate(calendar?.newStudentRegistrationStartDate)}
          </Descriptions.Item>
          <Descriptions.Item label="New Student Reg. End">
            {formatDate(calendar?.newStudentRegistrationEndDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Holidays">
            {formatDateArray(calendar?.holidayDates)}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDate(calendar?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {formatDate(calendar?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="academicYear"
            label="Academic Year"
            dependencies={["startDate"]}
            rules={[
              { required: true, message: "Academic year is required" },
              {
                pattern: /^\d{4}-\d{4}$/,
                message: "Format must be YYYY-YYYY (e.g. 2024-2025)",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !/^\d{4}-\d{4}$/.test(value)) {
                    return Promise.resolve();
                  }
                  const startDate = getFieldValue("startDate");
                  if (
                    startDate &&
                    Number(value.slice(0, 4)) !== startDate.year()
                  ) {
                    return Promise.reject(
                      new Error(
                        "The first year in the label must match the start date year",
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="2024-2025" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            dependencies={["endDate"]}
            rules={[
              { required: true, message: "Start date is required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const endDate = getFieldValue("endDate");
                  if (!value || !endDate) return Promise.resolve();
                  if (value.isBefore(endDate, "day")) return Promise.resolve();
                  return Promise.reject(
                    new Error("Start date must be before end date"),
                  );
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format={DATE_FORMAT}
              placeholder={DATE_FORMAT}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            dependencies={["startDate"]}
            rules={[
              { required: true, message: "End date is required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("startDate");
                  if (!value || !startDate) return Promise.resolve();
                  if (value.isAfter(startDate, "day")) return Promise.resolve();
                  return Promise.reject(
                    new Error("End date must be after start date"),
                  );
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format={DATE_FORMAT}
              placeholder={DATE_FORMAT}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="registrationStartDate"
            label="Registration Start Date"
            dependencies={["registrationEndDate"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const endDate = getFieldValue("registrationEndDate");
                  if (!value && !endDate) return Promise.resolve();
                  if (!value || !endDate) {
                    return Promise.reject(
                      new Error(
                        "Set both registration start and end dates, or neither",
                      ),
                    );
                  }
                  if (value.isAfter(endDate, "day")) {
                    return Promise.reject(
                      new Error(
                        "Registration start must be on or before the end",
                      ),
                    );
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
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="registrationEndDate"
            label="Registration End Date"
            dependencies={["registrationStartDate", "endDate"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("registrationStartDate");
                  if (!value && !startDate) return Promise.resolve();
                  if (!value || !startDate) {
                    return Promise.reject(
                      new Error(
                        "Set both registration start and end dates, or neither",
                      ),
                    );
                  }
                  if (value.isBefore(startDate, "day")) {
                    return Promise.reject(
                      new Error(
                        "Registration end must be on or after the start",
                      ),
                    );
                  }
                  const calendarEnd = getFieldValue("endDate");
                  if (calendarEnd && value.isAfter(calendarEnd, "day")) {
                    return Promise.reject(
                      new Error(
                        "Registration cannot end after the academic year end date",
                      ),
                    );
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
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="newStudentRegistrationStartDate"
            label="New Student Registration Start"
            dependencies={["newStudentRegistrationEndDate"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const endDate = getFieldValue(
                    "newStudentRegistrationEndDate",
                  );
                  if (!value && !endDate) return Promise.resolve();
                  if (!value || !endDate) {
                    return Promise.reject(
                      new Error(
                        "Set both new-student registration dates, or neither",
                      ),
                    );
                  }
                  if (value.isAfter(endDate, "day")) {
                    return Promise.reject(
                      new Error(
                        "New-student registration start must be on or before the end",
                      ),
                    );
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
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="newStudentRegistrationEndDate"
            label="New Student Registration End"
            dependencies={["newStudentRegistrationStartDate", "endDate"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue(
                    "newStudentRegistrationStartDate",
                  );
                  if (!value && !startDate) return Promise.resolve();
                  if (!value || !startDate) {
                    return Promise.reject(
                      new Error(
                        "Set both new-student registration dates, or neither",
                      ),
                    );
                  }
                  if (value.isBefore(startDate, "day")) {
                    return Promise.reject(
                      new Error(
                        "New-student registration end must be on or after the start",
                      ),
                    );
                  }
                  const calendarEnd = getFieldValue("endDate");
                  if (calendarEnd && value.isAfter(calendarEnd, "day")) {
                    return Promise.reject(
                      new Error(
                        "New-student registration cannot end after the academic year end date",
                      ),
                    );
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
              disabled={loading}
            />
          </Form.Item>

          <Form.List name="holidayDates">
            {(fields, { add, remove }) => (
              <Form.Item label="Holiday Dates">
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        { required: true, message: "Select date" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value) return Promise.resolve();
                            const startDate = getFieldValue("startDate");
                            const endDate = getFieldValue("endDate");
                            if (
                              startDate &&
                              value.isBefore(startDate, "day")
                            ) {
                              return Promise.reject(
                                new Error(
                                  "Holiday must be within the academic year dates",
                                ),
                              );
                            }
                            if (endDate && value.isAfter(endDate, "day")) {
                              return Promise.reject(
                                new Error(
                                  "Holiday must be within the academic year dates",
                                ),
                              );
                            }
                            const allDates = getFieldValue(
                              "holidayDates",
                            ) as
                              | Array<{ format: (format?: string) => string }>
                              | undefined;
                            const formatted = value.format(DATE_FORMAT);
                            const matches =
                              allDates?.filter(
                                (date) => date.format(DATE_FORMAT) === formatted,
                              ).length ?? 0;
                            if (matches > 1) {
                              return Promise.reject(
                                new Error("Holiday dates must be unique"),
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                      style={{ marginBottom: 0, width: 300 }}
                    >
                      <DatePicker
                        format={DATE_FORMAT}
                        placeholder={DATE_FORMAT}
                        style={{ width: "100%" }}
                        disabled={loading}
                      />
                    </Form.Item>
                    <CloseOutlined
                      onClick={() => remove(name)}
                      style={{ cursor: "pointer" }}
                    />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  disabled={loading}
                >
                  Add Holiday Date
                </Button>
              </Form.Item>
            )}
          </Form.List>
        </Form>
      )}
    </Drawer>
  );
}
