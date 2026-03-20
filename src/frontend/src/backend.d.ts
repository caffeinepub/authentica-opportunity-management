import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Opportunity {
    id: bigint;
    closeDate: bigint;
    value: bigint;
    name: string;
    createdAt: bigint;
    summary: string;
    stage: string;
}
export interface Comment {
    id: bigint;
    createdAt: bigint;
    text: string;
    authorName: string;
    opportunityId: bigint;
}
export interface Contact {
    id: bigint;
    title: string;
    linkedOpportunityIds: Array<bigint>;
    name: string;
    email: string;
    phone: string;
}
export interface TodoItem {
    id: bigint;
    title: string;
    assignedTo: string;
    createdAt: bigint;
    stage: string;
    opportunityId?: bigint;
    priority: string;
}
export interface FileRecord {
    id: bigint;
    displayName: string;
    opportunityId: bigint;
    fileType: string;
    blobId: string;
    uploadedAt: bigint;
    uploadedBy: string;
    folder: string;
    isConfidential: boolean;
}
export interface CalendarItem {
    id: bigint;
    title: string;
    timeLabel: string;
    createdBy: string;
    opportunityId?: bigint;
    notes: string;
    dateTimestamp: bigint;
}
export interface UserProfileDTO {
    principal: Principal;
    name: string;
}
export interface UserProfile {
    name: string;
}
export interface UserWithRole {
    principal: Principal;
    name: string;
    role: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(opportunityId: bigint, authorName: string, text: string): Promise<Comment>;
    addContact(name: string, email: string, phone: string, title: string): Promise<Contact>;
    addContactAndLink(name: string, email: string, phone: string, title: string, opportunityId: bigint): Promise<Contact>;
    addFileRecord(opportunityId: bigint, displayName: string, folder: string, blobId: string, fileType: string, uploadedBy: string): Promise<FileRecord>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCalendarItem(title: string, dateTimestamp: bigint, timeLabel: string, notes: string, opportunityId: bigint | null, createdBy: string): Promise<CalendarItem>;
    createOpportunity(name: string, stage: string, value: bigint, closeDate: bigint, summary: string): Promise<Opportunity>;
    createTodoItem(title: string, assignedTo: string, stage: string, opportunityId: bigint | null, priority?: string): Promise<TodoItem>;
    deleteCalendarItem(id: bigint): Promise<boolean>;
    deleteComment(id: bigint): Promise<boolean>;
    deleteFileRecord(id: bigint): Promise<boolean>;
    deleteOpportunity(id: bigint): Promise<boolean>;
    deleteTodoItem(id: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContact(id: bigint): Promise<Contact | null>;
    getMaxUsers(): Promise<bigint>;
    getOpportunity(id: bigint): Promise<Opportunity | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantFileAccess(fileId: bigint, user: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    linkContactToOpportunity(contactId: bigint, opportunityId: bigint): Promise<boolean>;
    listAllContacts(): Promise<Array<Contact>>;
    listAllFileRecordsAdmin(): Promise<Array<FileRecord>>;
    listAllUserProfiles(): Promise<Array<UserProfileDTO>>;
    listAllUsersWithRoles(): Promise<Array<UserWithRole>>;
    listCalendarItems(): Promise<Array<CalendarItem>>;
    listComments(opportunityId: bigint): Promise<Array<Comment>>;
    listContactsByOpportunity(opportunityId: bigint): Promise<Array<Contact>>;
    listFilePermissions(fileId: bigint): Promise<Array<Principal>>;
    listFileRecords(opportunityId: bigint): Promise<Array<FileRecord>>;
    listOpportunities(): Promise<Array<Opportunity>>;
    listTodoItems(): Promise<Array<TodoItem>>;
    removeContact(id: bigint): Promise<boolean>;
    removeUser(user: Principal): Promise<void>;
    revokeFileAccess(fileId: bigint, user: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setFileConfidential(fileId: bigint, confidential: boolean): Promise<boolean>;
    setMaxUsers(limit: bigint): Promise<void>;
    unlinkContactFromOpportunity(contactId: bigint, opportunityId: bigint): Promise<boolean>;
    updateContact(id: bigint, name: string, email: string, phone: string, title: string): Promise<Contact | null>;
    updateFileRecord(id: bigint, displayName: string, folder: string): Promise<FileRecord | null>;
    updateOpportunity(id: bigint, name: string, stage: string, value: bigint, closeDate: bigint, summary: string): Promise<Opportunity | null>;
    restoreCallerRole(): Promise<string>;
    updateTodoItem(id: bigint, title: string, assignedTo: string, stage: string, opportunityId: bigint | null, priority?: string): Promise<TodoItem | null>;
}
