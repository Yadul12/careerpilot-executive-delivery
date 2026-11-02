import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  switchUserRole,
  getAllTeamMembers,
  getDashboardAnalytics,
  getClientsDirectory,
  createExecutiveClient,
  updateClientResumeRecord,
  getPipelineData,
  createJobOpportunityRecord,
  updateOpportunityAndApplicationStatus,
  getOutreachCrmData,
  createOutreachRecord,
  updateOutreachStatusRecord,
  getInterviewsData,
  createInterviewRecordEntry,
  updateInterviewRecordEntry,
  getClientDeliveryData,
  createDeliveryTask,
  updateDeliveryTaskStatus,
  createClientDeliverable,
  updateDeliverableApprovalStatus,
  getClientReportsData,
  generateClientWeeklyReportRecord,
} from './src/db/repository.ts';
import {
  getTalentIQDashboardAnalytics,
  getTalentIQCandidates,
  createAndParseCandidateResume,
  updateCandidateIntelligenceProfile,
  reprocessCandidateResume,
  getTechnologyRolesTaxonomy,
  createTechnologyRole,
  getTalentIQJobDescriptions,
  createAndAnalyseJobDescription,
  updateJobDescriptionRecord,
  getTalentIQMatches,
  runCandidateJobMatch,
  getMatchingWeights,
  updateMatchingWeightsAndRecalculate,
  getEvaluationLogs,
} from './src/db/talentiq_repository.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // 1. Auth & User Profile Sync
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'executive@talentiq.io';
      const name = req.user!.name || email.split('@')[0];
      const userRecord = await getOrCreateUser(uid, email, name);
      const team = await getAllTeamMembers();
      res.json({ user: userRecord, team });
    } catch (error: any) {
      console.error('Error in /api/auth/me:', error);
      res.status(500).json({ error: error.message || 'Failed to load user session' });
    }
  });

  // Switch active RBAC role for testing/operating across enterprise roles
  app.patch('/api/auth/role', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { roleName } = req.body;
      const allowedRoles = [
        'Administrator',
        'Recruitment Analyst',
        'Delivery Manager',
        'Client Delivery Owner',
        'Research Associate',
        'Client',
      ];
      if (!allowedRoles.includes(roleName)) {
        return res.status(400).json({ error: 'Invalid role selected' });
      }
      const updated = await switchUserRole(req.user!.uid, roleName);
      res.json({ user: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/auth/role:', error);
      res.status(500).json({ error: error.message || 'Failed to switch role' });
    }
  });

  // 2. Executive Dashboard Analytics (All metrics dynamically computed from PostgreSQL)
  app.get('/api/dashboard', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const data = await getDashboardAnalytics();
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/dashboard:', error);
      res.status(500).json({ error: error.message || 'Failed to load dashboard metrics' });
    }
  });

  // 3. Client Onboarding & Profile Management
  app.get('/api/clients', requireAuth, async (req: AuthRequest, res) => {
    try {
      const allClients = await getClientsDirectory();
      const search = String(req.query.search || '').toLowerCase();
      const status = String(req.query.status || '');
      const filtered = allClients.filter((c) => {
        const matchesSearch =
          !search ||
          c.fullName.toLowerCase().includes(search) ||
          c.currentDesignation.toLowerCase().includes(search) ||
          c.currentEmployer.toLowerCase().includes(search) ||
          (c.profile?.technologySpecialisation || '').toLowerCase().includes(search);
        const matchesStatus = !status || status === 'All' || c.status === status;
        return matchesSearch && matchesStatus;
      });
      res.json({ clients: filtered, total: filtered.length });
    } catch (error: any) {
      console.error('Error in GET /api/clients:', error);
      res.status(500).json({ error: error.message || 'Failed to load clients' });
    }
  });

  app.post('/api/clients', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { fullName, email, currentDesignation, currentEmployer } = req.body;
      if (!fullName || !email || !currentDesignation || !currentEmployer) {
        return res.status(400).json({
          error: 'Full name, email, current designation, and current employer are required.',
        });
      }

      if (req.body.resumeFilename) {
        const fname = String(req.body.resumeFilename).toLowerCase();
        if (!fname.endsWith('.pdf') && !fname.endsWith('.docx') && !fname.endsWith('.doc')) {
          return res.status(400).json({
            error: 'Invalid resume format. Only PDF and DOCX files are permitted.',
          });
        }
      }

      const created = await createExecutiveClient({
        ...req.body,
        actorName: req.user?.name || req.user?.email || 'Operations Manager',
      });
      res.status(201).json({ client: created });
    } catch (error: any) {
      console.error('Error in POST /api/clients:', error);
      res.status(500).json({ error: error.message || 'Failed to onboard client' });
    }
  });

  app.post('/api/clients/:id/resume', requireAuth, async (req: AuthRequest, res) => {
    try {
      const clientId = Number(req.params.id);
      const { filename, fileType, fileSize } = req.body;
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }
      const lower = String(filename).toLowerCase();
      if (!lower.endsWith('.pdf') && !lower.endsWith('.docx') && !lower.endsWith('.doc')) {
        return res.status(400).json({
          error: 'Validation failed: Resume must be in PDF (.pdf) or Word (.docx) format.',
        });
      }
      if (Number(fileSize) > 10 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Validation failed: Resume file size must not exceed 10 MB.',
        });
      }

      const updatedProfile = await updateClientResumeRecord(clientId, {
        filename,
        fileType: fileType || (lower.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        fileSize: Number(fileSize) || 350000,
        actorName: req.user?.name || req.user?.email || 'Client Delivery Owner',
      });

      res.json({ profile: updatedProfile });
    } catch (error: any) {
      console.error('Error in POST /api/clients/:id/resume:', error);
      res.status(500).json({ error: error.message || 'Failed to upload resume' });
    }
  });

  // 4. Job Search Pipeline & Applications (Kanban + Paginated Searchable Table)
  app.get('/api/pipeline', requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await getPipelineData();
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 50));
      const clientId = req.query.clientId ? Number(req.query.clientId) : null;
      const status = req.query.status ? String(req.query.status) : null;
      const search = String(req.query.search || '').toLowerCase();

      let filteredOpps = data.opportunities;
      if (clientId) {
        filteredOpps = filteredOpps.filter((o) => o.clientId === clientId);
      }
      if (status && status !== 'All') {
        filteredOpps = filteredOpps.filter((o) => o.status === status);
      }
      if (search) {
        filteredOpps = filteredOpps.filter(
          (o) =>
            o.company.toLowerCase().includes(search) ||
            o.designation.toLowerCase().includes(search) ||
            o.technologySpecialisation.toLowerCase().includes(search) ||
            o.clientName.toLowerCase().includes(search) ||
            o.location.toLowerCase().includes(search)
        );
      }

      const totalCount = filteredOpps.length;
      const paginatedOpps = filteredOpps.slice((page - 1) * pageSize, page * pageSize);

      res.json({
        opportunities: filteredOpps,
        paginatedOpportunities: paginatedOpps,
        applications: data.applications,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
        },
      });
    } catch (error: any) {
      console.error('Error in GET /api/pipeline:', error);
      res.status(500).json({ error: error.message || 'Failed to load job search pipeline' });
    }
  });

  app.post('/api/opportunities', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { clientId, company, designation, technologySpecialisation } = req.body;
      if (!clientId || !company || !designation || !technologySpecialisation) {
        return res.status(400).json({
          error: 'Client, company, designation, and technology specialisation are required.',
        });
      }
      const created = await createJobOpportunityRecord({
        ...req.body,
        actorName: req.user?.name || req.user?.email || 'Research Associate',
      });
      res.status(201).json({ opportunity: created });
    } catch (error: any) {
      console.error('Error in POST /api/opportunities:', error);
      res.status(500).json({ error: error.message || 'Failed to create opportunity' });
    }
  });

  app.patch('/api/opportunities/:id/status', requireAuth, async (req: AuthRequest, res) => {
    try {
      const oppId = Number(req.params.id);
      const { status, notes } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Target status is required' });
      }
      const updated = await updateOpportunityAndApplicationStatus(
        oppId,
        status,
        notes,
        req.user?.name || req.user?.email || 'Client Delivery Owner'
      );
      res.json({ opportunity: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/opportunities/:id/status:', error);
      res.status(500).json({ error: error.message || 'Failed to update opportunity status' });
    }
  });

  // 5. Hiring Manager Outreach CRM
  app.get('/api/outreach', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const data = await getOutreachCrmData();
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/outreach:', error);
      res.status(500).json({ error: error.message || 'Failed to load outreach CRM' });
    }
  });

  app.post('/api/outreach', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { contactName, company, clientId, messageSubject } = req.body;
      if (!contactName || !company || !clientId || !messageSubject) {
        return res.status(400).json({
          error: 'Contact name, company, client, and message subject are required.',
        });
      }
      const created = await createOutreachRecord({
        ...req.body,
        actorName: req.user?.name || req.user?.email || 'Client Delivery Owner',
      });
      res.status(201).json({ activity: created });
    } catch (error: any) {
      console.error('Error in POST /api/outreach:', error);
      res.status(500).json({ error: error.message || 'Failed to log outreach activity' });
    }
  });

  app.patch('/api/outreach/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const activityId = Number(req.params.id);
      const updated = await updateOutreachStatusRecord(activityId, {
        ...req.body,
        actorName: req.user?.name || req.user?.email || 'Client Delivery Owner',
      });
      res.json({ activity: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/outreach/:id:', error);
      res.status(500).json({ error: error.message || 'Failed to update outreach status' });
    }
  });

  // 6. Interview Tracking
  app.get('/api/interviews', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const interviews = await getInterviewsData();
      res.json({ interviews });
    } catch (error: any) {
      console.error('Error in GET /api/interviews:', error);
      res.status(500).json({ error: error.message || 'Failed to load interviews' });
    }
  });

  app.post('/api/interviews', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { clientId, company, roleTitle, stageName, interviewerName } = req.body;
      if (!clientId || !company || !roleTitle || !stageName || !interviewerName) {
        return res.status(400).json({
          error: 'Client, company, role title, stage, and interviewer name are required.',
        });
      }
      const created = await createInterviewRecordEntry({
        ...req.body,
        actorName: req.user?.name || req.user?.email || 'Client Delivery Owner',
      });
      res.status(201).json({ interview: created });
    } catch (error: any) {
      console.error('Error in POST /api/interviews:', error);
      res.status(500).json({ error: error.message || 'Failed to schedule interview' });
    }
  });

  app.patch('/api/interviews/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const interviewId = Number(req.params.id);
      const updated = await updateInterviewRecordEntry(interviewId, {
        ...req.body,
        actorName: req.user?.name || req.user?.email || 'Client Delivery Owner',
      });
      res.json({ interview: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/interviews/:id:', error);
      res.status(500).json({ error: error.message || 'Failed to update interview' });
    }
  });

  // 7. Client Delivery Management (Tasks, Deliverables, Approvals, Activity Timeline)
  app.get('/api/delivery', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const data = await getClientDeliveryData();
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/delivery:', error);
      res.status(500).json({ error: error.message || 'Failed to load client delivery data' });
    }
  });

  app.post('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { clientId, title, dueDate } = req.body;
      if (!clientId || !title || !dueDate) {
        return res.status(400).json({ error: 'Client, task title, and due date are required.' });
      }
      const created = await createDeliveryTask({
        ...req.body,
        actorName: req.user?.name || req.user?.email || 'Client Delivery Owner',
      });
      res.status(201).json({ task: created });
    } catch (error: any) {
      console.error('Error in POST /api/tasks:', error);
      res.status(500).json({ error: error.message || 'Failed to create task' });
    }
  });

  app.patch('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const taskId = Number(req.params.id);
      const { status, internalNotes } = req.body;
      const updated = await updateDeliveryTaskStatus(
        taskId,
        status,
        internalNotes,
        req.user?.name || req.user?.email || 'Client Delivery Owner'
      );
      res.json({ task: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/tasks/:id:', error);
      res.status(500).json({ error: error.message || 'Failed to update task' });
    }
  });

  app.post('/api/deliverables', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { clientId, title, deliverableType, dueDate } = req.body;
      if (!clientId || !title || !deliverableType || !dueDate) {
        return res.status(400).json({
          error: 'Client, deliverable title, type, and due date are required.',
        });
      }
      const created = await createClientDeliverable({
        ...req.body,
        actorName: req.user?.name || req.user?.email || 'Client Delivery Owner',
      });
      res.status(201).json({ deliverable: created });
    } catch (error: any) {
      console.error('Error in POST /api/deliverables:', error);
      res.status(500).json({ error: error.message || 'Failed to create deliverable' });
    }
  });

  app.patch('/api/deliverables/:id/approval', requireAuth, async (req: AuthRequest, res) => {
    try {
      const deliverableId = Number(req.params.id);
      const { clientApprovalStatus } = req.body;
      const updated = await updateDeliverableApprovalStatus(
        deliverableId,
        clientApprovalStatus,
        req.user?.name || req.user?.email || 'Executive Client'
      );
      res.json({ deliverable: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/deliverables/:id/approval:', error);
      res.status(500).json({ error: error.message || 'Failed to update deliverable approval' });
    }
  });

  // 8. Client Weekly Reporting
  app.get('/api/reports', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const data = await getClientReportsData();
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/reports:', error);
      res.status(500).json({ error: error.message || 'Failed to load client reports' });
    }
  });

  app.post('/api/reports', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { clientId, reportPeriod, executiveSummary } = req.body;
      if (!clientId || !executiveSummary) {
        return res.status(400).json({ error: 'Client and executive summary are required.' });
      }
      const created = await generateClientWeeklyReportRecord(
        Number(clientId),
        reportPeriod || 'Nov 02 – Nov 09, 2026',
        executiveSummary,
        req.user?.name || req.user?.email || 'Client Delivery Owner'
      );
      res.status(201).json({ report: created });
    } catch (error: any) {
      console.error('Error in POST /api/reports:', error);
      res.status(500).json({ error: error.message || 'Failed to generate client report' });
    }
  });

  // ==========================================================================
  // TALENTIQ — AI-POWERED EXECUTIVE RESUME INTELLIGENCE & JOB MATCHING ROUTES
  // ==========================================================================

  app.get('/api/talentiq/dashboard', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const data = await getTalentIQDashboardAnalytics();
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/talentiq/dashboard:', error);
      res.status(500).json({ error: error.message || 'Failed to load TalentIQ dashboard' });
    }
  });

  app.get('/api/talentiq/candidates', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const candidates = await getTalentIQCandidates();
      res.json({ candidates });
    } catch (error: any) {
      console.error('Error in GET /api/talentiq/candidates:', error);
      res.status(500).json({ error: error.message || 'Failed to load candidates' });
    }
  });

  app.post('/api/talentiq/resumes/parse', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { filename, fileType, rawText } = req.body;
      if (!rawText || String(rawText).trim().length < 20) {
        return res.status(400).json({
          error: 'Please provide valid resume content (PDF, DOCX, or TXT) to extract executive intelligence.',
        });
      }
      const fname = String(filename || 'executive_resume.pdf');
      const lower = fname.toLowerCase();
      if (!lower.endsWith('.pdf') && !lower.endsWith('.docx') && !lower.endsWith('.txt')) {
        return res.status(400).json({
          error: 'Unsupported file format. TalentIQ supports PDF, DOCX, and TXT resumes.',
        });
      }
      const candidate = await createAndParseCandidateResume({
        filename: fname,
        fileType: fileType || (lower.endsWith('.docx') ? 'DOCX' : lower.endsWith('.txt') ? 'TXT' : 'PDF'),
        rawText: String(rawText),
      });
      res.status(201).json({ candidate });
    } catch (error: any) {
      console.error('Error in POST /api/talentiq/resumes/parse:', error);
      res.status(500).json({ error: error.message || 'Failed to parse resume' });
    }
  });

  app.patch('/api/talentiq/candidates/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const candidateId = Number(req.params.id);
      const updated = await updateCandidateIntelligenceProfile(candidateId, req.body);
      res.json({ candidate: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/talentiq/candidates/:id:', error);
      res.status(500).json({ error: error.message || 'Failed to update candidate profile' });
    }
  });

  app.post('/api/talentiq/candidates/:id/reprocess', requireAuth, async (req: AuthRequest, res) => {
    try {
      const candidateId = Number(req.params.id);
      const updated = await reprocessCandidateResume(candidateId);
      res.json({ candidate: updated });
    } catch (error: any) {
      console.error('Error in POST /api/talentiq/candidates/:id/reprocess:', error);
      res.status(500).json({ error: error.message || 'Failed to reprocess candidate resume' });
    }
  });

  app.get('/api/talentiq/roles', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const roles = await getTechnologyRolesTaxonomy();
      res.json({ roles });
    } catch (error: any) {
      console.error('Error in GET /api/talentiq/roles:', error);
      res.status(500).json({ error: error.message || 'Failed to load technology roles taxonomy' });
    }
  });

  app.post('/api/talentiq/roles', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { category, roleTitle, typicalResponsibilities, requiredTechnicalKnowledge } = req.body;
      if (!category || !roleTitle || !typicalResponsibilities || !requiredTechnicalKnowledge) {
        return res.status(400).json({
          error: 'Category, role title, typical responsibilities, and required technical knowledge are required.',
        });
      }
      const created = await createTechnologyRole(req.body);
      res.status(201).json({ role: created });
    } catch (error: any) {
      console.error('Error in POST /api/talentiq/roles:', error);
      res.status(500).json({ error: error.message || 'Failed to create technology role' });
    }
  });

  app.get('/api/talentiq/jobs', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const jobs = await getTalentIQJobDescriptions();
      res.json({ jobs });
    } catch (error: any) {
      console.error('Error in GET /api/talentiq/jobs:', error);
      res.status(500).json({ error: error.message || 'Failed to load job descriptions' });
    }
  });

  app.post('/api/talentiq/jobs/analyse', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { rawDescription, jobTitle, company, location, compensationInfo } = req.body;
      if (!rawDescription || String(rawDescription).trim().length < 20) {
        return res.status(400).json({
          error: 'Please provide a complete job description text to analyse.',
        });
      }
      const job = await createAndAnalyseJobDescription({
        rawDescription: String(rawDescription),
        jobTitle,
        company,
        location,
        compensationInfo,
      });
      res.status(201).json({ job });
    } catch (error: any) {
      console.error('Error in POST /api/talentiq/jobs/analyse:', error);
      res.status(500).json({ error: error.message || 'Failed to analyse job description' });
    }
  });

  app.patch('/api/talentiq/jobs/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const jobId = Number(req.params.id);
      const updated = await updateJobDescriptionRecord(jobId, req.body);
      res.json({ job: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/talentiq/jobs/:id:', error);
      res.status(500).json({ error: error.message || 'Failed to update job description' });
    }
  });

  app.get('/api/talentiq/matches', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const matches = await getTalentIQMatches();
      res.json({ matches });
    } catch (error: any) {
      console.error('Error in GET /api/talentiq/matches:', error);
      res.status(500).json({ error: error.message || 'Failed to load candidate-job matches' });
    }
  });

  app.post('/api/talentiq/matches/evaluate', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { candidateId, jobId } = req.body;
      if (!candidateId || !jobId) {
        return res.status(400).json({ error: 'Both candidateId and jobId are required.' });
      }
      const match = await runCandidateJobMatch(Number(candidateId), Number(jobId));
      res.status(201).json({ match });
    } catch (error: any) {
      console.error('Error in POST /api/talentiq/matches/evaluate:', error);
      res.status(500).json({ error: error.message || 'Failed to evaluate candidate-job match' });
    }
  });

  app.get('/api/talentiq/weights', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const weights = await getMatchingWeights();
      res.json({ weights });
    } catch (error: any) {
      console.error('Error in GET /api/talentiq/weights:', error);
      res.status(500).json({ error: error.message || 'Failed to load matching weights' });
    }
  });

  app.put('/api/talentiq/weights', requireAuth, async (req: AuthRequest, res) => {
    try {
      const result = await updateMatchingWeightsAndRecalculate({
        ...req.body,
        updatedBy: req.user?.name || req.user?.email || 'Administrator',
      });
      res.json(result);
    } catch (error: any) {
      console.error('Error in PUT /api/talentiq/weights:', error);
      res.status(500).json({ error: error.message || 'Failed to update matching weights' });
    }
  });

  app.get('/api/talentiq/logs', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const logs = await getEvaluationLogs();
      res.json({ logs });
    } catch (error: any) {
      console.error('Error in GET /api/talentiq/logs:', error);
      res.status(500).json({ error: error.message || 'Failed to load evaluation logs' });
    }
  });

  // Vite middleware in development, static assets in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerPilot Enterprise Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
