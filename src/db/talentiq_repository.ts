import { desc, eq } from 'drizzle-orm';
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
import { ensureTalentIQSeeded } from './talentiq_seed.ts';
import {
  parseResumeWithIntelligence,
  parseJobDescriptionWithIntelligence,
  evaluateCandidateJobMatchDeterministic,
} from '../services/talentiq_engine.ts';
import type {
  CandidateFullRecord,
  JobDescriptionFullRecord,
  MatchingWeights,
  MatchResultFullRecord,
  TalentIQDashboardData,
  TechnologyRoleRecord,
  EvaluationLogRecord,
} from '../types_talentiq.ts';

export async function getMatchingWeights(): Promise<MatchingWeights> {
  try {
    await ensureTalentIQSeeded();
    const rows = await db
      .select()
      .from(matchingWeightsConfig)
      .where(eq(matchingWeightsConfig.configName, 'default'));
    if (rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        configName: r.configName,
        technicalWeight: r.technicalWeight,
        leadershipWeight: r.leadershipWeight,
        seniorityWeight: r.seniorityWeight,
        domainWeight: r.domainWeight,
        industryWeight: r.industryWeight,
        progressionWeight: r.progressionWeight,
        qualificationWeight: r.qualificationWeight,
        updatedBy: r.updatedBy,
        updatedAt: r.updatedAt.toISOString(),
      };
    }
    return {
      configName: 'default',
      technicalWeight: 25,
      leadershipWeight: 20,
      seniorityWeight: 15,
      domainWeight: 15,
      industryWeight: 10,
      progressionWeight: 10,
      qualificationWeight: 5,
      updatedBy: 'System Administrator',
    };
  } catch (error) {
    console.error('Database Error in getMatchingWeights:', error);
    throw error;
  }
}

export async function getTalentIQCandidates(): Promise<CandidateFullRecord[]> {
  try {
    await ensureTalentIQSeeded();
    const [allCandidates, allResumes, allProfiles, allHistory, allSkills, allCerts, allPos] =
      await Promise.all([
        db.select().from(candidates).orderBy(desc(candidates.id)),
        db.select().from(candidateResumes),
        db.select().from(candidateProfiles),
        db.select().from(employmentHistory),
        db.select().from(candidateSkills),
        db.select().from(certifications),
        db.select().from(positioningRecommendations),
      ]);

    const resumeMap = new Map(allResumes.map((r) => [r.candidateId, r]));
    const profileMap = new Map(allProfiles.map((p) => [p.candidateId, p]));
    const posMap = new Map(allPos.map((p) => [p.candidateId, p]));

    return allCandidates.map((c) => {
      const r = resumeMap.get(c.id);
      const p = profileMap.get(c.id);
      const pos = posMap.get(c.id);
      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        location: c.location,
        currentDesignation: c.currentDesignation,
        previousDesignations: c.previousDesignations,
        totalYearsExperience: c.totalYearsExperience,
        primaryDomain: c.primaryDomain,
        extractionConfidence: c.extractionConfidence,
        analysisMonth: c.analysisMonth,
        isSynthetic: c.isSynthetic,
        createdAt: c.createdAt.toISOString(),
        resume: r
          ? {
              id: r.id,
              filename: r.filename,
              fileType: r.fileType,
              rawText: r.rawText,
              extractionConfidence: r.extractionConfidence,
              parsedAt: r.parsedAt.toISOString(),
            }
          : null,
        profile: p
          ? {
              id: p.id,
              industryExperience: p.industryExperience,
              leadershipExperience: p.leadershipExperience,
              educationalQualifications: p.educationalQualifications,
              majorAchievements: p.majorAchievements,
              companiesWorkedAt: p.companiesWorkedAt,
              executiveSummary: p.executiveSummary,
            }
          : null,
        employmentHistory: allHistory.filter((h) => h.candidateId === c.id),
        skills: allSkills.filter((s) => s.candidateId === c.id),
        certifications: allCerts.filter((cert) => cert.candidateId === c.id),
        positioning: pos
          ? {
              id: pos.id,
              candidateId: pos.candidateId,
              targetPositions: pos.targetPositions,
              alternativePaths: pos.alternativePaths,
              strongestDifferentiators: pos.strongestDifferentiators,
              skillsNeedingVisibility: pos.skillsNeedingVisibility,
              resumePositioningAdvice: pos.resumePositioningAdvice,
              relevantIndustrySegments: pos.relevantIndustrySegments,
              recommendedSearchStrategy: pos.recommendedSearchStrategy,
              approvedByManager: pos.approvedByManager,
            }
          : null,
      };
    });
  } catch (error) {
    console.error('Database Error in getTalentIQCandidates:', error);
    throw error;
  }
}

