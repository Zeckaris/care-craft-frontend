import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { ASSETS_BASE } from '@/services/api-client';

export interface ISchoolInfo {
  _id?: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string | null;
}

export const useSchoolInfo = () => {
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const urlPath = '/general/school';

  // Fetch
  const { data: rawData, isLoading } = get(urlPath);
  const schoolInfo: ISchoolInfo | null = rawData?.success 
    ? {
        ...rawData.data,
        logo: rawData.data.logo 
          ? `${ASSETS_BASE}${rawData.data.logo}` 
          : null
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

const create = async (data: Omit<ISchoolInfo, 'logo'> & { logo?: File | null }) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return post({ url: urlPath, body: formData });
};

const update = async (data: Omit<ISchoolInfo, 'logo'> & { logo?: File | null }) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return put({ url: urlPath, body: formData });
};
  const remove = () => del({ url: urlPath });

  return {
    schoolInfo,
    isLoading,
    error: serverError, 

    create,
    update,
    remove,

    isSaving: postMutation.isPending || putMutation.isPending,
    isDeleting: deleteMutation.isPending,

    previewLogo,
    handleLogoChange,
    resetLogo,
    logoFile,
  };
};