import React, { useState, useEffect } from "react";
import { fetchLabAudit, verifyOnChainReport, rejectOnChainReport, type LabAuditRow } from "../api";

export const VerifyQueue: React.FC = () => {
  const [reports, setReports] = useState<LabAuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const refreshQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchLabAudit();
      // Filter for PENDING status in the clinical queue
      setReports(data.filter(r => r.status === "PENDING"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshQueue();
  }, []);

  const handleVerify = async (id: string) => {
    if (!confirm(`Are you sure you want to clinically verify report #${id}?`)) return;
    setLoading(true);
    try {
      await verifyOnChainReport(Number(id));
      alert(`Report #${id} verified successfully!`);
      refreshQueue();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (id: string) => {
    setActionId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!actionId || !rejectReason.trim()) return;
    setLoading(true);
    try {
      await rejectOnChainReport(Number(actionId), rejectReason.trim());
      alert(`Report #${actionId} has been VETOED.`);
      setShowRejectModal(false);
      refreshQueue();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Verification Desk</h1>
        <p className="sub">
          Review pending diagnostics and provide final clinical sign-off or veto anomalies.
        </p>
      </header>

      <div className="card">
        {loading && <p>Processing...</p>}
        {reports.length === 0 ? (
          <p className="sub">No pending reports for verification.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Test</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.report_id}</td>
                  <td>{r.patient_name} <br/><small className="sub">{r.patient_evm}</small></td>
                  <td>{r.test_name}</td>
                  <td><span style={{ filter: 'blur(4px)', userSelect: 'none' }}>HIDDEN</span></td>
                  <td>
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    {/* NEW REVIEW BUTTON */}
    <button 
      className="secondary-btn" 
      onClick={() => alert(`CLINICAL DATA REVIEW\nPatient: ${r.patient_name}\nTest: ${r.test_name}\nRESULT: ${r.result_value}`)}
      style={{ padding: '0.5rem 0.75rem', borderColor: '#3b82f6', color: '#3b82f6' }}
    >
      Review
    </button>

    <button 
      className="primary-btn" 
      onClick={() => handleVerify(r.report_id!)}
      style={{ background: '#10b981', padding: '0.5rem 0.75rem' }}
    >
      Verify
    </button>

    <button 
      className="secondary-btn" 
      onClick={() => handleRejectClick(r.report_id!)}
      style={{ color: '#ef4444', borderColor: '#fecaca', padding: '0.5rem 0.75rem' }}
    >
      Veto
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRejectModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px' }}>
            <h2>Clinical Veto</h2>
            <p className="sub" style={{ marginBottom: '1rem' }}>Enter the reason for rejecting report #{actionId}:</p>
            <textarea
              style={{ width: '100%', minHeight: '100px', marginBottom: '1rem', padding: '0.75rem', borderRadius: '8px' }}
              placeholder="e.g., Sample contaminated, Out of clinical range..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="secondary-btn" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="primary-btn" style={{ background: '#ef4444' }} onClick={submitRejection} disabled={!rejectReason.trim()}>
                Confirm Veto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
