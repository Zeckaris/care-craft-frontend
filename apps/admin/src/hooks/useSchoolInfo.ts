import { useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface ISchoolInfo {
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
  const urlPath = '/general/school-info';

  // Fetch
  const { data: rawData, isLoading } = get(urlPath);
  const schoolInfo: ISchoolInfo | null = rawData?.success ? rawData.data : null;
  const serverError = rawData && !rawData.success ? rawData.message : null;

  // Logo preview
  const handleLogoChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPreviewLogo(reader.result as string);
    reader.readAsDataURL(file);
    return false;
  };

  const create = (data: ISchoolInfo) =>
    post({ url:urlPath , body: { ...data, logo: previewLogo || data.logo } });

  const update = (data: ISchoolInfo) =>
    put({ url: urlPath, body: { ...data, logo: previewLogo || data.logo } });

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
    resetPreview: () => setPreviewLogo(null),
  };
};