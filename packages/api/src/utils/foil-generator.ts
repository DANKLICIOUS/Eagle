export interface FOILRequestConfig {
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  requesterAddress?: string;
  incidentDate: string;
  incidentLocation: string;
  officerInfo: {
    name: string;
    badge?: string;
    precinct?: number;
  };
  agency?: "NYPD" | "CCRB" | "DA";
  includeCategories?: ("memobook" | "dispatch" | "bwc" | "criminal_records")[];
}

export class FOILGenerator {
  static generateNYPDRecordsRequest(config: FOILRequestConfig): string {
    const incidentDate = new Date(config.incidentDate);
    const formattedDate = incidentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const preActivationStart = new Date(incidentDate);
    preActivationStart.setMinutes(preActivationStart.getMinutes() - 1);
    const preActivationEnd = new Date(incidentDate);
    preActivationEnd.setSeconds(preActivationEnd.getSeconds() + 1);

    const categories = config.includeCategories || [
      "memobook",
      "dispatch",
      "bwc",
    ];

    let recordsRequested = "";
    if (categories.includes("memobook")) {
      recordsRequested += `
1. OFFICER MEMO BOOK ENTRIES: Complete copies of all entries in the memo book (Activity Log, Field Interview Reports, or similar records) recorded by the above-named officer on ${formattedDate}, including but not limited to entries documenting: activities, incidents, arrests, interactions with civilians, time-stamped entries, and any narratives related to the incident at ${config.incidentLocation}.`;
    }

    if (categories.includes("dispatch")) {
      recordsRequested += `

2. DISPATCH AND RADIO COMMUNICATIONS: Complete transcripts and audio recordings of all dispatch radio communications, CAD (Computer Aided Dispatch) records, and other recorded communications relating to the incident at ${config.incidentLocation} on ${formattedDate}, including call reports, assignment logs, and all radio traffic to and from units responding to this location.`;
    }

    if (categories.includes("bwc")) {
      recordsRequested += `

3. BODY-WORN CAMERA (BWC) FOOTAGE: Complete, unedited Body-Worn Camera video footage recorded by Officer ${config.officerInfo.name}${config.officerInfo.badge ? ` (Badge #${config.officerInfo.badge})` : ""} from ${preActivationStart.toLocaleTimeString()} on ${formattedDate} through the conclusion of all police activity at ${config.incidentLocation}. This request specifically includes:
   a) The mandatory one (1) minute pre-activation cache footage as required by NYPD operations orders;
   b) All unedited, continuous video recording;
   c) Audio recording in its entirety;
   d) Any and all metadata associated with the recording (timestamp, officer identification, precinct information, GPS data if available).`;
    }

    if (categories.includes("criminal_records")) {
      recordsRequested += `

4. CRIMINAL COURT RECORDS: All criminal court documents, arrest reports, charging instruments, discovery materials, and disposition records relating to any arrest made by Officer ${config.officerInfo.name} on ${formattedDate} at ${config.incidentLocation}.`;
    }

    return `
===============================================
         FREEDOM OF INFORMATION LAW
               FOIL REQUEST
         NEW YORK PUBLIC OFFICERS LAW
            ARTICLE 6, § 84-90
===============================================

DATE: ${new Date().toLocaleDateString("en-US")}

FROM: ${config.requesterName}
      ${config.requesterAddress || "[Your Address]"}
      ${config.requesterEmail}
${config.requesterPhone ? `      ${config.requesterPhone}` : ""}

TO: Records Access Officer
    New York City Police Department
    Records Bureau
    One Police Plaza
    New York, NY 10038

RE: FOIL REQUEST FOR RECORDS CONCERNING INCIDENT
    Location: ${config.incidentLocation}
    Date of Incident: ${formattedDate}
    Officer: ${config.officerInfo.name}${config.officerInfo.badge ? ` (Badge #${config.officerInfo.badge})` : ""}${config.officerInfo.precinct ? ` (Precinct ${config.officerInfo.precinct})` : ""}

STATUTORY BASIS & DEMAND:

Under New York Public Officers Law Article 6 (the "Freedom of Information Law" or "FOIL"), all records held by public agencies are presumed to be available to the public. N.Y. Pub. Officers L. § 84(1). As a member of the public, I have the legal right to inspect and copy records held by the New York City Police Department. Id. §§ 84-89.

