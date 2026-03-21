import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useContact,
  useOpportunities,
  useUpdateContactBio,
  useUpdateContactExtraFields,
} from "../hooks/useQueries";

export default function ContactBioPage() {
  const { id } = useParams({ from: "/contacts/$id" });
  const contactId = BigInt(id);

  const { data: contact, isLoading: contactLoading } = useContact(contactId);
  const { data: allOpportunities = [] } = useOpportunities();
  const updateContactBio = useUpdateContactBio();
  const updateContactExtraFields = useUpdateContactExtraFields();

  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [lastContacted, setLastContacted] = useState("");
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (contact && !initialized.current) {
      setBio(contact.bio ?? "");
      setCompany(contact.company ?? "");
      setLinkedinUrl(contact.linkedinUrl ?? "");
      setLastContacted(contact.lastContacted ?? "");
      initialized.current = true;
    }
  }, [contact]);

  const showSaved = useCallback(() => {
    setSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleBioBlur = useCallback(async () => {
    try {
      await updateContactBio.mutateAsync({ id: contactId, bio });
      showSaved();
    } catch {
      toast.error("Failed to save notes. Please try again.");
    }
  }, [contactId, bio, updateContactBio, showSaved]);

  const handleExtraFieldsBlur = useCallback(async () => {
    try {
      await updateContactExtraFields.mutateAsync({
        id: contactId,
        company,
        linkedinUrl,
        lastContacted,
      });
      showSaved();
    } catch {
      toast.error("Failed to save fields. Please try again.");
    }
  }, [
    contactId,
    company,
    linkedinUrl,
    lastContacted,
    updateContactExtraFields,
    showSaved,
  ]);

  const linkedOpportunities = allOpportunities.filter((opp) =>
    contact?.linkedOpportunityIds?.some((lid) => lid === opp.id),
  );

  if (contactLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading contact…
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Contact not found.</p>
        <Button asChild variant="outline">
          <Link to="/contacts">Back to Contacts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Back nav */}
      <div>
        <Button
          asChild
          variant="ghost"
          className="text-muted-foreground hover:text-primary -ml-2"
          data-ocid="contact_bio.link"
        >
          <Link to="/contacts">
            <ArrowLeft className="w-4 h-4 mr-1" />
            All Contacts
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {contact.name}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {contact.title && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              {contact.title}
            </span>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              {contact.phone}
            </a>
          )}
        </div>
      </div>

      <Separator className="border-border" />

      {/* Extra Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Details</h2>
          {saved && (
            <span
              className="text-xs text-primary animate-in fade-in"
              data-ocid="contact_bio.success_state"
            >
              ✓ Saved
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              Company
            </Label>
            <Input
              data-ocid="contact_bio.company"
              className="bg-card border-border text-foreground"
              placeholder="Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onBlur={handleExtraFieldsBlur}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              LinkedIn URL
            </Label>
            <Input
              data-ocid="contact_bio.linkedin"
              className="bg-card border-border text-foreground"
              placeholder="https://linkedin.com/in/..."
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              onBlur={handleExtraFieldsBlur}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Last Contacted
            </Label>
            <Input
              data-ocid="contact_bio.last_contacted"
              type="date"
              className="bg-card border-border text-foreground"
              value={lastContacted}
              onChange={(e) => setLastContacted(e.target.value)}
              onBlur={handleExtraFieldsBlur}
            />
          </div>
        </div>
        {linkedinUrl && (
          <a
            href={
              linkedinUrl.startsWith("http")
                ? linkedinUrl
                : `https://${linkedinUrl}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Open LinkedIn profile
          </a>
        )}
      </div>

      <Separator className="border-border" />

      {/* Bio & Notes */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Bio &amp; Notes
        </h2>
        <Textarea
          data-ocid="contact_bio.textarea"
          className="min-h-[180px] resize-y bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
          placeholder="Add bio, background notes, meeting summaries, preferences…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={handleBioBlur}
        />
        <p className="text-xs text-muted-foreground">
          Notes are saved automatically when you click away.
        </p>
      </div>

      <Separator className="border-border" />

      {/* Linked Opportunities */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Linked Opportunities
        </h2>
        {linkedOpportunities.length === 0 ? (
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground py-4"
            data-ocid="contact_bio.empty_state"
          >
            <Building2 className="w-4 h-4" />
            No linked opportunities yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {linkedOpportunities.map((opp, idx) => (
              <li
                key={opp.id.toString()}
                data-ocid={`contact_bio.item.${idx + 1}`}
              >
                <Link
                  to="/opportunity/$id"
                  params={{ id: opp.id.toString() }}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  {opp.name}
                  {opp.stage && (
                    <span className="text-xs text-muted-foreground font-normal">
                      · {opp.stage}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
