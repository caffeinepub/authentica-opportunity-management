import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  File,
  FileImage,
  FileText,
  FileVideo,
  FolderOpen,
  Loader2,
  Lock,
  Shield,
  ShieldOff,
  Trash2,
  Upload,
  UserCheck,
  UserX,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import { useActor } from "../hooks/useActor";
import { useBlobStorage } from "../hooks/useBlobStorage";
import {
  type FileRecord,
  useAddFileRecord,
  useDeleteFileRecord,
  useFileRecords,
  useUpdateFileRecord,
} from "../hooks/useQueries";

type FileRecordX = FileRecord & { isConfidential?: boolean };

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/csv": ".csv",
    "application/zip": ".zip",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      ".pptx",
  };
  return map[mime] ?? "";
}

function buildDownloadName(displayName: string, fileType: string): string {
  const ext = extFromMime(fileType);
  if (!ext) return displayName;
  if (displayName.toLowerCase().endsWith(ext.toLowerCase())) return displayName;
  return displayName + ext;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/"))
    return <FileImage className="w-4 h-4 text-blue-500" />;
  if (fileType.startsWith("video/"))
    return <FileVideo className="w-4 h-4 text-purple-500" />;
  if (fileType.includes("pdf") || fileType.includes("text"))
    return <FileText className="w-4 h-4 text-red-500" />;
  return <File className="w-4 h-4 text-muted-foreground" />;
}

