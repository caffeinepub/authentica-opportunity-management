import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface FileRecord {
    id: bigint;
    displayName: string;
    opportunityId: bigint;
    fileType: string;
    blobId: string;
    uploadedAt: bigint;
    uploadedBy: string;
    folder: string;
}
export interface UserProfile {
    name: string;
}
export interface Opportunity {
    id: bigint;
    closeDate: bigint;
    value: bigint;
    name: string;
    createdAt: bigint;
    summary: string;
    stage: string;
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
    createOpportunity(name: string, stage: string, value: bigint, closeDate: bigint, summary: string): Promise<Opportunity>;
    deleteComment(id: bigint): Promise<boolean>;
    deleteFileRecord(id: bigint): Promise<boolean>;
    deleteOpportunity(id: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContact(id: bigint): Promise<Contact | null>;
    getOpportunity(id: bigint): Promise<Opportunity | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkContactToOpportunity(contactId: bigint, opportunityId: bigint): Promise<boolean>;
    listAllContacts(): Promise<Array<Contact>>;
    listComments(opportunityId: bigint): Promise<Array<Comment>>;
    listContactsByOpportunity(opportunityId: bigint): Promise<Array<Contact>>;
    listFileRecords(opportunityId: bigint): Promise<Array<FileRecord>>;
    listOpportunities(): Promise<Array<Opportunity>>;
    removeContact(id: bigint): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unlinkContactFromOpportunity(contactId: bigint, opportunityId: bigint): Promise<boolean>;
    updateContact(id: bigint, name: string, email: string, phone: string, title: string): Promise<Contact | null>;
    updateFileRecord(id: bigint, displayName: string, folder: string): Promise<FileRecord | null>;
    updateOpportunity(id: bigint, name: string, stage: string, value: bigint, closeDate: bigint, summary: string): Promise<Opportunity | null>;
}