Pursuant to N.Y. Pub. Officers L. § 89(3), agency records shall be made available within five (5) business days of receipt of this request.

RECORDS REQUESTED:
${recordsRequested}

LEGAL BASIS FOR DISCLOSURE:

1. Public Accountability: The requested records are essential to public accountability and the oversight of government conduct. The documentation of police action, particularly the use of official powers and enforcement authority, is precisely the type of record the FOIL is designed to make publicly available.

2. No Statutory Exemption Applies: While N.Y. Pub. Officers L. § 87 permits withholding of certain records (such as those concerning active investigations), these exemptions are narrowly construed and do not apply to incident-specific records such as those requested here.

3. Mandatory Disclosure of Agency Records: Dispatch records, memo book entries, and camera footage constitute "agency records" as defined in N.Y. Pub. Officers L. § 86. The Department is required to disclose them unless a specific statutory exemption applies.

4. Officer Identification & BWC Disclosure: Under NYPD Patrol Guide Section 212-10, footage shall be disclosed to individuals who were subjects of police action upon request.

RESPONSE DEADLINE:

Pursuant to N.Y. Pub. Officers L. § 89(3), this request must be acknowledged within five (5) business days and shall be completed within twenty (20) business days.

Respectfully submitted,

_________________________________
${config.requesterName}
Date: ___________________

DELIVERY METHOD: [Select as appropriate]
☐ By Electronic Mail
☐ By Certified Mail, Return Receipt Requested
☐ By Hand Delivery
☐ By Facsimile

PLEASE SEND RESPONSE TO:
${config.requesterEmail}
${config.requesterPhone || "[Your Phone Number]"}

===============================================
`;
  }

  static generateCCRBRequest(config: FOILRequestConfig): string {
    const incidentDate = new Date(config.incidentDate);
    const formattedDate = incidentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
===============================================
    REQUEST FOR COMPLAINT RECORDS
  CIVILIAN COMPLAINT REVIEW BOARD (CCRB)
         NEW YORK PUBLIC OFFICERS LAW
            ARTICLE 6, § 84-90
===============================================

DATE: ${new Date().toLocaleDateString("en-US")}

FROM: ${config.requesterName}
      ${config.requesterAddress || "[Your Address]"}
      ${config.requesterEmail}
${config.requesterPhone ? `      ${config.requesterPhone}` : ""}

TO: Records Access Officer
    Civilian Complaint Review Board
    100 Church Street
    New York, NY 10007

RE: FOIL REQUEST FOR COMPLAINT RECORDS
    Incident Date: ${formattedDate}
    Location: ${config.incidentLocation}
    Officer: ${config.officerInfo.name}${config.officerInfo.badge ? ` (Badge #${config.officerInfo.badge})` : ""}

STATUTORY AUTHORITY:

I am requesting copies of all records in the possession of the Civilian Complaint Review Board (CCRB) pertaining to any complaint filed against Officer ${config.officerInfo.name} relating to the incident of ${formattedDate} at ${config.incidentLocation}.

Under New York Public Officers Law Article 6 § 87(2)(a), CCRB complaint records are public documents. The disposition of complaints is public information.

RECORDS REQUESTED:

1. All complaint case files and complaint documents
2. Investigation reports and summaries
3. Board disposition letters and findings
4. All evidence and witness statements (with appropriate redactions)

This request must be fulfilled within five (5) business days under N.Y. Pub. Officers L. § 89(3).

Respectfully submitted,

_________________________________
${config.requesterName}

===============================================
`;
  }

  static generateFOILSummaryLetter(requests: FOILRequestConfig[]): string {
    const requestList = requests
      .map(
        (r, i) =>
          `${i + 1}. Incident on ${r.incidentDate} at ${r.incidentLocation} involving Officer ${r.officerInfo.name}`
      )
      .join("\n");

    return `
===============================================
    CONSOLIDATED FOIL REQUEST TRACKING LETTER
         Multiple Incident Records Request
===============================================

This letter documents the submission of multiple Freedom of Information Law requests.

INCIDENTS REQUESTED:

${requestList}

SUBMISSION DATES & TRACKING:

[Track each FOIL submission here]

STATUTORY DEADLINE TRACKING:

Five (5) Business Days to Acknowledge: _________
Twenty (20) Business Days to Complete: _________

Keep this document for tracking all FOIL requests and agency responses.
`;
  }
}
