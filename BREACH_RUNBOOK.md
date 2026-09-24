# NFCISTA Personal Data Breach Response Runbook

> **LEGAL NOTICE & SCOPE:**
> This Runbook is an internal engineering operational procedure designed to guide incident triage, containment, and forensics for NFCISTA digital business card infrastructure. It does not constitute formal legal counsel. Any suspected data breach must be reviewed alongside qualified Indian legal counsel to determine statutory reporting obligations under India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000 (including CERT-In directions).

---

## 1. Statutory Context & Legal Distinction Note

### DPDP Act 2023 vs. GDPR / CERT-In Notification Deadlines
There is widespread market confusion regarding breach reporting timelines. This runbook establishes the verified legal position for NFCISTA:

| Legal / Regulatory Regime | Authority | Required Intimation / Timeline | Application to NFCISTA |
| :--- | :--- | :--- | :--- |
| **DPDP Act, 2023**<br>*(Section 8(6))* | Data Protection Board of India (DPBI) | Intimation to the Board and affected Data Principals *"in such form and manner as may be prescribed"*. | The statute itself does **not** specify a rigid 72-hour timeline. Specific timelines and submission forms await final notification of DPDP Rules by the Central Government. |
| **CERT-In Cyber Security Directions**<br>*(Under IT Act, Section 70B)* | Indian Computer Emergency Response Team (CERT-In) | Mandatory reporting within **6 hours** of noticing specified cybersecurity incidents (e.g. unauthorized server compromise, ransomware, large-scale defacement). | Applies to cybersecurity incidents meeting the CERT-In annexure categories, reportable via CERT-In incident reporting mechanisms. |
| **GDPR (European Union)**<br>*(Article 33)* | EU Supervisory Authorities | 72 hours from becoming aware of a personal data breach. | **Does not apply** to domestic Indian processing unless serving Data Principals in the EU/EEA. Social media claims asserting a mandatory "72-hour Board notice under DPDP Act" mistakenly cite GDPR text. |

---

## 2. Breach Response Phased Checklist

```
+-------------------+      +-------------------+      +-------------------+
| 1. Identification | ---> |  2. Containment   | ---> | 3. Investigation  |
|     & Triage      |      |   & Isolation     |      |   & Assessment    |
+-------------------+      +-------------------+      +-------------------+
                                                                |
+-------------------+      +-------------------+                v
| 6. Post-Incident  | <--- | 5. Remediation    | <--- +-------------------+
|      Review       |      |   & Hardening     |      | 4. Notification   |
+-------------------+      +-------------------+      | (Board & Users)   |
                                                      +-------------------+
```

### Phase 1: Identification & Immediate Triage (0 – 2 Hours)
- [ ] **Acknowledge Alarm:** Receive report via internal monitoring, user grievance, Supabase security notice, or Vercel alert.
- [ ] **Verify Authenticity:** Distinguish between a false alarm, a benign bug, and an actual unauthorized access/exfiltration event.
- [ ] **Open Incident Log:** Designate Incident Commander (Lead Engineer / Operator) and create an incident entry using the Template in Section 3.
- [ ] **Freeze Production State:** Preserve serverless deployment logs, Supabase audit logs, and PostgreSQL transaction logs before restarting services or redeploying.

### Phase 2: Containment & Isolation (Immediate Priority)
- [ ] **Revoke Compromised Credentials:**
  - Rotate Supabase Service-Role and Anon keys immediately if exposed.
  - Revoke and rotate Vercel deployment access tokens.
  - Terminate all active admin sessions via Supabase Auth admin console.
- [ ] **Disable Exploited Vectors:**
  - If a specific customer slug is exploited, toggle `is_active = false` on that profile.
  - If public RPC is abused, revoke execute permissions temporarily (`REVOKE EXECUTE ON FUNCTION public.get_customer_by_slug FROM anon;`).
  - If Storage bucket is compromised, disable public storage policies or set bucket to private.
- [ ] **Preserve Forensic Evidence:** Export snapshots of database logs, storage access logs, and Vercel edge access logs to a secure, write-once location.

### Phase 3: Investigation & Affected-Data Assessment
- [ ] **Determine Data Scope:**
  - Exactly what records were accessed?
  - Identify fields exposed: Public contact info vs. administrative credentials (`admin_users`, password hashes, session JWTs).
  - Determine number of affected Data Principals (customers).
- [ ] **Classify Breach Severity:**
  - **Low:** Inactive profile publicly rendered without contact data; no credentials compromised.
  - **Medium:** Bulk scraping of public contact details via repeated RPC calls.
  - **High:** Admin account compromise, unauthorized deletion or alteration of profiles, or unauthorized storage bucket tampering.
  - **Critical:** Database credential leak, mass exfiltration of private database tables, or infrastructure takeover.

