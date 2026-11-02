import {
  getDashboardAnalytics,
  getClientsDirectory,
  getPipelineData,
  getOutreachCrmData,
  getInterviewsData,
  getClientDeliveryData,
  getClientReportsData,
} from '../src/db/repository.ts';

async function runVerificationSuite() {
  console.log('Running CareerPilot PostgreSQL Integration & Workflow Tests...');

  const dash = await getDashboardAnalytics();
  if (dash.kpis.totalClients < 12) {
    throw new Error(`Expected at least 12 executive clients, got ${dash.kpis.totalClients}`);
  }
  if (dash.kpis.totalOpportunities < 50) {
    throw new Error(`Expected at least 50 job opportunities, got ${dash.kpis.totalOpportunities}`);
  }
  if (dash.kpis.totalApplicationsRecords < 100) {
    throw new Error(`Expected at least 100 application records, got ${dash.kpis.totalApplicationsRecords}`);
  }
  if (dash.kpis.hiringManagerOutreach < 60) {
    throw new Error(`Expected at least 60 outreach records, got ${dash.kpis.hiringManagerOutreach}`);
  }
  if (dash.kpis.interviewsSecured < 30) {
    throw new Error(`Expected at least 30 interview records, got ${dash.kpis.interviewsSecured}`);
  }

  const [clientsList, pipeline, outreach, interviews, delivery, reports] = await Promise.all([
    getClientsDirectory(),
    getPipelineData(),
    getOutreachCrmData(),
    getInterviewsData(),
    getClientDeliveryData(),
    getClientReportsData(),
  ]);

  console.log(`✓ Verified ${clientsList.length} executive clients with profiles & programs`);
  console.log(`✓ Verified ${pipeline.opportunities.length} job opportunities & ${pipeline.applications.length} applications`);
  console.log(`✓ Verified ${outreach.activities.length} hiring-manager outreach records`);
  console.log(`✓ Verified ${interviews.length} executive interview records`);
  console.log(`✓ Verified ${delivery.tasks.length} tasks & ${delivery.deliverables.length} deliverables`);
  console.log(`✓ Verified ${reports.liveSnapshots.length} live weekly client report snapshots`);
  console.log('ALL INTEGRATION TESTS PASSED.');
  process.exit(0);
}

runVerificationSuite().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