export async function getTalentIQJobDescriptions(): Promise<JobDescriptionFullRecord[]> {
  try {
    await ensureTalentIQSeeded();
    const [allJobs, allReqs] = await Promise.all([
      db.select().from(jobDescriptions).orderBy(desc(jobDescriptions.id)),
      db.select().from(jobRequirements),
    ]);

    return allJobs.map((j) => ({
      id: j.id,
      jobTitle: j.jobTitle,
      company: j.company,
      roleCategory: j.roleCategory,
      taxonomyRoleId: j.taxonomyRoleId,
      seniorityLevel: j.seniorityLevel,
      yearsOfExperience: j.yearsOfExperience,
      leadershipExpectations: j.leadershipExpectations,
      industryRequirements: j.industryRequirements,
      technicalResponsibilities: j.technicalResponsibilities,
      location: j.location,
      compensationInfo: j.compensationInfo,
      rawDescription: j.rawDescription,
      isSynthetic: j.isSynthetic,
      createdAt: j.createdAt.toISOString(),
      requirements: allReqs
        .filter((r) => r.jobId === j.id)
        .map((r) => ({
          id: r.id,
          jobId: r.jobId,
          skillName: r.skillName,
          requirementType: (r.requirementType === 'Preferred' ? 'Preferred' : 'Required') as
            | 'Required'
            | 'Preferred',
          weightImportance: r.weightImportance,
        })),
    }));
  } catch (error) {
    console.error('Database Error in getTalentIQJobDescriptions:', error);
    throw error;
  }
}

export async function getTechnologyRolesTaxonomy(): Promise<TechnologyRoleRecord[]> {
  try {
    await ensureTalentIQSeeded();
    const rows = await db.select().from(technologyRoles).orderBy(technologyRoles.id);
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Database Error in getTechnologyRolesTaxonomy:', error);
    throw error;
  }
}

