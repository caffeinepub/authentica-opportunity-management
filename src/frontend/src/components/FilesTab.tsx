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
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import { useBlobStorage } from "../hooks/useBlobStorage";
import {
  type FileRecord,
  useAddFileRecord,
  useDeleteFileRecord,
  useFileRecords,
  useUpdateFileRecord,
} from "../hooks/useQueries";

// Derive a file extension from a MIME type
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

// Build a download filename: use displayName and append ext if missing
function buildDownloadName(displayName: string, fileType: string): string {
  const ext = extFromMime(fileType);
  if (!ext) return displayName;
  // Check if displayName already ends with the extension (case-insensitive)
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

function FileRow({
  file,
  opportunityId,
  index,
}: { file: FileRecord; opportunityId: bigint; index: number }) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(file.displayName);
  const [folder, setFolder] = useState(file.folder);
  const { resolveBlobUrl } = useBlobStorage();
  const updateFile = useUpdateFileRecord();
  const deleteFile = useDeleteFileRecord();

  const handleClickLink = async () => {
    try {
      const url = await resolveBlobUrl(file.blobId);
      const downloadName = buildDownloadName(file.displayName, file.fileType);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast.error("Failed to get file URL");
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

  return (
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
            <button
              type="button"
              onClick={handleClickLink}
              className="text-sm font-medium text-foreground hover:text-primary truncate block text-left w-full"
            >
              {file.displayName}
            </button>
            <p className="text-xs text-muted-foreground">
              {new Date(Number(file.uploadedAt)).toLocaleDateString()} · by{" "}
              {file.uploadedBy}
            </p>
          </>
        )}
      </div>
      {!editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

  const files = filesQuery.data ?? [];
  const folderMap = new Map<string, FileRecord[]>();
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
      <Dialog
        open={showUpload}
        onOpenChange={(v) => {
          if (!v) {
            setShowUpload(false);
            setSelectedFile(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>File</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFile?.name}
              </p>
            </div>
            <div>
              <Label htmlFor="file-display-name">Display Name *</Label>
              <Input
                id="file-display-name"
                value={uploadDisplayName}
                onChange={(e) => setUploadDisplayName(e.target.value)}
                placeholder="Friendly name for this file"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="file-folder">Folder</Label>
              <Input
                id="file-folder"
                data-ocid="files.new_folder.input"
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                placeholder="e.g. Contracts, Proposals"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUpload(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !uploadDisplayName.trim()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
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
