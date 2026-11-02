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
import { desc, eq } from 'drizzle-orm';
import { ensureSeeded } from './seed.ts';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    await ensureSeeded();
    const fullName = displayName || email.split('@')[0] || 'Executive Partner';
    const initials = fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CP';

    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName,
        roleName: 'Administrator',
        designation: 'Managing Partner, Executive Delivery',
        department: 'Executive Career Operations',
        avatarInitials: initials,
        isActive: true,
        isSimulated: false,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function switchUserRole(uid: string, roleName: string) {
  try {
    const roleRecord = await db.select().from(roles).where(eq(roles.name, roleName));
    const roleId = roleRecord[0]?.id ?? null;

    const updated = await db
      .update(users)
      .set({
        roleName,
        roleId,
        updatedAt: new Date(),
      })
      .where(eq(users.uid, uid))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database query failed in switchUserRole:', error);
    throw new Error('Failed to update user role.', { cause: error });
  }
}

export async function getAllTeamMembers() {
  try {
    await ensureSeeded();
    return await db.select().from(users).orderBy(users.id);
  } catch (error) {
    console.error('Database query failed in getAllTeamMembers:', error);
    throw new Error('Failed to load team members.', { cause: error });
  }
}

export async function getDashboardAnalytics() {
  try {
    await ensureSeeded();

    const [
      allClients,
      allPrograms,
      allOpportunities,
      allApplications,
      allOutreach,
      allInterviews,
      allTasks,
      allDeliverables,
      allUsers,
      recentLogs,
    ] = await Promise.all([
      db.select().from(clients),
      db.select().from(clientPrograms),
      db.select().from(jobOpportunities),
      db.select().from(applications),
      db.select().from(outreachActivities),
      db.select().from(interviewRecords),
      db.select().from(tasks),
      db.select().from(deliverables),
      db.select().from(users),
      db.select().from(activityLogs).orderBy(desc(activityLogs.id)).limit(12),
    ]);

    const activeClients = allClients.filter((c) => c.status !== 'Paused').length;
    const newOnboardings = allClients.filter(
      (c) => c.status === 'Onboarding' || c.onboardingDate >= '2026-10-01'
    ).length;
    const activePrograms = allPrograms.filter((p) => p.status === 'Active').length;
    const totalOpportunities = allOpportunities.length;

    const submittedStatuses = [
      'Applied',
      'Recruiter Contacted',
      'Interview Scheduled',
      'Rejected',
      'Offer Received',
    ];
    const submittedApps = allApplications.filter((a) =>
      submittedStatuses.includes(a.status)
    ).length;

    const outreachCount = allOutreach.length;
    const outreachReplied = allOutreach.filter((o) => o.replyReceived).length;
    const interviewsSecured = allInterviews.length;

    const clientsWithInterviews = new Set(allInterviews.map((i) => i.clientId)).size;
    const clientConversionRate =
      allClients.length > 0
        ? Math.round((clientsWithInterviews / allClients.length) * 100)
        : 0;

    const appToInterviewRate =
      submittedApps > 0
        ? Math.round((interviewsSecured / submittedApps) * 100)
        : 0;

    const overdueDeliverables = allDeliverables.filter(
      (d) => d.status === 'Overdue'
    ).length;
    const overdueTasks = allTasks.filter((t) => t.status === 'Overdue').length;

    // 1. Weekly application trends
    const weekMap = new Map<
      string,
      { week: string; applications: number; outreach: number; interviews: number }
    >();
    const orderedWeeks = [
      '2026-W37',
      '2026-W38',
      '2026-W39',
      '2026-W40',
      '2026-W41',
      '2026-W42',
      '2026-W43',
      '2026-W44',
    ];
    for (const wk of orderedWeeks) {
      weekMap.set(wk, { week: wk.replace('2026-', ''), applications: 0, outreach: 0, interviews: 0 });
    }
    for (const app of allApplications) {
      const bucket = weekMap.get(app.weekBucket);
      if (bucket) {
        bucket.applications += 1;
        if (app.status === 'Interview Scheduled' || app.status === 'Offer Received') {
          bucket.interviews += 1;
        }
      }
    }
    allOutreach.forEach((o, idx) => {
      const wkKey = orderedWeeks[idx % orderedWeeks.length];
      const bucket = weekMap.get(wkKey);
      if (bucket) bucket.outreach += 1;
    });

    // 2. Job-Search Funnel
    const funnelStages = [
      'Identified',
      'Shortlisted',
      'Approved',
      'Applied',
      'Recruiter Contacted',
      'Interview Scheduled',
      'Offer Received',
    ];
    const funnelData = funnelStages.map((stage) => ({
      stage,
      count: allApplications.filter((a) => a.status === stage).length,
    }));

    // 3. Client-wise Performance
    const clientPerformance = allClients.map((c) => {
      const cOpps = allOpportunities.filter((o) => o.clientId === c.id).length;
      const cApps = allApplications.filter((a) => a.clientId === c.id).length;
      const cOutreach = allOutreach.filter((o) => o.clientId === c.id).length;
      const cInterviews = allInterviews.filter((i) => i.clientId === c.id).length;
      const conversionPct = cApps > 0 ? Math.round((cInterviews / cApps) * 100) : 0;
      return {
        clientId: c.id,
        clientName: c.fullName,
        designation: c.currentDesignation,
        status: c.status,
        ownerName: c.assignedOwnerName,
        opportunities: cOpps,
        applications: cApps,
        outreach: cOutreach,
        interviews: cInterviews,
        conversionRate: conversionPct,
      };
    });

    // 4. Team Workload
    const internalTeam = allUsers.filter((u) => u.isSimulated);
    const teamWorkload = internalTeam.map((member) => {
      const assignedClientsCount = allClients.filter(
        (c) => c.assignedOwnerId === member.id
      ).length;
      const openTasksCount = allTasks.filter(
        (t) => t.assignedToId === member.id && t.status !== 'Completed'
      ).length;
      const deliverablesCount = allDeliverables.filter(
        (d) => d.ownerId === member.id
      ).length;
      const outreachOwned = allOutreach.filter((o) => o.ownerId === member.id).length;

      return {
        userId: member.id,
        fullName: member.fullName,
        roleName: member.roleName,
        designation: member.designation,
        avatarInitials: member.avatarInitials,
        assignedClients: assignedClientsCount,
        openTasks: openTasksCount,
        deliverables: deliverablesCount,
        outreachHandled: outreachOwned,
        utilizationPct: Math.min(96, 55 + assignedClientsCount * 8 + openTasksCount * 5),
      };
    });

    // 5. Monthly Delivery Performance
    const monthlyDelivery = [
      {
        month: 'Aug 2026',
        onboarded: allClients.filter((c) => c.onboardingDate.startsWith('2026-08')).length,
        deliverablesCompleted: 6,
        interviewsSecured: 8,
      },
      {
        month: 'Sep 2026',
        onboarded: allClients.filter((c) => c.onboardingDate.startsWith('2026-09')).length,
        deliverablesCompleted: 11,
        interviewsSecured: 12,
      },
      {
        month: 'Oct 2026',
        onboarded: allClients.filter((c) => c.onboardingDate.startsWith('2026-10')).length,
        deliverablesCompleted: 14,
        interviewsSecured: interviewsSecured - 20 > 0 ? interviewsSecured - 20 : 10,
      },
    ];

    return {
      kpis: {
        totalActiveClients: activeClients,
        totalClients: allClients.length,
        newClientOnboardings: newOnboardings,
        activePrograms,
        totalOpportunities,
        applicationsSubmitted: submittedApps,
        totalApplicationsRecords: allApplications.length,
        hiringManagerOutreach: outreachCount,
        outreachReplyRate:
          outreachCount > 0 ? Math.round((outreachReplied / outreachCount) * 100) : 0,
        interviewsSecured,
        clientConversionRate,
        appToInterviewRate,
        overdueDeliverables: overdueDeliverables + overdueTasks,
        overdueDeliverablesOnly: overdueDeliverables,
        overdueTasksOnly: overdueTasks,
      },
      weeklyTrends: Array.from(weekMap.values()),
      funnelData,
      clientPerformance,
      teamWorkload,
      monthlyDelivery,
      recentActivity: recentLogs,
    };
  } catch (error) {
    console.error('Database query failed in getDashboardAnalytics:', error);
    throw new Error('Failed to compute executive dashboard metrics.', { cause: error });
  }
}

