import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
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

  // FileRecord V1 -- original shape without isConfidential.
  type InternalFileRecordV1 = {
    id : Nat;
    opportunityId : Nat;
    displayName : Text;
    folder : Text;
    blobId : Text;
    fileType : Text;
    uploadedAt : Int;
    uploadedBy : Text;
  };

  // FileRecord V2 -- adds isConfidential field.
  public type InternalFileRecord = {
    id : Nat;
    opportunityId : Nat;
    displayName : Text;
    folder : Text;
    blobId : Text;
    fileType : Text;
    uploadedAt : Int;
    uploadedBy : Text;
    isConfidential : Bool;
  };

  public type FileRecord = {
    id : Nat;
    opportunityId : Nat;
    displayName : Text;
    folder : Text;
    blobId : Text;
    fileType : Text;
    uploadedAt : Int;
    uploadedBy : Text;
    isConfidential : Bool;
  };

  module FileRecord {
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
        isConfidential = internal.isConfidential;
      };
    };
  };

  // User Profile Type
  public type UserProfile = {
    name : Text; // Display name
  };

  public type UserProfileDTO = {
    principal : Principal;
    name : Text;
  };

  // Admin: User with role info
  public type UserWithRole = {
    principal : Principal;
    name : Text;
    role : Text;
  };

  // Calendar Item Type
  public type CalendarItem = {
    id : Nat;
    title : Text;
    dateTimestamp : Int;
    timeLabel : Text;
    notes : Text;
    opportunityId : ?Nat;
    createdBy : Text;
  };

  public type TodoStage = {
    #todo;
    #inProgress;
    #done;
  };

  // TodoItem V1 -- original shape (no opportunityId)
  type TodoItemV1 = {
    id : Nat;
    title : Text;
    assignedTo : Text;
    stage : Text;
    createdAt : Int;
  };

  // TodoItem V2 -- added opportunityId
  type TodoItemV2 = {
    id : Nat;
    title : Text;
    assignedTo : Text;
    stage : Text;
    createdAt : Int;
    opportunityId : ?Nat;
  };

  // TodoItem V3 (current) -- adds priority field
  public type TodoItem = {
    id : Nat;
    title : Text;
    assignedTo : Text;
    stage : Text;
    createdAt : Int;
    opportunityId : ?Nat;
    priority : Text; // "low" | "medium" | "high"
  };

  // File permissions entry
  public type FilePermissionEntry = {
    fileId : Nat;
    allowedUsers : [Principal];
  };

  // Persistent Storage - stable vars survive canister upgrades
  stable var opportunities = Map.empty<Nat, InternalOpportunity>();
  stable var contacts = Map.empty<Nat, InternalContact>();
  stable var comments = Map.empty<Nat, InternalComment>();
  // V1 stable var kept for migration -- do NOT use at runtime
  stable var fileRecords = Map.empty<Nat, InternalFileRecordV1>();
  // V2 stable var -- all runtime code uses this
  stable var fileRecordsV2 = Map.empty<Nat, InternalFileRecord>();
  stable var fileRecordsMigrated = false;
  // Per-file list of principals allowed to see confidential files
  stable var filePermissions = Map.empty<Nat, [Principal]>();
  stable var userProfiles = Map.empty<Principal, UserProfile>();
  stable var calendarItems = Map.empty<Nat, CalendarItem>();
  stable var contactLinks = Map.empty<Nat, [Nat]>();

  // TodoItem migration stable vars
  stable var todoItems = Map.empty<Nat, TodoItemV1>();
  stable var todoItemsV2 = Map.empty<Nat, TodoItemV2>();
  stable var todoItemsMigrated = false;
  // V3 adds priority
  stable var todoItemsV3 = Map.empty<Nat, TodoItem>();
  stable var todoItemsV3Migrated = false;

  // Admin settings
  stable var maxUsers : Nat = 3;

  // ID Counters - stable so they don't reset on upgrade
  stable var opportunityCounter = 0;
  stable var contactCounter = 0;
  stable var commentCounter = 0;
  stable var fileRecordCounter = 0;
  stable var calendarItemCounter = 0;
  stable var todoItemCounter = 0;

  stable var userRolesMigrated = false;
  stable var allUsersAdminMigrated = false;
  stable var testUserDeleted = false;
  stable var confidentialUsers = Map.empty<Principal, Bool>();
  // Stable storage for access control roles (persists across upgrades)
  stable var stableUserRoles = Map.empty<Principal, Text>();
  stable var stableAdminAssigned = false;

  // Save access control roles before upgrade
  system func preupgrade() {
    stableUserRoles := Map.empty<Principal, Text>();
    for ((principal, role) in accessControlState.userRoles.toArray().vals()) {
      let roleText = switch (role) {
        case (#admin) { "admin" };
        case (#user) { "user" };
        case (_) { "guest" };
      };
      stableUserRoles.add(principal, roleText);
    };
    stableAdminAssigned := accessControlState.adminAssigned;
  };

  // Run migrations on upgrade
  system func postupgrade() {
    // Restore access control roles from stable storage
    for ((principal, roleText) in stableUserRoles.toArray().vals()) {
      let role = switch (roleText) {
        case ("admin") { #admin };
        case ("user") { #user };
        case (_) { #guest };
      };
      accessControlState.userRoles.add(principal, role);
    };
    accessControlState.adminAssigned := stableAdminAssigned;

    // Migrate TodoItem V1 -> V2
    if (not todoItemsMigrated) {
      for ((k, v) in todoItems.toArray().vals()) {
        todoItemsV2.add(k, {
          id = v.id;
          title = v.title;
          assignedTo = v.assignedTo;
          stage = v.stage;
          createdAt = v.createdAt;
          opportunityId = null;
        });
      };
      todoItemsMigrated := true;
    };
    // Migrate TodoItem V2 -> V3 (add priority = "medium" for existing items)
    if (not todoItemsV3Migrated) {
      for ((k, v) in todoItemsV2.toArray().vals()) {
        todoItemsV3.add(k, {
          id = v.id;
          title = v.title;
          assignedTo = v.assignedTo;
          stage = v.stage;
          createdAt = v.createdAt;
          opportunityId = v.opportunityId;
          priority = "medium";
        });
      };
      todoItemsV3Migrated := true;
    };
    // Migrate FileRecord V1 -> V2
    if (not fileRecordsMigrated) {
      for ((k, v) in fileRecords.toArray().vals()) {
        fileRecordsV2.add(k, {
          id = v.id;
          opportunityId = v.opportunityId;
          displayName = v.displayName;
          folder = v.folder;
          blobId = v.blobId;
          fileType = v.fileType;
          uploadedAt = v.uploadedAt;
          uploadedBy = v.uploadedBy;
          isConfidential = false;
        });
      };
      fileRecordsMigrated := true;
    };
    // Migrate: promote all existing #user roles to #admin (one-time migration)
    if (not userRolesMigrated) {
      for ((principal, role) in accessControlState.userRoles.toArray().vals()) {
        switch (role) {
          case (#user) {
            accessControlState.userRoles.add(principal, #admin);
          };
          case (_) {};
        };
      };
      userRolesMigrated := true;
    };
    // Migration: promote ALL registered users to admin (replaces partial migration)
    if (not allUsersAdminMigrated) {
      for ((principal, _) in userProfiles.toArray().vals()) {
        accessControlState.userRoles.add(principal, #admin);
        stableUserRoles.add(principal, "admin");
      };
      accessControlState.adminAssigned := true;
      allUsersAdminMigrated := true;
    };
  };
    // Migration: remove user named "test" if present
    if (not testUserDeleted) {
      let toRemove = userProfiles.toArray().filter(
        func((_, profile) : (Principal, UserProfile)) : Bool {
          profile.name == "test"
        }
      );
      for ((principal, _) in toRemove.vals()) {
        userProfiles.remove(principal);
        stableUserRoles.remove(principal);
      };
      testUserDeleted := true;
    };

  // Helper Functions
  func ensureUserRegistered(caller : Principal) {
    if (not userProfiles.containsKey(caller)) {
      // Enforce max users limit
      if (userProfiles.size() >= maxUsers) {
        Runtime.trap("User limit reached: maximum " # maxUsers.toText() # " users allowed");
      };
      // Add default profile if not exists
      userProfiles.add(caller, { name = "" });
    };
  };


  // Helper: restore caller role from stable storage so admin checks work across upgrades
  func _restoreCallerRoleFromStable(caller : Principal) {
    switch (stableUserRoles.get(caller)) {
      case (?roleText) {
        let role = switch (roleText) {
          case ("admin") { #admin };
          case ("confidential") { #user };
          case ("user") { #user };
          case (_) { #guest };
        };
        accessControlState.userRoles.add(caller, role);
      };
      case (null) {
        if (userProfiles.containsKey(caller)) {
          accessControlState.userRoles.add(caller, #admin);
          stableUserRoles.add(caller, "admin");
        };
      };
    };
  };

  // Helper: check if caller can access a confidential file
  func canAccessFile(caller : Principal, fileId : Nat) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    if (confidentialUsers.containsKey(caller)) { return true };
    switch (filePermissions.get(fileId)) {
      case (null) { false };
      case (?allowed) {
        allowed.find(func(p : Principal) : Bool { p == caller }) != null
      };
    };
  };

  // Admin: Get max users limit
  public query func getMaxUsers() : async Nat {
    maxUsers;
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
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

  public query ({ caller }) func listAllUserProfiles() : async [UserProfileDTO] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can list user profiles");
    };
    userProfiles.toArray().map<(Principal, UserProfile), UserProfileDTO>(
      func((principal, profile)) {
        { principal; name = profile.name };
      }
    );
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can view opportunities");
    };

    switch (opportunities.get(id)) {
      case (null) { null };
      case (?op) { ?Opportunity.fromInternal(op) };
    };
  };

  public query ({ caller }) func listOpportunities() : async [Opportunity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can list contacts");
    };

    contacts.values().toArray().map<InternalContact, Contact>(func(internal) { Contact.fromInternal(internal) });
  };

  public query ({ caller }) func listContactsByOpportunity(opportunityId : Nat) : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can list comments");
    };

    comments.values().toArray().filter(func(c) { c.opportunityId == opportunityId }).map<InternalComment, Comment>(func(internal) { Comment.fromInternal(internal) });
  };

  // FileRecord Functions (V2)
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
      isConfidential = false;
    };

    fileRecordsV2.add(fileRecord.id, fileRecord);
    fileRecordCounter += 1;

    FileRecord.fromInternal(fileRecord);
  };

  public shared ({ caller }) func deleteFileRecord(id : Nat) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete file records");
    };

    switch (fileRecordsV2.containsKey(id)) {
      case (true) {
        fileRecordsV2.remove(id);
        filePermissions.remove(id);
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

    switch (fileRecordsV2.get(id)) {
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
          isConfidential = existing.isConfidential;
        };

        fileRecordsV2.add(id, updated);
        ?FileRecord.fromInternal(existing);
      };
    };
  };

  // listFileRecords: filters out confidential files unless caller has access
  public query ({ caller }) func listFileRecords(opportunityId : Nat) : async [FileRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can list file records");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller) or confidentialUsers.containsKey(caller);

    fileRecordsV2.values().toArray()
      .filter(func(f : InternalFileRecord) : Bool {
        if (f.opportunityId != opportunityId) { return false };
        if (not f.isConfidential) { return true };
        if (isAdmin) { return true };
        switch (filePermissions.get(f.id)) {
          case (null) { false };
          case (?allowed) {
            allowed.find(func(p : Principal) : Bool { p == caller }) != null
          };
        };
      })
      .map<InternalFileRecord, FileRecord>(func(internal) { FileRecord.fromInternal(internal) });
  };

  // CalendarItem
  public shared ({ caller }) func createCalendarItem(title : Text, dateTimestamp : Int, timeLabel : Text, notes : Text, opportunityId : ?Nat, createdBy : Text) : async CalendarItem {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create calendar items");
    };

    let newCalendarItem : CalendarItem = {
      id = calendarItemCounter;
      title;
      dateTimestamp;
      timeLabel;
      notes;
      opportunityId;
      createdBy;
    };

    calendarItems.add(calendarItemCounter, newCalendarItem);
    calendarItemCounter += 1;

    newCalendarItem;
  };

  public shared ({ caller }) func deleteCalendarItem(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete calendar items");
    };

    calendarItems.remove(id);
    true;
  };

  public query ({ caller }) func listCalendarItems() : async [CalendarItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can list calendar items");
    };

    calendarItems.values().toArray();
  };

  // TodoItem V3 -- all runtime functions use todoItemsV3
  public shared ({ caller }) func createTodoItem(title : Text, assignedTo : Text, stage : Text, opportunityId : ?Nat, priority : Text) : async TodoItem {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create todo items");
    };

    let newTodoItem : TodoItem = {
      id = todoItemCounter;
      title;
      assignedTo;
      stage;
      createdAt = Int.abs(Time.now());
      opportunityId;
      priority;
    };

    todoItemsV3.add(todoItemCounter, newTodoItem);
    todoItemCounter += 1;

    newTodoItem;
  };

  public shared ({ caller }) func updateTodoItem(id : Nat, title : Text, assignedTo : Text, stage : Text, opportunityId : ?Nat, priority : Text) : async ?TodoItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update todo items");
    };

    switch (todoItemsV3.get(id)) {
      case (null) { null };
      case (?existing) {
        let updatedTodoItem : TodoItem = {
          id;
          title;
          assignedTo;
          stage;
          createdAt = existing.createdAt;
          opportunityId;
          priority;
        };
        todoItemsV3.add(id, updatedTodoItem);
        ?updatedTodoItem;
      };
    };
  };

  public shared ({ caller }) func deleteTodoItem(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete todo items");
    };

    todoItemsV3.remove(id);
    true;
  };

  public query ({ caller }) func listTodoItems() : async [TodoItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can list todo items");
    };

    todoItemsV3.values().toArray();
  };
};
