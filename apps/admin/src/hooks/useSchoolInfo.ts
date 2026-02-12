import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { ASSETS_BASE } from '@/services/api-client';
import { useQueryClient } from '@tanstack/react-query'; 

export interface ISchoolInfo {
  _id?: string;

  // Basic identity
  name: string;
  motto?: string;
  establishedYear?: number;

  // Contact
  address: string;
  contactEmail: string;
  contactPhone: string;
  alternatePhone?: string;
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

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export const useSchoolInfo = (enabled = true) => { 
  const { get, post, put, patch, del, postMutation, putMutation, patchMutation, deleteMutation } = useApi();
  const queryClient = useQueryClient(); 
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const basePath = '/general/school-info';

  // Fetch full school info – now respects enabled
  const { data: rawData, isLoading, refetch } = get(basePath, { enabled });  // ← Only line changed: added { enabled }

 const schoolInfo: ISchoolInfo | null = rawData?.success
  ? {
      ...rawData.data,
      logo: rawData.data.logo
        ? rawData.data.logo.startsWith("http")
          ? rawData.data.logo 
          : `${ASSETS_BASE}${rawData.data.logo}`  
        : null,
    }
  : null;

  const serverError = rawData && !rawData.success ? rawData.message : null;

  const handleLogoChange = (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetLogo = () => {
    setLogoFile(null);
    setPreviewLogo(null);
  };

  // Full create (initial setup)
  const create = async (data: Omit<ISchoolInfo, 'logo'> & { logo?: File | null }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return post({ url: basePath, body: formData });
  };

  // Full update (used for name, contact, logo changes)
  const update = async (data: Partial<Omit<ISchoolInfo, 'logo'>> & { logo?: File | null }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return put({ url: basePath, body: formData });
  };

  // Partial update for branding only
  const updateBranding = async (branding: { theme?: string; fontFamily?: string }) => {
    const payload: { theme?: string; fontFamily?: string } = {};
    if (branding.theme !== undefined) payload.theme = branding.theme;
    if (branding.fontFamily !== undefined) payload.fontFamily = branding.fontFamily;

    await patch({ url: `${basePath}/branding`, body: payload });
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
    remove,

    isSaving: postMutation.isPending || putMutation.isPending || patchMutation.isPending,
    isDeleting: deleteMutation.isPending,

    previewLogo,
    handleLogoChange,
    resetLogo,
    logoFile,
  };
};