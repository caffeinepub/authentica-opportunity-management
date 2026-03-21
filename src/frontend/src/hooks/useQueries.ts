import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CalendarItem,
  Comment,
  Contact,
  FileRecord,
  TodoItem,
  UserProfileDTO,
  Opportunity as _Opportunity,
} from "../backend";
import { useActor } from "./useActor";

// Extend Opportunity with the helpTypes field added in the backend
export type Opportunity = _Opportunity & { helpTypes?: Array<string> };

export type {
  Contact,
  Comment,
  FileRecord,
  CalendarItem,
  TodoItem,
  UserProfileDTO,
};

// ── Opportunities ──────────────────────────────────────────────────────────

export function useOpportunities() {
  const { actor, isFetching } = useActor();
  return useQuery<Opportunity[]>({
    queryKey: ["opportunities"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listOpportunities() as Promise<Opportunity[]>;
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
      return (actor as any).getOpportunity(id) as Promise<Opportunity | null>;
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
      helpTypes?: Array<string>;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).createOpportunity(
        data.name,
        data.stage,
        data.value,
        data.closeDate,
        data.summary,
        data.helpTypes ?? [],
      ) as Promise<Opportunity>;
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
      helpTypes?: Array<string>;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updateOpportunity(
        data.id,
        data.name,
        data.stage,
        data.value,
        data.closeDate,
        data.summary,
        data.helpTypes ?? [],
      ) as Promise<Opportunity | null>;
    },
    onSuccess: (_data: any, vars: any) => {
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

export function useContact(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Contact | null>({
    queryKey: ["contact", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getContact(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateContactBio() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; bio: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateContactBio(data.id, data.bio);
    },
    onSuccess: (_data: any, vars: any) => {
      qc.invalidateQueries({ queryKey: ["contact", vars.id.toString()] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContactExtraFields() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      company: string;
      linkedinUrl: string;
      lastContacted: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateContactExtraFields(
        data.id,
        data.company,
        data.linkedinUrl,
        data.lastContacted,
      );
    },
    onSuccess: (_data: any, vars: any) => {
      qc.invalidateQueries({ queryKey: ["contact", vars.id.toString()] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
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
    onSuccess: (_data: any, vars: any) =>
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
    onSuccess: (_data: any, vars: any) =>
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
    onSuccess: (_data: any, vars: any) =>
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
    onSuccess: (_data: any, vars: any) =>
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
    onSuccess: (_data: any, vars: any) =>
      qc.invalidateQueries({
        queryKey: ["files", vars.opportunityId.toString()],
      }),
  });
}

// ── Calendar Items ─────────────────────────────────────────────────────────

export function useCalendarItems() {
  const { actor, isFetching } = useActor();
  return useQuery<CalendarItem[]>({
    queryKey: ["calendarItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCalendarItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCalendarItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      dateTimestamp: bigint;
      timeLabel: string;
      notes: string;
      opportunityId: bigint | null;
      createdBy: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCalendarItem(
        data.title,
        data.dateTimestamp,
        data.timeLabel,
        data.notes,
        data.opportunityId,
        data.createdBy,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendarItems"] }),
  });
}

export function useDeleteCalendarItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCalendarItem(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendarItems"] }),
  });
}

// ── Todo Items ─────────────────────────────────────────────────────────────

export function useTodoItems() {
  const { actor, isFetching } = useActor();
  return useQuery<TodoItem[]>({
    queryKey: ["todoItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTodoItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTodoItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      assignedTo: string;
      stage: string;
      opportunityId?: bigint | null;
      priority?: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).createTodoItem(
        data.title,
        data.assignedTo,
        data.stage,
        data.opportunityId ?? null,
        data.priority ?? "medium",
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todoItems"] }),
  });
}

export function useUpdateTodoItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      assignedTo: string;
      stage: string;
      opportunityId?: bigint | null;
      priority?: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updateTodoItem(
        data.id,
        data.title,
        data.assignedTo,
        data.stage,
        data.opportunityId ?? null,
        data.priority ?? "medium",
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todoItems"] }),
  });
}

export function useDeleteTodoItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTodoItem(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todoItems"] }),
  });
}

// ── User Profiles ──────────────────────────────────────────────────────────

export function useUserProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfileDTO[]>({
    queryKey: ["userProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}