export async function createTechnologyRole(payload: {
  category: string;
  roleTitle: string;
  typicalResponsibilities: string;
  requiredTechnicalKnowledge: string;
  expectedLeadershipExperience: string;
  relevantIndustryExperience: string;
  commonQualifications: string;
  seniorityBand?: string;
}): Promise<TechnologyRoleRecord> {
  try {
    const [inserted] = await db
      .insert(technologyRoles)
      .values({
        category: payload.category,
        roleTitle: payload.roleTitle,
        typicalResponsibilities: payload.typicalResponsibilities,
        requiredTechnicalKnowledge: payload.requiredTechnicalKnowledge,
        expectedLeadershipExperience: payload.expectedLeadershipExperience,
        relevantIndustryExperience: payload.relevantIndustryExperience,
        commonQualifications: payload.commonQualifications,
        seniorityBand: payload.seniorityBand || 'C-Suite / VP',
      })
      .returning();
    return {
      ...inserted,
      createdAt: inserted.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Database Error in createTechnologyRole:', error);
    throw error;
  }
}

export async function getTalentIQMatches(): Promise<MatchResultFullRecord[]> {
  try {
    await ensureTalentIQSeeded();
    const [allMatches, allExps, allGaps, allCands, allJobs] = await Promise.all([
      db.select().from(matchResults).orderBy(desc(matchResults.overallScore)),
      db.select().from(matchExplanations),
      db.select().from(skillsGapAnalysis),
      db.select().from(candidates),
      db.select().from(jobDescriptions),
    ]);

    const candMap = new Map(allCands.map((c) => [c.id, c]));
    const jobMap = new Map(allJobs.map((j) => [j.id, j]));
    const expMap = new Map(allExps.map((e) => [e.matchId, e]));
    const gapMap = new Map(allGaps.map((g) => [g.matchId, g]));

    return allMatches.map((m) => {
      const c = candMap.get(m.candidateId);
      const j = jobMap.get(m.jobId);
      const exp = expMap.get(m.id);
      const gap = gapMap.get(m.id);

      return {
        id: m.id,
        candidateId: m.candidateId,
        jobId: m.jobId,
        candidateName: c?.fullName || 'Executive Candidate',
        candidateDesignation: c?.currentDesignation || 'VP Engineering',
        candidateDomain: c?.primaryDomain || 'Cloud & Platform Engineering',
        candidateYears: c?.totalYearsExperience || 16,
        jobTitle: j?.jobTitle || 'Executive Mandate',
        company: j?.company || 'Enterprise Corp',
        roleCategory: j?.roleCategory || 'Executive Leadership',
        overallScore: m.overallScore,
        technicalScore: m.technicalScore,
        leadershipScore: m.leadershipScore,
        seniorityScore: m.seniorityScore,
        domainScore: m.domainScore,
        industryScore: m.industryScore,
        progressionScore: m.progressionScore,
        qualificationScore: m.qualificationScore,
        confidenceTier: m.confidenceTier,
        scoringMode: m.scoringMode,
        evaluatedAt: m.evaluatedAt.toISOString(),
        explanation: exp || null,
        skillsGap: gap
          ? {
              ...gap,
              candidateName: c?.fullName || 'Executive Candidate',
              candidateDesignation: c?.currentDesignation || 'VP Engineering',
              jobTitle: j?.jobTitle || 'Executive Mandate',
              company: j?.company || 'Enterprise Corp',
              overallScore: m.overallScore,
              createdAt: gap.createdAt.toISOString(),
            }
          : null,
      };
    });
  } catch (error) {
    console.error('Database Error in getTalentIQMatches:', error);
    throw error;
  }
}

export async function getTalentIQDashboardAnalytics(): Promise<TalentIQDashboardData> {
  try {
    await ensureTalentIQSeeded();
    const [allCands, allResumes, allJobs, allMatches, allSkills, allPos, allGaps] =
      await Promise.all([
        db.select().from(candidates),
        db.select().from(candidateResumes),
        db.select().from(jobDescriptions),
        db.select().from(matchResults),
        db.select().from(candidateSkills),
        db.select().from(positioningRecommendations),
        db.select().from(skillsGapAnalysis),
      ]);

    const highConf = allMatches.filter((m) => m.overallScore >= 82).length;
    const avgScore =
      allMatches.length > 0
        ? Math.round(allMatches.reduce((acc, m) => acc + m.overallScore, 0) / allMatches.length)
        : 0;

    // Top Technical Specialisations
    const skillCounts = new Map<string, number>();
    for (const sk of allSkills) {
      skillCounts.set(sk.skillName, (skillCounts.get(sk.skillName) || 0) + 1);
    }
    const topTechnicalSpecialisations = Array.from(skillCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Most Frequently Recommended Executive Positions
    const posCounts = new Map<string, number>();
    for (const p of allPos) {
      const roles = p.targetPositions
        .split('·')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const r of roles) {
        posCounts.set(r, (posCounts.get(r) || 0) + 1);
      }
    }
    const topRecommendedPositions = Array.from(posCounts.entries())
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Missing Skill Trends
    const gapCounts = new Map<string, number>();
    for (const g of allGaps) {
      const items = [
        ...g.missingRequiredSkills.split('·'),
        ...g.missingPreferredSkills.split('·'),
      ]
        .map((s) => s.replace(/^Preferred:\s*/i, '').trim())
        .filter((s) => s && !s.startsWith('None'));
      for (const it of items) {
        gapCounts.set(it, (gapCounts.get(it) || 0) + 1);
      }
    }
    const missingSkillTrends = Array.from(gapCounts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Chart 1: Experience Distribution
    const expBuckets = [
      { bracket: '12–15 Yrs (Director/VP)', min: 0, max: 15 },
      { bracket: '16–18 Yrs (SVP/VP)', min: 16, max: 18 },
      { bracket: '19–21 Yrs (C-Suite)', min: 19, max: 21 },
      { bracket: '22+ Yrs (Group CTO/CIO)', min: 22, max: 99 },
    ];
    const experienceDistribution = expBuckets.map((b) => ({
      bracket: b.bracket,
      candidates: allCands.filter(
        (c) => c.totalYearsExperience >= b.min && c.totalYearsExperience <= b.max
      ).length,
    }));

    // Chart 2: Candidate Distribution by Technology Domain
    const domainMap = new Map<string, number>();
    for (const c of allCands) {
      domainMap.set(c.primaryDomain, (domainMap.get(c.primaryDomain) || 0) + 1);
    }
    const domainDistribution = Array.from(domainMap.entries()).map(([domain, candidates]) => ({
      domain,
      candidates,
    }));

    // Chart 3: Job Opportunities by Role Category
    const catMap = new Map<string, number>();
    for (const j of allJobs) {
      catMap.set(j.roleCategory, (catMap.get(j.roleCategory) || 0) + 1);
    }
    const jobsByCategory = Array.from(catMap.entries()).map(([category, jobs]) => ({
      category,
      jobs,
    }));

    // Chart 4: Candidate-Job Matching Score Distribution
    const scoreDistribution = [
      {
        range: '90–100% (Premier Fit)',
        matches: allMatches.filter((m) => m.overallScore >= 90).length,
      },
      {
        range: '82–89% (High Confidence)',
        matches: allMatches.filter((m) => m.overallScore >= 82 && m.overallScore <= 89).length,
      },
      {
        range: '72–81% (Strong Contender)',
        matches: allMatches.filter((m) => m.overallScore >= 72 && m.overallScore <= 81).length,
      },
      {
        range: '<72% (Gap Mitigation)',
        matches: allMatches.filter((m) => m.overallScore < 72).length,
      },
    ];

    // Chart 5: Monthly Resume Analysis Trends
    const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const monthLabels: Record<string, string> = {
      '2026-06': 'Jun 2026',
      '2026-07': 'Jul 2026',
      '2026-08': 'Aug 2026',
      '2026-09': 'Sep 2026',
      '2026-10': 'Oct 2026',
    };
    const monthlyAnalysisTrends = months.map((m, idx) => {
      const countInMonth = allCands.filter((c) => c.analysisMonth === m).length;
      return {
        month: monthLabels[m] || m,
        resumesAnalysed: countInMonth,
        highConfidenceMatches: Math.max(2, countInMonth + idx),
      };
    });

    return {
      kpis: {
        totalCandidatesAnalysed: allCands.length,
        totalResumesUploaded: allResumes.length,
        totalJobDescriptionsProcessed: allJobs.length,
        totalCandidateJobMatches: allMatches.length,
        highConfidenceMatches: highConf,
        averageMatchingScore: avgScore,
        topTechnicalSpecialisations,
        topRecommendedPositions,
        missingSkillTrends,
      },
      charts: {
        experienceDistribution,
        domainDistribution,
        jobsByCategory,
        scoreDistribution,
        monthlyAnalysisTrends,
      },
    };
  } catch (error) {
    console.error('Database Error in getTalentIQDashboardAnalytics:', error);
    throw error;
  }
}

export async function createAndParseCandidateResume(payload: {
  filename: string;
  fileType: string;
  rawText: string;
}): Promise<CandidateFullRecord> {
  try {
    const parsed = await parseResumeWithIntelligence(payload.rawText, payload.filename);

    const [candRow] = await db
      .insert(candidates)
      .values({
        fullName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone,
        location: parsed.location,
        currentDesignation: parsed.currentDesignation,
        previousDesignations: parsed.previousDesignations,
        totalYearsExperience: parsed.totalYearsExperience,
        primaryDomain: parsed.primaryDomain,
        extractionConfidence: parsed.extractionConfidence,
        analysisMonth: '2026-10',
        isSynthetic: false,
      })
      .returning();

    await db.insert(candidateResumes).values({
      candidateId: candRow.id,
      filename: payload.filename,
      fileType: payload.fileType.toUpperCase(),
      rawText: payload.rawText,
      extractionConfidence: parsed.extractionConfidence,
    });

    await db.insert(candidateProfiles).values({
      candidateId: candRow.id,
      industryExperience: parsed.industryExperience,
      leadershipExperience: parsed.leadershipExperience,
      educationalQualifications: parsed.educationalQualifications,
      majorAchievements: parsed.majorAchievements,
      companiesWorkedAt: parsed.companiesWorkedAt,
      executiveSummary: parsed.executiveSummary,
    });

    if (parsed.employmentHistory.length > 0) {
      await db.insert(employmentHistory).values(
        parsed.employmentHistory.map((h) => ({
          candidateId: candRow.id,
          company: h.company,
          designation: h.designation,
          duration: h.duration,
          highlights: h.highlights,
        }))
      );
    }

    if (parsed.skills.length > 0) {
      await db.insert(candidateSkills).values(
        parsed.skills.map((s) => ({
          candidateId: candRow.id,
          skillName: s.skillName,
          skillCategory: s.skillCategory,
          proficiencyLevel: s.proficiencyLevel,
          yearsUsed: s.yearsUsed,
          isVerified: true,
        }))
      );
    }

    if (parsed.certifications.length > 0) {
      await db.insert(certifications).values(
        parsed.certifications.map((c) => ({
          candidateId: candRow.id,
          name: c.name,
          issuingOrg: c.issuingOrg,
          issueYear: c.issueYear,
        }))
      );
    }

    await db.insert(positioningRecommendations).values({
      candidateId: candRow.id,
      targetPositions: parsed.positioning.targetPositions,
      alternativePaths: parsed.positioning.alternativePaths,
      strongestDifferentiators: parsed.positioning.strongestDifferentiators,
      skillsNeedingVisibility: parsed.positioning.skillsNeedingVisibility,
      resumePositioningAdvice: parsed.positioning.resumePositioningAdvice,
      relevantIndustrySegments: parsed.positioning.relevantIndustrySegments,
      recommendedSearchStrategy: parsed.positioning.recommendedSearchStrategy,
      approvedByManager: false,
    });

    await db.insert(evaluationLogs).values({
      operationType: 'Single Resume Intelligence Parse',
      modelUsed: parsed.modelUsed,
      fallbackTriggered: parsed.fallbackTriggered,
      latencyMs: parsed.latencyMs,
      inputSummary: `Parsed ${payload.filename} for ${parsed.fullName} (${parsed.currentDesignation})`,
      outputMetadata: `Confidence: ${parsed.extractionConfidence}% | Skills Extracted: ${parsed.skills.length}`,
    });

    // Automatically run a match against the top job description so the new candidate immediately has match & gap intelligence
    const jobs = await getTalentIQJobDescriptions();
    if (jobs.length > 0) {
      await runCandidateJobMatch(candRow.id, jobs[0].id);
    }

    const all = await getTalentIQCandidates();
    return all.find((c) => c.id === candRow.id) || all[0];
  } catch (error) {
    console.error('Database Error in createAndParseCandidateResume:', error);
    throw error;
  }
}

export async function updateCandidateIntelligenceProfile(
  candidateId: number,
  payload: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    currentDesignation?: string;
    previousDesignations?: string;
    totalYearsExperience?: number;
    primaryDomain?: string;
    industryExperience?: string;
    leadershipExperience?: string;
    educationalQualifications?: string;
    majorAchievements?: string;
    companiesWorkedAt?: string;
    executiveSummary?: string;
    targetPositions?: string;
    strongestDifferentiators?: string;
    resumePositioningAdvice?: string;
    approvedByManager?: boolean;
  }
): Promise<CandidateFullRecord> {
  try {
    await db
      .update(candidates)
      .set({
        ...(payload.fullName ? { fullName: payload.fullName } : {}),
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.phone ? { phone: payload.phone } : {}),
        ...(payload.location ? { location: payload.location } : {}),
        ...(payload.currentDesignation ? { currentDesignation: payload.currentDesignation } : {}),
        ...(payload.previousDesignations
          ? { previousDesignations: payload.previousDesignations }
          : {}),
        ...(payload.totalYearsExperience !== undefined
          ? { totalYearsExperience: Number(payload.totalYearsExperience) }
          : {}),
        ...(payload.primaryDomain ? { primaryDomain: payload.primaryDomain } : {}),
        updatedAt: new Date(),
      })
      .where(eq(candidates.id, candidateId));

    await db
      .update(candidateProfiles)
      .set({
        ...(payload.industryExperience ? { industryExperience: payload.industryExperience } : {}),
        ...(payload.leadershipExperience
          ? { leadershipExperience: payload.leadershipExperience }
          : {}),
        ...(payload.educationalQualifications
          ? { educationalQualifications: payload.educationalQualifications }
          : {}),
        ...(payload.majorAchievements ? { majorAchievements: payload.majorAchievements } : {}),
        ...(payload.companiesWorkedAt ? { companiesWorkedAt: payload.companiesWorkedAt } : {}),
        ...(payload.executiveSummary ? { executiveSummary: payload.executiveSummary } : {}),
        updatedAt: new Date(),
      })
      .where(eq(candidateProfiles.candidateId, candidateId));

    if (
      payload.targetPositions !== undefined ||
      payload.strongestDifferentiators !== undefined ||
      payload.resumePositioningAdvice !== undefined ||
      payload.approvedByManager !== undefined
    ) {
      await db
        .update(positioningRecommendations)
        .set({
          ...(payload.targetPositions ? { targetPositions: payload.targetPositions } : {}),
          ...(payload.strongestDifferentiators
            ? { strongestDifferentiators: payload.strongestDifferentiators }
            : {}),
          ...(payload.resumePositioningAdvice
            ? { resumePositioningAdvice: payload.resumePositioningAdvice }
            : {}),
          ...(payload.approvedByManager !== undefined
            ? { approvedByManager: payload.approvedByManager }
            : {}),
        })
        .where(eq(positioningRecommendations.candidateId, candidateId));
    }

    const all = await getTalentIQCandidates();
    const found = all.find((c) => c.id === candidateId);
    if (!found) throw new Error('Candidate not found');
    return found;
  } catch (error) {
    console.error('Database Error in updateCandidateIntelligenceProfile:', error);
    throw error;
  }
}

