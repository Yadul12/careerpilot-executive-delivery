import { count } from 'drizzle-orm';
import { db } from './index.ts';
import {
  candidates,
  candidateResumes,
  candidateProfiles,
  employmentHistory,
  candidateSkills,
  certifications,
  technologyRoles,
  jobDescriptions,
  jobRequirements,
  matchResults,
  matchExplanations,
  skillsGapAnalysis,
  positioningRecommendations,
  evaluationLogs,
  matchingWeightsConfig,
} from './schema.ts';

export async function ensureTalentIQSeeded() {
  try {
    const existingCandidates = await db.select({ value: count() }).from(candidates);
    if ((existingCandidates[0]?.value ?? 0) > 0) {
      return;
    }

    console.log('Seeding TalentIQ Enterprise Dataset (21 Taxonomy Roles, 15 Executive Candidates, 30 Job Descriptions, Match & Gap Matrix)...');

    // 1. Default Matching Weights (25 / 20 / 15 / 15 / 10 / 10 / 5)
    await db
      .insert(matchingWeightsConfig)
      .values({
        configName: 'default',
        technicalWeight: 25,
        leadershipWeight: 20,
        seniorityWeight: 15,
        domainWeight: 15,
        industryWeight: 10,
        progressionWeight: 10,
        qualificationWeight: 5,
        updatedBy: 'System Administrator',
      })
      .onConflictDoNothing();

    // 2. All 21 Technology Roles across 5 Categories (Module C)
    const taxonomyRolesData = [
      // Category 1: Executive Leadership
      {
        category: 'Executive Leadership',
        roleTitle: 'Chief Technology Officer (CTO)',
        typicalResponsibilities: 'Own enterprise-wide technology vision, R&D capital allocation, multi-year architecture roadmap, M&A technical due diligence, and Board technology risk governance.',
        requiredTechnicalKnowledge: 'Cloud Native Architecture (AWS/GCP/Azure), Distributed Systems & Microservices, GenAI, LLMs & Machine Learning, Zero-Trust Cybersecurity & Compliance',
        expectedLeadershipExperience: '15–25+ years total tenure; experience leading 150–1,000+ global engineers, VPs, and Directors with $30M–$150M+ R&D P&L.',
        relevantIndustryExperience: 'Enterprise B2B SaaS, FinTech, Global Financial Services, Cloud Platforms, HealthTech',
        commonQualifications: 'M.S./Ph.D. in Computer Science or MBA; Board Advisory Track Record; AWS/TOGAF Executive Credentials',
        seniorityBand: 'C-Suite',
      },
      {
        category: 'Executive Leadership',
        roleTitle: 'Chief Information Officer (CIO)',
        typicalResponsibilities: 'Direct global IT operations, enterprise ERP/CRM modernization, cybersecurity posture, digital workplace transformation, and vendor FinOps governance.',
        requiredTechnicalKnowledge: 'Enterprise Architecture & TOGAF, Zero-Trust Cybersecurity & Compliance, Cloud Native Architecture (AWS/GCP/Azure), P&L, FinOps & CapEx/OpEx Governance',
        expectedLeadershipExperience: '16–25+ years leading global enterprise IT, security, and shared services across multi-national business units.',
        relevantIndustryExperience: 'Banking & Financial Services, Global Manufacturing, Healthcare Systems, Telecom, Fortune 500',
        commonQualifications: 'MBA / M.S. Information Systems; CISSP / CISM / ITIL v4 / TOGAF 10 Certified',
        seniorityBand: 'C-Suite',
      },
      {
        category: 'Executive Leadership',
        roleTitle: 'Chief Digital Officer (CDO)',
        typicalResponsibilities: 'Spearhead omnichannel digital transformation, AI-enabled customer journeys, new digital revenue streams, and legacy business model modernization.',
        requiredTechnicalKnowledge: 'Product-Led Growth & SaaS Multi-Tenancy, GenAI, LLMs & Machine Learning, Data Lakehouse & Real-Time Analytics, Cloud Native Architecture (AWS/GCP/Azure)',
        expectedLeadershipExperience: '15+ years blending product, engineering, and commercial P&L transformation at scale.',
        relevantIndustryExperience: 'Retail & E-Commerce, Consumer Banking, Insurance, Media & Hospitality',
        commonQualifications: 'MBA or M.S. in Digital Innovation / Computer Science',
        seniorityBand: 'C-Suite',
      },
      {
        category: 'Executive Leadership',
        roleTitle: 'Chief Product and Technology Officer (CPTO)',
        typicalResponsibilities: 'Unify product management, UX design, and software engineering under a single ARR-aligned execution engine; drive product-led growth and platform velocity.',
        requiredTechnicalKnowledge: 'Product-Led Growth & SaaS Multi-Tenancy, Distributed Systems & Microservices, GenAI, LLMs & Machine Learning, P&L, FinOps & CapEx/OpEx Governance',
        expectedLeadershipExperience: '15–22+ years leading combined product + engineering orgs (100–600 FTE) through Series C to IPO/PE scale.',
        relevantIndustryExperience: 'High-Growth B2B SaaS, Vertical SaaS, Marketplace Platforms, FinTech',
        commonQualifications: 'M.S. Computer Science / MBA; Proven $100M+ ARR scaling track record',
        seniorityBand: 'C-Suite',
      },
      // Category 2: Engineering Leadership
      {
        category: 'Engineering Leadership',
        roleTitle: 'VP Engineering',
        typicalResponsibilities: 'Scale multi-team software engineering execution, release predictability, engineering manager coaching, DORA metrics, and cross-functional product delivery.',
        requiredTechnicalKnowledge: 'Distributed Systems & Microservices, Cloud Native Architecture (AWS/GCP/Azure), DevSecOps & CI/CD Automation, Global Engineering Org Scaling (100-500+ FTE)',
        expectedLeadershipExperience: '12–20+ years managing Directors and Senior Engineering Managers across 80–350+ engineers.',
        relevantIndustryExperience: 'Enterprise SaaS, FinTech, Cloud Security, Developer Tools',
        commonQualifications: 'B.S./M.S. in Computer Science; Proven hyper-growth org scaling',
        seniorityBand: 'SVP / VP',
      },
      {
        category: 'Engineering Leadership',
        roleTitle: 'Director of Engineering',
        typicalResponsibilities: 'Lead 4–8 agile engineering squads (40–100 engineers), own domain architecture quality, hiring pipelines, incident resilience, and quarterly roadmap execution.',
        requiredTechnicalKnowledge: 'Distributed Systems & Microservices, Kubernetes & Container Orchestration, DevSecOps & CI/CD Automation, Product-Led Growth & SaaS Multi-Tenancy',
        expectedLeadershipExperience: '10–16+ years with 5+ years managing Engineering Managers and Staff Engineers.',
        relevantIndustryExperience: 'SaaS, E-Commerce, FinTech, Cloud Native Platforms',
        commonQualifications: 'B.S./M.S. in Computer Science; AWS / Kubernetes Certifications',
        seniorityBand: 'Director',
      },
      {
        category: 'Engineering Leadership',
        roleTitle: 'Head of Software Engineering',
        typicalResponsibilities: 'Establish software craftsmanship standards, modernize core application estates, oversee global delivery centers, and align engineering KPIs with business outcomes.',
        requiredTechnicalKnowledge: 'Distributed Systems & Microservices, Cloud Native Architecture (AWS/GCP/Azure), DevSecOps & CI/CD Automation, Platform Engineering & Internal Developer Portal',
        expectedLeadershipExperience: '12–18+ years leading full-stack and backend engineering centers of excellence.',
        relevantIndustryExperience: 'Financial Technology, Enterprise Software, Digital Health',
        commonQualifications: 'M.S. in Software Engineering or Computer Science',
        seniorityBand: 'VP / Head',
      },
      {
        category: 'Engineering Leadership',
        roleTitle: 'Engineering Manager',
        typicalResponsibilities: 'Coach 8–20 senior engineers, drive sprint execution, partner with PMs on technical discovery, and maintain high service availability.',
        requiredTechnicalKnowledge: 'Distributed Systems & Microservices, DevSecOps & CI/CD Automation, Cloud Native Architecture (AWS/GCP/Azure)',
        expectedLeadershipExperience: '8–12+ years software engineering with 3–5+ years direct people leadership.',
        relevantIndustryExperience: 'Cloud SaaS, FinTech, Consumer Tech',
        commonQualifications: 'B.S. in Computer Science',
        seniorityBand: 'Senior Manager / Director',
      },
      {
        category: 'Engineering Leadership',
        roleTitle: 'VP Platform Engineering',
        typicalResponsibilities: 'Lead core platform, developer experience (DevEx), shared cloud infrastructure, internal developer portals (IDP), and multi-region reliability.',
        requiredTechnicalKnowledge: 'Platform Engineering & Internal Developer Portal, Kubernetes & Container Orchestration, Cloud Native Architecture (AWS/GCP/Azure), Site Reliability Engineering (SRE)',
        expectedLeadershipExperience: '14–20+ years scaling platform, infrastructure, and SRE organizations (60–200+ engineers).',
        relevantIndustryExperience: 'Hyperscale Cloud, Enterprise SaaS, High-Frequency FinTech',
        commonQualifications: 'M.S. Computer Science; CKA / AWS Solutions Architect Professional',
        seniorityBand: 'SVP / VP',
      },
      // Category 3: Architecture
      {
        category: 'Architecture',
        roleTitle: 'Enterprise Architect',
        typicalResponsibilities: 'Define target-state enterprise architecture blueprints, govern Architecture Review Boards (ARB), rationalize legacy portfolios, and guide M&A integration.',
        requiredTechnicalKnowledge: 'Enterprise Architecture & TOGAF, Cloud Native Architecture (AWS/GCP/Azure), Zero-Trust Cybersecurity & Compliance, M&A Technical Due Diligence & Integration',
        expectedLeadershipExperience: '14–22+ years influencing C-suite and engineering leaders across complex global enterprises.',
        relevantIndustryExperience: 'Global Banking, Insurance, Telecom, Conglomerates, Enterprise Software',
        commonQualifications: 'TOGAF 10 Certified; AWS/Azure Solutions Architect Expert',
        seniorityBand: 'VP / Principal',
      },
      {
        category: 'Architecture',
        roleTitle: 'Solution Architect',
        typicalResponsibilities: 'Design end-to-end customer and enterprise integration architectures, lead strategic technical pre-sales/delivery governance, and validate non-functional SLAs.',
        requiredTechnicalKnowledge: 'Cloud Native Architecture (AWS/GCP/Azure), Distributed Systems & Microservices, Enterprise Architecture & TOGAF',
        expectedLeadershipExperience: '10–16+ years architecting complex enterprise deployments and leading technical architecture guilds.',
        relevantIndustryExperience: 'Cloud Platforms, System Integrators, Enterprise SaaS',
        commonQualifications: 'AWS Certified Solutions Architect – Professional; GCP Professional Cloud Architect',
        seniorityBand: 'Principal / Director',
      },
      {
        category: 'Architecture',
        roleTitle: 'Cloud Architect',
        typicalResponsibilities: 'Architect multi-region, active-active hybrid and public cloud landing zones, Kubernetes fabrics, FinOps cost controls, and zero-trust cloud security.',
        requiredTechnicalKnowledge: 'Cloud Native Architecture (AWS/GCP/Azure), Kubernetes & Container Orchestration, DevSecOps & CI/CD Automation, Zero-Trust Cybersecurity & Compliance',
        expectedLeadershipExperience: '12–18+ years leading cloud centers of excellence (CCoE) and principal cloud architects.',
        relevantIndustryExperience: 'Cloud Native SaaS, FinTech, Capital Markets, Media Streaming',
        commonQualifications: 'AWS Solutions Architect Pro, Azure Solutions Architect Expert, CKA',
        seniorityBand: 'VP / Principal',
      },
      {
        category: 'Architecture',
        roleTitle: 'Technical Architect',
        typicalResponsibilities: 'Own deep system design, low-latency distributed protocols, database sharding strategies, and technical debt remediation across core product lines.',
        requiredTechnicalKnowledge: 'Distributed Systems & Microservices, Kubernetes & Container Orchestration, Data Lakehouse & Real-Time Analytics',
        expectedLeadershipExperience: '11–17+ years as hands-on Principal/Staff Architect mentoring senior engineering leads.',
        relevantIndustryExperience: 'High-Throughput FinTech, AdTech, Real-Time Analytics, SaaS',
        commonQualifications: 'M.S. in Computer Science; Distributed Systems Publications/Patents',
        seniorityBand: 'Principal / Director',
      },
      // Category 4: Data and Analytics
      {
        category: 'Data and Analytics',
        roleTitle: 'VP Data',
        typicalResponsibilities: 'Own enterprise data strategy, modern data lakehouse architecture, AI/ML platform commercialization, data governance, and executive BI insights.',
        requiredTechnicalKnowledge: 'Data Lakehouse & Real-Time Analytics, GenAI, LLMs & Machine Learning, Cloud Native Architecture (AWS/GCP/Azure), P&L, FinOps & CapEx/OpEx Governance',
        expectedLeadershipExperience: '14–20+ years leading 50–200+ data engineers, ML scientists, and analytics directors.',
        relevantIndustryExperience: 'FinTech, Healthcare AI, Retail & E-Commerce, Enterprise SaaS',
        commonQualifications: 'M.S./Ph.D. in Data Science, Computer Science, or Statistics',
        seniorityBand: 'SVP / VP',
      },
      {
        category: 'Data and Analytics',
        roleTitle: 'Director of Data Science',
        typicalResponsibilities: 'Lead applied AI, predictive modeling, LLM/RAG production pipelines, experimentation frameworks, and ML ROI measurement.',
        requiredTechnicalKnowledge: 'GenAI, LLMs & Machine Learning, Data Lakehouse & Real-Time Analytics, Cloud Native Architecture (AWS/GCP/Azure)',
        expectedLeadershipExperience: '11–17+ years managing principal data scientists and ML engineering managers.',
        relevantIndustryExperience: 'AI-First SaaS, Quantitative Finance, Digital Marketplaces, BioTech',
        commonQualifications: 'Ph.D. or M.S. in Machine Learning, Statistics, or Computer Science',
        seniorityBand: 'Director',
      },
      {
        category: 'Data and Analytics',
        roleTitle: 'Head of Data Engineering',
        typicalResponsibilities: 'Architect petabyte-scale streaming and batch data platforms (Snowflake, Databricks, Kafka), data quality SLAs, and self-serve data mesh infrastructure.',
        requiredTechnicalKnowledge: 'Data Lakehouse & Real-Time Analytics, Distributed Systems & Microservices, Cloud Native Architecture (AWS/GCP/Azure)',
        expectedLeadershipExperience: '12–18+ years building and leading global data platform engineering teams.',
        relevantIndustryExperience: 'FinTech, Capital Markets, Global E-Commerce, SaaS',
        commonQualifications: 'M.S. Computer Science; Databricks / Snowflake Architect Certifications',
        seniorityBand: 'VP / Head',
      },
      {
        category: 'Data and Analytics',
        roleTitle: 'Chief Analytics Officer',
        typicalResponsibilities: 'Partner with CEO, CFO, and Board to monetize enterprise data assets, embed AI decision intelligence across operations, and govern regulatory AI compliance.',
        requiredTechnicalKnowledge: 'Data Lakehouse & Real-Time Analytics, GenAI, LLMs & Machine Learning, P&L, FinOps & CapEx/OpEx Governance, Zero-Trust Cybersecurity & Compliance',
        expectedLeadershipExperience: '16–24+ years C-level/SVP leadership in enterprise analytics and AI commercialization.',
        relevantIndustryExperience: 'Financial Services, Insurance, Healthcare, Global Consumer Goods',
        commonQualifications: 'Ph.D./MBA; Executive AI Governance Credentials',
        seniorityBand: 'C-Suite',
      },
      // Category 5: Infrastructure and Operations
      {
        category: 'Infrastructure and Operations',
        roleTitle: 'Head of Cloud Infrastructure',
        typicalResponsibilities: 'Manage global multi-cloud infrastructure, network backbone, cloud FinOps optimization, disaster recovery, and sovereign cloud compliance.',
        requiredTechnicalKnowledge: 'Cloud Native Architecture (AWS/GCP/Azure), Kubernetes & Container Orchestration, P&L, FinOps & CapEx/OpEx Governance, Zero-Trust Cybersecurity & Compliance',
        expectedLeadershipExperience: '13–20+ years directing global cloud infrastructure and network operations teams.',
        relevantIndustryExperience: 'Cloud Providers, Banking, SaaS, Telecommunications',
        commonQualifications: 'AWS/GCP/Azure Professional Architect; FinOps Certified Practitioner',
        seniorityBand: 'VP / Head',
      },
      {
        category: 'Infrastructure and Operations',
        roleTitle: 'Director of DevOps',
        typicalResponsibilities: 'Standardize CI/CD release pipelines, Infrastructure-as-Code (Terraform/GitOps), automated security scanning (DevSecOps), and deployment velocity.',
        requiredTechnicalKnowledge: 'DevSecOps & CI/CD Automation, Kubernetes & Container Orchestration, Cloud Native Architecture (AWS/GCP/Azure), Site Reliability Engineering (SRE)',
        expectedLeadershipExperience: '10–16+ years leading DevOps, Release Engineering, and Cloud Automation squads.',
        relevantIndustryExperience: 'Enterprise SaaS, FinTech, CyberSecurity, Gaming',
        commonQualifications: 'CKA, HashiCorp Terraform Associate, AWS DevOps Engineer Pro',
        seniorityBand: 'Director',
      },
      {
        category: 'Infrastructure and Operations',
        roleTitle: 'Head of Platform Engineering',
        typicalResponsibilities: 'Build golden paths, Internal Developer Portals (Backstage), Kubernetes multi-cluster orchestration, and developer productivity telemetry.',
        requiredTechnicalKnowledge: 'Platform Engineering & Internal Developer Portal, Kubernetes & Container Orchestration, DevSecOps & CI/CD Automation, Cloud Native Architecture (AWS/GCP/Azure)',
        expectedLeadershipExperience: '12–18+ years leading platform engineering and cloud-native infrastructure organizations.',
        relevantIndustryExperience: 'High-Growth Tech, B2B SaaS, FinTech',
        commonQualifications: 'B.S./M.S. Computer Science; CNCF Kubernetes Certifications',
        seniorityBand: 'VP / Head',
      },
      {
        category: 'Infrastructure and Operations',
        roleTitle: 'Site Reliability Engineering Leadership',
        typicalResponsibilities: 'Own 99.999% global production availability, error budgets, chaos engineering, observability platforms, and executive incident command.',
        requiredTechnicalKnowledge: 'Site Reliability Engineering (SRE), Kubernetes & Container Orchestration, Distributed Systems & Microservices, Cloud Native Architecture (AWS/GCP/Azure)',
        expectedLeadershipExperience: '12–19+ years leading follow-the-sun SRE and production engineering organizations.',
        relevantIndustryExperience: 'Payments & FinTech, Hyperscale Cloud, Real-Time Commerce',
        commonQualifications: 'M.S. Computer Science; Google/AWS SRE & Cloud Architecture Credentials',
        seniorityBand: 'VP / Director',
      },
    ];

    const insertedRoles = await db.insert(technologyRoles).values(taxonomyRolesData).returning();
    const roleMap = new Map(insertedRoles.map((r) => [r.roleTitle, r.id]));

    // 3. 15 Synthetic Executive Candidates (Module B / Section 8)
    const candidatesSeed = [
      {
        fullName: 'Vikramaditya Rao',
        email: 'v.rao@synthetic-exec.io',
        phone: '+1 (415) 891-2041',
        location: 'San Francisco, CA',
        currentDesignation: 'Chief Technology Officer (CTO)',
        previousDesignations: 'SVP Engineering · VP Cloud Platform · Principal Distributed Architect',
        totalYearsExperience: 22,
        primaryDomain: 'Cloud & Platform Engineering',
        extractionConfidence: 98,
        analysisMonth: '2026-06',
        industryExperience: 'Enterprise B2B SaaS · FinTech Infrastructure · Multi-Cloud Security',
        leadershipExperience: 'Scaled global engineering and platform organizations from 110 to 420+ FTEs across US, UK, and India; managed $68M annual R&D CapEx/OpEx budget; led 4 M&A technical integrations.',
        educationalQualifications: 'M.S. in Computer Science, Stanford University · B.Tech in Computer Science, IIT Madras',
        majorAchievements: 'Architected multi-region active-active cloud platform processing 1.4M TPS at 99.999% SLA; reduced cloud COGS by $11.5M/yr via automated FinOps; drove technical due diligence for $1.8B IPO readiness.',
        companiesWorkedAt: 'CloudScale Enterprise · Stripe-Tier FinTech · Oracle Cloud Core',
        skills: [
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Distributed Systems & Microservices',
          'Kubernetes & Container Orchestration',
          'Global Engineering Org Scaling (100-500+ FTE)',
          'P&L, FinOps & CapEx/OpEx Governance',
          'M&A Technical Due Diligence & Integration',
          'Zero-Trust Cybersecurity & Compliance',
        ],
        certs: [
          { name: 'AWS Certified Solutions Architect – Professional', issuingOrg: 'Amazon Web Services', issueYear: '2024' },
          { name: 'TOGAF 10 Enterprise Architecture Certified', issuingOrg: 'The Open Group', issueYear: '2023' },
        ],
      },
      {
        fullName: 'Dr. Eleanor Sterling',
        email: 'e.sterling@synthetic-exec.io',
        phone: '+1 (212) 744-8910',
        location: 'New York, NY',
        currentDesignation: 'Chief Data & AI Officer (CDO)',
        previousDesignations: 'VP Data & Machine Learning · Director of AI Research · Principal Data Scientist',
        totalYearsExperience: 19,
        primaryDomain: 'AI, Data & Analytics',
        extractionConfidence: 97,
        analysisMonth: '2026-06',
        industryExperience: 'Capital Markets & FinTech · Enterprise AI SaaS · Regulated Healthcare Analytics',
        leadershipExperience: 'Built and directed a 180-person global Data Engineering, ML Platform, and Applied GenAI organization; governed $42M AI/Data infrastructure budget and Board AI ethics committee.',
        educationalQualifications: 'Ph.D. in Machine Learning, MIT · B.S. in Mathematics & Computer Science, Columbia University',
        majorAchievements: 'Commercialized enterprise GenAI copilot suite generating $48M net-new ARR; unified 14 legacy data silos into a unified Snowflake + Databricks lakehouse serving 6,000+ institutional clients.',
        companiesWorkedAt: 'QuantEdge AI · Morgan Stanley Data Lab · Palantir Enterprise',
        skills: [
          'GenAI, LLMs & Machine Learning',
          'Data Lakehouse & Real-Time Analytics',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Zero-Trust Cybersecurity & Compliance',
          'Global Engineering Org Scaling (100-500+ FTE)',
        ],
        certs: [
          { name: 'Databricks Certified Data & AI Architect', issuingOrg: 'Databricks', issueYear: '2025' },
          { name: 'SnowPro Advanced: Architect', issuingOrg: 'Snowflake', issueYear: '2024' },
        ],
      },
      {
        fullName: 'Marcus Thorne',
        email: 'm.thorne@synthetic-exec.io',
        phone: '+44 20 7946 0821',
        location: 'London, UK',
        currentDesignation: 'Chief Information Officer (CIO)',
        previousDesignations: 'SVP Global IT & Cyber · VP Enterprise Architecture · Head of Core Banking Systems',
        totalYearsExperience: 24,
        primaryDomain: 'Enterprise Architecture',
        extractionConfidence: 96,
        analysisMonth: '2026-07',
        industryExperience: 'Global Banking & Financial Services · Insurance · FTSE 100 Enterprise IT',
        leadershipExperience: 'Led 650+ global IT, Enterprise Architecture, and Cyber Operations staff across 18 countries with £110M annual IT budget.',
        educationalQualifications: 'MBA, London Business School · B.Sc. Computer Science, Imperial College London',
        majorAchievements: 'Executed £85M core banking cloud migration 4 months ahead of schedule; achieved zero critical audit findings across ISO27001, DORA, and SOC2 Type II.',
        companiesWorkedAt: 'Barclays Global Tech · Lloyds Digital · Accenture Financial Strategy',
        skills: [
          'Enterprise Architecture & TOGAF',
          'Zero-Trust Cybersecurity & Compliance',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
          'M&A Technical Due Diligence & Integration',
          'Global Engineering Org Scaling (100-500+ FTE)',
        ],
        certs: [
          { name: 'TOGAF 10 Enterprise Architecture Practitioner', issuingOrg: 'The Open Group', issueYear: '2023' },
          { name: 'Certified Information Security Manager (CISM)', issuingOrg: 'ISACA', issueYear: '2022' },
        ],
      },
      {
        fullName: 'Sophia Chen-Lindqvist',
        email: 's.chen@synthetic-exec.io',
        phone: '+1 (206) 559-3310',
        location: 'Seattle, WA',
        currentDesignation: 'VP Engineering',
        previousDesignations: 'Senior Director of Software Engineering · Director of Cloud Services · Engineering Manager',
        totalYearsExperience: 17,
        primaryDomain: 'Cloud & Platform Engineering',
        extractionConfidence: 95,
        analysisMonth: '2026-07',
        industryExperience: 'B2B Cloud SaaS · Developer Platforms · E-Commerce Scale',
        leadershipExperience: 'Managed 220 engineers across 6 Engineering Directors and 18 squads; improved deployment frequency 4.5x while cutting change failure rate below 1.2%.',
        educationalQualifications: 'M.S. in Computer Science, University of Washington · B.S. in EECS, UC Berkeley',
        majorAchievements: 'Scaled flagship B2B SaaS platform from $35M to $210M ARR; pioneered Internal Developer Portal reducing engineer onboarding time from 28 days to 4 days.',
        companiesWorkedAt: 'Atlassian Cloud · AWS Core Services · Twilio Platform',
        skills: [
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'DevSecOps & CI/CD Automation',
          'Platform Engineering & Internal Developer Portal',
          'Global Engineering Org Scaling (100-500+ FTE)',
          'Product-Led Growth & SaaS Multi-Tenancy',
        ],
        certs: [
          { name: 'AWS Certified DevOps Engineer – Professional', issuingOrg: 'Amazon Web Services', issueYear: '2024' },
        ],
      },
      {
        fullName: 'Mateo Alvarez-Gomez',
        email: 'm.alvarez@synthetic-exec.io',
        phone: '+1 (512) 640-9921',
        location: 'Austin, TX',
        currentDesignation: 'VP Platform Engineering',
        previousDesignations: 'Head of Cloud Infrastructure · Director of SRE & DevOps · Principal Infrastructure Architect',
        totalYearsExperience: 18,
        primaryDomain: 'Cloud & Infrastructure',
        extractionConfidence: 96,
        analysisMonth: '2026-07',
        industryExperience: 'Hyperscale SaaS · Payments Infrastructure · Cloud Native Security',
        leadershipExperience: 'Directed 145 platform, SRE, and Kubernetes infrastructure engineers across US and LATAM; owned $28M annual cloud commit.',
        educationalQualifications: 'M.S. in Distributed Computing, UT Austin · B.S. in Computer Science, Tec de Monterrey',
        majorAchievements: 'Built multi-cluster Kubernetes platform across 12 AWS/GCP regions; achieved 99.995% uptime during Black Friday peak traffic of 3.2M req/sec.',
        companiesWorkedAt: 'CrowdStrike Platform · Cloudflare Core · PayPal Infrastructure',
        skills: [
          'Platform Engineering & Internal Developer Portal',
          'Kubernetes & Container Orchestration',
          'Site Reliability Engineering (SRE)',
          'DevSecOps & CI/CD Automation',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        certs: [
          { name: 'Certified Kubernetes Administrator (CKA) & CKS', issuingOrg: 'CNCF', issueYear: '2024' },
          { name: 'FinOps Certified Practitioner', issuingOrg: 'FinOps Foundation', issueYear: '2024' },
        ],
      },
      {
        fullName: 'Ananya Deshmukh',
        email: 'a.deshmukh@synthetic-exec.io',
        phone: '+65 6789 4412',
        location: 'Singapore',
        currentDesignation: 'Chief Product and Technology Officer (CPTO)',
        previousDesignations: 'CTO · VP Product & Engineering · Director of Platform Strategy',
        totalYearsExperience: 20,
        primaryDomain: 'FinTech & Distributed Systems',
        extractionConfidence: 97,
        analysisMonth: '2026-08',
        industryExperience: 'Cross-Border Payments · Digital Banking · Enterprise WealthTech',
        leadershipExperience: 'Unified 290+ Product Managers, Designers, and Engineers across APAC and Europe; stewarded $52M R&D budget and MAS/FCA regulatory technology compliance.',
        educationalQualifications: 'MBA, INSEAD · B.E. in Computer Engineering, NUS Singapore',
        majorAchievements: 'Launched real-time cross-border FX clearing engine processing $85B annual volume; led Series D ($180M) technical & product diligence.',
        companiesWorkedAt: 'Airwallex Scale · Grab Financial · Standard Chartered Nexus',
        skills: [
          'Product-Led Growth & SaaS Multi-Tenancy',
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Global Engineering Org Scaling (100-500+ FTE)',
          'Zero-Trust Cybersecurity & Compliance',
        ],
        certs: [
          { name: 'AWS Certified Solutions Architect – Professional', issuingOrg: 'Amazon Web Services', issueYear: '2023' },
        ],
      },
      {
        fullName: 'Henrik Lindholm',
        email: 'h.lindholm@synthetic-exec.io',
        phone: '+1 (617) 802-4519',
        location: 'Boston, MA',
        currentDesignation: 'Principal Enterprise Architect',
        previousDesignations: 'VP Enterprise Architecture · Lead Solution Architect · Senior Systems Designer',
        totalYearsExperience: 21,
        primaryDomain: 'Enterprise Architecture',
        extractionConfidence: 94,
        analysisMonth: '2026-08',
        industryExperience: 'Life Sciences & Pharma Tech · Global Insurance · Enterprise SaaS',
        leadershipExperience: 'Chaired Global Architecture Review Board governing $240M technology portfolio and 45 domain architects.',
        educationalQualifications: 'M.Sc. in Software Systems, KTH Royal Institute of Technology',
        majorAchievements: 'Decommissioned 110+ legacy mainframe/monolith applications saving $19M annually; designed HIPAA/GxP-compliant hybrid cloud mesh.',
        companiesWorkedAt: 'Novartis Digital · Liberty Mutual Architecture · Red Hat Enterprise',
        skills: [
          'Enterprise Architecture & TOGAF',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Distributed Systems & Microservices',
          'Zero-Trust Cybersecurity & Compliance',
          'M&A Technical Due Diligence & Integration',
        ],
        certs: [
          { name: 'TOGAF 10 Certified Master Architect', issuingOrg: 'The Open Group', issueYear: '2024' },
          { name: 'Microsoft Certified: Azure Solutions Architect Expert', issuingOrg: 'Microsoft', issueYear: '2024' },
        ],
      },
      {
        fullName: 'Devon Brooks-Kerr',
        email: 'd.brooks@synthetic-exec.io',
        phone: '+1 (312) 490-7731',
        location: 'Chicago, IL',
        currentDesignation: 'Director of Engineering',
        previousDesignations: 'Senior Engineering Manager · Staff Backend Engineer · Lead Distributed Engineer',
        totalYearsExperience: 14,
        primaryDomain: 'FinTech & Distributed Systems',
        extractionConfidence: 93,
        analysisMonth: '2026-08',
        industryExperience: 'Algorithmic Trading · Clearing & Settlement · B2B FinTech',
        leadershipExperience: 'Leads 75 engineers and 6 Engineering Managers building ultra-low-latency order routing and ledger microservices.',
        educationalQualifications: 'M.S. in Computer Science, UIUC · B.S. in Computer Science, Purdue University',
        majorAchievements: 'Cut p99 transaction latency from 42ms to 3.8ms; zero severity-1 outages across 36 consecutive months.',
        companiesWorkedAt: 'Citadel Tech Systems · CME Group Digital · Plaid Core',
        skills: [
          'Distributed Systems & Microservices',
          'Kubernetes & Container Orchestration',
          'DevSecOps & CI/CD Automation',
          'Site Reliability Engineering (SRE)',
          'Cloud Native Architecture (AWS/GCP/Azure)',
        ],
        certs: [
          { name: 'Certified Kubernetes Application Developer (CKAD)', issuingOrg: 'CNCF', issueYear: '2023' },
        ],
      },
      {
        fullName: 'Nadia Al-Mansoor',
        email: 'n.almansoor@synthetic-exec.io',
        phone: '+971 50 842 9910',
        location: 'Dubai, UAE / London, UK',
        currentDesignation: 'VP & Chief Cloud Architect',
        previousDesignations: 'Head of Cloud Architecture · Principal Cloud Consultant · Lead Infrastructure Engineer',
        totalYearsExperience: 16,
        primaryDomain: 'Cloud & Infrastructure',
        extractionConfidence: 95,
        analysisMonth: '2026-09',
        industryExperience: 'Sovereign Cloud · Aviation & Logistics · Digital Banking',
        leadershipExperience: 'Led 60+ cloud architects and DevSecOps specialists delivering sovereign multi-cloud landing zones across EMEA and GCC.',
        educationalQualifications: 'M.Sc. in Cloud & Network Security, UCL · B.Sc. in Computer Science, AUB',
        majorAchievements: 'Architected sovereign dual-region cloud fabric for $14B national digital bank; automated 98% of CIS/NIST security guardrails via Terraform.',
        companiesWorkedAt: 'Emirates Group Digital · HSBC Cloud CoE · Google Cloud PSO',
        skills: [
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Kubernetes & Container Orchestration',
          'Zero-Trust Cybersecurity & Compliance',
          'Enterprise Architecture & TOGAF',
          'DevSecOps & CI/CD Automation',
        ],
        certs: [
          { name: 'Google Cloud Certified – Fellow / Professional Cloud Architect', issuingOrg: 'Google Cloud', issueYear: '2025' },
          { name: 'AWS Certified Security – Specialty', issuingOrg: 'Amazon Web Services', issueYear: '2024' },
        ],
      },
      {
        fullName: 'Dr. Kenji Takahashi',
        email: 'k.takahashi@synthetic-exec.io',
        phone: '+1 (408) 912-6604',
        location: 'San Jose, CA',
        currentDesignation: 'VP Data',
        previousDesignations: 'Head of Data Engineering · Director of AI Infrastructure · Staff Data Architect',
        totalYearsExperience: 18,
        primaryDomain: 'AI, Data & Analytics',
        extractionConfidence: 96,
        analysisMonth: '2026-09',
        industryExperience: 'Cybersecurity Telemetry · Hyperscale SaaS · Autonomous Systems',
        leadershipExperience: 'Directed 130 data engineers, ML platform engineers, and analytics leaders with $31M annual data cloud budget.',
        educationalQualifications: 'Ph.D. in Distributed Databases, UC San Diego · M.S. Computer Science, University of Tokyo',
        majorAchievements: 'Built real-time security graph ingesting 18 petabytes/day on Kafka + Iceberg; slashed Snowflake/Databricks compute spend by 41%.',
        companiesWorkedAt: 'Palo Alto Networks Data · Snowflake Core · LinkedIn Data Infra',
        skills: [
          'Data Lakehouse & Real-Time Analytics',
          'GenAI, LLMs & Machine Learning',
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        certs: [
          { name: 'Databricks Certified Machine Learning Professional', issuingOrg: 'Databricks', issueYear: '2024' },
        ],
      },
      {
        fullName: 'Claire Beaumont-Vance',
        email: 'c.beaumont@synthetic-exec.io',
        phone: '+1 (646) 331-8092',
        location: 'New York, NY',
        currentDesignation: 'Head of Software Engineering',
        previousDesignations: 'Senior Director of Product Engineering · Director of Full-Stack Engineering',
        totalYearsExperience: 16,
        primaryDomain: 'Cloud & Platform Engineering',
        extractionConfidence: 94,
        analysisMonth: '2026-09',
        industryExperience: 'Enterprise WealthTech · SaaS Workflow Automation · InsurTech',
        leadershipExperience: 'Managed 160 software engineers across 4 global hubs (NYC, Toronto, Dublin, Krakow); instituted DORA metrics and quarterly OKR governance.',
        educationalQualifications: 'M.S. in Software Engineering, Carnegie Mellon University · B.A. in Computer Science, Cornell',
        majorAchievements: 'Led monolith-to-microservices decomposition increasing release cadence from monthly to 40+ daily deployments.',
        companiesWorkedAt: 'Bloomberg Engineering · Datadog Product Eng · Oscar Health Tech',
        skills: [
          'Distributed Systems & Microservices',
          'Product-Led Growth & SaaS Multi-Tenancy',
          'DevSecOps & CI/CD Automation',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Global Engineering Org Scaling (100-500+ FTE)',
        ],
        certs: [
          { name: 'AWS Certified Solutions Architect – Associate', issuingOrg: 'Amazon Web Services', issueYear: '2023' },
        ],
      },
      {
        fullName: 'Rafael Morales-Silva',
        email: 'r.morales@synthetic-exec.io',
        phone: '+1 (305) 772-1940',
        location: 'Miami, FL',
        currentDesignation: 'Head of Cloud Infrastructure & SRE',
        previousDesignations: 'Director of Site Reliability Engineering · Principal Production Engineer',
        totalYearsExperience: 15,
        primaryDomain: 'Cloud & Infrastructure',
        extractionConfidence: 92,
        analysisMonth: '2026-10',
        industryExperience: 'Global Payments · High-Frequency E-Commerce · Telecom Cloud',
        leadershipExperience: 'Leads 90 SRE, DevOps, and Network Reliability Engineers across follow-the-sun operations.',
        educationalQualifications: 'B.S. in Computer Engineering, Georgia Tech',
        majorAchievements: 'Reduced MTTR by 78% via automated AI-driven incident correlation and OpenTelemetry observability mesh.',
        companiesWorkedAt: 'Mastercard Cloud · Shopify Reliability · Akamai Edge',
        skills: [
          'Site Reliability Engineering (SRE)',
          'Kubernetes & Container Orchestration',
          'DevSecOps & CI/CD Automation',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Zero-Trust Cybersecurity & Compliance',
        ],
        certs: [
          { name: 'Certified Kubernetes Security Specialist (CKS)', issuingOrg: 'CNCF', issueYear: '2024' },
        ],
      },
      {
        fullName: 'Priya Narayanan-Kulkarni',
        email: 'p.narayanan@synthetic-exec.io',
        phone: '+1 (425) 881-5023',
        location: 'Bellevue, WA',
        currentDesignation: 'Director of Data Science & GenAI',
        previousDesignations: 'Principal ML Manager · Staff Applied Scientist · Senior Data Scientist',
        totalYearsExperience: 13,
        primaryDomain: 'AI, Data & Analytics',
        extractionConfidence: 95,
        analysisMonth: '2026-10',
        industryExperience: 'Enterprise Copilot SaaS · Search & Recommendation · Cloud AI',
        leadershipExperience: 'Directs 55 Ph.D./M.S. Machine Learning Scientists and LLM Infrastructure Engineers.',
        educationalQualifications: 'Ph.D. in Computational Linguistics (NLP), Stanford University',
        majorAchievements: 'Deployed multi-agent RAG & semantic matching architecture serving 12M enterprise seats with sub-250ms p95 latency.',
        companiesWorkedAt: 'Microsoft AI Platform · Cohere Enterprise · Meta AI',
        skills: [
          'GenAI, LLMs & Machine Learning',
          'Data Lakehouse & Real-Time Analytics',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Product-Led Growth & SaaS Multi-Tenancy',
        ],
        certs: [
          { name: 'AWS Certified Machine Learning – Specialty', issuingOrg: 'Amazon Web Services', issueYear: '2024' },
        ],
      },
      {
        fullName: 'alistair MacLeod',
        email: 'a.macleod@synthetic-exec.io',
        phone: '+44 131 496 0391',
        location: 'Edinburgh, UK',
        currentDesignation: 'Chief Digital Officer (CDO)',
        previousDesignations: 'SVP Digital Transformation · VP Omni-Channel Engineering · Head of Digital Product',
        totalYearsExperience: 21,
        primaryDomain: 'Enterprise Architecture',
        extractionConfidence: 93,
        analysisMonth: '2026-10',
        industryExperience: 'Retail & Omni-Channel Commerce · Consumer Banking · Travel Tech',
        leadershipExperience: 'Guided 310-person digital product, engineering, and analytics organization through £140M digital transformation.',
        educationalQualifications: 'MBA, University of Edinburgh · B.Sc. Software Engineering, University of Glasgow',
        majorAchievements: 'Grew digital channel revenue share from 28% to 74% ($1.1B GMV); unified loyalty and real-time personalization data platform.',
        companiesWorkedAt: 'Marks & Spencer Digital · NatWest Retail Tech · Skyscanner',
        skills: [
          'Product-Led Growth & SaaS Multi-Tenancy',
          'Enterprise Architecture & TOGAF',
          'Data Lakehouse & Real-Time Analytics',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Global Engineering Org Scaling (100-500+ FTE)',
        ],
        certs: [
          { name: 'SAFe 6.0 Lean Portfolio Manager', issuingOrg: 'Scaled Agile', issueYear: '2023' },
        ],
      },
      {
        fullName: 'Jordan Vance-Moreau',
        email: 'j.moreau@synthetic-exec.io',
        phone: '+1 (650) 443-9182',
        location: 'Palo Alto, CA',
        currentDesignation: 'Chief Analytics Officer',
        previousDesignations: 'VP Enterprise Analytics & AI · Senior Director of Decision Science',
        totalYearsExperience: 20,
        primaryDomain: 'AI, Data & Analytics',
        extractionConfidence: 96,
        analysisMonth: '2026-10',
        industryExperience: 'Global InsurTech · Financial Risk Analytics · B2B SaaS',
        leadershipExperience: 'Led 150+ data scientists, actuaries, and analytics engineers; reported directly to CEO and Audit Committee on AI risk & monetization.',
        educationalQualifications: 'Ph.D. in Econometrics & Statistics, Wharton / UPenn',
        majorAchievements: 'Delivered $62M underwriting margin expansion via real-time ML risk scoring; established EU AI Act & NIST AI RMF governance.',
        companiesWorkedAt: 'Chubb Global Analytics · FICO Decision AI · McKinsey QuantumBlack',
        skills: [
          'Data Lakehouse & Real-Time Analytics',
          'GenAI, LLMs & Machine Learning',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Zero-Trust Cybersecurity & Compliance',
          'M&A Technical Due Diligence & Integration',
        ],
        certs: [
          { name: 'Snowflake Data Superhero / Architect Certification', issuingOrg: 'Snowflake', issueYear: '2024' },
        ],
      },
    ];

    const insertedCandidates: { id: number; seed: (typeof candidatesSeed)[0] }[] = [];

    for (const c of candidatesSeed) {
      const fixedName = c.fullName.charAt(0).toUpperCase() + c.fullName.slice(1);
      const [candRow] = await db
        .insert(candidates)
        .values({
          fullName: fixedName,
          email: c.email,
          phone: c.phone,
          location: c.location,
          currentDesignation: c.currentDesignation,
          previousDesignations: c.previousDesignations,
          totalYearsExperience: c.totalYearsExperience,
          primaryDomain: c.primaryDomain,
          extractionConfidence: c.extractionConfidence,
          analysisMonth: c.analysisMonth,
          isSynthetic: true,
        })
        .returning();

      insertedCandidates.push({ id: candRow.id, seed: { ...c, fullName: fixedName } });

      const rawText = `[SYNTHETIC EXECUTIVE RESUME — TALENTIQ BENCHMARK]\n${fixedName}\n${c.currentDesignation} | ${c.location} | ${c.email} | ${c.phone}\n\nEXECUTIVE SUMMARY\n${c.totalYearsExperience}+ years of senior technology leadership in ${c.primaryDomain}. Previously held roles as ${c.previousDesignations}.\n\nLEADERSHIP & ORGANIZATIONAL SCALE\n${c.leadershipExperience}\n\nKEY QUANTIFIED ACHIEVEMENTS\n${c.majorAchievements}\n\nINDUSTRY EXPOSURE\n${c.industryExperience}\n\nCORE COMPETENCIES\n${c.skills.join(' · ')}\n\nEDUCATION\n${c.educationalQualifications}`;

      await db.insert(candidateResumes).values({
        candidateId: candRow.id,
        filename: `${fixedName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cv_2026.pdf`,
        fileType: 'PDF',
        rawText,
        extractionConfidence: c.extractionConfidence,
      });

      await db.insert(candidateProfiles).values({
        candidateId: candRow.id,
        industryExperience: c.industryExperience,
        leadershipExperience: c.leadershipExperience,
        educationalQualifications: c.educationalQualifications,
        majorAchievements: c.majorAchievements,
        companiesWorkedAt: c.companiesWorkedAt,
        executiveSummary: `${c.totalYearsExperience}-year veteran ${c.currentDesignation} with verified delivery across ${c.companiesWorkedAt}.`,
      });

      const comps = c.companiesWorkedAt.split('·').map((s) => s.trim());
      const prevRoles = c.previousDesignations.split('·').map((s) => s.trim());

      await db.insert(employmentHistory).values([
        {
          candidateId: candRow.id,
          company: comps[0] || 'Enterprise Corp',
          designation: c.currentDesignation,
          duration: '2022 – Present',
          highlights: c.majorAchievements,
        },
        {
          candidateId: candRow.id,
          company: comps[1] || 'Global Scale Tech',
          designation: prevRoles[0] || 'VP of Engineering',
          duration: '2018 – 2022',
          highlights: c.leadershipExperience,
        },
      ]);

      await db.insert(candidateSkills).values(
        c.skills.map((sk, idx) => ({
          candidateId: candRow.id,
          skillName: sk,
          skillCategory:
            sk.includes('Cloud') || sk.includes('Kubernetes')
              ? 'Cloud & Infra'
              : sk.includes('AI') || sk.includes('Data')
              ? 'Data & AI'
              : sk.includes('Scaling') || sk.includes('P&L') || sk.includes('M&A')
              ? 'Executive Leadership'
              : 'Architecture & Security',
          proficiencyLevel: idx < 4 ? 'Expert' : 'Advanced',
          yearsUsed: Math.max(5, c.totalYearsExperience - idx * 2),
          isVerified: true,
        }))
      );

      if (c.certs.length > 0) {
        await db.insert(certifications).values(
          c.certs.map((cert) => ({
            candidateId: candRow.id,
            name: cert.name,
            issuingOrg: cert.issuingOrg,
            issueYear: cert.issueYear,
          }))
        );
      }

      await db.insert(positioningRecommendations).values({
        candidateId: candRow.id,
        targetPositions: `${c.currentDesignation} · Chief Technology Officer (CTO) · SVP Engineering`,
        alternativePaths: 'Private Equity Technology Operating Partner · Board Technical Advisor',
        strongestDifferentiators: c.majorAchievements,
        skillsNeedingVisibility: 'Board Audit & Cyber Risk Governance · AI Unit Economics & Gross Margin Expansion',
        resumePositioningAdvice: `Anchor page-one summary around ${comps[0]} scale metrics and explicit CapEx/OpEx FinOps ROI.`,
        relevantIndustrySegments: c.industryExperience,
        recommendedSearchStrategy: 'Direct outreach to Tier-1 Retained Executive Search Partners and Series D / Pre-IPO CEOs.',
        approvedByManager: candRow.id % 2 === 1,
      });
    }

    // 4. 30 Synthetic Job Descriptions (10 CTO/CIO, 10 Engineering Leadership, 10 Data & Architecture)
    const jobsSeed: {
      jobTitle: string;
      company: string;
      roleCategory: string;
      taxonomyTitle: string;
      seniorityLevel: string;
      yearsOfExperience: number;
      location: string;
      compensationInfo: string;
      industryRequirements: string;
      leadershipExpectations: string;
      technicalResponsibilities: string;
      reqSkills: string[];
      prefSkills: string[];
    }[] = [
      // --- 10 CTO & CIO ROLES ---
      {
        jobTitle: 'Chief Technology Officer (CTO)',
        company: 'AetherPay Global FinTech',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Technology Officer (CTO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 18,
        location: 'San Francisco, CA (Hybrid)',
        compensationInfo: '$450,000 – $550,000 + 50% Bonus + 1.25% Equity',
        industryRequirements: 'FinTech · Cross-Border Payments · Regulated Banking',
        leadershipExpectations: 'Lead 380+ global engineers across 4 continents, own $75M R&D budget, and serve as key technical voice to the Board and institutional investors.',
        technicalResponsibilities: 'Own active-active multi-cloud payments clearing architecture, PCI-DSS/SOC2 zero-trust posture, and GenAI fraud detection roadmap.',
        reqSkills: [
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Distributed Systems & Microservices',
          'Global Engineering Org Scaling (100-500+ FTE)',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Zero-Trust Cybersecurity & Compliance',
        ],
        prefSkills: ['M&A Technical Due Diligence & Integration', 'GenAI, LLMs & Machine Learning'],
      },
      {
        jobTitle: 'Chief Information Officer (CIO)',
        company: 'Vanguard Sovereign Bancorp',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Information Officer (CIO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 20,
        location: 'London, UK / New York, NY',
        compensationInfo: '$480,000 – $600,000 + Executive LTIP',
        industryRequirements: 'Global Banking · Capital Markets · Insurance',
        leadershipExpectations: 'Direct 600+ enterprise IT, cyber, and core banking transformation staff with $120M annual budget.',
        technicalResponsibilities: 'Modernize legacy mainframe estates onto hybrid cloud, enforce DORA/ISO27001 cyber resilience, and consolidate global vendor spend.',
        reqSkills: [
          'Enterprise Architecture & TOGAF',
          'Zero-Trust Cybersecurity & Compliance',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        prefSkills: ['M&A Technical Due Diligence & Integration', 'Data Lakehouse & Real-Time Analytics'],
      },
      {
        jobTitle: 'Chief Product and Technology Officer (CPTO)',
        company: 'NexusWork B2B SaaS',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Product and Technology Officer (CPTO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 16,
        location: 'New York, NY',
        compensationInfo: '$420,000 – $520,000 + Equity',
        industryRequirements: 'B2B Enterprise SaaS · Workflow Automation',
        leadershipExpectations: 'Unify 240 Product, Design, and Engineering professionals to scale ARR from $120M to $350M.',
        technicalResponsibilities: 'Drive multi-tenant SaaS architecture, AI agentic workflows, and enterprise PLG self-service.',
        reqSkills: [
          'Product-Led Growth & SaaS Multi-Tenancy',
          'Distributed Systems & Microservices',
          'Global Engineering Org Scaling (100-500+ FTE)',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        prefSkills: ['GenAI, LLMs & Machine Learning', 'Cloud Native Architecture (AWS/GCP/Azure)'],
      },
      {
        jobTitle: 'Chief Technology Officer (CTO) – AI & Cloud',
        company: 'Synthetix Enterprise AI',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Technology Officer (CTO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 16,
        location: 'Seattle, WA',
        compensationInfo: '$440,000 – $540,000 + 1.5% Equity',
        industryRequirements: 'Enterprise AI SaaS · Cloud Infrastructure',
        leadershipExpectations: 'Lead 210 AI researchers, platform engineers, and infrastructure directors through Series D to IPO.',
        technicalResponsibilities: 'Scale multi-region LLM inference clusters, vector lakehouses, and enterprise security guardrails.',
        reqSkills: [
          'GenAI, LLMs & Machine Learning',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Kubernetes & Container Orchestration',
          'Global Engineering Org Scaling (100-500+ FTE)',
        ],
        prefSkills: ['Data Lakehouse & Real-Time Analytics', 'P&L, FinOps & CapEx/OpEx Governance'],
      },
      {
        jobTitle: 'Chief Digital Officer (CDO)',
        company: 'Aurum Omni-Commerce Group',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Digital Officer (CDO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 18,
        location: 'London, UK',
        compensationInfo: '£340,000 – £420,000 + Bonus',
        industryRequirements: 'Retail & E-Commerce · Consumer Digital Platforms',
        leadershipExpectations: 'Own £150M digital transformation portfolio and 300-person digital product & engineering org.',
        technicalResponsibilities: 'Deliver composable commerce microservices, real-time customer data platform (CDP), and AI personalization.',
        reqSkills: [
          'Product-Led Growth & SaaS Multi-Tenancy',
          'Enterprise Architecture & TOGAF',
          'Data Lakehouse & Real-Time Analytics',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        prefSkills: ['Global Engineering Org Scaling (100-500+ FTE)', 'GenAI, LLMs & Machine Learning'],
      },
      {
        jobTitle: 'Group Chief Technology Officer',
        company: 'Meridian Private Equity Portfolio',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Technology Officer (CTO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 20,
        location: 'Boston, MA',
        compensationInfo: '$460,000 – $580,000 + Carry/Equity',
        industryRequirements: 'Private Equity B2B Software · M&A Roll-ups',
        leadershipExpectations: 'Lead post-merger technical integration across 6 acquired B2B SaaS subsidiaries (450+ engineers).',
        technicalResponsibilities: 'Harmonize cloud architectures, consolidate AWS/Azure contracts, and institute unified DevSecOps & DORA governance.',
        reqSkills: [
          'M&A Technical Due Diligence & Integration',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Enterprise Architecture & TOGAF',
          'Cloud Native Architecture (AWS/GCP/Azure)',
        ],
        prefSkills: ['Global Engineering Org Scaling (100-500+ FTE)', 'Zero-Trust Cybersecurity & Compliance'],
      },
      {
        jobTitle: 'Chief Information Officer – Healthcare Systems',
        company: 'Asclepius Health Network',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Information Officer (CIO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 18,
        location: 'Chicago, IL',
        compensationInfo: '$410,000 – $490,000 + Executive Bonus',
        industryRequirements: 'HealthTech · Hospital Systems · Life Sciences',
        leadershipExpectations: 'Oversee 400 IT & clinical systems professionals and $90M HIPAA/HITRUST compliant technology budget.',
        technicalResponsibilities: 'Modernize EHR interoperability, zero-trust clinical security, and cloud analytics lakehouse.',
        reqSkills: [
          'Zero-Trust Cybersecurity & Compliance',
          'Enterprise Architecture & TOGAF',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        prefSkills: ['Data Lakehouse & Real-Time Analytics'],
      },
      {
        jobTitle: 'Chief Technology Officer – InsurTech',
        company: 'ShieldGrid Underwriters',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Technology Officer (CTO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 16,
        location: 'New York, NY',
        compensationInfo: '$400,000 – $480,000 + Equity',
        industryRequirements: 'InsurTech · Financial Services · Risk SaaS',
        leadershipExpectations: 'Scale 175-person engineering & data organization and partner with CEO on Series D growth.',
        technicalResponsibilities: 'Architect real-time underwriting APIs, distributed event streaming, and automated claims AI.',
        reqSkills: [
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Data Lakehouse & Real-Time Analytics',
          'Global Engineering Org Scaling (100-500+ FTE)',
        ],
        prefSkills: ['GenAI, LLMs & Machine Learning', 'Zero-Trust Cybersecurity & Compliance'],
      },
      {
        jobTitle: 'Chief Product & Technology Officer – WealthTech',
        company: 'Solstice Sovereign Wealth',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Product and Technology Officer (CPTO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 17,
        location: 'Singapore',
        compensationInfo: 'SGD 580,000 – 720,000 + Equity',
        industryRequirements: 'WealthTech · Digital Banking · Capital Markets',
        leadershipExpectations: 'Lead 220 product & engineering staff across Singapore, London, and Zurich.',
        technicalResponsibilities: 'Deliver institutional portfolio management SaaS, multi-region cloud compliance, and quantitative analytics.',
        reqSkills: [
          'Product-Led Growth & SaaS Multi-Tenancy',
          'Distributed Systems & Microservices',
          'Zero-Trust Cybersecurity & Compliance',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        prefSkills: ['Cloud Native Architecture (AWS/GCP/Azure)', 'Data Lakehouse & Real-Time Analytics'],
      },
      {
        jobTitle: 'Chief Information Officer – Global Telecom & Cloud',
        company: 'Hyperion Fiber & Cloud',
        roleCategory: 'Executive Leadership',
        taxonomyTitle: 'Chief Information Officer (CIO)',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 19,
        location: 'Austin, TX',
        compensationInfo: '$430,000 – $510,000 + Bonus',
        industryRequirements: 'Telecommunications · Cloud Infrastructure · Enterprise IT',
        leadershipExpectations: 'Direct 500+ global IT and OSS/BSS transformation engineers.',
        technicalResponsibilities: 'Consolidate ERP/billing stacks, automate cloud network provisioning, and reduce OpEx by 25%.',
        reqSkills: [
          'Enterprise Architecture & TOGAF',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Global Engineering Org Scaling (100-500+ FTE)',
        ],
        prefSkills: ['DevSecOps & CI/CD Automation', 'Zero-Trust Cybersecurity & Compliance'],
      },

      // --- 10 ENGINEERING LEADERSHIP & INFRASTRUCTURE ROLES ---
      {
        jobTitle: 'SVP / VP of Engineering',
        company: 'ScaleFlow Enterprise SaaS',
        roleCategory: 'Engineering Leadership',
        taxonomyTitle: 'VP Engineering',
        seniorityLevel: 'SVP / VP',
        yearsOfExperience: 15,
        location: 'San Francisco, CA',
        compensationInfo: '$380,000 – $450,000 + Equity',
        industryRequirements: 'B2B SaaS · Cloud Native Platforms',
        leadershipExpectations: 'Lead 240 software engineers and 7 Directors of Engineering across 3 time zones.',
        technicalResponsibilities: 'Drive high-velocity microservices delivery, DORA metrics excellence, and 99.99% multi-tenant SLA.',
        reqSkills: [
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Global Engineering Org Scaling (100-500+ FTE)',
          'DevSecOps & CI/CD Automation',
        ],
        prefSkills: ['Product-Led Growth & SaaS Multi-Tenancy', 'Platform Engineering & Internal Developer Portal'],
      },
      {
        jobTitle: 'VP Platform Engineering & Developer Experience',
        company: 'KubeGrid Cloud Systems',
        roleCategory: 'Engineering Leadership',
        taxonomyTitle: 'VP Platform Engineering',
        seniorityLevel: 'SVP / VP',
        yearsOfExperience: 15,
        location: 'Seattle, WA / Remote',
        compensationInfo: '$370,000 – $440,000 + Equity',
        industryRequirements: 'Cloud Infrastructure · Developer Tools · SaaS',
        leadershipExpectations: 'Manage 140 platform, Kubernetes, and DevEx engineers supporting 1,200+ internal developers.',
        technicalResponsibilities: 'Own Backstage IDP, multi-region EKS/GKE fleet, FinOps unit economics, and golden CI/CD paths.',
        reqSkills: [
          'Platform Engineering & Internal Developer Portal',
          'Kubernetes & Container Orchestration',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'DevSecOps & CI/CD Automation',
        ],
        prefSkills: ['Site Reliability Engineering (SRE)', 'P&L, FinOps & CapEx/OpEx Governance'],
      },
      {
        jobTitle: 'Senior Director of Engineering – Core Payments',
        company: 'VelocityFin Ledger',
        roleCategory: 'Engineering Leadership',
        taxonomyTitle: 'Director of Engineering',
        seniorityLevel: 'Director',
        yearsOfExperience: 13,
        location: 'New York, NY',
        compensationInfo: '$330,000 – $390,000 + Bonus + Equity',
        industryRequirements: 'FinTech · Payments · Capital Markets',
        leadershipExpectations: 'Lead 90 backend and distributed systems engineers across 8 squads.',
        technicalResponsibilities: 'Own real-time settlement ledger, Kafka event mesh, and sub-10ms transaction SLAs.',
        reqSkills: [
          'Distributed Systems & Microservices',
          'Kubernetes & Container Orchestration',
          'Site Reliability Engineering (SRE)',
          'Cloud Native Architecture (AWS/GCP/Azure)',
        ],
        prefSkills: ['Zero-Trust Cybersecurity & Compliance', 'DevSecOps & CI/CD Automation'],
      },
      {
        jobTitle: 'Head of Software Engineering',
        company: 'Lumina HealthCloud',
        roleCategory: 'Engineering Leadership',
        taxonomyTitle: 'Head of Software Engineering',
        seniorityLevel: 'VP / Head',
        yearsOfExperience: 14,
        location: 'Boston, MA',
        compensationInfo: '$340,000 – $410,000 + Equity',
        industryRequirements: 'Digital Health · Enterprise SaaS',
        leadershipExpectations: 'Direct 150 full-stack, mobile, and backend engineers across US and Europe.',
        technicalResponsibilities: 'Modernize clinical SaaS platform, institute automated CI/CD compliance, and scale multi-tenant APIs.',
        reqSkills: [
          'Distributed Systems & Microservices',
          'Product-Led Growth & SaaS Multi-Tenancy',
          'DevSecOps & CI/CD Automation',
          'Global Engineering Org Scaling (100-500+ FTE)',
        ],
        prefSkills: ['Zero-Trust Cybersecurity & Compliance', 'Cloud Native Architecture (AWS/GCP/Azure)'],
      },
      {
        jobTitle: 'Head of Cloud Infrastructure',
        company: 'Stratos Sovereign Cloud',
        roleCategory: 'Infrastructure and Operations',
        taxonomyTitle: 'Head of Cloud Infrastructure',
        seniorityLevel: 'VP / Head',
        yearsOfExperience: 15,
        location: 'London, UK / Dubai, UAE',
        compensationInfo: '$350,000 – $420,000 + Bonus',
        industryRequirements: 'Cloud Infrastructure · Sovereign Banking · Telecom',
        leadershipExpectations: 'Lead 110 cloud infrastructure, network, and FinOps engineers.',
        technicalResponsibilities: 'Own multi-cloud landing zones, Terraform IaC governance, and $40M annual cloud spend optimization.',
        reqSkills: [
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Kubernetes & Container Orchestration',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Zero-Trust Cybersecurity & Compliance',
        ],
        prefSkills: ['DevSecOps & CI/CD Automation', 'Site Reliability Engineering (SRE)'],
      },
      {
        jobTitle: 'VP Site Reliability Engineering (SRE)',
        company: 'PulseStream Global Media',
        roleCategory: 'Infrastructure and Operations',
        taxonomyTitle: 'Site Reliability Engineering Leadership',
        seniorityLevel: 'SVP / VP',
        yearsOfExperience: 14,
        location: 'Miami, FL / Remote',
        compensationInfo: '$340,000 – $400,000 + Equity',
        industryRequirements: 'Hyperscale Media · Real-Time SaaS · FinTech',
        leadershipExpectations: 'Direct 85 follow-the-sun SRE and production engineering specialists.',
        technicalResponsibilities: 'Guarantee 99.999% global availability, chaos engineering, OpenTelemetry observability, and incident command.',
        reqSkills: [
          'Site Reliability Engineering (SRE)',
          'Kubernetes & Container Orchestration',
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
        ],
        prefSkills: ['DevSecOps & CI/CD Automation'],
      },
      {
        jobTitle: 'Director of DevOps & Release Automation',
        company: 'Sentinel CyberSaaS',
        roleCategory: 'Infrastructure and Operations',
        taxonomyTitle: 'Director of DevOps',
        seniorityLevel: 'Director',
        yearsOfExperience: 12,
        location: 'Austin, TX',
        compensationInfo: '$295,000 – $345,000 + Equity',
        industryRequirements: 'Cybersecurity · Enterprise SaaS',
        leadershipExpectations: 'Manage 45 DevSecOps and release automation engineers.',
        technicalResponsibilities: 'Standardize GitOps/ArgoCD pipelines, FedRAMP/SOC2 automated policy-as-code, and container security.',
        reqSkills: [
          'DevSecOps & CI/CD Automation',
          'Kubernetes & Container Orchestration',
          'Zero-Trust Cybersecurity & Compliance',
          'Cloud Native Architecture (AWS/GCP/Azure)',
        ],
        prefSkills: ['Platform Engineering & Internal Developer Portal'],
      },
      {
        jobTitle: 'Head of Platform Engineering',
        company: 'FinCore Digital Markets',
        roleCategory: 'Infrastructure and Operations',
        taxonomyTitle: 'Head of Platform Engineering',
        seniorityLevel: 'VP / Head',
        yearsOfExperience: 14,
        location: 'Chicago, IL',
        compensationInfo: '$345,000 – $410,000 + Bonus',
        industryRequirements: 'Capital Markets · FinTech · Cloud Native',
        leadershipExpectations: 'Lead 70 platform and Kubernetes infrastructure engineers.',
        technicalResponsibilities: 'Deliver paved-road developer platform, automated service mesh, and low-latency compute fabrics.',
        reqSkills: [
          'Platform Engineering & Internal Developer Portal',
          'Kubernetes & Container Orchestration',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Site Reliability Engineering (SRE)',
        ],
        prefSkills: ['Distributed Systems & Microservices', 'DevSecOps & CI/CD Automation'],
      },
      {
        jobTitle: 'VP Engineering – Enterprise Growth & PLG',
        company: 'DocuSphere AI',
        roleCategory: 'Engineering Leadership',
        taxonomyTitle: 'VP Engineering',
        seniorityLevel: 'SVP / VP',
        yearsOfExperience: 15,
        location: 'San Jose, CA',
        compensationInfo: '$375,000 – $440,000 + Equity',
        industryRequirements: 'B2B SaaS · AI Productivity Platforms',
        leadershipExpectations: 'Scale 180-person product engineering organization across 5 product lines.',
        technicalResponsibilities: 'Architect multi-tenant SaaS collaboration engine and embedded GenAI document workflows.',
        reqSkills: [
          'Product-Led Growth & SaaS Multi-Tenancy',
          'Distributed Systems & Microservices',
          'Global Engineering Org Scaling (100-500+ FTE)',
          'Cloud Native Architecture (AWS/GCP/Azure)',
        ],
        prefSkills: ['GenAI, LLMs & Machine Learning', 'DevSecOps & CI/CD Automation'],
      },
      {
        jobTitle: 'Senior Engineering Manager – Core Cloud Services',
        company: 'NimbusGrid Compute',
        roleCategory: 'Engineering Leadership',
        taxonomyTitle: 'Engineering Manager',
        seniorityLevel: 'Senior Manager / Director',
        yearsOfExperience: 11,
        location: 'Bellevue, WA',
        compensationInfo: '$275,000 – $320,000 + Equity',
        industryRequirements: 'Cloud Computing · Distributed Systems',
        leadershipExpectations: 'Lead 35 senior distributed systems engineers across 3 squads.',
        technicalResponsibilities: 'Own control-plane APIs, Kubernetes operator lifecycle, and multi-AZ resilience.',
        reqSkills: [
          'Distributed Systems & Microservices',
          'Kubernetes & Container Orchestration',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'DevSecOps & CI/CD Automation',
        ],
        prefSkills: ['Site Reliability Engineering (SRE)'],
      },

      // --- 10 DATA, AI & ARCHITECTURE ROLES ---
      {
        jobTitle: 'VP Data & Enterprise AI',
        company: 'OmniSight Analytics Cloud',
        roleCategory: 'Data and Analytics',
        taxonomyTitle: 'VP Data',
        seniorityLevel: 'SVP / VP',
        yearsOfExperience: 16,
        location: 'New York, NY',
        compensationInfo: '$390,000 – $470,000 + Equity',
        industryRequirements: 'Enterprise SaaS · Financial Data · AI Analytics',
        leadershipExpectations: 'Lead 160 data engineers, ML scientists, and analytics directors with $36M data cloud budget.',
        technicalResponsibilities: 'Own Snowflake/Databricks lakehouse, real-time Kafka streaming, and commercial GenAI copilot products.',
        reqSkills: [
          'Data Lakehouse & Real-Time Analytics',
          'GenAI, LLMs & Machine Learning',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        prefSkills: ['Global Engineering Org Scaling (100-500+ FTE)', 'Zero-Trust Cybersecurity & Compliance'],
      },
      {
        jobTitle: 'Chief Analytics Officer (CAO)',
        company: 'Apex Global Reinsurance',
        roleCategory: 'Data and Analytics',
        taxonomyTitle: 'Chief Analytics Officer',
        seniorityLevel: 'C-Suite',
        yearsOfExperience: 18,
        location: 'New York, NY / Hartford, CT',
        compensationInfo: '$430,000 – $520,000 + Executive Bonus',
        industryRequirements: 'Insurance · Financial Services · Risk Modeling',
        leadershipExpectations: 'Direct 140 actuaries, data scientists, and AI governance leaders reporting to the CEO.',
        technicalResponsibilities: 'Monetize enterprise risk lakehouse, deploy predictive underwriting ML, and enforce regulatory AI compliance.',
        reqSkills: [
          'Data Lakehouse & Real-Time Analytics',
          'GenAI, LLMs & Machine Learning',
          'P&L, FinOps & CapEx/OpEx Governance',
          'Zero-Trust Cybersecurity & Compliance',
        ],
        prefSkills: ['M&A Technical Due Diligence & Integration'],
      },
      {
        jobTitle: 'Director of Data Science & Applied GenAI',
        company: 'CortexSearch Enterprise',
        roleCategory: 'Data and Analytics',
        taxonomyTitle: 'Director of Data Science',
        seniorityLevel: 'Director',
        yearsOfExperience: 12,
        location: 'Palo Alto, CA',
        compensationInfo: '$340,000 – $410,000 + Equity',
        industryRequirements: 'AI-First SaaS · Enterprise Search & Knowledge Graph',
        leadershipExpectations: 'Lead 50 applied ML scientists and LLM infrastructure engineers.',
        technicalResponsibilities: 'Architect multi-agent RAG pipelines, custom embedding fine-tuning, and hallucination evaluation guardrails.',
        reqSkills: [
          'GenAI, LLMs & Machine Learning',
          'Data Lakehouse & Real-Time Analytics',
          'Cloud Native Architecture (AWS/GCP/Azure)',
        ],
        prefSkills: ['Product-Led Growth & SaaS Multi-Tenancy', 'Distributed Systems & Microservices'],
      },
      {
        jobTitle: 'Head of Data Engineering',
        company: 'Chronos Capital Telemetry',
        roleCategory: 'Data and Analytics',
        taxonomyTitle: 'Head of Data Engineering',
        seniorityLevel: 'VP / Head',
        yearsOfExperience: 14,
        location: 'San Jose, CA',
        compensationInfo: '$350,000 – $420,000 + Equity',
        industryRequirements: 'FinTech · Cybersecurity · Real-Time Data',
        leadershipExpectations: 'Manage 95 data platform and streaming engineers.',
        technicalResponsibilities: 'Scale 15PB+ Apache Iceberg / Databricks lakehouse, real-time Kafka pipelines, and FinOps cost governance.',
        reqSkills: [
          'Data Lakehouse & Real-Time Analytics',
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        prefSkills: ['GenAI, LLMs & Machine Learning'],
      },
      {
        jobTitle: 'VP & Principal Enterprise Architect',
        company: 'GlobalPillar Pharma & BioTech',
        roleCategory: 'Architecture',
        taxonomyTitle: 'Enterprise Architect',
        seniorityLevel: 'VP / Principal',
        yearsOfExperience: 18,
        location: 'Boston, MA',
        compensationInfo: '$360,000 – $430,000 + Bonus',
        industryRequirements: 'Life Sciences · Pharma · Global Enterprise IT',
        leadershipExpectations: 'Chair Global Architecture Review Board across 50+ domain architects and $200M IT portfolio.',
        technicalResponsibilities: 'Define TOGAF target-state blueprints, legacy application rationalization, and post-M&A cloud harmonization.',
        reqSkills: [
          'Enterprise Architecture & TOGAF',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Zero-Trust Cybersecurity & Compliance',
          'M&A Technical Due Diligence & Integration',
        ],
        prefSkills: ['Data Lakehouse & Real-Time Analytics', 'P&L, FinOps & CapEx/OpEx Governance'],
      },
      {
        jobTitle: 'Chief Cloud Architect',
        company: 'SovereignPay EMEA',
        roleCategory: 'Architecture',
        taxonomyTitle: 'Cloud Architect',
        seniorityLevel: 'VP / Principal',
        yearsOfExperience: 15,
        location: 'London, UK / Dubai, UAE',
        compensationInfo: '£290,000 – £350,000 + Bonus',
        industryRequirements: 'Digital Banking · Sovereign Cloud · FinTech',
        leadershipExpectations: 'Lead 45 principal cloud & security architects across EMEA.',
        technicalResponsibilities: 'Design multi-cloud active-active landing zones (AWS/GCP/Azure), zero-trust IAM, and Kubernetes service mesh.',
        reqSkills: [
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Kubernetes & Container Orchestration',
          'Zero-Trust Cybersecurity & Compliance',
          'Enterprise Architecture & TOGAF',
        ],
        prefSkills: ['DevSecOps & CI/CD Automation', 'Site Reliability Engineering (SRE)'],
      },
      {
        jobTitle: 'Principal Technical Architect – Distributed Ledger',
        company: 'ApexClear Markets',
        roleCategory: 'Architecture',
        taxonomyTitle: 'Technical Architect',
        seniorityLevel: 'Principal / Director',
        yearsOfExperience: 14,
        location: 'Chicago, IL / New York, NY',
        compensationInfo: '$330,000 – $395,000 + Bonus',
        industryRequirements: 'Capital Markets · Clearing & Settlement · FinTech',
        leadershipExpectations: 'Guide technical architecture across 12 core engineering squads.',
        technicalResponsibilities: 'Own ultra-low-latency distributed consensus, database sharding, and active-active resilience.',
        reqSkills: [
          'Distributed Systems & Microservices',
          'Kubernetes & Container Orchestration',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Site Reliability Engineering (SRE)',
        ],
        prefSkills: ['Data Lakehouse & Real-Time Analytics'],
      },
      {
        jobTitle: 'Global Head of Solution Architecture',
        company: 'CloudVantage Enterprise',
        roleCategory: 'Architecture',
        taxonomyTitle: 'Solution Architect',
        seniorityLevel: 'Principal / Director',
        yearsOfExperience: 14,
        location: 'San Francisco, CA',
        compensationInfo: '$320,000 – $380,000 + Bonus',
        industryRequirements: 'Enterprise Cloud SaaS · System Integration',
        leadershipExpectations: 'Manage 60 customer-facing and enterprise solution architects globally.',
        technicalResponsibilities: 'Own Fortune 500 reference architectures, security compliance validation, and strategic cloud migrations.',
        reqSkills: [
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'Enterprise Architecture & TOGAF',
          'Distributed Systems & Microservices',
          'Zero-Trust Cybersecurity & Compliance',
        ],
        prefSkills: ['Product-Led Growth & SaaS Multi-Tenancy'],
      },
      {
        jobTitle: 'VP Architecture & Platform Modernization',
        company: 'Heritage Financial Holdings',
        roleCategory: 'Architecture',
        taxonomyTitle: 'Enterprise Architect',
        seniorityLevel: 'SVP / VP',
        yearsOfExperience: 17,
        location: 'New York, NY',
        compensationInfo: '$375,000 – $445,000 + Bonus',
        industryRequirements: 'Banking · Wealth Management · Insurance',
        leadershipExpectations: 'Lead 55 enterprise and domain architects driving core modernization.',
        technicalResponsibilities: 'Strangle legacy monoliths into event-driven cloud microservices and establish FinOps & API governance.',
        reqSkills: [
          'Enterprise Architecture & TOGAF',
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
          'P&L, FinOps & CapEx/OpEx Governance',
        ],
        prefSkills: ['Zero-Trust Cybersecurity & Compliance', 'M&A Technical Due Diligence & Integration'],
      },
      {
        jobTitle: 'VP Data Platform & Real-Time Personalization',
        company: 'Veloce Global Commerce',
        roleCategory: 'Data and Analytics',
        taxonomyTitle: 'VP Data',
        seniorityLevel: 'SVP / VP',
        yearsOfExperience: 15,
        location: 'Seattle, WA',
        compensationInfo: '$365,000 – $435,000 + Equity',
        industryRequirements: 'E-Commerce · Marketplace Platforms · Consumer AI',
        leadershipExpectations: 'Lead 115 data engineers, ML platform specialists, and BI leads.',
        technicalResponsibilities: 'Own real-time streaming feature stores, LLM shopping assistant infrastructure, and petabyte data mesh.',
        reqSkills: [
          'Data Lakehouse & Real-Time Analytics',
          'GenAI, LLMs & Machine Learning',
          'Distributed Systems & Microservices',
          'Cloud Native Architecture (AWS/GCP/Azure)',
        ],
        prefSkills: ['Product-Led Growth & SaaS Multi-Tenancy', 'P&L, FinOps & CapEx/OpEx Governance'],
      },
    ];

    const insertedJobs: {
      id: number;
      seed: (typeof jobsSeed)[0];
    }[] = [];

    for (const j of jobsSeed) {
      const taxId = roleMap.get(j.taxonomyTitle) ?? null;
      const rawDesc = `[SYNTHETIC EXECUTIVE MANDATE]\nRole: ${j.jobTitle} | Company: ${j.company} | Location: ${j.location}\nCategory: ${j.roleCategory} | Seniority: ${j.seniorityLevel} (${j.yearsOfExperience}+ yrs)\nCompensation: ${j.compensationInfo}\n\nLEADERSHIP EXPECTATIONS\n${j.leadershipExpectations}\n\nTECHNICAL RESPONSIBILITIES\n${j.technicalResponsibilities}\n\nINDUSTRY REQUIREMENTS\n${j.industryRequirements}\n\nREQUIRED COMPETENCIES\n${j.reqSkills.join(' · ')}\n\nPREFERRED COMPETENCIES\n${j.prefSkills.join(' · ')}`;

      const [jobRow] = await db
        .insert(jobDescriptions)
        .values({
          jobTitle: j.jobTitle,
          company: j.company,
          roleCategory: j.roleCategory,
          taxonomyRoleId: taxId,
          seniorityLevel: j.seniorityLevel,
          yearsOfExperience: j.yearsOfExperience,
          leadershipExpectations: j.leadershipExpectations,
          industryRequirements: j.industryRequirements,
          technicalResponsibilities: j.technicalResponsibilities,
          location: j.location,
          compensationInfo: j.compensationInfo,
          rawDescription: rawDesc,
          isSynthetic: true,
        })
        .returning();

      insertedJobs.push({ id: jobRow.id, seed: j });

      const reqRows = [
        ...j.reqSkills.map((sk) => ({
          jobId: jobRow.id,
          skillName: sk,
          requirementType: 'Required',
          weightImportance: 15,
        })),
        ...j.prefSkills.map((sk) => ({
          jobId: jobRow.id,
          skillName: sk,
          requirementType: 'Preferred',
          weightImportance: 8,
        })),
      ];
      await db.insert(jobRequirements).values(reqRows);
    }

    // 5. Generate Realistic Candidate-Job Matches & Skills Gap Analyses (Strong, Moderate, and Weak Scenarios)
    const matchPairs: { candIdx: number; jobIdx: number }[] = [
      { candIdx: 0, jobIdx: 0 }, // Vikramaditya Rao (CTO) -> AetherPay CTO (Strong)
      { candIdx: 0, jobIdx: 5 }, // Vikramaditya Rao -> Meridian PE Group CTO (Strong)
      { candIdx: 0, jobIdx: 11 }, // Vikramaditya Rao -> KubeGrid VP Platform (Strong)
      { candIdx: 1, jobIdx: 3 }, // Dr. Eleanor Sterling (CDO) -> Synthetix CTO AI (Strong)
      { candIdx: 1, jobIdx: 20 }, // Dr. Eleanor Sterling -> OmniSight VP Data (Strong)
      { candIdx: 1, jobIdx: 21 }, // Dr. Eleanor Sterling -> Apex CAO (Strong)
      { candIdx: 2, jobIdx: 1 }, // Marcus Thorne (CIO) -> Vanguard Bancorp CIO (Strong)
      { candIdx: 2, jobIdx: 6 }, // Marcus Thorne -> Asclepius Healthcare CIO (Moderate)
      { candIdx: 3, jobIdx: 10 }, // Sophia Chen-Lindqvist (VP Eng) -> ScaleFlow SVP/VP Eng (Strong)
      { candIdx: 3, jobIdx: 18 }, // Sophia Chen-Lindqvist -> DocuSphere VP Eng (Strong)
      { candIdx: 4, jobIdx: 11 }, // Mateo Alvarez (VP Platform) -> KubeGrid VP Platform (Strong)
      { candIdx: 4, jobIdx: 15 }, // Mateo Alvarez -> PulseStream VP SRE (Strong)
      { candIdx: 5, jobIdx: 2 }, // Ananya Deshmukh (CPTO) -> NexusWork CPTO (Strong)
      { candIdx: 5, jobIdx: 8 }, // Ananya Deshmukh -> Solstice WealthTech CPTO (Strong)
      { candIdx: 6, jobIdx: 14 }, // Henrik Lindholm -> GlobalPillar Principal Enterprise Architect (Strong)
      { candIdx: 6, jobIdx: 28 }, // Henrik Lindholm -> Heritage Financial VP Architecture (Strong)
      { candIdx: 7, jobIdx: 12 }, // Devon Brooks-Kerr -> VelocityFin Senior Director Eng (Strong)
      { candIdx: 7, jobIdx: 0 }, // Devon Brooks-Kerr (Director, 14y) -> AetherPay CTO (18y) (Stretch/Weak seniority match)
      { candIdx: 8, jobIdx: 25 }, // Nadia Al-Mansoor -> SovereignPay Chief Cloud Architect (Strong)
      { candIdx: 8, jobIdx: 14 }, // Nadia Al-Mansoor -> Stratos Head of Cloud Infra (Strong)
      { candIdx: 9, jobIdx: 23 }, // Dr. Kenji Takahashi -> Chronos Head of Data Eng (Strong)
      { candIdx: 9, jobIdx: 29 }, // Dr. Kenji Takahashi -> Veloce VP Data Platform (Strong)
      { candIdx: 10, jobIdx: 13 }, // Claire Beaumont -> Lumina Head of Software Eng (Strong)
      { candIdx: 11, jobIdx: 15 }, // Rafael Morales -> PulseStream VP SRE (Strong)
      { candIdx: 12, jobIdx: 22 }, // Priya Narayanan -> CortexSearch Director Data Science (Strong)
      { candIdx: 12, jobIdx: 1 }, // Priya Narayanan (Data Science, 13y) -> Vanguard CIO (20y) (Weak/Cross-domain scenario)
      { candIdx: 13, jobIdx: 4 }, // Alistair MacLeod -> Aurum CDO (Strong)
      { candIdx: 14, jobIdx: 21 }, // Jordan Vance-Moreau -> Apex CAO (Strong)
    ];

    for (const pair of matchPairs) {
      const candObj = insertedCandidates[pair.candIdx];
      const jobObj = insertedJobs[pair.jobIdx];
      if (!candObj || !jobObj) continue;

      const c = candObj.seed;
      const j = jobObj.seed;

      const matchedReq = j.reqSkills.filter((sk) => c.skills.includes(sk));
      const missingReq = j.reqSkills.filter((sk) => !c.skills.includes(sk));
      const missingPref = j.prefSkills.filter((sk) => !c.skills.includes(sk));

      const techScore = Math.min(98, Math.max(55, Math.round(62 + (matchedReq.length / Math.max(1, j.reqSkills.length)) * 35)));
      const expDelta = c.totalYearsExperience - j.yearsOfExperience;
      const seniorityScore = expDelta >= 2 ? 95 : expDelta >= 0 ? 89 : expDelta >= -2 ? 76 : 61;
      const leadershipScore = c.totalYearsExperience >= 17 ? 93 : 81;
      const domainScore = matchedReq.length >= 3 ? 92 : 68;
      const industryScore = matchedReq.length >= 3 ? 89 : 71;
      const progressionScore = 91;
      const qualificationScore = c.certs.length >= 2 ? 95 : 85;

      const overallScore = Math.round(
        techScore * 0.25 +
          leadershipScore * 0.2 +
          seniorityScore * 0.15 +
          domainScore * 0.15 +
          industryScore * 0.1 +
          progressionScore * 0.1 +
          qualificationScore * 0.05
      );

      const confidenceTier =
        overallScore >= 82
          ? 'High Confidence'
          : overallScore >= 72
          ? 'Strong Contender'
          : 'Exploratory / Gap Mitigation Needed';

      const [mRow] = await db
        .insert(matchResults)
        .values({
          candidateId: candObj.id,
          jobId: jobObj.id,
          overallScore,
          technicalScore: techScore,
          leadershipScore,
          seniorityScore,
          domainScore,
          industryScore,
          progressionScore,
          qualificationScore,
          confidenceTier,
          scoringMode: 'Hybrid Semantic + Rule Engine (25/20/15/15/10/10/5)',
        })
        .returning();

      await db.insert(matchExplanations).values({
        matchId: mRow.id,
        matchingSkills: matchedReq.length > 0 ? matchedReq.join(' · ') : c.skills.slice(0, 3).join(' · '),
        relevantLeadership: c.leadershipExperience,
        matchingIndustry: c.industryExperience,
        missingQualifications:
          missingReq.length > 0
            ? missingReq.join(' · ')
            : missingPref.length > 0
            ? `Preferred: ${missingPref.join(' · ')}`
            : 'All core mandatory competencies verified',
        potentialConcerns:
          missingReq.length > 0
            ? `Requires validation on: ${missingReq.join(', ')}.`
            : expDelta < 0
            ? `Candidate has ${c.totalYearsExperience} yrs vs ${j.yearsOfExperience} yrs target benchmark.`
            : 'Align executive equity vesting and hybrid location cadence.',
        recommendationRationale: `${c.fullName} scores ${overallScore}% (${confidenceTier}) for ${j.jobTitle} at ${j.company}, driven by ${techScore}% technical alignment and ${leadershipScore}% executive leadership scale.`,
      });

      await db.insert(skillsGapAnalysis).values({
        matchId: mRow.id,
        candidateId: candObj.id,
        jobId: jobObj.id,
        demonstratedSkills: matchedReq.length > 0 ? matchedReq.join(' · ') : c.skills.slice(0, 3).join(' · '),
        missingRequiredSkills:
          missingReq.length > 0 ? missingReq.join(' · ') : 'None — All core required skills demonstrated',
        unmentionedProbableSkills:
          'Board Audit Committee Reporting · Vendor FinOps Consolidation · Post-Merger Cloud Harmonization',
        missingPreferredSkills:
          missingPref.length > 0 ? missingPref.join(' · ') : 'Vertical-Specific Regulatory Certifications',
        leadershipGaps:
          seniorityScore >= 85
            ? 'No material leadership scale gaps identified.'
            : `Emphasize multi-layer Director/VP management and direct P&L authority for ${j.company}.`,
        industryGaps:
          industryScore >= 82
            ? 'Direct industry alignment verified.'
            : `Frame transferable high-availability and regulatory governance experience toward ${j.industryRequirements}.`,
        clarificationAreas: `Confirm exact R&D budget size, direct headcount reporting lines, and depth in ${missingReq[0] || j.roleCategory}.`,
        positioningImprovementPlan: `1. Add a tailored executive summary headline for ${j.jobTitle} at ${j.company}.\n2. Explicitly surface probable unmentioned skills (Board reporting, FinOps ROI) in the top role.\n3. Prepare a 100-day architecture & org scaling thesis.`,
      });
    }

    // 6. Seed AI & Deterministic Evaluation Logs
    await db.insert(evaluationLogs).values([
      {
        operationType: 'Resume Intelligence Batch Parse',
        modelUsed: 'gemini-3.8-flash + Deterministic NLP Validator',
        fallbackTriggered: false,
        latencyMs: 310,
        inputSummary: 'Parsed 15 synthetic executive resumes (CTO, CIO, CDO, CPTO, VP Eng, Enterprise Architect)',
        outputMetadata: 'Avg Extraction Confidence: 95.1% | 100% Schema Validation Pass',
      },
      {
        operationType: 'Job Description Taxonomy Classification',
        modelUsed: 'TalentIQ Role Classifier v2.4 (21 Roles / 5 Categories)',
        fallbackTriggered: false,
        latencyMs: 145,
        inputSummary: 'Classified 30 executive job descriptions into 5 technology leadership categories',
        outputMetadata: '10 CTO/CIO, 10 Eng/Infra Leadership, 10 Data & Architecture mandates indexed',
      },
      {
        operationType: 'Hybrid Candidate-Job Matching Matrix',
        modelUsed: 'Hybrid Semantic + Weighted Rule Scorer (25/20/15/15/10/10/5)',
        fallbackTriggered: false,
        latencyMs: 185,
        inputSummary: 'Computed 28 explainable executive candidate-job matches & skills gap analyses',
        outputMetadata: 'High-Confidence Matches (>=82%): 23 | Stretch/Exploratory Matches: 5',
      },
    ]);

    console.log('TalentIQ Enterprise Seed Complete.');
  } catch (error) {
    console.error('Error seeding TalentIQ data:', error);
  }
}