export async function getClientsDirectory() {
  try {
    await ensureSeeded();
    const [allClients, allProfiles, allPrograms, allAssignments, allUsers] =
      await Promise.all([
        db.select().from(clients).orderBy(desc(clients.id)),
        db.select().from(clientProfiles),
        db.select().from(clientPrograms),
        db.select().from(teamAssignments),
        db.select().from(users),
      ]);

    const profileMap = new Map(allProfiles.map((p) => [p.clientId, p]));
    const programMap = new Map(allPrograms.map((p) => [p.clientId, p]));
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    return allClients.map((client) => {
      const assignedTeam = allAssignments
        .filter((a) => a.clientId === client.id)
        .map((a) => ({
          ...a,
          user: userMap.get(a.userId),
        }));

      return {
        ...client,
        profile: profileMap.get(client.id) || null,
        program: programMap.get(client.id) || null,
        teamAssignments: assignedTeam,
      };
    });
  } catch (error) {
    console.error('Database query failed in getClientsDirectory:', error);
    throw new Error('Failed to fetch executive client profiles.', { cause: error });
  }
}

export async function createExecutiveClient(payload: {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  currentDesignation: string;
  currentEmployer: string;
  yearsOfExperience: number;
  location: string;
  targetCompMin: number;
  targetCompMax: number;
  assignedOwnerName: string;
  technologySpecialisation: string;
  leadershipExperience: string;
  coreCompetencies: string;
  targetJobTitles: string;
  preferredIndustries: string;
  targetCompanies: string;
  preferredLocations: string;
  salaryExpectations: string;
  careerObjectives: string;
  programTier?: string;
  resumeFilename?: string;
  resumeFileType?: string;
  resumeFileSize?: number;
  actorName?: string;
}) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const insertedClient = await db
      .insert(clients)
      .values({
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        linkedinUrl: payload.linkedinUrl || 'https://linkedin.com/in/executive-profile',
        currentDesignation: payload.currentDesignation,
        currentEmployer: payload.currentEmployer,
        yearsOfExperience: Number(payload.yearsOfExperience) || 15,
        location: payload.location,
        status: 'Onboarding',
        onboardingDate: today,
        targetCompMin: Number(payload.targetCompMin) || 350000,
        targetCompMax: Number(payload.targetCompMax) || 500000,
        assignedOwnerName: payload.assignedOwnerName || 'Elena Vance',
        isSimulated: false,
      })
      .returning();

    const newClient = insertedClient[0];

    await db.insert(clientProfiles).values({
      clientId: newClient.id,
      technologySpecialisation: payload.technologySpecialisation,
      leadershipExperience: payload.leadershipExperience,
      coreCompetencies: payload.coreCompetencies,
      targetJobTitles: payload.targetJobTitles,
      preferredIndustries: payload.preferredIndustries,
      targetCompanies: payload.targetCompanies,
      preferredLocations: payload.preferredLocations,
      salaryExpectations: payload.salaryExpectations,
      careerObjectives: payload.careerObjectives,
      resumeFilename: payload.resumeFilename || null,
      resumeFileType: payload.resumeFileType || null,
      resumeFileSize: payload.resumeFileSize || null,
      resumeUploadedAt: payload.resumeFilename ? new Date() : null,
      resumeSummary: `Structured Executive Dossier initialized for ${payload.fullName} (${payload.currentDesignation}).`,
    });

    await db.insert(clientPrograms).values({
      clientId: newClient.id,
      programName: `${payload.programTier || 'Executive Retainer'} — 2026 Campaign`,
      tier: payload.programTier || 'Executive Retainer',
      startDate: today,
      targetEndDate: '2027-04-30',
      status: 'Active',
      weeklyApplicationTarget: 8,
      weeklyOutreachTarget: 12,
      conversionStage: 'Onboarding & Positioning',
      healthStatus: 'On Track',
    });

    await db.insert(activityLogs).values({
      clientId: newClient.id,
      actorName: payload.actorName || 'Operations Manager',
      actionType: 'Client Onboarded',
      entityType: 'Client',
      entityId: newClient.id,
      description: `Onboarded new executive client ${payload.fullName} (${payload.currentDesignation} at ${payload.currentEmployer}).`,
    });

    return newClient;
  } catch (error) {
    console.error('Database query failed in createExecutiveClient:', error);
    throw new Error('Failed to onboard new executive client.', { cause: error });
  }
}

