import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment, Contact, FileRecord, Opportunity } from "../backend";
import { useActor } from "./useActor";

export type { Opportunity, Contact, Comment, FileRecord };

// ── Opportunities ──────────────────────────────────────────────────────────

export function useOpportunities() {
  const { actor, isFetching } = useActor();
  return useQuery<Opportunity[]>({
    queryKey: ["opportunities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOpportunities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOpportunity(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Opportunity | null>({
    queryKey: ["opportunity", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOpportunity(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOpportunity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      stage: string;
      value: bigint;
      closeDate: bigint;
      summary: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOpportunity(
        data.name,
        data.stage,
        data.value,
        data.closeDate,
        data.summary,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });
}

export function useUpdateOpportunity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      stage: string;
      value: bigint;
      closeDate: bigint;
      summary: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOpportunity(
        data.id,
        data.name,
        data.stage,
        data.value,
        data.closeDate,
        data.summary,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      qc.invalidateQueries({ queryKey: ["opportunity", vars.id.toString()] });
    },
  });
}

export function useDeleteOpportunity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteOpportunity(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });
}

// ── Contacts ───────────────────────────────────────────────────────────────

export function useAllContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<Contact[]>({
    queryKey: ["contacts", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOpportunityContacts(opportunityId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Contact[]>({
    queryKey: ["contacts", "opportunity", opportunityId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listContactsByOpportunity(opportunityId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      title: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addContact(data.name, data.email, data.phone, data.title);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useAddContactAndLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      title: string;
      opportunityId: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addContactAndLink(
        data.name,
        data.email,
        data.phone,
        data.title,
        data.opportunityId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useUpdateContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      email: string;
      phone: string;
      title: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateContact(
        data.id,
        data.name,
        data.email,
        data.phone,
        data.title,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useRemoveContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeContact(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useLinkContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { contactId: bigint; opportunityId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.linkContactToOpportunity(data.contactId, data.opportunityId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useUnlinkContact() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { contactId: bigint; opportunityId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.unlinkContactFromOpportunity(
        data.contactId,
        data.opportunityId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

// ── Comments ───────────────────────────────────────────────────────────────

export function useComments(opportunityId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", opportunityId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listComments(opportunityId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      opportunityId: bigint;
      authorName: string;
      text: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(data.opportunityId, data.authorName, data.text);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["comments", vars.opportunityId.toString()],
      }),
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; opportunityId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteComment(data.id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["comments", vars.opportunityId.toString()],
      }),
  });
}

// ── File Records ───────────────────────────────────────────────────────────

export function useFileRecords(opportunityId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<FileRecord[]>({
    queryKey: ["files", opportunityId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFileRecords(opportunityId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFileRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      opportunityId: bigint;
      displayName: string;
      folder: string;
      blobId: string;
      fileType: string;
      uploadedBy: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addFileRecord(
        data.opportunityId,
        data.displayName,
        data.folder,
        data.blobId,
        data.fileType,
        data.uploadedBy,
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["files", vars.opportunityId.toString()],
      }),
  });
}

export function useUpdateFileRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      opportunityId: bigint;
      displayName: string;
      folder: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateFileRecord(data.id, data.displayName, data.folder);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["files", vars.opportunityId.toString()],
      }),
  });
}

export function useDeleteFileRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; opportunityId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteFileRecord(data.id);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["files", vars.opportunityId.toString()],
      }),
  });
}