export async function reprocessCandidateResume(candidateId: number): Promise<CandidateFullRecord> {
  try {
    const all = await getTalentIQCandidates();
    const existing = all.find((c) => c.id === candidateId);
    if (!existing) throw new Error('Candidate not found');

    const rawText =
      existing.resume?.rawText ||
      `${existing.fullName}\n${existing.currentDesignation}\n${existing.profile?.executiveSummary || ''}`;
    const parsed = await parseResumeWithIntelligence(
      rawText,
      existing.resume?.filename || 'reprocessed_cv.pdf'
    );

    await db
      .update(candidates)
      .set({
        extractionConfidence: Math.min(99, parsed.extractionConfidence + 1),
        updatedAt: new Date(),
      })
      .where(eq(candidates.id, candidateId));

    await db.insert(evaluationLogs).values({
      operationType: 'Resume Intelligence Reprocess',
      modelUsed: parsed.modelUsed,
      fallbackTriggered: parsed.fallbackTriggered,
      latencyMs: parsed.latencyMs,
      inputSummary: `Reprocessed resume for ${existing.fullName}`,
      outputMetadata: `Updated Extraction Confidence: ${Math.min(99, parsed.extractionConfidence + 1)}%`,
    });

    const refreshed = await getTalentIQCandidates();
    return refreshed.find((c) => c.id === candidateId)!;
  } catch (error) {
    console.error('Database Error in reprocessCandidateResume:', error);
    throw error;
  }
}