export async function updateClientResumeRecord(
  clientId: number,
  fileData: {
    filename: string;
    fileType: string;
    fileSize: number;
    actorName?: string;
  }
) {
  try {
    const updated = await db
      .update(clientProfiles)
      .set({
        resumeFilename: fileData.filename,
        resumeFileType: fileData.fileType,
        resumeFileSize: fileData.fileSize,
        resumeUploadedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(clientProfiles.clientId, clientId))
      .returning();

    await db.insert(activityLogs).values({
      clientId,
      actorName: fileData.actorName || 'Client Delivery Owner',
      actionType: 'Resume Uploaded',
      entityType: 'Client',
      entityId: clientId,
      description: `Uploaded validated executive resume (${fileData.filename}, ${Math.round(fileData.fileSize / 1024)} KB).`,
    });

    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateClientResumeRecord:', error);
    throw new Error('Failed to store executive resume metadata.', { cause: error });
  }
}

export async function getPipelineData() {
  try {
    await ensureSeeded();
    const [allOpps, allApps, allClients] = await Promise.all([
      db.select().from(jobOpportunities).orderBy(desc(jobOpportunities.id)),
      db.select().from(applications).orderBy(desc(applications.id)),
      db.select().from(clients),
    ]);

    const clientMap = new Map(allClients.map((c) => [c.id, c]));

    const enrichedOpportunities = allOpps.map((o) => ({
      ...o,
      clientName: clientMap.get(o.clientId)?.fullName || 'Executive Client',
      clientDesignation: clientMap.get(o.clientId)?.currentDesignation || 'CTO / VP',
    }));

    const oppMap = new Map(allOpps.map((o) => [o.id, o]));
    const enrichedApplications = allApps.map((a) => {
      const opp = oppMap.get(a.opportunityId);
      const client = clientMap.get(a.clientId);
      return {
        ...a,
        company: opp?.company || 'Enterprise Tech Corp',
        designation: opp?.designation || 'VP of Engineering',
        salaryRange: opp?.salaryRange || '$400k – $550k',
        location: opp?.location || 'San Francisco, CA',
        technologySpecialisation: opp?.technologySpecialisation || 'Cloud & AI',
        clientName: client?.fullName || 'Executive Client',
      };
    });

    return {
      opportunities: enrichedOpportunities,
      applications: enrichedApplications,
    };
  } catch (error) {
    console.error('Database query failed in getPipelineData:', error);
    throw new Error('Failed to fetch job search pipeline.', { cause: error });
  }
}

export async function createJobOpportunityRecord(payload: {
  clientId: number;
  company: string;
  designation: string;
  technologySpecialisation: string;
  salaryRange: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  workMode: string;
  jobDescription: string;
  sourceUrl: string;
  fitScore: number;
  status: string;
  actorName?: string;
}) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const inserted = await db
      .insert(jobOpportunities)
      .values({
        clientId: Number(payload.clientId),
        company: payload.company,
        designation: payload.designation,
        technologySpecialisation: payload.technologySpecialisation,
        salaryRange: payload.salaryRange,
        salaryMin: Number(payload.salaryMin) || 380000,
        salaryMax: Number(payload.salaryMax) || 540000,
        location: payload.location,
        workMode: payload.workMode || 'Hybrid',
        jobDescription: payload.jobDescription,
        sourceUrl: payload.sourceUrl || 'https://careers.enterprise.sim',
        fitScore: Number(payload.fitScore) || 90,
        status: payload.status || 'Identified',
      })
      .returning();

    const opp = inserted[0];

    // Also create a linked Application tracking record
    await db.insert(applications).values({
      opportunityId: opp.id,
      clientId: opp.clientId,
      status: opp.status,
      appliedDate: today,
      weekBucket: '2026-W44',
      monthBucket: '2026-10',
      resumeVersion: `v3.5 — ${opp.company} Tailored Executive Dossier`,
      coverLetterSent: true,
      notes: `Opportunity added to pipeline for ${opp.company} (${opp.designation}).`,
      stageHistory: JSON.stringify([
        { stage: opp.status, date: today, note: `Added by ${payload.actorName || 'Advisor'}` },
      ]),
    });

    await db.insert(activityLogs).values({
      clientId: opp.clientId,
      actorName: payload.actorName || 'Research Associate',
      actionType: 'Opportunity Created',
      entityType: 'Opportunity',
      entityId: opp.id,
      description: `Added ${opp.designation} at ${opp.company} (${opp.status}) to pipeline.`,
    });

    return opp;
  } catch (error) {
    console.error('Database query failed in createJobOpportunityRecord:', error);
    throw new Error('Failed to create job opportunity.', { cause: error });
  }
}

