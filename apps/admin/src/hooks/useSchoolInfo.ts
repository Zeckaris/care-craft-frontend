import { useCallback, useState } from 'react';
import type { SchoolFeatures } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';
import { ASSETS_BASE } from '@/services/api-client';

export interface ISchoolInfo {
  _id?: string;

  // Basic identity
  name: string;
  motto?: string;
  establishedYear?: number;
  about?: string;

  // Contact
  address: string;
  contactEmail: string;
  telephone: string[];
  website?: string;

  // Visual branding
  logo?: string | null;
  theme: string;
  fontFamily: string;

  // Location
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;

  // Academic configuration
  academicStructure?: "Semester" | "Term" | "Quarter" | "Trimester" | "Custom";
  numberOfPeriods?: number;
  defaultPassingScore?: number;
  gradingSystem?: "Percentage" | "Letter (A-F)" | "Grade Points (4.0)" | "Custom";

  // Optional feature flags
  features?: SchoolFeatures;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolInfoCreateInput {
  name: string;
  address: string;
  contactEmail: string;
  telephone: string[];
  about?: string;
  logo?: File | null;
}

export type SchoolInfoUpdateInput = Partial<SchoolInfoCreateInput>;

/** Fields removed from the contract; never send them again. */
const DEPRECATED_SCHOOL_INFO_FIELDS = new Set([
  'contactPhone',
  'alternatePhone',
]);

/**
 * Appends one school-info field to a multipart body.
 *
 * Telephone numbers are sent as repeated `telephone[]` parts; empty entries
 * are skipped so an empty array omits the field entirely (the backend then
 * keeps the stored value on update).
 */
const appendSchoolInfoField = (
  formData: FormData,
  key: string,
  value: unknown,
) => {
  if (value === undefined || value === null) return;
  if (DEPRECATED_SCHOOL_INFO_FIELDS.has(key)) return;

  if (key === 'telephone') {
    if (!Array.isArray(value)) return;
    value.forEach((entry) => {
      if (typeof entry !== 'string') return;
      const trimmed = entry.trim();
      if (trimmed) formData.append('telephone[]', trimmed);
    });
    return;
  }

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  formData.append(key, String(value));
};

const buildSchoolInfoFormData = (data: object) => {
  const formData = new FormData();
  Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
    appendSchoolInfoField(formData, key, value);
  });
  return formData;
};

export const useSchoolInfo = (enabled = true) => {
  const { get, post, put, patch, del, postMutation, putMutation, patchMutation, deleteMutation } = useApi();
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const basePath = '/general/school-info';

  const { data: rawData, isLoading, refetch } = get(basePath, { enabled });

  const schoolInfo: ISchoolInfo | null = rawData?.success
    ? {
        ...rawData.data,
        telephone: Array.isArray(rawData.data.telephone)
          ? rawData.data.telephone
          : [],
        about: rawData.data.about ?? undefined,
        logo: rawData.data.logo
          ? rawData.data.logo.startsWith("http")
            ? rawData.data.logo
            : `${ASSETS_BASE}${rawData.data.logo}`
          : null,
      }
    : null;

  const serverError = rawData && !rawData.success ? rawData.message : null;

  const handleLogoChange = useCallback((file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewLogo(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const resetLogo = useCallback(() => {
    setLogoFile(null);
    setPreviewLogo(null);
  }, []);

  // Full create (initial setup)
  const create = async (data: SchoolInfoCreateInput) => {
    return post({ url: basePath, body: buildSchoolInfoFormData(data) });
  };

  // Full update (used for name, contact, about, logo changes)
  const update = async (data: SchoolInfoUpdateInput) => {
    return put({ url: basePath, body: buildSchoolInfoFormData(data) });
  };

  // Partial update for branding only
  const updateBranding = async (branding: { theme?: string; fontFamily?: string }) => {
    const payload: { theme?: string; fontFamily?: string } = {};
    if (branding.theme !== undefined) payload.theme = branding.theme;
    if (branding.fontFamily !== undefined) payload.fontFamily = branding.fontFamily;

    // Invalidate and refetch the school-info query so the saved theme/font
    // reflect back into the UI (and the Save button resets once there are no
    // changes). The caller shows its own save feedback.
    await patch({
      url: `${basePath}/branding`,
      body: payload,
      invalidateKey: [basePath],
      toast: false,
    });
    await refetch();
  };

  const updateFeatures = async (features: SchoolFeatures) => {
    const result = await patch({
      url: `${basePath}/features`,
      body: features,
      invalidateKey: [basePath],
      toast: false,
    });
    await refetch();
    return result;
  };

  const remove = () => del({ url: basePath });

  return {
    schoolInfo,
    isLoading,
    error: serverError,
    refetch,

    create,
    update,
    updateBranding,
    updateFeatures,
    remove,

    isSaving: postMutation.isPending || putMutation.isPending || patchMutation.isPending,
    isSavingFeatures: patchMutation.isPending,
    isDeleting: deleteMutation.isPending,

    previewLogo,
    handleLogoChange,
    resetLogo,
    logoFile,
  };
};
