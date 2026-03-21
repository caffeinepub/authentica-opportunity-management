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

  // Opportunity V1 -- original shape without helpTypes
  type InternalOpportunityV1 = {
    id : Nat;
    name : Text;
    stage : Text;
    value : Int;
    closeDate : Int;
    summary : Text;
    createdAt : Int;
  };

  // Opportunity V2 -- adds helpTypes
  public type InternalOpportunity = {
    id : Nat;
    name : Text;
    stage : Text;
    value : Int;
    closeDate : Int;
    summary : Text;
    createdAt : Int;
    helpTypes : [Text];
  };

  public type Opportunity = {
    id : Nat;
    name : Text;
    stage : Text;
    value : Int;
    closeDate : Int;
    summary : Text;
    createdAt : Int;
    helpTypes : [Text];
  };

  module Opportunity {
    public func fromInternal(internal : InternalOpportunity) : Opportunity {
      {
        id = internal.id;
        name = internal.name;
        stage = internal.stage;
        value = internal.value;
        closeDate = internal.closeDate;
        summary = internal.summary;
        createdAt = internal.createdAt;
        helpTypes = internal.helpTypes;
      };
    };
  };

  module InternalOpportunity {
    public func compareByValue(a : InternalOpportunity, b : InternalOpportunity) : Order.Order {
      return Int.compare(a.value, b.value);
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
    bio : Text;
    company : Text;
    linkedinUrl : Text;
    lastContacted : Text;
  };

  module Contact {
    public func fromInternal(internal : InternalContact, bio : Text, company : Text, linkedinUrl : Text, lastContacted : Text) : Contact {
      {
        id = internal.id;
        name = internal.name;
        email = internal.email;
        phone = internal.phone;
        title = internal.title;
        linkedOpportunityIds = internal.linkedOpportunityIds;
        bio;
        company;
        linkedinUrl;
        lastContacted;
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

  // Comment Types
  public type Comment = {
    id : Nat;
    opportunityId : Nat;
    authorName : Text;
    text : Text;
    createdAt : Int;
  };

  module Comment {
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
    name : Text;
  };

  public type UserProfileDTO = {
    principal : Principal;
    name : Text;
  };

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

  type TodoItemV1 = {
    id : Nat;
    title : Text;
    assignedTo : Text;
    stage : Text;
    createdAt : Int;
  };

  type TodoItemV2 = {
    id : Nat;
    title : Text;
    assignedTo : Text;
    stage : Text;
    createdAt : Int;
    opportunityId : ?Nat;
  };

  public type TodoItem = {
    id : Nat;
    title : Text;
    assignedTo : Text;
    stage : Text;
    createdAt : Int;
    opportunityId : ?Nat;
    priority : Text;
  };

  public type FilePermissionEntry = {
    fileId : Nat;
    allowedUsers : [Principal];
  };

  // Persistent Storage - stable vars survive canister upgrades
  // V1 opportunities (old shape, kept for migration)
  stable var opportunities = Map.empty<Nat, InternalOpportunityV1>();
  // V2 opportunities (with helpTypes)
  stable var opportunitiesV2 = Map.empty<Nat, InternalOpportunity>();
  stable var opportunitiesV2Migrated = false;

  stable var contacts = Map.empty<Nat, InternalContact>();
  stable var contactBios = Map.empty<Nat, Text>();
  stable var contactCompany = Map.empty<Nat, Text>();
  stable var contactLinkedinUrl = Map.empty<Nat, Text>();
  stable var contactLastContacted = Map.empty<Nat, Text>();
  stable var comments = Map.empty<Nat, InternalComment>();
  stable var fileRecords = Map.empty<Nat, InternalFileRecordV1>();
  stable var fileRecordsV2 = Map.empty<Nat, InternalFileRecord>();
  stable var fileRecordsMigrated = false;
  stable var filePermissions = Map.empty<Nat, [Principal]>();
  stable var userProfiles = Map.empty<Principal, UserProfile>();
  stable var calendarItems = Map.empty<Nat, CalendarItem>();
  stable var contactLinks = Map.empty<Nat, [Nat]>();

  stable var todoItems = Map.empty<Nat, TodoItemV1>();
  stable var todoItemsV2 = Map.empty<Nat, TodoItemV2>();
  stable var todoItemsMigrated = false;
  stable var todoItemsV3 = Map.empty<Nat, TodoItem>();
  stable var todoItemsV3Migrated = false;

  stable var maxUsers : Nat = 3;

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
  stable var stableUserRoles = Map.empty<Principal, Text>();
  stable var stableAdminAssigned = false;

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

  system func postupgrade() {
    // Restore access control roles
    for ((principal, roleText) in stableUserRoles.toArray().vals()) {
      let role = switch (roleText) {
        case ("admin") { #admin };
        case ("user") { #user };
        case (_) { #guest };
      };
      accessControlState.userRoles.add(principal, role);
    };
    accessControlState.adminAssigned := stableAdminAssigned;

    // Migrate Opportunity V1 -> V2 (add helpTypes = [])
    if (not opportunitiesV2Migrated) {
      for ((k, v) in opportunities.toArray().vals()) {
        if (not opportunitiesV2.containsKey(k)) {
          opportunitiesV2.add(k, {
            id = v.id;
            name = v.name;
            stage = v.stage;
            value = v.value;
            closeDate = v.closeDate;
            summary = v.summary;
            createdAt = v.createdAt;
            helpTypes = [];
          });
        };
      };
      opportunitiesV2Migrated := true;
    };

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
    // Migrate TodoItem V2 -> V3
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
    if (not allUsersAdminMigrated) {
      for ((principal, _) in userProfiles.toArray().vals()) {
        accessControlState.userRoles.add(principal, #admin);
        stableUserRoles.add(principal, "admin");
      };
      accessControlState.adminAssigned := true;
      allUsersAdminMigrated := true;
    };
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
  };

  func ensureUserRegistered(caller : Principal) {
    if (not userProfiles.containsKey(caller)) {
      if (userProfiles.size() >= maxUsers) {
        Runtime.trap("User limit reached: maximum " # maxUsers.toText() # " users allowed");
      };
      userProfiles.add(caller, { name = "" });
    };
  };

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

  public query func getMaxUsers() : async Nat {
    maxUsers;
  };

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

  // Opportunity Functions (V2)
  public shared ({ caller }) func createOpportunity(name : Text, stage : Text, value : Int, closeDate : Int, summary : Text, helpTypes : [Text]) : async Opportunity {
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
      helpTypes;
    };

    opportunitiesV2.add(opportunity.id, opportunity);
    opportunityCounter += 1;

    Opportunity.fromInternal(opportunity);
  };

  public shared ({ caller }) func updateOpportunity(id : Nat, name : Text, stage : Text, value : Int, closeDate : Int, summary : Text, helpTypes : [Text]) : async ?Opportunity {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update opportunities");
    };

    switch (opportunitiesV2.get(id)) {
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
          helpTypes;
        };

        opportunitiesV2.add(id, updated);
        ?Opportunity.fromInternal(updated);
      };
    };
  };

  public shared ({ caller }) func deleteOpportunity(id : Nat) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete opportunities");
    };

    switch (opportunitiesV2.containsKey(id)) {
      case (true) {
        opportunitiesV2.remove(id);
        true;
      };
      case (false) { false };
    };
  };

  public query ({ caller }) func getOpportunity(id : Nat) : async ?Opportunity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can view opportunities");
    };

    switch (opportunitiesV2.get(id)) {
      case (null) { null };
      case (?op) { ?Opportunity.fromInternal(op) };
    };
  };

  public query ({ caller }) func listOpportunities() : async [Opportunity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can list opportunities");
    };

    opportunitiesV2.values().toArray().map<InternalOpportunity, Opportunity>(func(internal) { Opportunity.fromInternal(internal) });
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

    Contact.fromInternal(contact, "", "", "", "");
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

    Contact.fromInternal(contact, "", "", "", "");
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

    contacts.values().toArray().map<InternalContact, Contact>(func(internal) { Contact.fromInternal(internal, (switch (contactBios.get(internal.id)) { case (?b) b; case null "" }), (switch (contactCompany.get(internal.id)) { case (?c) c; case null "" }), (switch (contactLinkedinUrl.get(internal.id)) { case (?l) l; case null "" }), (switch (contactLastContacted.get(internal.id)) { case (?d) d; case null "" })) });
  };

  public query ({ caller }) func listContactsByOpportunity(opportunityId : Nat) : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can list contacts");
    };

    contacts.values().toArray().filter(func(c) { c.linkedOpportunityIds.find(func(id) { id == opportunityId }) != null }).map<InternalContact, Contact>(func(internal) { Contact.fromInternal(internal, (switch (contactBios.get(internal.id)) { case (?b) b; case null "" }), (switch (contactCompany.get(internal.id)) { case (?c) c; case null "" }), (switch (contactLinkedinUrl.get(internal.id)) { case (?l) l; case null "" }), (switch (contactLastContacted.get(internal.id)) { case (?d) d; case null "" })) });
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
        ?Contact.fromInternal(existing, (switch (contactBios.get(id)) { case (?b) b; case null "" }), (switch (contactCompany.get(id)) { case (?c) c; case null "" }), (switch (contactLinkedinUrl.get(id)) { case (?l) l; case null "" }), (switch (contactLastContacted.get(id)) { case (?d) d; case null "" }));
      };
    };
  };

  public shared ({ caller }) func updateContactBio(id : Nat, bio : Text) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update contacts");
    };
    switch (contacts.get(id)) {
      case (null) { false };
      case (?_) {
        contactBios.add(id, bio);
        true;
      };
    };
  };

  public shared ({ caller }) func updateContactExtraFields(id : Nat, company : Text, linkedinUrl : Text, lastContacted : Text) : async Bool {
    ensureUserRegistered(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update contacts");
    };
    switch (contacts.get(id)) {
      case (null) { false };
      case (?_) {
        contactCompany.add(id, company);
        contactLinkedinUrl.add(id, linkedinUrl);
        contactLastContacted.add(id, lastContacted);
        true;
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
      case (?contact) { ?Contact.fromInternal(contact, (switch (contactBios.get(contact.id)) { case (?b) b; case null "" }), (switch (contactCompany.get(contact.id)) { case (?c) c; case null "" }), (switch (contactLinkedinUrl.get(contact.id)) { case (?l) l; case null "" }), (switch (contactLastContacted.get(contact.id)) { case (?d) d; case null "" })) };
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

  // TodoItem V3
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