export async function updateOpportunityAndApplicationStatus(
  opportunityId: number,
  newStatus: string,
  notes?: string,
  actorName?: string
) {
  try {
    const updatedOpp = await db
      .update(jobOpportunities)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(jobOpportunities.id, opportunityId))
      .returning();

    const existingApps = await db
      .select()
      .from(applications)
      .where(eq(applications.opportunityId, opportunityId));

    const today = new Date().toISOString().slice(0, 10);

    for (const app of existingApps) {
      let history = [];
      try {
        history = JSON.parse(app.stageHistory || '[]');
      } catch {
        history = [];
      }
      history.push({
        stage: newStatus,
        date: today,
        note: notes || `Transitioned to ${newStatus}`,
      });

      await db
        .update(applications)
        .set({
          status: newStatus,
          notes: notes ? `${app.notes}\n[${today}] ${notes}` : app.notes,
          rejectionReason: newStatus === 'Rejected' ? notes || 'Closed by panel' : app.rejectionReason,
          offerDetails: newStatus === 'Offer Received' ? notes || app.offerDetails : app.offerDetails,
          stageHistory: JSON.stringify(history),
          updatedAt: new Date(),
        })
        .where(eq(applications.id, app.id));
    }

    if (updatedOpp[0]) {
      await db.insert(activityLogs).values({
        clientId: updatedOpp[0].clientId,
        actorName: actorName || 'Client Delivery Owner',
        actionType: 'Status Updated',
        entityType: 'Opportunity',
        entityId: opportunityId,
        description: `Moved ${updatedOpp[0].designation} at ${updatedOpp[0].company} to "${newStatus}".`,
      });
    }

    return updatedOpp[0];
  } catch (error) {
    console.error('Database query failed in updateOpportunityAndApplicationStatus:', error);
    throw new Error('Failed to update pipeline status.', { cause: error });
  }
}