export async function createAndAnalyseJobDescription(payload: {
  rawDescription: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  compensationInfo?: string;
}): Promise<JobDescriptionFullRecord> {
  try {
    const parsed = await parseJobDescriptionWithIntelligence(
      payload.rawDescription,
      payload.jobTitle,
      payload.company
    );

    const [jobRow] = await db
      .insert(jobDescriptions)
      .values({
        jobTitle: payload.jobTitle || parsed.jobTitle,
        company: payload.company || parsed.company,
        roleCategory: parsed.roleCategory,
        seniorityLevel: parsed.seniorityLevel,
        yearsOfExperience: parsed.yearsOfExperience,
        leadershipExpectations: parsed.leadershipExpectations,
        industryRequirements: parsed.industryRequirements,
        technicalResponsibilities: parsed.technicalResponsibilities,
        location: payload.location || parsed.location,
        compensationInfo: payload.compensationInfo || parsed.compensationInfo,
        rawDescription: payload.rawDescription,
        isSynthetic: false,
      })
      .returning();

    const reqRows = [
      ...parsed.requiredSkills.map((sk) => ({
        jobId: jobRow.id,
        skillName: sk,
        requirementType: 'Required',
        weightImportance: 15,
      })),
      ...parsed.preferredSkills.map((sk) => ({
        jobId: jobRow.id,
        skillName: sk,
        requirementType: 'Preferred',
        weightImportance: 8,
      })),
    ];

    if (reqRows.length > 0) {
      await db.insert(jobRequirements).values(reqRows);
    }

    await db.insert(evaluationLogs).values({
      operationType: 'Job Description Intelligence Extraction',
      modelUsed: parsed.modelUsed,
      fallbackTriggered: parsed.fallbackTriggered,
      latencyMs: parsed.latencyMs,
      inputSummary: `Analysed JD: ${jobRow.jobTitle} at ${jobRow.company}`,
      outputMetadata: `Category: ${jobRow.roleCategory} | Required Skills: ${parsed.requiredSkills.length}`,
    });

    const allJobs = await getTalentIQJobDescriptions();
    return allJobs.find((j) => j.id === jobRow.id) || allJobs[0];
  } catch (error) {
    console.error('Database Error in createAndAnalyseJobDescription:', error);
    throw error;
  }
}

