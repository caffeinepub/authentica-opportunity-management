import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Mixin required if you use authentication or persistent blob storage
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Stage = {
    #prospecting;
    #qualification;
    #proposal;
    #negotiation;
    #closedWon;
    #closedLost;
  };

  module Stage {
    func toText(stage : Stage) : Text {
      switch (stage) {
        case (#prospecting) { "Prospecting" };
        case (#qualification) { "Qualification" };
        case (#proposal) { "Proposal" };
        case (#negotiation) { "Negotiation" };
        case (#closedWon) { "Closed Won" };
        case (#closedLost) { "Closed Lost" };
      };
    };

    public func fromText(text : Text) : ?Stage {
      switch (text) {
        case ("Prospecting") { ?#prospecting };
        case ("Qualification") { ?#qualification };
        case ("Proposal") { ?#proposal };
        case ("Negotiation") { ?#negotiation };
        case ("Closed Won") { ?#closedWon };
        case ("Closed Lost") { ?#closedLost };
        case (_) { null };
      };
    };
  };

  // Opportunity Types
  public type Opportunity = {
    id : Nat;
    name : Text;
    stage : Text;
    value : Int;
    closeDate : Int;
    summary : Text;
    createdAt : Int;
  };

  module Opportunity {
    func toInternal(ext : Opportunity) : InternalOpportunity {
      {
        id = ext.id;
        name = ext.name;
        stage = ext.stage;
        value = ext.value;
        closeDate = ext.closeDate;
        summary = ext.summary;
        createdAt = ext.createdAt;
      };
    };

    public func fromInternal(internal : InternalOpportunity) : Opportunity {
      {
        id = internal.id;
        name = internal.name;
        stage = internal.stage;
        value = internal.value;
        closeDate = internal.closeDate;
        summary = internal.summary;
        createdAt = internal.createdAt;
      };
    };
  };

  public type InternalOpportunity = {
    id : Nat;
    name : Text;
    stage : Text;
    value : Int;
    closeDate : Int;
    summary : Text;
    createdAt : Int;
  };

  module InternalOpportunity {
    public func compareByValue(a : InternalOpportunity, b : InternalOpportunity) : Order.Order {
      return Int.compare(a.value, b.value);
    };

    func fromInternal(internal : InternalOpportunity) : Opportunity {
      {
        id = internal.id;
        name = internal.name;
        stage = internal.stage;
        value = internal.value;
        closeDate = internal.closeDate;
        summary = internal.summary;
        createdAt = internal.createdAt;
      };
    };
  };

  // Contact Types
  public type Contact = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    title : Text;
    linkedOpportunityIds : [Nat];
  };

  module Contact {
    func toInternal(ext : Contact) : InternalContact {
      {
        id = ext.id;
        name = ext.name;
        email = ext.email;
        phone = ext.phone;
        title = ext.title;
        linkedOpportunityIds = ext.linkedOpportunityIds;
      };
    };

    public func fromInternal(internal : InternalContact) : Contact {
      {
        id = internal.id;
        name = internal.name;
        email = internal.email;
        phone = internal.phone;
        title = internal.title;
        linkedOpportunityIds = internal.linkedOpportunityIds;
      };
    };
  };

  public type InternalContact = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    title : Text;
    linkedOpportunityIds : [Nat];
  };

  module InternalContact {
    func fromInternal(internal : InternalContact) : Contact {
      {
        id = internal.id;
        name = internal.name;
        email = internal.email;
        phone = internal.phone;
        title = internal.title;
        linkedOpportunityIds = internal.linkedOpportunityIds;
      };
    };
  };

  // Comment Types
  public type Comment = {
    id : Nat;
    opportunityId : Nat;
    authorName : Text;
    text : Text;
    createdAt : Int;
  };

  module Comment {
    func toInternal(ext : Comment) : InternalComment {
      {
        id = ext.id;
        opportunityId = ext.opportunityId;
        authorName = ext.authorName;
        text = ext.text;
        createdAt = ext.createdAt;
      };
    };

    public func fromInternal(internal : InternalComment) : Comment {
      {
        id = internal.id;
        opportunityId = internal.opportunityId;
        authorName = internal.authorName;
        text = internal.text;
        createdAt = internal.createdAt;
      };
    };
  };

  public type InternalComment = {
    id : Nat;
    opportunityId : Nat;
    authorName : Text;
    text : Text;
    createdAt : Int;
  };

  module InternalComment {
    func fromInternal(internal : InternalComment) : Comment {
      {
        id = internal.id;
        opportunityId = internal.opportunityId;
        authorName = internal.authorName;
        text = internal.text;
        createdAt = internal.createdAt;
      };
    };
  };

  // FileRecord Types
  public type FileRecord = {
    id : Nat;
    opportunityId : Nat;
    displayName : Text;
    folder : Text;
    blobId : Text;
    fileType : Text;
    uploadedAt : Int;
    uploadedBy : Text;
  };

  module FileRecord {
    func toInternal(ext : FileRecord) : InternalFileRecord {
      {
        id = ext.id;
        opportunityId = ext.opportunityId;
        displayName = ext.displayName;
        folder = ext.folder;
        blobId = ext.blobId;
        fileType = ext.fileType;
        uploadedAt = ext.uploadedAt;
        uploadedBy = ext.uploadedBy;
      };
    };

    public func fromInternal(internal : InternalFileRecord) : FileRecord {
      {
        id = internal.id;
        opportunityId = internal.opportunityId;
        displayName = internal.displayName;
        folder = internal.folder;
        blobId = internal.blobId;
        fileType = internal.fileType;
        uploadedAt = internal.uploadedAt;
        uploadedBy = internal.uploadedBy;
      };
    };
  };

  public type InternalFileRecord = {
    id : Nat;
    opportunityId : Nat;
    displayName : Text;
    folder : Text;
    blobId : Text;
    fileType : Text;
    uploadedAt : Int;
    uploadedBy : Text;
  };

  module InternalFileRecord {
    func fromInternal(internal : InternalFileRecord) : FileRecord {
      {
        id = internal.id;
        opportunityId = internal.opportunityId;
        displayName = internal.displayName;
        folder = internal.folder;
        blobId = internal.blobId;
        fileType = internal.fileType;
        uploadedAt = internal.uploadedAt;
        uploadedBy = internal.uploadedBy;
      };
    };
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Persistent Storage
  let opportunities = Map.empty<Nat, InternalOpportunity>();
  let contacts = Map.empty<Nat, InternalContact>();
  let comments = Map.empty<Nat, InternalComment>();
  let fileRecords = Map.empty<Nat, InternalFileRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let contactLinks = Map.empty<Nat, [Nat]>();

  // ID Counters
  var opportunityCounter = 0;
  var contactCounter = 0;
  var commentCounter = 0;
  var fileRecordCounter = 0;

  // Helper Functions
  func ensureUserRegistered(caller : Principal) {
    if (not userProfiles.containsKey(caller)) {
      // Add default profile if not exists
      userProfiles.add(caller, { name = "" });
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Opportunity Functions
  public shared ({ caller }) func createOpportunity(name : Text, stage : Text, value : Int, closeDate : Int, summary : Text) : async Opportunity {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create opportunities");
    };

    let currentTime = Int.abs(Time.now());
    let opportunity : InternalOpportunity = {
      id = opportunityCounter;
      name;
      stage;
      value;
      closeDate;
      summary;
      createdAt = currentTime;
    };

    opportunities.add(opportunity.id, opportunity);
    opportunityCounter += 1;

    Opportunity.fromInternal(opportunity);
  };

  public shared ({ caller }) func updateOpportunity(id : Nat, name : Text, stage : Text, value : Int, closeDate : Int, summary : Text) : async ?Opportunity {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update opportunities");
    };

    switch (opportunities.get(id)) {
      case (null) { null };
      case (?existing) {
        let updated : InternalOpportunity = {
          id;
          name;
          stage;
          value;
          closeDate;
          summary;
          createdAt = existing.createdAt;
        };

        opportunities.add(id, updated);
        ?Opportunity.fromInternal(existing);
      };
    };
  };

  public shared ({ caller }) func deleteOpportunity(id : Nat) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete opportunities");
    };

    switch (opportunities.containsKey(id)) {
      case (true) {
        opportunities.remove(id);
        true;
      };
      case (false) { false };
    };
  };

  public query ({ caller }) func getOpportunity(id : Nat) : async ?Opportunity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view opportunities");
    };

    switch (opportunities.get(id)) {
      case (null) { null };
      case (?op) { ?Opportunity.fromInternal(op) };
    };
  };

  public query ({ caller }) func listOpportunities() : async [Opportunity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list opportunities");
    };

    opportunities.values().toArray().map<InternalOpportunity, Opportunity>(func(internal) { Opportunity.fromInternal(internal) });
  };

  // Contact Functions

  public shared ({ caller }) func addContact(name : Text, email : Text, phone : Text, title : Text) : async Contact {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add contacts");
    };

    let contact : InternalContact = {
      id = contactCounter;
      name;
      email;
      phone;
      title;
      linkedOpportunityIds = [];
    };

    contacts.add(contact.id, contact);
    contactCounter += 1;

    Contact.fromInternal(contact);
  };

  public shared ({ caller }) func addContactAndLink(name : Text, email : Text, phone : Text, title : Text, opportunityId : Nat) : async Contact {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add contacts");
    };

    let contact : InternalContact = {
      id = contactCounter;
      name;
      email;
      phone;
      title;
      linkedOpportunityIds = [opportunityId];
    };

    contacts.add(contact.id, contact);
    contactCounter += 1;

    Contact.fromInternal(contact);
  };

  public shared ({ caller }) func linkContactToOpportunity(contactId : Nat, opportunityId : Nat) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can link contacts");
    };

    switch (contacts.get(contactId)) {
      case (null) { false };
      case (?existing) {
        let updatedContact = {
          existing with
          linkedOpportunityIds = existing.linkedOpportunityIds.concat([opportunityId]);
        };
        contacts.add(contactId, updatedContact);
        true;
      };
    };
  };

  public shared ({ caller }) func unlinkContactFromOpportunity(contactId : Nat, opportunityId : Nat) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlink contacts");
    };

    switch (contacts.get(contactId)) {
      case (null) { false };
      case (?existing) {
        let filteredIds = existing.linkedOpportunityIds.filter(func(id) { id != opportunityId });
        let updatedContact = { existing with linkedOpportunityIds = filteredIds };
        contacts.add(contactId, updatedContact);
        true;
      };
    };
  };

  public query ({ caller }) func listAllContacts() : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list contacts");
    };

    contacts.values().toArray().map<InternalContact, Contact>(func(internal) { Contact.fromInternal(internal) });
  };

  public query ({ caller }) func listContactsByOpportunity(opportunityId : Nat) : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list contacts");
    };

    contacts.values().toArray().filter(func(c) { c.linkedOpportunityIds.find(func(id) { id == opportunityId }) != null }).map<InternalContact, Contact>(func(internal) { Contact.fromInternal(internal) });
  };

  public shared ({ caller }) func updateContact(id : Nat, name : Text, email : Text, phone : Text, title : Text) : async ?Contact {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update contacts");
    };

    switch (contacts.get(id)) {
      case (null) { null };
      case (?existing) {
        let updated : InternalContact = {
          id;
          name;
          email;
          phone;
          title;
          linkedOpportunityIds = existing.linkedOpportunityIds;
        };

        contacts.add(id, updated);
        ?Contact.fromInternal(existing);
      };
    };
  };

  public shared ({ caller }) func removeContact(id : Nat) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove contacts");
    };

    switch (contacts.containsKey(id)) {
      case (true) {
        contacts.remove(id);
        true;
      };
      case (false) { false };
    };
  };

  public query ({ caller }) func getContact(id : Nat) : async ?Contact {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get contacts");
    };

    switch (contacts.get(id)) {
      case (null) { null };
      case (?contact) { ?Contact.fromInternal(contact) };
    };
  };

  // Comment Functions
  public shared ({ caller }) func addComment(opportunityId : Nat, authorName : Text, text : Text) : async Comment {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let currentTime = Int.abs(Time.now());
    let comment : InternalComment = {
      id = commentCounter;
      opportunityId;
      authorName;
      text;
      createdAt = currentTime;
    };

    comments.add(comment.id, comment);
    commentCounter += 1;

    Comment.fromInternal(comment);
  };

  public shared ({ caller }) func deleteComment(id : Nat) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };

    switch (comments.containsKey(id)) {
      case (true) {
        comments.remove(id);
        true;
      };
      case (false) { false };
    };
  };

  public query ({ caller }) func listComments(opportunityId : Nat) : async [Comment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list comments");
    };

    comments.values().toArray().filter(func(c) { c.opportunityId == opportunityId }).map<InternalComment, Comment>(func(internal) { Comment.fromInternal(internal) });
  };

  // FileRecord Functions
  public shared ({ caller }) func addFileRecord(opportunityId : Nat, displayName : Text, folder : Text, blobId : Text, fileType : Text, uploadedBy : Text) : async FileRecord {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add file records");
    };

    let currentTime = Int.abs(Time.now());
    let fileRecord : InternalFileRecord = {
      id = fileRecordCounter;
      opportunityId;
      displayName;
      folder;
      blobId;
      fileType;
      uploadedAt = currentTime;
      uploadedBy;
    };

    fileRecords.add(fileRecord.id, fileRecord);
    fileRecordCounter += 1;

    FileRecord.fromInternal(fileRecord);
  };

  public shared ({ caller }) func deleteFileRecord(id : Nat) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete file records");
    };

    switch (fileRecords.containsKey(id)) {
      case (true) {
        fileRecords.remove(id);
        true;
      };
      case (false) { false };
    };
  };

  public shared ({ caller }) func updateFileRecord(id : Nat, displayName : Text, folder : Text) : async ?FileRecord {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update file records");
    };

    switch (fileRecords.get(id)) {
      case (null) { null };
      case (?existing) {
        let updated : InternalFileRecord = {
          id;
          opportunityId = existing.opportunityId;
          displayName;
          folder;
          blobId = existing.blobId;
          fileType = existing.fileType;
          uploadedAt = existing.uploadedAt;
          uploadedBy = existing.uploadedBy;
        };

        fileRecords.add(id, updated);
        ?FileRecord.fromInternal(existing);
      };
    };
  };

  public query ({ caller }) func listFileRecords(opportunityId : Nat) : async [FileRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list file records");
    };

    fileRecords.values().toArray().filter(func(f) { f.opportunityId == opportunityId }).map<InternalFileRecord, FileRecord>(func(internal) { FileRecord.fromInternal(internal) });
  };
};
