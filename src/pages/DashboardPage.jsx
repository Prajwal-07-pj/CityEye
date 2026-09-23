/* eslint-disable no-unused-vars */
export default function DashboardPage({
  role, view, activeTop, notifications, onNavigate, onLogout, onOpenReport, selectedReport,
  reports, citizenName, workerName, onCitizenSubmit, onFeedback, onAdminAssign, onAdminNotify,
  onUpdateReport, onWorkerComplete, onWorkerCompleteOpen, onOfficerDecision, nav, pages,
}) {
  const common = { onNavigate, onLogout };
  return (
    <>
      {role === "citizen" && <>
        <pages.TopNav role="Citizen" active={view} items={nav.citizen} notifCount={notifications.citizen.length} {...common} />
        {view === "citizen-home" && <pages.CitizenHome reports={reports} citizenName={citizenName} onNavigate={onNavigate} onOpenReport={onOpenReport} />}
        {view === "citizen-report" && <pages.ReportWizard onSubmit={onCitizenSubmit} citizenName={citizenName} />}
        {view === "citizen-myreports" && <pages.CitizenMyReports reports={reports} citizenName={citizenName} onOpenReport={onOpenReport} />}
        {view === "citizen-nearby" && <pages.CitizenHome reports={reports} citizenName={citizenName} onNavigate={onNavigate} onOpenReport={onOpenReport} />}
        {view === "citizen-track" && selectedReport && <pages.CitizenReportDetail report={selectedReport} onFeedback={onFeedback} />}
        {view === "notifications" && <pages.NotificationsPage notifications={notifications.citizen} />}
      </>}

      {role === "admin" && <>
        <pages.TopNav role="Admin" active={activeTop} items={nav.admin.slice(0, 4)} notifCount={notifications.admin.length} {...common} />
        <div className="flex"><pages.SideNav items={nav.admin} active={view} onNavigate={onNavigate} /><div className="flex-1">
          {view === "admin-dashboard" && <pages.AdminDashboard reports={reports} onNavigate={onNavigate} onOpenReport={onOpenReport} />}
          {view === "admin-issues" && <pages.AdminAllIssues reports={reports} onOpenReport={onOpenReport} />}
          {view === "admin-map" && <pages.AdminMapView reports={reports} onOpenReport={onOpenReport} />}
          {view === "admin-review" && selectedReport && <pages.AdminIssueReview report={selectedReport} onUpdate={onAdminAssign} notify={onAdminNotify} />}
          {view === "admin-workers" && <pages.AdminWorkers reports={reports} />}
          {view === "admin-analytics" && <pages.AdminAnalytics reports={reports} />}
          {view === "admin-heatmap" && <pages.AdminHeatmap reports={reports} />}
          {view === "notifications" && <pages.NotificationsPage notifications={notifications.admin} />}
        </div></div>
      </>}

      {role === "worker" && <>
        <pages.TopNav role="Worker" active={view} items={nav.worker} notifCount={notifications.worker.length} {...common} />
        {view === "worker-tasks" && <pages.WorkerDashboard reports={reports} workerName={workerName} onOpenTask={onOpenReport} />}
        {view === "worker-task" && selectedReport && <pages.WorkerTaskPage report={selectedReport} onUpdate={onUpdateReport} onGoComplete={onWorkerCompleteOpen} />}
        {view === "worker-complete" && selectedReport && <pages.WorkerCompletionUpload report={selectedReport} onSubmit={onWorkerComplete} />}
        {view === "notifications" && <pages.NotificationsPage notifications={notifications.worker} />}
      </>}

      {role === "officer" && <>
        <pages.TopNav role="Officer" active={view} items={nav.officer} notifCount={notifications.officer.length} {...common} />
        {view === "officer-verify" && <pages.OfficerDashboard reports={reports} onOpenVerify={onOpenReport} />}
        {view === "officer-review" && selectedReport && <pages.OfficerVerifyDetail report={selectedReport} onDecision={onOfficerDecision} />}
        {view === "notifications" && <pages.NotificationsPage notifications={notifications.officer} />}
      </>}
    </>
  );
}