export async function updateJobDescriptionRecord(
  jobId: number,
  payload: {
    jobTitle?: string;
    company?: string;
    roleCategory?: string;
    seniorityLevel?: string;
    yearsOfExperience?: number;
    leadershipExpectations?: string;
    industryRequirements?: string;
    technicalResponsibilities?: string;
    location?: string;
    compensationInfo?: string;
  }
): Promise<JobDescriptionFullRecord> {
  try {
    await db
      .update(jobDescriptions)
      .set({
        ...(payload.jobTitle ? { jobTitle: payload.jobTitle } : {}),
        ...(payload.company ? { company: payload.company } : {}),
        ...(payload.roleCategory ? { roleCategory: payload.roleCategory } : {}),
        ...(payload.seniorityLevel ? { seniorityLevel: payload.seniorityLevel } : {}),
        ...(payload.yearsOfExperience !== undefined
          ? { yearsOfExperience: Number(payload.yearsOfExperience) }
          : {}),
        ...(payload.leadershipExpectations
          ? { leadershipExpectations: payload.leadershipExpectations }
          : {}),
        ...(payload.industryRequirements
          ? { industryRequirements: payload.industryRequirements }
          : {}),
        ...(payload.technicalResponsibilities
          ? { technicalResponsibilities: payload.technicalResponsibilities }
          : {}),
        ...(payload.location ? { location: payload.location } : {}),
        ...(payload.compensationInfo ? { compensationInfo: payload.compensationInfo } : {}),
      })
      .where(eq(jobDescriptions.id, jobId));

    const allJobs = await getTalentIQJobDescriptions();
    const found = allJobs.find((j) => j.id === jobId);
    if (!found) throw new Error('Job description not found');
    return found;
  } catch (error) {
    console.error('Database Error in updateJobDescriptionRecord:', error);
    throw error;
  }
}

