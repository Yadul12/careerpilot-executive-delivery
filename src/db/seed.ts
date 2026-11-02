import { db } from './index.ts';
import {
  roles,
  users,
  clients,
  clientProfiles,
  clientPrograms,
  teamAssignments,
  jobOpportunities,
  applications,
  hiringManagerContacts,
  outreachActivities,
  interviewRecords,
  tasks,
  deliverables,
  clientReports,
  activityLogs,
} from './schema.ts';
import { count } from 'drizzle-orm';

let isSeeding = false;

export async function ensureSeeded(): Promise<void> {
  if (isSeeding) return;
  try {
    const existingClients = await db.select({ value: count() }).from(clients);
    if ((existingClients[0]?.value ?? 0) >= 12) {
      return;
    }
    isSeeding = true;
    await seedDatabase();
  } catch (error) {
    console.error('Database seed check failed:', error);
    throw new Error('Failed to verify or initialize simulated dataset.', { cause: error });
  } finally {
    isSeeding = false;
  }
}

export async function seedDatabase(): Promise<void> {
  try {
    const existingRoles = await db.select({ value: count() }).from(roles);
    if ((existingRoles[0]?.value ?? 0) > 0) {
      const existingClients = await db.select({ value: count() }).from(clients);
      if ((existingClients[0]?.value ?? 0) >= 12) {
        return;
      }
    }

    // 1. Seed Roles
    const roleData = [
      {
        name: 'Administrator',
        description: 'Full platform governance, team allocation, client onboarding, and executive reporting.',
        permissions: JSON.stringify(['all', 'manage_users', 'manage_clients', 'manage_pipeline', 'manage_outreach', 'manage_interviews', 'export_reports']),
      },
      {
        name: 'Client Delivery Owner',
        description: 'End-to-end ownership of assigned executive clients, deliverables, and interview conversion.',
        permissions: JSON.stringify(['manage_clients', 'manage_pipeline', 'manage_outreach', 'manage_interviews', 'export_reports']),
      },
      {
        name: 'Research Associate',
        description: 'Market mapping, target role sourcing, and hiring-manager contact research.',
        permissions: JSON.stringify(['manage_pipeline', 'manage_outreach']),
      },
      {
        name: 'Client',
        description: 'Executive candidate portal access to review shortlisted roles, approve deliverables, and view weekly progress reports.',
        permissions: JSON.stringify(['view_own_profile', 'approve_roles', 'view_reports']),
      },
    ];

    const insertedRoles = await db
      .insert(roles)
      .values(roleData)
      .onConflictDoNothing()
      .returning();

    const adminRoleId = insertedRoles[0]?.id ?? 1;
    const ownerRoleId = insertedRoles[1]?.id ?? 2;
    const researchRoleId = insertedRoles[2]?.id ?? 3;

    // 2. Seed 5 Internal Team Members (Simulated Advisory Team)
    const teamMembersData = [
      {
        uid: 'sim-team-elena-vance',
        email: 'elena.vance@careerpilot.exec.sim',
        fullName: 'Elena Vance',
        roleId: adminRoleId,
        roleName: 'Administrator',
        designation: 'Managing Director, Executive Delivery',
        department: 'C-Suite & Board Practice',
        avatarInitials: 'EV',
        isActive: true,
        isSimulated: true,
      },
      {
        uid: 'sim-team-marcus-thorne',
        email: 'marcus.thorne@careerpilot.exec.sim',
        fullName: 'Marcus Thorne',
        roleId: ownerRoleId,
        roleName: 'Client Delivery Owner',
        designation: 'Principal Career Strategist',
        department: 'VP & CTO Practice',
        avatarInitials: 'MT',
        isActive: true,
        isSimulated: true,
      },
      {
        uid: 'sim-team-priya-nair',
        email: 'priya.nair@careerpilot.exec.sim',
        fullName: 'Priya Nair',
        roleId: ownerRoleId,
        roleName: 'Client Delivery Owner',
        designation: 'VP, Client Delivery & Advisory',
        department: 'AI & Cloud Leadership Practice',
        avatarInitials: 'PN',
        isActive: true,
        isSimulated: true,
      },
      {
        uid: 'sim-team-julian-brooks',
        email: 'julian.brooks@careerpilot.exec.sim',
        fullName: 'Julian Brooks',
        roleId: researchRoleId,
        roleName: 'Research Associate',
        designation: 'Lead Executive Research Associate',
        department: 'Market Intelligence & Sourcing',
        avatarInitials: 'JB',
        isActive: true,
        isSimulated: true,
      },
      {
        uid: 'sim-team-sofia-chen',
        email: 'sofia.chen@careerpilot.exec.sim',
        fullName: 'Sofia Chen',
        roleId: researchRoleId,
        roleName: 'Research Associate',
        designation: 'Senior Market Intelligence Associate',
        department: 'Hiring Manager Outreach & Mapping',
        avatarInitials: 'SC',
        isActive: true,
        isSimulated: true,
      },
    ];

    const insertedUsers = await db
      .insert(users)
      .values(teamMembersData)
      .onConflictDoNothing()
      .returning();

    const teamIds = insertedUsers.length >= 5
      ? insertedUsers.map((u) => u.id)
      : [1, 2, 3, 4, 5];

    // 3. Seed 12 Executive Clients (Simulated Executive Cohort)
    const executiveClientsSeed = [
      {
        fullName: 'Dr. Aris Thorne',
        email: 'aris.thorne@simulated-exec.io',
        phone: '+1 (415) 890-2311',
        linkedinUrl: 'https://linkedin.com/in/aris-thorne-cto-sim',
        currentDesignation: 'Chief Technology Officer',
        currentEmployer: 'Vanguard Cloud Systems',
        yearsOfExperience: 22,
        location: 'San Francisco, CA',
        status: 'Interviewing',
        onboardingDate: '2026-08-14',
        targetCompMin: 480000,
        targetCompMax: 680000,
        assignedOwnerId: teamIds[0],
        assignedOwnerName: 'Elena Vance',
        spec: 'AI Infrastructure & Distributed Systems',
        leadership: 'Scaled global engineering org from 95 to 420 engineers across 4 continents; led $1.4B enterprise cloud platform transformation and board tech committee governance.',
        competencies: 'LLM Inference Infrastructure, Multi-Region Kubernetes, Zero-Trust Architecture, M&A Technical Due Diligence, P&L Ownership ($180M)',
        targetTitles: 'Chief Technology Officer (CTO), SVP of Engineering, President of Platform Engineering',
        industries: 'Enterprise AI, Cloud Infrastructure, Developer Platforms',
        companies: 'Anthropic, Databricks, Snowflake, CoreWeave, Cloudflare',
        locations: 'San Francisco Bay Area, Seattle, Remote (US)',
        salaryText: '$480k – $680k Base + 1.25%–2.0% Equity',
        objectives: 'Transition into a Series D+ or public AI infrastructure category leader as Chief Technology Officer driving next-generation compute architecture.',
        tier: 'Board & CTO Advisory',
        conversionStage: 'Final Panel Interviews',
        healthStatus: 'On Track',
      },
      {
        fullName: 'Victoria Sterling',
        email: 'victoria.sterling@simulated-exec.io',
        phone: '+1 (212) 644-8910',
        linkedinUrl: 'https://linkedin.com/in/victoria-sterling-vp-sim',
        currentDesignation: 'SVP, Global Platform Engineering',
        currentEmployer: 'Meridian FinTech Corp',
        yearsOfExperience: 19,
        location: 'New York, NY',
        status: 'Offer Stage',
        onboardingDate: '2026-08-03',
        targetCompMin: 450000,
        targetCompMax: 620000,
        assignedOwnerId: teamIds[1],
        assignedOwnerName: 'Marcus Thorne',
        spec: 'FinTech Core Ledger & High-Throughput Payments',
        leadership: 'Directed 310+ engineers processing $95B annual payment volume at 99.999% availability; championed SOC2/PCI-DSS automation.',
        competencies: 'Real-Time Settlement Systems, Rust/Go Microservices, Regulatory Compliance, Global Incident Command, Org Redesign',
        targetTitles: 'CTO, SVP Engineering, Head of Global Infrastructure',
        industries: 'FinTech, Capital Markets Technology, Payment Networks',
        companies: 'Stripe, Adyen, Plaid, Ramp, Block',
        locations: 'New York City, London, Hybrid',
        salaryText: '$450k – $620k Total Target Cash + RSU Package',
        objectives: 'Secure a C-level or SVP Engineering mandate at a global payments or treasury platform preparing for IPO.',
        tier: 'Executive Retainer',
        conversionStage: 'Offer Negotiation',
        healthStatus: 'On Track',
      },
      {
        fullName: 'Rajesh Viswanathan',
        email: 'rajesh.viswanathan@simulated-exec.io',
        phone: '+1 (206) 519-4402',
        linkedinUrl: 'https://linkedin.com/in/rajesh-viswanathan-ciso-sim',
        currentDesignation: 'Chief Information Security Officer (CISO)',
        currentEmployer: 'Aegis Cyber Defense',
        yearsOfExperience: 20,
        location: 'Seattle, WA',
        status: 'Interviewing',
        onboardingDate: '2026-08-22',
        targetCompMin: 420000,
        targetCompMax: 580000,
        assignedOwnerId: teamIds[2],
        assignedOwnerName: 'Priya Nair',
        spec: 'Zero-Trust Cybersecurity & Sovereign Cloud Compliance',
        leadership: 'Built global security operations, product security, and threat intelligence teams of 140 specialists; presented quarterly cyber risk posture to Audit Committee.',
        competencies: 'Zero-Trust Identity, FedRAMP High Authorization, AI Model Governance, DevSecOps, Incident Response Strategy',
        targetTitles: 'Chief Information Security Officer (CISO), SVP of Trust & Security, VP Cyber Engineering',
        industries: 'Cybersecurity, Cloud Native SaaS, Defense Tech',
        companies: 'CrowdStrike, Palo Alto Networks, Zscaler, Datadog, Palantir',
        locations: 'Seattle, San Francisco, Austin, Remote',
        salaryText: '$420k – $580k Base + Performance Equity',
        objectives: 'Lead enterprise trust, product security, and federal compliance at a high-growth cloud or AI security leader.',
        tier: 'Board & CTO Advisory',
        conversionStage: 'Hiring Manager Interviews',
        healthStatus: 'On Track',
      },
      {
        fullName: 'Camille Laurent',
        email: 'camille.laurent@simulated-exec.io',
        phone: '+1 (650) 402-7731',
        linkedinUrl: 'https://linkedin.com/in/camille-laurent-cpo-sim',
        currentDesignation: 'VP of Product & AI Experiences',
        currentEmployer: 'Lumina Collaborative SaaS',
        yearsOfExperience: 16,
        location: 'Palo Alto, CA',
        status: 'Active',
        onboardingDate: '2026-09-05',
        targetCompMin: 390000,
        targetCompMax: 540000,
        assignedOwnerId: teamIds[0],
        assignedOwnerName: 'Elena Vance',
        spec: 'Agentic AI Product Strategy & PLG Enterprise SaaS',
        leadership: 'Grew ARR from $42M to $215M across PLG and enterprise motions; managed 65 PMs, product designers, and AI researchers.',
        competencies: 'Generative AI Workflows, Product-Led Growth, Enterprise Pricing & Packaging, Design Systems, Executive Storytelling',
        targetTitles: 'Chief Product Officer (CPO), SVP of Product, VP Product Management',
        industries: 'B2B SaaS, Productivity Platforms, Applied AI',
        companies: 'Figma, Notion, Linear, Vercel, Atlassian',
        locations: 'San Francisco Bay Area, New York, Remote',
        salaryText: '$390k – $540k Base + Equity',
        objectives: 'Step into a Chief Product Officer role owning multi-product roadmap and AI monetization.',
        tier: 'Executive Retainer',
        conversionStage: 'Active Pipeline',
        healthStatus: 'On Track',
      },
      {
        fullName: 'kenji Takahashi',
        email: 'kenji.takahashi@simulated-exec.io',
        phone: '+1 (512) 782-9914',
        linkedinUrl: 'https://linkedin.com/in/kenji-takahashi-vp-sim',
        currentDesignation: 'VP of Data & Machine Learning Engineering',
        currentEmployer: 'Hyperion Analytics',
        yearsOfExperience: 18,
        location: 'Austin, TX',
        status: 'Interviewing',
        onboardingDate: '2026-09-10',
        targetCompMin: 380000,
        targetCompMax: 520000,
        assignedOwnerId: teamIds[2],
        assignedOwnerName: 'Priya Nair',
        spec: 'Lakehouse Data Architecture & Real-Time ML Feature Stores',
        leadership: 'Architected petabyte-scale streaming analytics serving 18M enterprise users; led 160 data engineers and ML scientists.',
        competencies: 'Apache Iceberg, Spark, Kafka, Feature Platforms, MLOps Governance, FinOps Cloud Optimization',
        targetTitles: 'Chief Data & AI Officer (CDAO), VP Data Engineering, SVP AI Platform',
        industries: 'Data Infrastructure, Streaming Analytics, Autonomous Systems',
        companies: 'Confluent, Databricks, Snowflake, Scale AI, Samsara',
        locations: 'Austin, San Francisco, Seattle, Remote',
        salaryText: '$380k – $520k Base + RSU Grant',
        objectives: 'Drive unified data and AI platform engineering for a late-stage enterprise data company.',
        tier: 'Executive Retainer',
        conversionStage: 'Technical Panel Stage',
        healthStatus: 'On Track',
      },
      {
        fullName: 'Hannah Lindqvist',
        email: 'hannah.lindqvist@simulated-exec.io',
        phone: '+1 (617) 339-8210',
        linkedinUrl: 'https://linkedin.com/in/hannah-lindqvist-cto-sim',
        currentDesignation: 'Chief Digital & Technology Officer',
        currentEmployer: 'BioVantage Genomics',
        yearsOfExperience: 21,
        location: 'Boston, MA',
        status: 'Active',
        onboardingDate: '2026-09-18',
        targetCompMin: 430000,
        targetCompMax: 590000,
        assignedOwnerId: teamIds[1],
        assignedOwnerName: 'Marcus Thorne',
        spec: 'Computational Biology Cloud & Regulated HealthTech',
        leadership: 'Led 240 engineers and bioinformaticians across HIPAA/FDA-regulated software pipelines; delivered 3x faster clinical trial data synthesis.',
        competencies: 'Computational Genomics, High-Performance Computing (HPC), HIPAA/GxP Compliance, AI Drug Discovery Platforms',
        targetTitles: 'CTO, SVP Digital & AI Platform, Chief Information Officer (CIO)',
        industries: 'HealthTech, Biotech AI, Life Sciences SaaS',
        companies: 'Veeva Systems, Benchling, Tempus AI, Recursion, Illumina',
        locations: 'Boston/Cambridge, New York, Remote',
        salaryText: '$430k – $590k Base + Executive Bonus',
        objectives: 'Partner with a mission-driven biotech or clinical AI organization as CTO.',
        tier: 'Board & CTO Advisory',
        conversionStage: 'Outreach & Warm Intros',
        healthStatus: 'At Risk',
      },
      {
        fullName: 'Devon Brooks-Alvarez',
        email: 'devon.alvarez@simulated-exec.io',
        phone: '+1 (303) 912-4088',
        linkedinUrl: 'https://linkedin.com/in/devon-alvarez-vp-sim',
        currentDesignation: 'VP of Infrastructure & Site Reliability',
        currentEmployer: 'StratusEdge Networks',
        yearsOfExperience: 17,
        location: 'Denver, CO',
        status: 'Active',
        onboardingDate: '2026-09-25',
        targetCompMin: 350000,
        targetCompMax: 470000,
        assignedOwnerId: teamIds[0],
        assignedOwnerName: 'Elena Vance',
        spec: 'Global Edge Compute, Bare-Metal GPU Clusters & SRE',
        leadership: 'Managed $85M cloud and colocation CapEx/OpEx budget; reduced global p99 latency by 44% across 180 edge POPs.',
        competencies: 'GPU Cluster Orchestration, BGP/Edge Networking, Chaos Engineering, FinOps, Terraform/Crossplane',
        targetTitles: 'VP of Infrastructure, SVP Cloud Operations, Head of Core Compute',
        industries: 'Edge Cloud, AI Compute, Content Delivery',
        companies: 'Cloudflare, Fastly, CoreWeave, DigitalOcean, Akamai',
        locations: 'Denver, Remote, San Francisco',
        salaryText: '$350k – $470k Base + Equity',
        objectives: 'Lead global infrastructure and GPU fleet reliability for an AI-native cloud provider.',
        tier: 'VP Fast-Track',
        conversionStage: 'Active Pipeline',
        healthStatus: 'On Track',
      },
      {
        fullName: 'Nadia Al-Mansoor',
        email: 'nadia.almansoor@simulated-exec.io',
        phone: '+1 (312) 701-5529',
        linkedinUrl: 'https://linkedin.com/in/nadia-almansoor-cio-sim',
        currentDesignation: 'Global Chief Information Officer (CIO)',
        currentEmployer: 'OmniLogix Supply Chain',
        yearsOfExperience: 24,
        location: 'Chicago, IL',
        status: 'Interviewing',
        onboardingDate: '2026-08-29',
        targetCompMin: 460000,
        targetCompMax: 640000,
        assignedOwnerId: teamIds[1],
        assignedOwnerName: 'Marcus Thorne',
        spec: 'Enterprise ERP Modernization, Supply Chain AI & Global IT',
        leadership: 'Oversaw 500+ global IT and digital engineering staff across 28 countries; delivered $62M annual productivity savings through AI automation.',
        competencies: 'Enterprise Architecture, Global Shared Services, Autonomous Supply Chain, Vendor Consolidation, Board Advisory',
        targetTitles: 'Chief Information Officer (CIO), Chief Digital Officer (CDO), SVP Enterprise Technology',
        industries: 'Industrial Tech, Autonomous Logistics, Enterprise SaaS',
        companies: 'ServiceNow, Samsara, Flexport, Honeywell, Procore',
        locations: 'Chicago, New York, Dallas, Hybrid',
        salaryText: '$460k – $640k Base + LTIP',
        objectives: 'Assume a Fortune 500 or late-stage category-defining CIO role leading AI-first enterprise transformation.',
        tier: 'Board & CTO Advisory',
        conversionStage: 'CEO / Board Final',
        healthStatus: 'On Track',
      },
      {
        fullName: 'Lucas Meyer-Holden',
        email: 'lucas.holden@simulated-exec.io',
        phone: '+1 (404) 618-3321',
        linkedinUrl: 'https://linkedin.com/in/lucas-holden-vp-sim',
        currentDesignation: 'VP of Engineering, Developer Experience',
        currentEmployer: 'ForgeDev Cloud',
        yearsOfExperience: 15,
        location: 'Atlanta, GA',
        status: 'Active',
        onboardingDate: '2026-10-02',
        targetCompMin: 340000,
        targetCompMax: 460000,
        assignedOwnerId: teamIds[2],
        assignedOwnerName: 'Priya Nair',
        spec: 'Internal Developer Platforms (IDP), CI/CD & Code Intelligence',
        leadership: 'Built developer velocity organization of 115 engineers; improved deployment frequency 6x for 3,500 internal developers.',
        competencies: 'Developer Portals, Bazel/Monorepo Tooling, AI Coding Assistants, Platform Engineering, Open Source Strategy',
        targetTitles: 'VP of Engineering, Head of Developer Platform, Deputy CTO',
        industries: 'Developer Tools, Cloud Platforms, Enterprise SaaS',
        companies: 'GitHub, GitLab, Vercel, HashiCorp, Harness',
        locations: 'Atlanta, Remote, New York',
        salaryText: '$340k – $460k Base + Equity',
        objectives: 'Lead engineering for a developer-first platform or AI code generation company.',
        tier: 'VP Fast-Track',
        conversionStage: 'Active Pipeline',
        healthStatus: 'Needs Attention',
      },
      {
        fullName: 'Soraiaendes Silva',
        email: 'soraia.silva@simulated-exec.io',
        phone: '+1 (305) 844-1920',
        linkedinUrl: 'https://linkedin.com/in/soraia-silva-vp-sim',
        currentDesignation: 'SVP of Customer Engineering & Solutions Architecture',
        currentEmployer: 'CloudScale Data',
        yearsOfExperience: 18,
        location: 'Miami, FL',
        status: 'Active',
        onboardingDate: '2026-10-08',
        targetCompMin: 370000,
        targetCompMax: 510000,
        assignedOwnerId: teamIds[0],
        assignedOwnerName: 'Elena Vance',
        spec: 'Global Pre-Sales Engineering, Field CTO & Enterprise Value Realization',
        leadership: 'Built 190-person global solutions architecture and field CTO organization supporting $680M in enterprise net-new ARR.',
        competencies: 'Field CTO Strategy, Technical Win-Rate Optimization, Executive Briefing Centers, Strategic Alliances (AWS/GCP/Azure)',
        targetTitles: 'Field CTO, SVP Solutions Engineering, Chief Customer Officer (CCO)',
        industries: 'Cloud Data, AI Enterprise Software, Cybersecurity',
        companies: 'Snowflake, Datadog, MongoDB, Elastic, Rubrik',
        locations: 'Miami, New York, Remote (Americas/EMEA)',
        salaryText: '$370k – $510k OTE + Equity',
        objectives: 'Serve as Global Field CTO or SVP of Customer Engineering scaling $500M–$1B+ revenue motion.',
        tier: 'Executive Retainer',
        conversionStage: 'Active Pipeline',
        healthStatus: 'On Track',
      },
      {
        fullName: 'Gideon Vance-Kerr',
        email: 'gideon.kerr@simulated-exec.io',
        phone: '+1 (310) 529-6104',
        linkedinUrl: 'https://linkedin.com/in/gideon-kerr-cto-sim',
        currentDesignation: 'Chief Architect & VP of Autonomous Systems',
        currentEmployer: 'AeroPulse Robotics',
        yearsOfExperience: 19,
        location: 'Los Angeles, CA',
        status: 'Onboarding',
        onboardingDate: '2026-10-20',
        targetCompMin: 410000,
        targetCompMax: 560000,
        assignedOwnerId: teamIds[1],
        assignedOwnerName: 'Marcus Thorne',
        spec: 'Embodied AI, Robotics Perception & Edge Embedded Software',
        leadership: 'Led 150 robotics, perception, and firmware engineers; deployed 12,000 autonomous fleet units across industrial warehouses.',
        competencies: 'C++/CUDA Real-Time Perception, Sensor Fusion, ROS2, Fleet Telemetry, Hardware-in-the-Loop Simulation',
        targetTitles: 'CTO, VP of Autonomy Engineering, SVP Robotics Software',
        industries: 'Robotics, Physical AI, Autonomous Mobility, Defense Tech',
        companies: 'Anduril, Samsara, Figure AI, Rivian, Shield AI',
        locations: 'Los Angeles, San Francisco, Austin',
        salaryText: '$410k – $560k Base + Equity',
        objectives: 'Lead autonomy and embodied AI engineering as CTO or SVP at a physical AI category leader.',
        tier: 'Board & CTO Advisory',
        conversionStage: 'Onboarding & Positioning',
        healthStatus: 'On Track',
      },
      {
        fullName: 'Meera Subramanian',
        email: 'meera.subramanian@simulated-exec.io',
        phone: '+1 (408) 773-2940',
        linkedinUrl: 'https://linkedin.com/in/meera-subramanian-vp-sim',
        currentDesignation: 'VP of Engineering, Core FinTech & Workforce Systems',
        currentEmployer: 'PaySphere Global',
        yearsOfExperience: 16,
        location: 'San Jose, CA',
        status: 'Onboarding',
        onboardingDate: '2026-10-25',
        targetCompMin: 360000,
        targetCompMax: 490000,
        assignedOwnerId: teamIds[2],
        assignedOwnerName: 'Priya Nair',
        spec: 'Global Payroll Engines, Multi-Country Compliance & B2B SaaS',
        leadership: 'Scaled 135 engineers across US, UK, and India; launched automated multi-currency treasury and payroll products in 42 countries.',
        competencies: 'Distributed Ledger Systems, Global Tax/Payroll Engines, Multi-Product Architecture, High-Velocity Execution',
        targetTitles: 'VP of Engineering, SVP Product Engineering, CTO',
        industries: 'HRTech, FinTech, Global Workforce SaaS',
        companies: 'Rippling, Gusto, Deel, Brex, Intuit',
        locations: 'San Francisco Bay Area, Remote',
        salaryText: '$360k – $490k Base + Equity',
        objectives: 'Secure a VP/SVP Engineering leadership role driving multi-product compound SaaS architecture.',
        tier: 'Executive Retainer',
        conversionStage: 'Onboarding & Positioning',
        healthStatus: 'On Track',
      },
    ];

    const insertedClients = await db
      .insert(clients)
      .values(
        executiveClientsSeed.map((c) => ({
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          linkedinUrl: c.linkedinUrl,
          currentDesignation: c.currentDesignation,
          currentEmployer: c.currentEmployer,
          yearsOfExperience: c.yearsOfExperience,
          location: c.location,
          status: c.status,
          onboardingDate: c.onboardingDate,
          targetCompMin: c.targetCompMin,
          targetCompMax: c.targetCompMax,
          assignedOwnerId: c.assignedOwnerId,
          assignedOwnerName: c.assignedOwnerName,
          isSimulated: true,
        }))
      )
      .returning();

    const clientIds = insertedClients.map((c) => c.id);

    // 4. Seed Client Profiles, Client Programs & Team Assignments
    const profilesToInsert = executiveClientsSeed.map((c, idx) => ({
      clientId: clientIds[idx],
      technologySpecialisation: c.spec,
      leadershipExperience: c.leadership,
      coreCompetencies: c.competencies,
      targetJobTitles: c.targetTitles,
      preferredIndustries: c.industries,
      targetCompanies: c.companies,
      preferredLocations: c.locations,
      salaryExpectations: c.salaryText,
      careerObjectives: c.objectives,
      resumeFilename: `${c.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_executive_cv_2026.pdf`,
      resumeFileType: 'application/pdf',
      resumeFileSize: 428500 + idx * 14200,
      resumeUploadedAt: new Date('2026-10-15T10:00:00Z'),
      resumeSummary: `[SIMULATED DOSSIER] Board-ready executive dossier for ${c.fullName} (${c.currentDesignation} at ${c.currentEmployer}, ${c.yearsOfExperience} yrs exp). Verified impact across ${c.spec}.`,
    }));

    await db.insert(clientProfiles).values(profilesToInsert).onConflictDoNothing();

    const programsToInsert = executiveClientsSeed.map((c, idx) => ({
      clientId: clientIds[idx],
      programName: `${c.tier} — Q3/Q4 2026 Executive Campaign`,
      tier: c.tier,
      startDate: c.onboardingDate,
      targetEndDate: '2027-02-28',
      status: 'Active',
      weeklyApplicationTarget: 8,
      weeklyOutreachTarget: 12,
      conversionStage: c.conversionStage,
      healthStatus: c.healthStatus,
    }));

    await db.insert(clientPrograms).values(programsToInsert);

    const assignmentsToInsert = [];
    for (let idx = 0; idx < clientIds.length; idx++) {
      const cId = clientIds[idx];
      const ownerId = executiveClientsSeed[idx].assignedOwnerId;
      const researcherId = idx % 2 === 0 ? teamIds[3] : teamIds[4];
      assignmentsToInsert.push(
        {
          clientId: cId,
          userId: ownerId,
          assignmentRole: 'Client Delivery Owner',
          allocationPct: 30,
        },
        {
          clientId: cId,
          userId: researcherId,
          assignmentRole: 'Research Associate',
          allocationPct: 25,
        }
      );
    }
    await db.insert(teamAssignments).values(assignmentsToInsert);

    // 5. Seed 50 Job Opportunities across all 8 statuses
    const companiesCatalog = [
      { company: 'Anthropic', role: 'VP of Inference Infrastructure', spec: 'AI Infrastructure & Distributed Systems', min: 500000, max: 720000, loc: 'San Francisco, CA', mode: 'Hybrid' },
      { company: 'Databricks', role: 'SVP of Platform Engineering', spec: 'Lakehouse Data Architecture & Real-Time ML Feature Stores', min: 480000, max: 660000, loc: 'San Francisco, CA', mode: 'Hybrid' },
      { company: 'Stripe', role: 'Chief Technology Officer, Global Treasury', spec: 'FinTech Core Ledger & High-Throughput Payments', min: 520000, max: 750000, loc: 'New York, NY', mode: 'Hybrid' },
      { company: 'CrowdStrike', role: 'Deputy CISO & VP Cloud Security', spec: 'Zero-Trust Cybersecurity & Sovereign Cloud Compliance', min: 440000, max: 600000, loc: 'Seattle, WA', mode: 'Remote' },
      { company: 'Figma', role: 'Chief Product Officer, Enterprise & AI', spec: 'Agentic AI Product Strategy & PLG Enterprise SaaS', min: 450000, max: 630000, loc: 'San Francisco, CA', mode: 'Hybrid' },
      { company: 'Snowflake', role: 'VP of AI Data Cloud Engineering', spec: 'Lakehouse Data Architecture & Real-Time ML Feature Stores', min: 430000, max: 590000, loc: 'Bellevue, WA', mode: 'Hybrid' },
      { company: 'CoreWeave', role: 'SVP of Global GPU Infrastructure', spec: 'Global Edge Compute, Bare-Metal GPU Clusters & SRE', min: 460000, max: 650000, loc: 'New York, NY', mode: 'Hybrid' },
      { company: 'ServiceNow', role: 'Global CIO & SVP Enterprise Transformation', spec: 'Enterprise ERP Modernization, Supply Chain AI & Global IT', min: 470000, max: 660000, loc: 'Chicago, IL', mode: 'Hybrid' },
      { company: 'Vercel', role: 'VP of Developer Experience & Build Platform', spec: 'Internal Developer Platforms (IDP), CI/CD & Code Intelligence', min: 380000, max: 520000, loc: 'San Francisco, CA', mode: 'Remote' },
      { company: 'Datadog', role: 'Global Field CTO & SVP Solutions', spec: 'Global Pre-Sales Engineering, Field CTO & Enterprise Value Realization', min: 410000, max: 560000, loc: 'Miami, FL', mode: 'Remote' },
      { company: 'Anduril Industries', role: 'VP of Autonomous Perception Systems', spec: 'Embodied AI, Robotics Perception & Edge Embedded Software', min: 450000, max: 620000, loc: 'Costa Mesa, CA', mode: 'On-site' },
      { company: 'Rippling', role: 'VP of Engineering, Global Payroll & FinTech', spec: 'Global Payroll Engines, Multi-Country Compliance & B2B SaaS', min: 400000, max: 560000, loc: 'San Francisco, CA', mode: 'Hybrid' },
      { company: 'Cloudflare', role: 'SVP of Core Network & Edge Compute', spec: 'AI Infrastructure & Distributed Systems', min: 460000, max: 640000, loc: 'Austin, TX', mode: 'Hybrid' },
      { company: 'Adyen', role: 'SVP of North America Engineering', spec: 'FinTech Core Ledger & High-Throughput Payments', min: 440000, max: 610000, loc: 'New York, NY', mode: 'Hybrid' },
      { company: 'Palo Alto Networks', role: 'VP of AI Security & Threat Intelligence', spec: 'Zero-Trust Cybersecurity & Sovereign Cloud Compliance', min: 420000, max: 580000, loc: 'Santa Clara, CA', mode: 'Hybrid' },
      { company: 'Linear', role: 'Head of Product & Design Engineering', spec: 'Agentic AI Product Strategy & PLG Enterprise SaaS', min: 390000, max: 530000, loc: 'San Francisco, CA', mode: 'Remote' },
      { company: 'Confluent', role: 'VP of Cloud Streaming Engine', spec: 'Lakehouse Data Architecture & Real-Time ML Feature Stores', min: 400000, max: 550000, loc: 'Mountain View, CA', mode: 'Remote' },
      { company: 'Benchling', role: 'Chief Technology Officer (CTO)', spec: 'Computational Biology Cloud & Regulated HealthTech', min: 450000, max: 610000, loc: 'Boston, MA', mode: 'Hybrid' },
      { company: 'Fastly', role: 'VP of Global Infrastructure & Reliability', spec: 'Global Edge Compute, Bare-Metal GPU Clusters & SRE', min: 370000, max: 490000, loc: 'Denver, CO', mode: 'Remote' },
      { company: 'Samsara', role: 'Chief Information Officer (CIO)', spec: 'Enterprise ERP Modernization, Supply Chain AI & Global IT', min: 450000, max: 620000, loc: 'San Francisco, CA', mode: 'Hybrid' },
      { company: 'GitLab', role: 'VP of Engineering, AI DevSecOps', spec: 'Internal Developer Platforms (IDP), CI/CD & Code Intelligence', min: 370000, max: 500000, loc: 'Remote', mode: 'Remote' },
      { company: 'MongoDB', role: 'SVP of Worldwide Customer Engineering', spec: 'Global Pre-Sales Engineering, Field CTO & Enterprise Value Realization', min: 400000, max: 540000, loc: 'New York, NY', mode: 'Hybrid' },
      { company: 'Shield AI', role: 'SVP of Autonomy & Edge AI', spec: 'Embodied AI, Robotics Perception & Edge Embedded Software', min: 430000, max: 590000, loc: 'San Diego, CA', mode: 'On-site' },
      { company: 'Gusto', role: 'VP of Engineering, Embedded Payroll', spec: 'Global Payroll Engines, Multi-Country Compliance & B2B SaaS', min: 380000, max: 510000, loc: 'San Francisco, CA', mode: 'Hybrid' },
      { company: 'Scale AI', role: 'Chief Technology Officer, Enterprise GenAI', spec: 'AI Infrastructure & Distributed Systems', min: 510000, max: 710000, loc: 'San Francisco, CA', mode: 'On-site' },
    ];

    const pipelineStatuses = [
      'Identified',
      'Shortlisted',
      'Approved',
      'Applied',
      'Recruiter Contacted',
      'Interview Scheduled',
      'Rejected',
      'Offer Received',
    ];

    const opportunitiesToInsert = [];
    for (let i = 0; i < 50; i++) {
      const cat = companiesCatalog[i % companiesCatalog.length];
      const clientIdx = i % clientIds.length;
      const status =
        i === 1 || i === 26
          ? 'Offer Received'
          : i % 8 === 5 || i % 7 === 0
          ? 'Interview Scheduled'
          : pipelineStatuses[i % pipelineStatuses.length];

      const roleVariant = i >= 25 ? `${cat.role} (Division II)` : cat.role;
      opportunitiesToInsert.push({
        clientId: clientIds[clientIdx],
        company: cat.company,
        designation: roleVariant,
        technologySpecialisation: cat.spec,
        salaryRange: `$${Math.round(cat.min / 1000)}k – $${Math.round(cat.max / 1000)}k + Equity`,
        salaryMin: cat.min,
        salaryMax: cat.max,
        location: cat.loc,
        workMode: cat.mode,
        jobDescription: `[SIMULATED ROLE BRIEF] Mandate for ${roleVariant} at ${cat.company}. Lead 150–350+ engineers, partner with CEO/Board on 3-year technical architecture, and scale enterprise reliability & AI roadmap.`,
        sourceUrl: `https://careers.${cat.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.sim/exec/${1000 + i}`,
        fitScore: 84 + (i % 15),
        status,
        createdById: teamIds[3 + (i % 2)],
      });
    }

    const insertedOpportunities = await db
      .insert(jobOpportunities)
      .values(opportunitiesToInsert)
      .returning();

    const oppIds = insertedOpportunities.map((o) => o.id);

    // 6. Seed 100 Application Records across realistic weeks and months
    const weeks = [
      { week: '2026-W37', month: '2026-09', date: '2026-09-10' },
      { week: '2026-W38', month: '2026-09', date: '2026-09-17' },
      { week: '2026-W39', month: '2026-09', date: '2026-09-24' },
      { week: '2026-W40', month: '2026-10', date: '2026-10-01' },
      { week: '2026-W41', month: '2026-10', date: '2026-10-08' },
      { week: '2026-W42', month: '2026-10', date: '2026-10-15' },
      { week: '2026-W43', month: '2026-10', date: '2026-10-22' },
      { week: '2026-W44', month: '2026-10', date: '2026-10-29' },
    ];

    const appStatuses = [
      'Identified',
      'Shortlisted',
      'Approved',
      'Applied',
      'Applied',
      'Recruiter Contacted',
      'Interview Scheduled',
      'Rejected',
      'Offer Received',
    ];

    const applicationsToInsert = [];
    for (let i = 0; i < 100; i++) {
      const oppIdx = i % oppIds.length;
      const opp = insertedOpportunities[oppIdx];
      const w = weeks[i % weeks.length];
      const status =
        i < 50
          ? opp.status
          : i % 14 === 0
          ? 'Offer Received'
          : i % 5 === 0
          ? 'Interview Scheduled'
          : appStatuses[i % appStatuses.length];

      const stageHistory = [
        { stage: 'Identified', date: '2026-09-05', note: 'Sourced by Research Associate' },
        { stage: 'Shortlisted', date: '2026-09-08', note: 'Fit score verified > 85%' },
        { stage: status, date: w.date, note: `Progressed to ${status}` },
      ];

      applicationsToInsert.push({
        opportunityId: opp.id,
        clientId: opp.clientId,
        status,
        appliedDate: w.date,
        weekBucket: w.week,
        monthBucket: w.month,
        resumeVersion: `v3.${(i % 4) + 1} — ${opp.company} Tailored Executive Brief`,
        coverLetterSent: i % 3 !== 0,
        rejectionReason: status === 'Rejected' ? 'Position filled internally / Board paused search' : null,
        offerDetails: status === 'Offer Received' ? '$540,000 Base + 35% Bonus + $1.8M RSU (4-yr vest)' : null,
        notes: `[SIMULATED APPLICATION #${i + 1}] Executive submission package aligned to ${opp.company} board priorities.`,
        stageHistory: JSON.stringify(stageHistory),
      });
    }

    const insertedApplications = await db
      .insert(applications)
      .values(applicationsToInsert)
      .returning();

    // 7. Seed 60 Hiring Manager Contacts & 60 Outreach Activities
    const hmFirstNames = ['Marcus', 'Evelyn', 'Sanjay', 'Claire', 'Dietrich', 'Aisha', 'Henrik', 'keiko', 'Tariq', 'Lauren', 'Vikram', 'celine'];
    const hmLastNames = ['Sterling', 'lin', 'Patel', 'Mercer', 'Hoffmann', 'Okafor', 'Lindholm', 'Tanaka', 'Haddad', 'Callahan', 'Rao', 'Dubois'];
    const hmTitles = [
      'Chief Executive Officer',
      'Managing Partner, Executive Talent',
      'Chief Operating Officer',
      'Board Director & Audit Chair',
      'Founder & President',
      'Chief People & Talent Officer',
    ];

    const contactsToInsert = [];
    for (let i = 0; i < 60; i++) {
      const opp = insertedOpportunities[i % insertedOpportunities.length];
      const fname = hmFirstNames[i % hmFirstNames.length];
      const lname = hmLastNames[(i * 3) % hmLastNames.length];
      const warmthOptions = ['Champion', 'Referred', 'Warm', 'Cold'];
      contactsToInsert.push({
        name: `${fname} ${lname}`,
        title: hmTitles[i % hmTitles.length],
        company: opp.company,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}.${i}@${opp.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.sim`,
        linkedinUrl: `https://linkedin.com/in/${fname.toLowerCase()}-${lname.toLowerCase()}-${100 + i}-sim`,
        phone: `+1 (415) 555-${String(1000 + i).slice(-4)}`,
        opportunityId: opp.id,
        clientId: opp.clientId,
        relationshipWarmth: warmthOptions[i % warmthOptions.length],
      });
    }

    const insertedContacts = await db
      .insert(hiringManagerContacts)
      .values(contactsToInsert)
      .returning();

    const outreachChannels = ['Warm Intro', 'Direct Email', 'LinkedIn InMail', 'Executive Recruiter'];
    const outreachStatuses = ['Meeting Booked', 'Referral Secured', 'Replied', 'Follow-Up Due', 'Opened', 'Sent'];
    const outreachOutcomes = [
      'Intro Call Scheduled',
      'Referred to Hiring Panel',
      'Positive Reply — Dossier Requested',
      'Awaiting Response',
      'Follow-Up Sequence Active',
      'Polite Pass',
    ];

    const outreachToInsert = [];
    for (let i = 0; i < 60; i++) {
      const contact = insertedContacts[i];
      const status = outreachStatuses[i % outreachStatuses.length];
      const replied = status === 'Meeting Booked' || status === 'Referral Secured' || status === 'Replied';
      const sentDay = String(1 + (i % 26)).padStart(2, '0');
      const nextDay = String(Math.min(28, 4 + (i % 24))).padStart(2, '0');

      outreachToInsert.push({
        contactId: contact.id,
        clientId: contact.clientId!,
        opportunityId: contact.opportunityId,
        channel: outreachChannels[i % outreachChannels.length],
        messageSubject: `Confidential: Executive Leadership Alignment — ${contact.company}`,
        messageSnippet: `[SIMULATED OUTREACH] Sharing our client's 90-day architectural thesis and board dossier regarding the leadership mandate at ${contact.company}.`,
        sentDate: `2026-10-${sentDay}`,
        status,
        replyReceived: replied,
        replyDate: replied ? `2026-10-${nextDay}` : null,
        followUpCount: (i % 3) + 1,
        nextAction: replied
          ? 'Send Executive Briefing Dossier & confirm 30-min chemistry call'
          : 'Send Follow-Up #2 with Architectural Case Study',
        nextActionDate: `2026-11-${String(3 + (i % 12)).padStart(2, '0')}`,
        outcome: outreachOutcomes[i % outreachOutcomes.length],
        ownerId: teamIds[i % teamIds.length],
      });
    }

    await db.insert(outreachActivities).values(outreachToInsert);

    // 8. Seed 30 Interview Records
    const interviewStages = [
      'Executive Recruiter Screen',
      'Hiring Manager Deep-Dive',
      'Architecture & Strategy Panel',
      'CEO / Board Final',
      'Compensation & Offer',
    ];
    const prepStatuses = ['Debrief Complete', 'Mock Completed', 'Dossier Ready', 'Pending Prep'];
    const interviewOutcomes = ['Advanced to Next Round', 'Offer Extended', 'Scheduled', 'Advanced to Next Round', 'Scheduled'];

    const interviewsToInsert = [];
    for (let i = 0; i < 30; i++) {
      const app = insertedApplications[i % insertedApplications.length];
      const opp = insertedOpportunities[i % insertedOpportunities.length];
      const contact = insertedContacts[i % insertedContacts.length];
      const round = (i % 5) + 1;
      const day = String(1 + (i % 25)).padStart(2, '0');
      const month = i < 18 ? '10' : '11';

      interviewsToInsert.push({
        applicationId: app.id,
        opportunityId: opp.id,
        clientId: opp.clientId,
        company: opp.company,
        roleTitle: opp.designation,
        stageName: interviewStages[i % interviewStages.length],
        roundNumber: round,
        scheduledAt: `2026-${month}-${day} ${10 + (i % 6)}:00`,
        interviewerName: contact.name,
        interviewerTitle: contact.title,
        prepStatus: prepStatuses[i % prepStatuses.length],
        prepNotes: `Prepared 90-day strategic roadmap, board governance talking points, and ${opp.company} competitive moat analysis.`,
        feedback:
          i < 18
            ? 'Strong executive presence; panel praised clarity on global distributed engineering scale and AI cost governance.'
            : 'Upcoming session — briefing packet shared 48h prior.',
        outcome: i === 1 || i === 14 ? 'Offer Extended' : interviewOutcomes[i % interviewOutcomes.length],
      });
    }

    await db.insert(interviewRecords).values(interviewsToInsert);

    // 9. Seed Tasks & Deliverables (including Overdue items and Pending Approvals)
    const tasksToInsert = [
      {
        clientId: clientIds[0],
        assignedToId: teamIds[0],
        assignedToName: 'Elena Vance',
        title: 'Finalize Anthropic Board Panel Briefing Dossier',
        description: 'Compile 10-page architectural thesis and reference backchannel summary before CEO final round.',
        category: 'Interview Prep',
        priority: 'Critical',
        status: 'Overdue',
        dueDate: '2026-10-28',
        internalNotes: 'Waiting on 2nd board reference confirmation from former Sequoia partner.',
      },
      {
        clientId: clientIds[1],
        assignedToId: teamIds[1],
        assignedToName: 'Marcus Thorne',
        title: 'Model Stripe Equity & Severance Protection Term Sheet',
        description: 'Benchmark RSU refreshers, change-in-control acceleration, and sign-on bonus bridge.',
        category: 'Interview Prep',
        priority: 'Critical',
        status: 'In Progress',
        dueDate: '2026-11-04',
        internalNotes: 'Compensation committee call scheduled for Thursday.',
      },
      {
        clientId: clientIds[2],
        assignedToId: teamIds[2],
        assignedToName: 'Priya Nair',
        title: 'Audit CrowdStrike FedRAMP Case Study Metrics',
        description: 'Quantify zero-trust posture improvements for CISO panel presentation.',
        category: 'Branding',
        priority: 'High',
        status: 'Awaiting Client',
        dueDate: '2026-11-03',
        internalNotes: 'Draft sent to Rajesh for final sign-off.',
      },
      {
        clientId: clientIds[3],
        assignedToId: teamIds[3],
        assignedToName: 'Julian Brooks',
        title: 'Map 15 Series C/D Applied AI CPO Opportunities',
        description: 'Identify Sequoia, a16z, and Index portfolio companies hiring Chief Product Officers.',
        category: 'Pipeline Operations',
        priority: 'High',
        status: 'Completed',
        dueDate: '2026-10-25',
        completedAt: '2026-10-24',
        internalNotes: 'Delivered 18 vetted roles; 11 approved by Camille.',
      },
      {
        clientId: clientIds[5],
        assignedToId: teamIds[1],
        assignedToName: 'Marcus Thorne',
        title: 'Re-align Biotech CTO Target List & Warm VC Intros',
        description: 'Expand target outreach to Flagship Pioneering and ARCH Venture portfolio CEOs.',
        category: 'Outreach',
        priority: 'Critical',
        status: 'Overdue',
        dueDate: '2026-10-27',
        internalNotes: 'Client requested heavier focus on Boston/Cambridge hybrid roles.',
      },
      {
        clientId: clientIds[8],
        assignedToId: teamIds[4],
        assignedToName: 'Sofia Chen',
        title: 'Execute Wave 3 Hiring Manager Outreach for Developer Platforms',
        description: 'Send 12 personalized warm intro requests to VPs/CTOs at DevTools leaders.',
        category: 'Outreach',
        priority: 'High',
        status: 'Overdue',
        dueDate: '2026-10-29',
        internalNotes: '8 of 12 sent; remaining 4 pending updated GitHub case study link.',
      },
      {
        clientId: clientIds[6],
        assignedToId: teamIds[0],
        assignedToName: 'Elena Vance',
        title: 'Conduct Mock Technical Architecture Review (GPU Fleet)',
        description: 'Run 60-minute simulated whiteboard session for CoreWeave SVP panel.',
        category: 'Interview Prep',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-11-06',
        internalNotes: 'Scheduled with advisory CTO fellow.',
      },
      {
        clientId: clientIds[10],
        assignedToId: teamIds[1],
        assignedToName: 'Marcus Thorne',
        title: 'Complete Executive Onboarding & 90-Day Autonomy Charter',
        description: 'Synthesize robotics patent portfolio and fleet deployment KPIs into executive narrative.',
        category: 'Branding',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-11-05',
        internalNotes: 'Intake interview completed; drafting v1 charter.',
      },
    ];

    await db.insert(tasks).values(tasksToInsert);

    const deliverablesToInsert = [
      {
        clientId: clientIds[0],
        ownerId: teamIds[0],
        ownerName: 'Elena Vance',
        title: 'CTO & Board Advisory Master Dossier',
        deliverableType: 'Executive Resume',
        status: 'Approved',
        clientApprovalStatus: 'Approved',
        dueDate: '2026-09-01',
        submittedAt: '2026-08-29',
        approvedAt: '2026-08-31',
        version: 'v3.4',
        notes: 'Approved for all Tier-1 AI infrastructure board submissions.',
      },
      {
        clientId: clientIds[0],
        ownerId: teamIds[0],
        ownerName: 'Elena Vance',
        title: '90-Day AI Compute Scaling Charter (Anthropic Panel)',
        deliverableType: '90-Day CTO Charter',
        status: 'Overdue',
        clientApprovalStatus: 'Pending Approval',
        dueDate: '2026-10-29',
        submittedAt: '2026-10-29',
        version: 'v1.2',
        notes: 'Urgent client review required ahead of final panel.',
      },
      {
        clientId: clientIds[1],
        ownerId: teamIds[1],
        ownerName: 'Marcus Thorne',
        title: 'Global Payments SVP Compensation Benchmark & Term Sheet Model',
        deliverableType: 'Interview Briefing Dossier',
        status: 'In Review',
        clientApprovalStatus: 'Pending Approval',
        dueDate: '2026-11-04',
        submittedAt: '2026-11-01',
        version: 'v2.0',
        notes: 'Includes public peer comp analysis (Stripe, Adyen, Block).',
      },
      {
        clientId: clientIds[2],
        ownerId: teamIds[2],
        ownerName: 'Priya Nair',
        title: 'Board-Ready CISO Cyber Governance & Audit Bio',
        deliverableType: 'Board Bio',
        status: 'Approved',
        clientApprovalStatus: 'Approved',
        dueDate: '2026-09-12',
        submittedAt: '2026-09-10',
        approvedAt: '2026-09-11',
        version: 'v2.1',
        notes: 'Formatted for NACD and Fortune 500 Audit Committees.',
      },
      {
        clientId: clientIds[3],
        ownerId: teamIds[0],
        ownerName: 'Elena Vance',
        title: 'CPO Product-Led Growth & Agentic AI Portfolio Deck',
        deliverableType: 'LinkedIn Authority Overhaul',
        status: 'In Review',
        clientApprovalStatus: 'Pending Approval',
        dueDate: '2026-11-05',
        submittedAt: '2026-10-31',
        version: 'v1.4',
        notes: 'Awaiting Camille sign-off on ARR expansion slides.',
      },
      {
        clientId: clientIds[5],
        ownerId: teamIds[1],
        ownerName: 'Marcus Thorne',
        title: 'Biotech & Genomics CTO Target Market Map (Wave 2)',
        deliverableType: 'Target Market Map',
        status: 'Overdue',
        clientApprovalStatus: 'Changes Requested',
        dueDate: '2026-10-26',
        submittedAt: '2026-10-25',
        version: 'v1.1',
        notes: 'Expanding Boston/Cambridge clinical AI company coverage.',
      },
      {
        clientId: clientIds[8],
        ownerId: teamIds[2],
        ownerName: 'Priya Nair',
        title: 'VP Developer Platform Executive Narrative & GitHub Authority Profile',
        deliverableType: 'Executive Resume',
        status: 'Overdue',
        clientApprovalStatus: 'Pending Approval',
        dueDate: '2026-10-30',
        submittedAt: '2026-10-30',
        version: 'v2.0',
        notes: 'Pending client approval to trigger Wave 3 applications.',
      },
      {
        clientId: clientIds[10],
        ownerId: teamIds[1],
        ownerName: 'Marcus Thorne',
        title: 'Physical AI & Robotics CTO Positioning Dossier',
        deliverableType: 'Executive Resume',
        status: 'Draft',
        clientApprovalStatus: 'Pending Approval',
        dueDate: '2026-11-07',
        version: 'v0.9',
        notes: 'Initial draft in assembly following onboarding session.',
      },
    ];

    await db.insert(deliverables).values(deliverablesToInsert);

    // 10. Seed Client Weekly Reports
    const reportsToInsert = clientIds.slice(0, 6).map((cId, idx) => ({
      clientId: cId,
      reportPeriod: 'Oct 26 – Nov 02, 2026',
      weekStarting: '2026-10-26',
      opportunitiesIdentified: 6 + (idx % 4),
      rolesShortlisted: 5 + (idx % 3),
      applicationsSubmitted: 4 + (idx % 3),
      outreachSent: 8 + (idx % 5),
      responsesReceived: 3 + (idx % 3),
      interviewsSecured: 1 + (idx % 3),
      upcomingActions: '1. Complete final board panel prep session\n2. Follow up on 4 warm VC partner introductions\n3. Approve tailored Wave 4 target company briefs',
      pendingDeliverablesSummary: idx % 2 === 0 ? '90-Day Executive Charter (Pending Client Sign-Off)' : 'All current milestone deliverables approved',
      executiveSummary: `[SIMULATED WEEKLY REPORT] Strong conversion velocity for ${executiveClientsSeed[idx].fullName}. Hiring-manager response rate reached 38% across Tier-1 targets with active panel progression.`,
      generatedById: teamIds[idx % 3],
    }));

    await db.insert(clientReports).values(reportsToInsert);

    // 11. Seed Activity Logs
    const logsToInsert = [
      {
        clientId: clientIds[1],
        userId: teamIds[1],
        actorName: 'Marcus Thorne',
        actionType: 'Offer Received',
        entityType: 'Application',
        entityId: 2,
        description: 'Recorded formal executive offer from Stripe ($540k Base + $1.8M RSU package) for Victoria Sterling.',
      },
      {
        clientId: clientIds[0],
        userId: teamIds[0],
        actorName: 'Elena Vance',
        actionType: 'Interview Scheduled',
        entityType: 'Interview',
        entityId: 1,
        description: 'Confirmed CEO / Board Final Panel at Anthropic for Dr. Aris Thorne.',
      },
      {
        clientId: clientIds[2],
        userId: teamIds[4],
        actorName: 'Sofia Chen',
        actionType: 'Outreach Logged',
        entityType: 'Outreach',
        entityId: 4,
        description: 'Secured warm introduction to Audit Committee Chair at CrowdStrike for Rajesh Viswanathan.',
      },
      {
        clientId: clientIds[7],
        userId: teamIds[1],
        actorName: 'Marcus Thorne',
        actionType: 'Interview Scheduled',
        entityType: 'Interview',
        entityId: 8,
        description: 'Scheduled CEO chemistry meeting at ServiceNow for Nadia Al-Mansoor.',
      },
      {
        clientId: clientIds[10],
        userId: teamIds[1],
        actorName: 'Marcus Thorne',
        actionType: 'Client Onboarded',
        entityType: 'Client',
        entityId: clientIds[10],
        description: 'Completed executive intake and Board & CTO Advisory kickoff for Gideon Vance-Kerr.',
      },
      {
        clientId: clientIds[11],
        userId: teamIds[2],
        actorName: 'Priya Nair',
        actionType: 'Client Onboarded',
        entityType: 'Client',
        entityId: clientIds[11],
        description: 'Completed executive profile and target market definition for Meera Subramanian.',
      },
    ];

    await db.insert(activityLogs).values(logsToInsert);
  } catch (error) {
    console.error('Error seeding simulated database:', error);
    throw new Error('Failed to seed simulated executive dataset.', { cause: error });
  }
}