export async function getOutreachCrmData() {
  try {
    await ensureSeeded();
    const [allContacts, allActivities, allClients, allOpps] = await Promise.all([
      db.select().from(hiringManagerContacts).orderBy(desc(hiringManagerContacts.id)),
      db.select().from(outreachActivities).orderBy(desc(outreachActivities.id)),
      db.select().from(clients),
      db.select().from(jobOpportunities),
    ]);

    const contactMap = new Map(allContacts.map((c) => [c.id, c]));
    const clientMap = new Map(allClients.map((c) => [c.id, c]));
    const oppMap = new Map(allOpps.map((o) => [o.id, o]));

    const enrichedActivities = allActivities.map((act) => {
      const contact = contactMap.get(act.contactId);
      const client = clientMap.get(act.clientId);
      const opp = act.opportunityId ? oppMap.get(act.opportunityId) : undefined;
      return {
        ...act,
        contactName: contact?.name || 'Executive Hiring Leader',
        contactTitle: contact?.title || 'SVP / CTO',
        contactEmail: contact?.email || '',
        company: contact?.company || opp?.company || 'Enterprise Target',
        relationshipWarmth: contact?.relationshipWarmth || 'Warm',
        clientName: client?.fullName || 'Executive Client',
        opportunityTitle: opp?.designation || 'Executive Leadership Mandate',
      };
    });

    return {
      contacts: allContacts,
      activities: enrichedActivities,
    };
  } catch (error) {
    console.error('Database query failed in getOutreachCrmData:', error);
    throw new Error('Failed to load Hiring Manager Outreach CRM.', { cause: error });
  }
}

export async function createOutreachRecord(payload: {
  contactName: string;
  contactTitle: string;
  company: string;
  contactEmail: string;
  linkedinUrl: string;
  relationshipWarmth: string;
  clientId: number;
  opportunityId?: number;
  channel: string;
  messageSubject: string;
  messageSnippet: string;
  nextAction: string;
  nextActionDate: string;
  actorName?: string;
}) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const insertedContact = await db
      .insert(hiringManagerContacts)
      .values({
        name: payload.contactName,
        title: payload.contactTitle,
        company: payload.company,
        email: payload.contactEmail,
        linkedinUrl: payload.linkedinUrl || 'https://linkedin.com/in/hiring-leader',
        phone: '+1 (415) 555-0199',
        clientId: Number(payload.clientId),
        opportunityId: payload.opportunityId ? Number(payload.opportunityId) : null,
        relationshipWarmth: payload.relationshipWarmth || 'Warm',
      })
      .returning();

    const contact = insertedContact[0];

    const insertedActivity = await db
      .insert(outreachActivities)
      .values({
        contactId: contact.id,
        clientId: Number(payload.clientId),
        opportunityId: payload.opportunityId ? Number(payload.opportunityId) : null,
        channel: payload.channel || 'LinkedIn InMail',
        messageSubject: payload.messageSubject,
        messageSnippet: payload.messageSnippet,
        sentDate: today,
        status: 'Sent',
        replyReceived: false,
        followUpCount: 1,
        nextAction: payload.nextAction || 'Follow up with 90-day architectural brief',
        nextActionDate: payload.nextActionDate || '2026-11-09',
        outcome: 'Awaiting Response',
      })
      .returning();

    await db.insert(activityLogs).values({
      clientId: Number(payload.clientId),
      actorName: payload.actorName || 'Client Delivery Owner',
      actionType: 'Outreach Logged',
      entityType: 'Outreach',
      entityId: insertedActivity[0].id,
      description: `Initiated ${payload.channel} outreach to ${payload.contactName} (${payload.contactTitle} at ${payload.company}).`,
    });

    return insertedActivity[0];
  } catch (error) {
    console.error('Database query failed in createOutreachRecord:', error);
    throw new Error('Failed to log hiring-manager outreach.', { cause: error });
  }
}

export async function updateOutreachStatusRecord(
  activityId: number,
  updates: {
    status: string;
    replyReceived: boolean;
    outcome: string;
    nextAction?: string;
    followUpCount?: number;
    actorName?: string;
  }
) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const updated = await db
      .update(outreachActivities)
      .set({
        status: updates.status,
        replyReceived: updates.replyReceived,
        replyDate: updates.replyReceived ? today : null,
        outcome: updates.outcome,
        nextAction: updates.nextAction || 'Confirm executive chemistry call logistics',
        followUpCount: updates.followUpCount ?? 2,
      })
      .where(eq(outreachActivities.id, activityId))
      .returning();

    if (updated[0]) {
      await db.insert(activityLogs).values({
        clientId: updated[0].clientId,
        actorName: updates.actorName || 'Client Delivery Owner',
        actionType: 'Outreach Updated',
        entityType: 'Outreach',
        entityId: activityId,
        description: `Updated outreach #${activityId} status to "${updates.status}" — Outcome: ${updates.outcome}.`,
      });
    }

    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateOutreachStatusRecord:', error);
    throw new Error('Failed to update outreach activity.', { cause: error });
  }
}

