import { useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { SchoolInfoView } from "@/components/school-info/SchoolInfoView";
import { SchoolInfoDrawer } from "@/components/school-info/SchoolInfoDrawer";
import { useSchoolInfo } from "@/hooks/useSchoolInfo";
import { Breadcrumb } from "@/components/common/Breadcrumb";

export const SchoolInfoPage = () => {
  const { schoolInfo, isLoading, error, resetLogo } = useSchoolInfo();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");

  const openDrawer = (mode: "create" | "edit") => {
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    resetLogo();
  };

  const handleSaveSuccess = () => {
    closeDrawer();
  };

  if (isLoading) {
    return (
      <div
        className="admin-content"
        style={{ textAlign: "center", padding: "60px 0" }}
      >
        <div className="ant-spin ant-spin-lg ant-spin-spinning">
          <span className="ant-spin-dot ant-spin-dot-spin">
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <EmptyState
          title="Failed to Load"
          description={error}
          buttonText="Retry"
          onClick={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb />

      {/* Empty State */}
      {!schoolInfo && !isLoading && (
        <EmptyState
          title="No School Profile"
          description="Add your school information to get started"
          buttonText="Create School Profile"
          onClick={() => openDrawer("create")}
        />
      )}

      {/* View Mode */}
      {schoolInfo && (
        <SchoolInfoView
          data={schoolInfo}
          onEdit={() => openDrawer("edit")}
        />
      )}

      {/* Edit/Create Drawer */}
      <SchoolInfoDrawer
        open={drawerOpen}
        mode={drawerMode}
        initialData={
          drawerMode === "edit" && schoolInfo ? schoolInfo : undefined
        }
        onClose={closeDrawer}
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
};