### Phase 4: Statutory Notification & Communications
- [ ] **Legal Counsel Consultation:** Brief qualified Indian legal counsel on the forensic findings before issuing public or regulatory statements.
- [ ] **CERT-In Evaluation:** If the incident is a qualifying cybersecurity attack under the IT Act (e.g., unauthorized server takeover, ransomware), file initial intimation to CERT-In within 6 hours.
- [ ] **DPDP Board Notification:** If personal data was breached, prepare formal intimation to the Data Protection Board of India in accordance with prescribed rules once notified by the Central Government.
- [ ] **Data Principal Notification:** If required by law or necessary to protect customers:
  - Inform affected customers directly via registered email/phone.
  - Provide concise, plain-language description of:
    1. Nature of the incident.
    2. Categories of personal data involved.
    3. Remedial measures implemented by NFCISTA.
    4. Recommended steps for the customer (e.g. reviewing phone spam settings, rotating passwords if applicable).
    5. Designated contact point (`hellonfcista@gmail.com`).

### Phase 5: Remediation & Hardening
- [ ] **Patch Vulnerability:** Implement code fix or RLS policy correction on a dedicated branch (`hotfix/*`).
- [ ] **Run Security Verifications:** Execute `node scripts/verify-admin-crud.js` and test all authorization boundaries.
- [ ] **Deploy & Verify:** Push patched build to Vercel production and verify TLS, headers, and access controls.

### Phase 6: Post-Incident Review & Lessons Learned
- [ ] Conduct blameless root-cause analysis (RCA) within 5 business days.
- [ ] Update documentation, test scripts, and operational procedures.
- [ ] Archive the Incident Record securely for legal compliance audit trails.

---

## 3. Incident Record Template

```markdown
### NFCISTA Incident Record # [INC-YYYY-XXXX]

**Date & Time Noticed (IST):** [YYYY-MM-DD HH:MM]
**Reported By:** [Name / Source / Alert System]
**Incident Lead:** [Lead Engineer / Administrator]
**Current Status:** [Open / Contained / Remediated / Closed]

#### 1. Executive Summary
[Brief high-level summary of what occurred and current operational status]

#### 2. Scope & Affected Data Principals
- Systems Affected: [Next.js / Supabase DB / Supabase Storage / Vercel]
- Data Fields Involved: [Full Name / Phone / WhatsApp / Email / Address / Photos / Admin Credentials]
- Estimated Number of Affected Profiles: [Exact count or estimated range]

#### 3. Chronology of Events (All times in IST)
- **HH:MM:** Initial alert detected.
- **HH:MM:** Triage initiated; incident confirmed.
- **HH:MM:** Containment actions executed (keys rotated / profile deactivated).
- **HH:MM:** Root cause identified.
- **HH:MM:** Vulnerability remediated.

#### 4. Root Cause Analysis
[Technical explanation of the vulnerability or breakdown that enabled the breach]

#### 5. Containment & Remediation Actions Taken
- [Detail credential rotations, policy patches, code commits]

#### 6. Regulatory & User Notifications
- CERT-In reporting required? [Yes / No / Reason]
- DPDP Board notification prepared? [Yes / No / Status]
- Affected Data Principals informed? [Yes / No / Date sent]

#### 7. Corrective & Preventative Actions (CAPA)
1. [Action item 1 - Owner - Target Date]
2. [Action item 2 - Owner - Target Date]
```

---

## 4. Affected Customer Communication Template

```
Subject: [Important] Notice Regarding Your NFCISTA Digital Business Card Data

Dear [Customer Name],

We are writing to provide you with transparent notice regarding a security incident that recently impacted NFCISTA's digital business card platform.

1. What Happened:
On [Date], our security monitoring identified [brief description of incident, e.g., unauthorized access to an administrative interface / unexpected access to profile data].

2. What Data Was Involved:
Our forensic investigation confirmed that the following information associated with your digital business card profile was involved:
- [List specific fields, e.g., Full Name, Public Phone, Email, Profile Link]
Please note that NFCISTA does not collect or store sensitive financial details, payment card numbers, or passwords for customer cardholders.

3. What We Have Done:
Immediately upon detection, our engineering team took the following steps:
- [List containment actions, e.g., revoked compromised access credentials, patched database policies, verified security integrity].
- Implemented enhanced access logging and tightened serverless boundaries.

4. What You Should Do:
Because digital business card profiles are publicly viewable by design, your public contact information was already intended for professional networking. However, as an extra safeguard, we recommend:
- Being vigilant against unsolicited or phishing messages directed to your public contact channels.

5. Contact & Support:
If you have any questions or wish to review, update, or deactivate your digital business card profile, please contact our privacy team directly:
- Email: hellonfcista@gmail.com
- Privacy Portal: https://nfcista.vercel.app/privacy/data-request

Sincerely,
The NFCISTA Team
```