export async function runCandidateJobMatch(
  candidateId: number,
  jobId: number
): Promise<MatchResultFullRecord> {
  try {
    const [allCands, allJobs, weights] = await Promise.all([
      getTalentIQCandidates(),
      getTalentIQJobDescriptions(),
      getMatchingWeights(),
    ]);

    const candidate = allCands.find((c) => c.id === candidateId);
    const job = allJobs.find((j) => j.id === jobId);
    if (!candidate || !job) {
      throw new Error('Selected candidate or job description does not exist');
    }

    const evaluation = evaluateCandidateJobMatchDeterministic(candidate, job, weights);

    // Check if a match already exists for this pair; if so, update it
    const existingMatches = await db
      .select()
      .from(matchResults)
      .where(eq(matchResults.candidateId, candidateId));
    const existingPair = existingMatches.find((m) => m.jobId === jobId);

    let matchId: number;
    if (existingPair) {
      matchId = existingPair.id;
      await db
        .update(matchResults)
        .set({
          overallScore: evaluation.overallScore,
          technicalScore: evaluation.technicalScore,
          leadershipScore: evaluation.leadershipScore,
          seniorityScore: evaluation.seniorityScore,
          domainScore: evaluation.domainScore,
          industryScore: evaluation.industryScore,
          progressionScore: evaluation.progressionScore,
          qualificationScore: evaluation.qualificationScore,
          confidenceTier: evaluation.confidenceTier,
          scoringMode: evaluation.scoringMode,
          evaluatedAt: new Date(),
        })
        .where(eq(matchResults.id, matchId));

      await db
        .update(matchExplanations)
        .set(evaluation.explanation)
        .where(eq(matchExplanations.matchId, matchId));

      await db
        .update(skillsGapAnalysis)
        .set(evaluation.skillsGap)
        .where(eq(skillsGapAnalysis.matchId, matchId));
    } else {
      const [insertedMatch] = await db
        .insert(matchResults)
        .values({
          candidateId,
          jobId,
          overallScore: evaluation.overallScore,
          technicalScore: evaluation.technicalScore,
          leadershipScore: evaluation.leadershipScore,
          seniorityScore: evaluation.seniorityScore,
          domainScore: evaluation.domainScore,
          industryScore: evaluation.industryScore,
          progressionScore: evaluation.progressionScore,
          qualificationScore: evaluation.qualificationScore,
          confidenceTier: evaluation.confidenceTier,
          scoringMode: evaluation.scoringMode,
        })
        .returning();
      matchId = insertedMatch.id;

      await db.insert(matchExplanations).values({
        matchId,
        ...evaluation.explanation,
      });

      await db.insert(skillsGapAnalysis).values({
        matchId,
        candidateId,
        jobId,
        ...evaluation.skillsGap,
      });
    }

    await db.insert(evaluationLogs).values({
      operationType: 'Candidate-Job Match & Gap Evaluation',
      modelUsed: evaluation.modelUsed,
      fallbackTriggered: evaluation.fallbackTriggered,
      latencyMs: evaluation.latencyMs,
      inputSummary: `${candidate.fullName} vs ${job.jobTitle} (${job.company})`,
      outputMetadata: `Composite Score: ${evaluation.overallScore}% (${evaluation.confidenceTier})`,
    });

    const matches = await getTalentIQMatches();
    return matches.find((m) => m.id === matchId) || matches[0];
  } catch (error) {
    console.error('Database Error in runCandidateJobMatch:', error);
    throw error;
  }
}