export async function getInterviewsData() {
  try {
    await ensureSeeded();
    const [allInterviews, allClients] = await Promise.all([
      db.select().from(interviewRecords).orderBy(desc(interviewRecords.id)),
      db.select().from(clients),
    ]);

    const clientMap = new Map(allClients.map((c) => [c.id, c]));

    return allInterviews.map((iv) => ({
      ...iv,
      clientName: clientMap.get(iv.clientId)?.fullName || 'Executive Client',
      clientDesignation: clientMap.get(iv.clientId)?.currentDesignation || 'CTO / VP',
    }));
  } catch (error) {
    console.error('Database query failed in getInterviewsData:', error);
    throw new Error('Failed to load interview tracking records.', { cause: error });
  }
}

export async function createInterviewRecordEntry(payload: {
  clientId: number;
  opportunityId?: number;
  company: string;
  roleTitle: string;
  stageName: string;
  roundNumber: number;
  scheduledAt: string;
  interviewerName: string;
  interviewerTitle: string;
  prepStatus: string;
  prepNotes: string;
  actorName?: string;
}) {
  try {
    const inserted = await db
      .insert(interviewRecords)
      .values({
        clientId: Number(payload.clientId),
        opportunityId: payload.opportunityId ? Number(payload.opportunityId) : null,
        company: payload.company,
        roleTitle: payload.roleTitle,
        stageName: payload.stageName,
        roundNumber: Number(payload.roundNumber) || 1,
        scheduledAt: payload.scheduledAt,
        interviewerName: payload.interviewerName,
        interviewerTitle: payload.interviewerTitle,
        prepStatus: payload.prepStatus || 'Dossier Ready',
        prepNotes: payload.prepNotes,
        feedback: 'Scheduled — Executive briefing dossier queued for pre-interview review.',
        outcome: 'Scheduled',
      })
      .returning();

    await db.insert(activityLogs).values({
      clientId: Number(payload.clientId),
      actorName: payload.actorName || 'Client Delivery Owner',
      actionType: 'Interview Scheduled',
      entityType: 'Interview',
      entityId: inserted[0].id,
      description: `Scheduled Round ${payload.roundNumber} (${payload.stageName}) at ${payload.company} with ${payload.interviewerName}.`,
    });

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createInterviewRecordEntry:', error);
    throw new Error('Failed to schedule executive interview.', { cause: error });
  }
}

export async function updateInterviewRecordEntry(
  interviewId: number,
  updates: {
    prepStatus?: string;
    feedback?: string;
    outcome?: string;
    actorName?: string;
  }
) {
  try {
    const existing = await db
      .select()
      .from(interviewRecords)
      .where(eq(interviewRecords.id, interviewId));

    if (!existing[0]) {
      throw new Error('Interview record not found');
    }

    const updated = await db
      .update(interviewRecords)
      .set({
        prepStatus: updates.prepStatus ?? existing[0].prepStatus,
        feedback: updates.feedback ?? existing[0].feedback,
        outcome: updates.outcome ?? existing[0].outcome,
      })
      .where(eq(interviewRecords.id, interviewId))
      .returning();

    await db.insert(activityLogs).values({
      clientId: existing[0].clientId,
      actorName: updates.actorName || 'Client Delivery Owner',
      actionType: 'Interview Updated',
      entityType: 'Interview',
      entityId: interviewId,
      description: `Updated ${existing[0].company} (${existing[0].stageName}) outcome to "${updated[0].outcome}".`,
    });

    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateInterviewRecordEntry:', error);
    throw new Error('Failed to update interview record.', { cause: error });
  }
}

export async function getClientDeliveryData() {
  try {
    await ensureSeeded();
    const [allTasks, allDeliverables, allLogs, allClients] = await Promise.all([
      db.select().from(tasks).orderBy(desc(tasks.id)),
      db.select().from(deliverables).orderBy(desc(deliverables.id)),
      db.select().from(activityLogs).orderBy(desc(activityLogs.id)).limit(40),
      db.select().from(clients),
    ]);

    const clientMap = new Map(allClients.map((c) => [c.id, c]));

    return {
      tasks: allTasks.map((t) => ({
        ...t,
        clientName: clientMap.get(t.clientId)?.fullName || 'Executive Client',
      })),
      deliverables: allDeliverables.map((d) => ({
        ...d,
        clientName: clientMap.get(d.clientId)?.fullName || 'Executive Client',
      })),
      activityLogs: allLogs.map((l) => ({
        ...l,
        clientName: l.clientId ? clientMap.get(l.clientId)?.fullName || 'Client' : 'Platform',
      })),
    };
  } catch (error) {
    console.error('Database query failed in getClientDeliveryData:', error);
    throw new Error('Failed to load client delivery management data.', { cause: error });
  }
}

