import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Contact } from "../hooks/useQueries";
import {
  useAddContact,
  useAllContacts,
  useOpportunities,
  useRemoveContact,
  useUpdateContact,
} from "../hooks/useQueries";

interface ContactFormData {
  name: string;
  title: string;
  email: string;
  phone: string;
}

const emptyForm: ContactFormData = {
  name: "",
  title: "",
  email: "",
  phone: "",
};

function ContactForm({
  data,
  onChange,
}: {
  data: ContactFormData;
  onChange: (d: ContactFormData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cp-name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cp-name"
            data-ocid="contacts.input"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Jane Smith"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-title">Title</Label>
          <Input
            id="cp-title"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="VP of Sales"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cp-email">Email</Label>
        <Input
          id="cp-email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="jane@acme.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cp-phone">Phone</Label>
        <Input
          id="cp-phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="+1 555 000 0000"
        />
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const contactsQuery = useAllContacts();
  const opportunitiesQuery = useOpportunities();
  const addContact = useAddContact();
  const updateContact = useUpdateContact();
  const removeContact = useRemoveContact();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>(emptyForm);

  const opportunityMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const opp of opportunitiesQuery.data ?? []) {
      map.set(opp.id.toString(), opp.name);
    }
    return map;
  }, [opportunitiesQuery.data]);

  const contacts = contactsQuery.data ?? [];
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await addContact.mutateAsync(formData);
      toast.success("Contact added");
      setAddOpen(false);
      setFormData(emptyForm);
    } catch {
      toast.error("Failed to add contact");
    }
  };

  const handleEdit = async () => {
    if (!editTarget || !formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await updateContact.mutateAsync({ id: editTarget.id, ...formData });
      toast.success("Contact updated");
      setEditTarget(null);
      setFormData(emptyForm);
    } catch {
      toast.error("Failed to update contact");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeContact.mutateAsync(deleteTarget.id);
      toast.success("Contact removed");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove contact");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                Contacts
              </h1>
              <p className="text-sm text-muted-foreground">
                {contacts.length}{" "}
                {contacts.length === 1 ? "contact" : "contacts"} across all
                opportunities
              </p>
            </div>
          </div>
          <Button
            data-ocid="contacts.open_modal_button"
            className="gap-2"
            onClick={() => {
              setFormData(emptyForm);
              setAddOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-5">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="contacts.search_input"
            placeholder="Search by name, email, or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {contactsQuery.isLoading ? (
          <div className="space-y-2" data-ocid="contacts.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="contacts.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">
              {search ? "No contacts match your search" : "No contacts yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try a different search term"
                : "Add your first contact to get started."}
            </p>
          </div>
        ) : (
          <div
            className="border border-border rounded-xl overflow-hidden"
            data-ocid="contacts.table"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-foreground">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Title
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Linked Opportunities
                  </TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact, idx) => (
                  <TableRow
                    key={contact.id.toString()}
                    data-ocid={`contacts.item.${idx + 1}`}
                    className="hover:bg-muted/20"
                  >
                    <TableCell className="font-medium text-foreground">
                      {contact.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.title || "—"}
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {contact.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-1.5 text-sm hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {contact.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.linkedOpportunityIds.length === 0 ? (
                        <span className="text-muted-foreground text-sm">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {contact.linkedOpportunityIds.map((oid) => (
                            <Badge
                              key={oid.toString()}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {opportunityMap.get(oid.toString()) ?? `#${oid}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          data-ocid={`contacts.edit_button.${idx + 1}`}
                          onClick={() => {
                            setEditTarget(contact);
                            setFormData({
                              name: contact.name,
                              title: contact.title,
                              email: contact.email,
                              phone: contact.phone,
                            });
                          }}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`contacts.delete_button.${idx + 1}`}
                          onClick={() => setDeleteTarget(contact)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Contact Dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(v) => {
          setAddOpen(v);
          if (!v) setFormData(emptyForm);
        }}
      >
        <DialogContent className="sm:max-w-md" data-ocid="contacts.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add Contact</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ContactForm data={formData} onChange={setFormData} />
          </div>
          <DialogFooter>
            <Button
              data-ocid="contacts.cancel_button"
              variant="outline"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="contacts.submit_button"
              onClick={handleAdd}
              disabled={addContact.isPending}
            >
              {addContact.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Contact"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => {
          if (!v) {
            setEditTarget(null);
            setFormData(emptyForm);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" data-ocid="contacts.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ContactForm data={formData} onChange={setFormData} />
          </div>
          <DialogFooter>
            <Button
              data-ocid="contacts.cancel_button"
              variant="outline"
              onClick={() => {
                setEditTarget(null);
                setFormData(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="contacts.save_button"
              onClick={handleEdit}
              disabled={updateContact.isPending}
            >
              {updateContact.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="contacts.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove contact?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> will be permanently removed
              from all opportunities. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="contacts.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="contacts.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeContact.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
