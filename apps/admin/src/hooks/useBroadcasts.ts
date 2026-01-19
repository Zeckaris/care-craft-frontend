import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";

export interface IBroadcastMessage {
  _id: string;
  title: string;
  body: string;
  recipients: string[];
  status: "draft" | "sent";
  sentBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  sentAt: string | null;
  priority: "urgent" | "normal" | "low";
  createdAt: string;
  updatedAt: string;
}

interface FetchBroadcastsParams {
  status?: "draft" | "sent";
  title?: string;
  recipients?: string[];
  page?: number;
  limit?: number;
  all?: boolean;
}

export const useBroadcasts = () => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } =
    useApi();

  // -------------------- Drafts State --------------------
  const [drafts, setDrafts] = useState<IBroadcastMessage[]>([]);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<Error | null>(null);

  // -------------------- Fetch Broadcasts --------------------
  const fetchBroadcasts = async (filters: FetchBroadcastsParams = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.title) params.set("title", filters.title);
    if (filters.recipients && filters.recipients.length > 0) {
      filters.recipients.forEach((r) => params.append("recipients", r));
    }
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.all) params.set("all", "true");

    const queryKey = ["/broadcast", filters];
    const { data: raw, isLoading, isError, refetch, error } = get(
      `/broadcast?${params.toString()}`,
      {
        queryKey,
      }
    );

    const broadcasts: IBroadcastMessage[] = raw?.success ? raw.data : [];
    const pagination = raw?.pagination ?? { total: 0, page: 1, limit: 20 };

    return { broadcasts, pagination, isLoading, isError, fetchError: error, refetch };
  };

  // -------------------- Fetch Drafts (Managed State) --------------------
  const fetchDrafts = async (search = "") => {
    try {
      setDraftLoading(true);
      const { broadcasts } = await fetchBroadcasts({
        status: "draft",
        title: search,
        all: true, // Fetch all for search dropdown
      });
      setDrafts(broadcasts);
      setDraftError(null);
    } catch (err) {
      setDraftError(err as Error);
    } finally {
      setDraftLoading(false);
    }
  };

  // -------------------- Create Broadcast --------------------
  const createBroadcast = async (data: {
    title: string;
    body: string;
    recipients: string[];
    status?: "draft" | "sent";
    priority?: "urgent" | "normal" | "low";
  }) => {
    const result = await post({ url: "/broadcast", body: data });
    queryClient.invalidateQueries({ queryKey: ["/broadcast"] });
    return result;
  };

  // -------------------- Update Broadcast --------------------
  const updateBroadcast = async (
    id: string,
    data: {
      title?: string;
      body?: string;
      recipients?: string[];
      status?: "draft" | "sent";
      priority?: "urgent" | "normal" | "low";
    }
  ) => {
    const result = await put({ url: `/broadcast/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: ["/broadcast"] });
    return result;
  };

  // -------------------- Delete Draft --------------------
  const deleteDraft = async (id: string) => {
    const result = await del({ url: `/broadcast/${id}` });
    queryClient.invalidateQueries({ queryKey: ["/broadcast"] });
    return result;
  };

  return {
    // General fetch
    fetchBroadcasts,
    createBroadcast,
    updateBroadcast,
    deleteDraft,

    // Drafts state
    drafts,
    draftLoading,
    draftError,
    fetchDrafts,

    // Mutation states
    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