export async function createDeliveryTask(payload: {
  clientId: number;
  assignedToName: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDate: string;
  internalNotes: string;
  actorName?: string;
}) {
  try {
    const inserted = await db
      .insert(tasks)
      .values({
        clientId: Number(payload.clientId),
        assignedToName: payload.assignedToName || 'Elena Vance',
        title: payload.title,
        description: payload.description,
        category: payload.category || 'Pipeline Operations',
        priority: payload.priority || 'High',
        status: 'In Progress',
        dueDate: payload.dueDate,
        internalNotes: payload.internalNotes || '',
      })
      .returning();

    await db.insert(activityLogs).values({
      clientId: Number(payload.clientId),
      actorName: payload.actorName || payload.assignedToName || 'Delivery Owner',
      actionType: 'Task Created',
      entityType: 'Task',
      entityId: inserted[0].id,
      description: `Created delivery task "${payload.title}" (Priority: ${payload.priority}, Due: ${payload.dueDate}).`,
    });

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createDeliveryTask:', error);
    throw new Error('Failed to create delivery task.', { cause: error });
  }
}

export async function updateDeliveryTaskStatus(
  taskId: number,
  status: string,
  internalNotes?: string,
  actorName?: string
) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!existing[0]) throw new Error('Task not found');

    const updated = await db
      .update(tasks)
      .set({
        status,
        completedAt: status === 'Completed' ? today : null,
        internalNotes: internalNotes ?? existing[0].internalNotes,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    await db.insert(activityLogs).values({
      clientId: existing[0].clientId,
      actorName: actorName || 'Client Delivery Owner',
      actionType: 'Task Updated',
      entityType: 'Task',
      entityId: taskId,
      description: `Marked task "${existing[0].title}" as ${status}.`,
    });

    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateDeliveryTaskStatus:', error);
    throw new Error('Failed to update task status.', { cause: error });
  }
}

export async function createClientDeliverable(payload: {
  clientId: number;
  ownerName: string;
  title: string;
  deliverableType: string;
  dueDate: string;
  version: string;
  notes: string;
  actorName?: string;
}) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const inserted = await db
      .insert(deliverables)
      .values({
        clientId: Number(payload.clientId),
        ownerName: payload.ownerName || 'Elena Vance',
        title: payload.title,
        deliverableType: payload.deliverableType,
        status: 'In Review',
        clientApprovalStatus: 'Pending Approval',
        dueDate: payload.dueDate,
        submittedAt: today,
        version: payload.version || 'v1.0',
        notes: payload.notes || '',
      })
      .returning();

    await db.insert(activityLogs).values({
      clientId: Number(payload.clientId),
      actorName: payload.actorName || payload.ownerName,
      actionType: 'Deliverable Created',
      entityType: 'Deliverable',
      entityId: inserted[0].id,
      description: `Submitted deliverable "${payload.title}" (${payload.version}) for client approval.`,
    });

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createClientDeliverable:', error);
    throw new Error('Failed to create deliverable.', { cause: error });
  }
}

export async function updateDeliverableApprovalStatus(
  deliverableId: number,
  clientApprovalStatus: string,
  actorName?: string
) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await db
      .select()
      .from(deliverables)
      .where(eq(deliverables.id, deliverableId));
    if (!existing[0]) throw new Error('Deliverable not found');

    const status =
      clientApprovalStatus === 'Approved'
        ? 'Approved'
        : clientApprovalStatus === 'Changes Requested'
        ? 'In Review'
        : existing[0].status;

    const updated = await db
      .update(deliverables)
      .set({
        clientApprovalStatus,
        status,
        approvedAt: clientApprovalStatus === 'Approved' ? today : null,
      })
      .where(eq(deliverables.id, deliverableId))
      .returning();

    await db.insert(activityLogs).values({
      clientId: existing[0].clientId,
      actorName: actorName || 'Executive Client',
      actionType: 'Deliverable Approved',
      entityType: 'Deliverable',
      entityId: deliverableId,
      description: `Deliverable "${existing[0].title}" marked "${clientApprovalStatus}".`,
    });

    return updated[0];
  } catch (error) {
    console.error('Database query failed in updateDeliverableApprovalStatus:', error);
    throw new Error('Failed to update deliverable approval.', { cause: error });
  }
}

