import {
  getTalentIQDashboardAnalytics,
  getTalentIQCandidates,
  getTalentIQJobDescriptions,
  getTechnologyRolesTaxonomy,
  getTalentIQMatches,
  runCandidateJobMatch,
  getMatchingWeights,
} from '../src/db/talentiq_repository.ts';

async function verifyTalentIQPlatform() {
  console.log('Running TalentIQ End-to-End PostgreSQL & Matching Verification...');

  const dash = await getTalentIQDashboardAnalytics();
  const cands = await getTalentIQCandidates();
  const jobs = await getTalentIQJobDescriptions();
  const roles = await getTechnologyRolesTaxonomy();
  const matches = await getTalentIQMatches();
  const weights = await getMatchingWeights();

  console.log(`- Candidates Analysed: ${cands.length} (Required >= 15)`);
  console.log(`- Job Descriptions Indexed: ${jobs.length} (Required >= 30)`);
  console.log(`- Technology Taxonomy Roles: ${roles.length} (Required >= 21)`);
  console.log(`- Pre-computed Matches: ${matches.length}`);
  console.log(`- High-Confidence Matches: ${dash.kpis.highConfidenceMatches}`);
  console.log(
    `- Active Weights: ${weights.technicalWeight}/${weights.leadershipWeight}/${weights.seniorityWeight}/${weights.domainWeight}/${weights.industryWeight}/${weights.progressionWeight}/${weights.qualificationWeight}`
  );

  if (cands.length < 15) throw new Error('Expected at least 15 executive candidates');
  if (jobs.length < 30) throw new Error('Expected at least 30 job descriptions');
  if (roles.length < 21) throw new Error('Expected at least 21 technology taxonomy roles');

  // Test live match evaluation
  const liveMatch = await runCandidateJobMatch(cands[0].id, jobs[0].id);
  console.log(
    `- Live Match Evaluation Verified: ${liveMatch.candidateName} -> ${liveMatch.jobTitle} = ${liveMatch.overallScore}% (${liveMatch.confidenceTier})`
  );

  console.log('ALL TALENTIQ PLATFORM CHECKS PASSED.');
  process.exit(0);
}

verifyTalentIQPlatform().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