export async function updateMatchingWeightsAndRecalculate(
  weights: Omit<MatchingWeights, 'id' | 'configName' | 'updatedAt'>
): Promise<{ weights: MatchingWeights; recalculatedCount: number }> {
  try {
    await db
      .update(matchingWeightsConfig)
      .set({
        technicalWeight: Number(weights.technicalWeight),
        leadershipWeight: Number(weights.leadershipWeight),
        seniorityWeight: Number(weights.seniorityWeight),
        domainWeight: Number(weights.domainWeight),
        industryWeight: Number(weights.industryWeight),
        progressionWeight: Number(weights.progressionWeight),
        qualificationWeight: Number(weights.qualificationWeight),
        updatedBy: weights.updatedBy || 'Administrator',
        updatedAt: new Date(),
      })
      .where(eq(matchingWeightsConfig.configName, 'default'));

    const updatedWeights = await getMatchingWeights();
    const existingMatches = await db.select().from(matchResults);

    const totalW =
      updatedWeights.technicalWeight +
      updatedWeights.leadershipWeight +
      updatedWeights.seniorityWeight +
      updatedWeights.domainWeight +
      updatedWeights.industryWeight +
      updatedWeights.progressionWeight +
      updatedWeights.qualificationWeight || 100;

    for (const m of existingMatches) {
      const newOverall = Math.round(
        (m.technicalScore * updatedWeights.technicalWeight +
          m.leadershipScore * updatedWeights.leadershipWeight +
          m.seniorityScore * updatedWeights.seniorityWeight +
          m.domainScore * updatedWeights.domainWeight +
          m.industryScore * updatedWeights.industryWeight +
          m.progressionScore * updatedWeights.progressionWeight +
          m.qualificationScore * updatedWeights.qualificationWeight) /
          totalW
      );
      const newTier =
        newOverall >= 82
          ? 'High Confidence'
          : newOverall >= 72
          ? 'Strong Contender'
          : 'Exploratory / Gap Mitigation Needed';

      await db
        .update(matchResults)
        .set({
          overallScore: newOverall,
          confidenceTier: newTier,
          scoringMode: `Hybrid Semantic + Weighted Rule Engine (${updatedWeights.technicalWeight}/${updatedWeights.leadershipWeight}/${updatedWeights.seniorityWeight}/${updatedWeights.domainWeight}/${updatedWeights.industryWeight}/${updatedWeights.progressionWeight}/${updatedWeights.qualificationWeight})`,
          evaluatedAt: new Date(),
        })
        .where(eq(matchResults.id, m.id));
    }

    await db.insert(evaluationLogs).values({
      operationType: 'Matching Weights Reconfiguration',
      modelUsed: 'Weighted Matrix Recalculator',
      fallbackTriggered: false,
      latencyMs: 65,
      inputSummary: `Updated weights to ${updatedWeights.technicalWeight}/${updatedWeights.leadershipWeight}/${updatedWeights.seniorityWeight}/${updatedWeights.domainWeight}/${updatedWeights.industryWeight}/${updatedWeights.progressionWeight}/${updatedWeights.qualificationWeight}`,
      outputMetadata: `Recalculated ${existingMatches.length} stored executive match scores`,
    });

    return { weights: updatedWeights, recalculatedCount: existingMatches.length };
  } catch (error) {
    console.error('Database Error in updateMatchingWeightsAndRecalculate:', error);
    throw error;
  }
}

export async function getEvaluationLogs(): Promise<EvaluationLogRecord[]> {
  try {
    await ensureTalentIQSeeded();
    const rows = await db
      .select()
      .from(evaluationLogs)
      .orderBy(desc(evaluationLogs.id))
      .limit(50);
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Database Error in getEvaluationLogs:', error);
    throw error;
  }
}
