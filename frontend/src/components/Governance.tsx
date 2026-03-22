import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { handleTransferRequest } from "../api";

interface TransferRequestRow {
  id: string;
  report_id: string;
  patient_name: string;
  reason: string;
  created_at: string;
}

export const Governance: React.FC = () => {
  const [requests, setRequests] = useState<TransferRequestRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!supabase) return;
    setLoading(true);
    // Note: We need a transfer_requests table or use a status in lab_audit.
    // Based on the contract, there's a mapping. In Supabase, we'll look for status 'TRANSFER_PENDING'
    const { data, error } = await supabase
      .from("lab_audit")
      .select("id, report_id, patient_name, status")
      .eq("status", "TRANSFER_PENDING");
    
    if (!error) setRequests(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, approve: boolean) => {
    const note = prompt(`Enter a note for this ${approve ? 'approval' : 'refusal'}:`);
    if (note === null) return;

    setLoading(true);
    try {
      await handleTransferRequest(Number(id), approve, note);
      alert(`Transfer request ${approve ? 'APPROVED' : 'REFUSED'}.`);
      fetchRequests();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Clinical Governance</h1>
        <p className="sub">Manage clinical data portability and Patient transfer requests.</p>
      </header>

      <div className="card">
        <h2>Portability Inbox</h2>
        {loading && <p>Loading requests...</p>}
        {!loading && requests.length === 0 && <p className="sub">No pending transfer requests.</p>}
        
        {requests.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Patient</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.report_id}</td>
                  <td>{r.patient_name}</td>
                  <td>{r.reason || "N/A"}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="primary-btn" style={{ background: '#10b981' }} onClick={() => handleAction(r.report_id, true)}>Approve</button>
                      <button className="secondary-btn" style={{ color: '#ef4444' }} onClick={() => handleAction(r.report_id, false)}>Refuse</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