export async function getClientReportsData() {
  try {
    await ensureSeeded();
    const [
      allReports,
      allClients,
      allOpps,
      allApps,
      allOutreach,
      allInterviews,
      allDeliverables,
      allTasks,
    ] = await Promise.all([
      db.select().from(clientReports).orderBy(desc(clientReports.id)),
      db.select().from(clients),
      db.select().from(jobOpportunities),
      db.select().from(applications),
      db.select().from(outreachActivities),
      db.select().from(interviewRecords),
      db.select().from(deliverables),
      db.select().from(tasks),
    ]);

    const clientMap = new Map(allClients.map((c) => [c.id, c]));

    const enrichedReports = allReports.map((r) => {
      const c = clientMap.get(r.clientId);
      return {
        ...r,
        clientName: c?.fullName || 'Executive Client',
        clientDesignation: c?.currentDesignation || 'CTO / VP',
        clientEmployer: c?.currentEmployer || 'Enterprise',
        ownerName: c?.assignedOwnerName || 'Elena Vance',
      };
    });

    // Also compute real-time live report snapshot per client from actual DB records
    const liveSnapshots = allClients.map((c) => {
      const cOpps = allOpps.filter((o) => o.clientId === c.id);
      const cApps = allApps.filter((a) => a.clientId === c.id);
      const cOutreach = allOutreach.filter((o) => o.clientId === c.id);
      const cInterviews = allInterviews.filter((i) => i.clientId === c.id);
      const cDeliverables = allDeliverables.filter((d) => d.clientId === c.id);
      const cTasks = allTasks.filter((t) => t.clientId === c.id && t.status !== 'Completed');

      return {
        clientId: c.id,
        clientName: c.fullName,
        designation: c.currentDesignation,
        employer: c.currentEmployer,
        ownerName: c.assignedOwnerName,
        status: c.status,
        opportunitiesIdentified: cOpps.length,
        rolesShortlisted: cOpps.filter((o) => o.status !== 'Identified').length,
        applicationsSubmitted: cApps.filter((a) =>
          ['Applied', 'Recruiter Contacted', 'Interview Scheduled', 'Offer Received', 'Rejected'].includes(a.status)
        ).length,
        hiringManagerOutreach: cOutreach.length,
        responsesReceived: cOutreach.filter((o) => o.replyReceived).length,
        interviewsSecured: cInterviews.length,
        upcomingActions: cTasks.map((t) => `${t.title} (Due ${t.dueDate})`),
        pendingDeliverables: cDeliverables
          .filter((d) => d.clientApprovalStatus !== 'Approved')
          .map((d) => `${d.title} [${d.clientApprovalStatus}]`),
      };
    });

    return {
      reports: enrichedReports,
      liveSnapshots,
    };
  } catch (error) {
    console.error('Database query failed in getClientReportsData:', error);
    throw new Error('Failed to load client progress reports.', { cause: error });
  }
}

export async function generateClientWeeklyReportRecord(
  clientId: number,
  reportPeriod: string,
  executiveSummary: string,
  actorName?: string
) {
  try {
    const [cOpps, cApps, cOutreach, cInterviews, cDeliverables, cTasks] =
      await Promise.all([
        db.select().from(jobOpportunities).where(eq(jobOpportunities.clientId, clientId)),
        db.select().from(applications).where(eq(applications.clientId, clientId)),
        db.select().from(outreachActivities).where(eq(outreachActivities.clientId, clientId)),
        db.select().from(interviewRecords).where(eq(interviewRecords.clientId, clientId)),
        db.select().from(deliverables).where(eq(deliverables.clientId, clientId)),
        db.select().from(tasks).where(eq(tasks.clientId, clientId)),
      ]);

    const today = new Date().toISOString().slice(0, 10);
    const pendingDeliv = cDeliverables
      .filter((d) => d.clientApprovalStatus !== 'Approved')
      .map((d) => `${d.title} (${d.clientApprovalStatus})`)
      .join('; ') || 'All milestone deliverables approved.';

    const upcoming = cTasks
      .filter((t) => t.status !== 'Completed')
      .map((t) => `${t.title} (Due ${t.dueDate})`)
      .join('\n') || 'Continue hiring-manager warm intro cadence & panel prep.';

    const inserted = await db
      .insert(clientReports)
      .values({
        clientId,
        reportPeriod: reportPeriod || 'Oct 26 – Nov 02, 2026',
        weekStarting: today,
        opportunitiesIdentified: cOpps.length,
        rolesShortlisted: cOpps.filter((o) => o.status !== 'Identified').length,
        applicationsSubmitted: cApps.filter((a) =>
          ['Applied', 'Recruiter Contacted', 'Interview Scheduled', 'Offer Received', 'Rejected'].includes(a.status)
        ).length,
        outreachSent: cOutreach.length,
        responsesReceived: cOutreach.filter((o) => o.replyReceived).length,
        interviewsSecured: cInterviews.length,
        upcomingActions: upcoming,
        pendingDeliverablesSummary: pendingDeliv,
        executiveSummary,
      })
      .returning();

    await db.insert(activityLogs).values({
      clientId,
      actorName: actorName || 'Client Delivery Owner',
      actionType: 'Report Generated',
      entityType: 'Report',
      entityId: inserted[0].id,
      description: `Generated Weekly Executive Progress Report (${reportPeriod}) from live database metrics.`,
    });

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in generateClientWeeklyReportRecord:', error);
    throw new Error('Failed to generate weekly client report.', { cause: error });
  }
}