// Panel to manage per-user access for a confidential file
function AccessPanel({
  fileId,
  onClose,
}: { fileId: bigint; onClose: () => void }) {
  const { actor } = useActor();
  const { data: allUsers } = useAllUsers();
  const [grantedPrincipals, setGrantedPrincipals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    actor
      .listFilePermissions(fileId)
      .then((principals) => {
        setGrantedPrincipals(principals.map((p) => p.toString()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, fileId]);

  const toggle = async (principal: string, currentlyGranted: boolean) => {
    if (!actor) return;
    try {
      // We need to convert string principal back to Principal type
      // The actor methods accept Principal objects
      const { Principal } = await import("@icp-sdk/core/principal");
      const p = Principal.fromText(principal);
      if (currentlyGranted) {
        await actor.revokeFileAccess(fileId, p);
        setGrantedPrincipals((prev) => prev.filter((x) => x !== principal));
        toast.success("Access revoked");
      } else {
        await actor.grantFileAccess(fileId, p);
        setGrantedPrincipals((prev) => [...prev, principal]);
        toast.success("Access granted");
      }
    } catch {
      toast.error("Failed to update access");
    }
  };

  return (
    <div className="mt-3 p-3 bg-muted/40 border border-border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          Manage Access
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading...
        </div>
      ) : !allUsers || allUsers.length === 0 ? (
        <p className="text-xs text-muted-foreground">No other users found.</p>
      ) : (
        <div className="space-y-1">
          {allUsers.map((user) => {
            const principalStr = user.principal.toString();
            const granted = grantedPrincipals.includes(principalStr);
            return (
              <div
                key={principalStr}
                className="flex items-center justify-between py-1"
              >
                <span className="text-xs text-foreground">
                  {user.name || `${principalStr.slice(0, 12)}...`}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(principalStr, granted)}
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                    granted
                      ? "bg-primary/20 text-primary hover:bg-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {granted ? (
                    <UserCheck className="w-3 h-3" />
                  ) : (
                    <UserX className="w-3 h-3" />
                  )}
                  {granted ? "Granted" : "Grant"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function useAllUsers() {
  const { actor } = useActor();
  const [data, setData] = useState<Array<{
    principal: { toString(): string };
    name: string;
  }> | null>(null);
  useEffect(() => {
    if (!actor) return;
    actor
      .listAllUserProfiles()
      .then((profiles) => {
        setData(profiles as typeof data);
      })
      .catch(() => {});
  }, [actor]);
  return { data };
}

function FileRow({
  file,
  opportunityId,
  index,
  isAdmin,
}: {
  file: FileRecordX;
  opportunityId: bigint;
  index: number;
  isAdmin: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(file.displayName);
  const [folder, setFolder] = useState(file.folder);
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const { resolveBlobUrl } = useBlobStorage();
  const updateFile = useUpdateFileRecord();
  const deleteFile = useDeleteFileRecord();
  const { actor } = useActor();

  // A locked file is confidential with no blobId (masked by backend)
  const isLocked = !!file.isConfidential && !file.blobId;

  const handleClickLink = async () => {
    if (isLocked) return;
    try {
      const url = await resolveBlobUrl(file.blobId);
      const downloadName = buildDownloadName(file.displayName, file.fileType);
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      toast.error("Failed to download file");
    }
  };

  const handleSave = async () => {
    try {
      await updateFile.mutateAsync({
        id: file.id,
        opportunityId,
        displayName,
        folder,
      });
      setEditing(false);
      toast.success("File updated");
    } catch {
      toast.error("Failed to update file");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFile.mutateAsync({ id: file.id, opportunityId });
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const handleToggleConfidential = async () => {
    if (!actor) return;
    try {
      const newVal = !file.isConfidential;
      await actor.setFileConfidential(file.id, newVal);
      // Refetch is handled by invalidation in useUpdateFileRecord; trigger a page refresh hint
      updateFile.reset();
      toast.success(newVal ? "File marked confidential" : "File is now public");
      // Force refetch by invalidating the query
      window.dispatchEvent(new CustomEvent("refetch-files"));
    } catch {
      toast.error("Failed to update confidential status");
    }
  };

  if (isLocked) {
    return (
      <div
        className="flex items-center gap-3 py-2.5 px-3 rounded-md bg-muted/20"
        data-ocid={`files.file.item.${index}`}
      >
        <Lock className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground italic">
            Confidential File
          </p>
          <p className="text-xs text-muted-foreground">
            You don't have access to this file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div
        className="flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-muted/50 group"
        data-ocid={`files.file.item.${index}`}
      >
        {getFileIcon(file.fileType)}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2 items-center">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-7 text-sm"
                placeholder="File name"
              />
              <Input
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="h-7 text-sm w-32"
                placeholder="Folder"
              />
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateFile.isPending}
                className="h-7 px-2"
              >
                {updateFile.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
                className="h-7 px-2"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClickLink}
                  className="text-sm font-medium text-foreground hover:text-primary truncate block text-left"
                >
                  {file.displayName}
                </button>
                {file.isConfidential && (
                  <span
                    title="Confidential"
                    className="inline-flex items-center shrink-0"
                  >
                    <Lock className="w-3 h-3 text-primary" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(Number(file.uploadedAt)).toLocaleDateString()} · by{" "}
                {file.uploadedBy}
              </p>
            </>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleToggleConfidential}
                  className={`p-1 rounded text-xs ${
                    file.isConfidential
                      ? "hover:bg-muted text-primary"
                      : "hover:bg-muted text-muted-foreground hover:text-primary"
                  }`}
                  title={
                    file.isConfidential
                      ? "Remove confidential"
                      : "Mark confidential"
                  }
                >
                  {file.isConfidential ? (
                    <ShieldOff className="w-3.5 h-3.5" />
                  ) : (
                    <Shield className="w-3.5 h-3.5" />
                  )}
                </button>
                {file.isConfidential && (
                  <button
                    type="button"
                    onClick={() => setShowAccessPanel((v) => !v)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Manage access"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Rename"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              data-ocid={`files.file.delete_button.${index}`}
              onClick={handleDelete}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              title="Delete"
              disabled={deleteFile.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      {isAdmin && showAccessPanel && file.isConfidential && (
        <div className="px-3 pb-2">
          <AccessPanel
            fileId={file.id}
            onClose={() => setShowAccessPanel(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function FilesTab({ opportunityId }: { opportunityId: bigint }) {
  const { userName } = useUser();
  const filesQuery = useFileRecords(opportunityId);
  const addFile = useAddFileRecord();
  const { uploadBlob } = useBlobStorage();
  const [showUpload, setShowUpload] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadDisplayName, setUploadDisplayName] = useState("");
  const [uploadFolder, setUploadFolder] = useState("General");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["General"]),
  );

  // Fred is the hardcoded admin
  const isAdmin = userName === "Fred";

  // Listen for confidential toggle refetch events
  useEffect(() => {
    const handler = () => filesQuery.refetch();
    window.addEventListener("refetch-files", handler);
    return () => window.removeEventListener("refetch-files", handler);
  }, [filesQuery]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadDisplayName(file.name);
      setShowUpload(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadDisplayName(file.name);
      setShowUpload(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadDisplayName.trim()) return;
    setUploading(true);
    try {
      const blobId = await uploadBlob(selectedFile);
      await addFile.mutateAsync({
        opportunityId,
        displayName: uploadDisplayName.trim(),
        folder: uploadFolder.trim() || "General",
        blobId,
        fileType: selectedFile.type || "application/octet-stream",
        uploadedBy: userName || "Unknown",
      });
      toast.success("File uploaded");
      setShowUpload(false);
      setSelectedFile(null);
      setUploadDisplayName("");
      setUploadFolder("General");
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const files = (filesQuery.data ?? []) as FileRecordX[];
  const folderMap = new Map<string, FileRecordX[]>();
  for (const f of files) {
    const list = folderMap.get(f.folder) ?? [];
    list.push(f);
    folderMap.set(f.folder, list);
  }

  let globalIndex = 0;

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        data-ocid="files.dropzone"
        onDragOver={(_e) => {
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30"
        }`}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Drag &amp; drop files here, or click to browse
        </p>
        <Label htmlFor="file-upload">
          <Button
            asChild
            variant="outline"
            size="sm"
            data-ocid="files.upload_button"
          >
            <span>Browse Files</span>
          </Button>
        </Label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Files by folder */}
      {filesQuery.isLoading ? (
        <div
          className="flex items-center gap-2 text-muted-foreground text-sm"
          data-ocid="files.loading_state"
        >
          <Loader2 className="w-4 h-4 animate-spin" /> Loading files...
        </div>
      ) : files.length === 0 ? (
        <div
          className="text-center py-8 text-muted-foreground text-sm"
          data-ocid="files.empty_state"
        >
          No files uploaded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(folderMap.entries()).map(([folder, folderFiles]) => (
            <div
              key={folder}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-medium"
                onClick={() => toggleFolder(folder)}
              >
                {expandedFolders.has(folder) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <FolderOpen className="w-4 h-4 text-amber-500" />
                {folder}
                <span className="ml-auto text-xs text-muted-foreground">
                  {folderFiles.length} file{folderFiles.length !== 1 ? "s" : ""}
                </span>
              </button>
              {expandedFolders.has(folder) && (
                <div className="divide-y divide-border">
                  {folderFiles.map((file) => {
                    globalIndex++;
                    return (
                      <FileRow
                        key={file.id.toString()}
                        file={file}
                        opportunityId={opportunityId}
                        index={globalIndex}
                        isAdmin={isAdmin}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="upload-name">Display Name</Label>
              <Input
                id="upload-name"
                value={uploadDisplayName}
                onChange={(e) => setUploadDisplayName(e.target.value)}
                placeholder="File name"
              />
            </div>
            <div>
              <Label htmlFor="upload-folder">Folder</Label>
              <Input
                id="upload-folder"
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                placeholder="General"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !uploadDisplayName.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
