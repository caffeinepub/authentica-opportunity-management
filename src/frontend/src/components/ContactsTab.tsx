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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  Link2,
  Link2Off,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Contact } from "../hooks/useQueries";
import {
  useAddContactAndLink,
  useAllContacts,
  useLinkContact,
  useOpportunityContacts,
  useUnlinkContact,
} from "../hooks/useQueries";

interface NewContactForm {
  name: string;
  title: string;
  email: string;
  phone: string;
}

const emptyForm: NewContactForm = { name: "", title: "", email: "", phone: "" };

export default function ContactsTab({
  opportunityId,
}: { opportunityId: bigint }) {
  const contactsQuery = useOpportunityContacts(opportunityId);
  const allContactsQuery = useAllContacts();
  const addContactAndLink = useAddContactAndLink();
  const linkContact = useLinkContact();
  const unlinkContact = useUnlinkContact();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<Contact | null>(null);
  const [newForm, setNewForm] = useState<NewContactForm>(emptyForm);
  const [linkSearch, setLinkSearch] = useState("");

  const linkedIds = useMemo(
    () => new Set((contactsQuery.data ?? []).map((c) => c.id.toString())),
    [contactsQuery.data],
  );

  const availableToLink = useMemo(() => {
    const q = linkSearch.toLowerCase();
    return (allContactsQuery.data ?? []).filter(
      (c) =>
        !linkedIds.has(c.id.toString()) &&
        (c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q)),
    );
  }, [allContactsQuery.data, linkedIds, linkSearch]);

  const handleCreateAndLink = async () => {
    if (!newForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await addContactAndLink.mutateAsync({ ...newForm, opportunityId });
      toast.success("Contact created and linked");
      setDialogOpen(false);
      setNewForm(emptyForm);
    } catch {
      toast.error("Failed to create contact");
    }
  };

  const handleLink = async (contact: Contact) => {
    try {
      await linkContact.mutateAsync({
        contactId: contact.id,
        opportunityId,
      });
      toast.success(`${contact.name} linked`);
    } catch {
      toast.error("Failed to link contact");
    }
  };

  const handleUnlink = async () => {
    if (!unlinkTarget) return;
    try {
      await unlinkContact.mutateAsync({
        contactId: unlinkTarget.id,
        opportunityId,
      });
      toast.success(`${unlinkTarget.name} unlinked`);
      setUnlinkTarget(null);
    } catch {
      toast.error("Failed to unlink contact");
    }
  };

  const contacts = contactsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          data-ocid="contacts.open_modal_button"
          size="sm"
          className="gap-2"
          onClick={() => {
            setNewForm(emptyForm);
            setLinkSearch("");
            setDialogOpen(true);
          }}
        >
          <UserPlus className="w-4 h-4" /> Add Contact
        </Button>
      </div>

      {contactsQuery.isLoading ? (
        <div
          className="flex items-center gap-2 text-muted-foreground text-sm"
          data-ocid="contacts.loading_state"
        >
          <Loader2 className="w-4 h-4 animate-spin" /> Loading contacts...
        </div>
      ) : contacts.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-lg"
          data-ocid="contacts.empty_state"
        >
          No contacts linked to this opportunity.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact, idx) => (
                <TableRow
                  key={contact.id.toString()}
                  data-ocid={`contacts.item.${idx + 1}`}
                >
                  <TableCell className="font-medium">
                    <Link
                      to="/contacts/$id"
                      params={{ id: contact.id.toString() }}
                      className="hover:text-primary hover:underline cursor-pointer"
                    >
                      {contact.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.title || "—"}
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <Mail className="w-3 h-3" />
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
                        className="flex items-center gap-1 text-sm hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      data-ocid={`contacts.delete_button.${idx + 1}`}
                      onClick={() => setUnlinkTarget(contact)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs transition-colors"
                      title="Unlink from this opportunity"
                    >
                      <Link2Off className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Link Contact Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) {
            setNewForm(emptyForm);
            setLinkSearch("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg" data-ocid="contacts.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add Contact</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="new">
            <TabsList className="w-full">
              <TabsTrigger
                value="new"
                className="flex-1"
                data-ocid="contacts.tab"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create New
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="flex-1"
                data-ocid="contacts.tab"
              >
                <Link2 className="w-3.5 h-3.5 mr-1.5" />
                Link Existing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ct-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ct-name"
                    data-ocid="contacts.input"
                    value={newForm.name}
                    onChange={(e) =>
                      setNewForm({ ...newForm, name: e.target.value })
                    }
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ct-title">Title</Label>
                  <Input
                    id="ct-title"
                    value={newForm.title}
                    onChange={(e) =>
                      setNewForm({ ...newForm, title: e.target.value })
                    }
                    placeholder="VP of Sales"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ct-email">Email</Label>
                <Input
                  id="ct-email"
                  type="email"
                  value={newForm.email}
                  onChange={(e) =>
                    setNewForm({ ...newForm, email: e.target.value })
                  }
                  placeholder="jane@acme.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ct-phone">Phone</Label>
                <Input
                  id="ct-phone"
                  type="tel"
                  value={newForm.phone}
                  onChange={(e) =>
                    setNewForm({ ...newForm, phone: e.target.value })
                  }
                  placeholder="+1 555 000 0000"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  data-ocid="contacts.submit_button"
                  onClick={handleCreateAndLink}
                  disabled={addContactAndLink.isPending}
                >
                  {addContactAndLink.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create & Link"
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="link" className="pt-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="contacts.search_input"
                  placeholder="Search contacts…"
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-64 border border-border rounded-lg">
                {availableToLink.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground py-8">
                    {allContactsQuery.isLoading
                      ? "Loading…"
                      : linkedIds.size === (allContactsQuery.data?.length ?? 0)
                        ? "All contacts are already linked"
                        : "No contacts match your search"}
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {availableToLink.map((contact) => (
                      <div
                        key={contact.id.toString()}
                        className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {contact.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {[contact.title, contact.email]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-3 shrink-0 gap-1.5 text-xs h-7"
                          onClick={() => handleLink(contact)}
                          disabled={linkContact.isPending}
                        >
                          <Link2 className="w-3 h-3" />
                          Link
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="flex justify-end">
                <Button
                  data-ocid="contacts.close_button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Done
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Unlink Confirm */}
      <AlertDialog
        open={!!unlinkTarget}
        onOpenChange={(v) => {
          if (!v) setUnlinkTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="contacts.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink contact?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{unlinkTarget?.name}</strong> will be removed from this
              opportunity but will remain in your global contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="contacts.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="contacts.confirm_button"
              onClick={handleUnlink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {unlinkContact.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unlinking...
                </>
              ) : (
                "Unlink"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
