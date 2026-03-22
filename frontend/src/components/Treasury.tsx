import React, { useState, useEffect } from "react";
import { fetchTreasuryStats, setAutomationStatus, setAnchorFee } from "../api";

export const Treasury: React.FC = () => {
  const [stats, setStats] = useState<{ balanceHbar: string, contractId: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [automation, setAutomation] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchTreasuryStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const toggleAutomation = async () => {
    const newStatus = !automation;
    setLoading(true);
    try {
      await setAutomationStatus(newStatus);
      setAutomation(newStatus);
      alert(`AI Automation ${newStatus ? 'ENABLED' : 'DISABLED'}.`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateFee = async () => {
    const fee = prompt("Enter new Anchor Fee (in tinybars):");
    if (!fee) return;
    setLoading(true);
    try {
      await setAnchorFee(Number(fee));
      alert("Anchor fee updated!");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Hospital Treasury</h1>
        <p className="sub">Monitor clinical anchoring costs and manage system-wide automation.</p>
      </header>

      <div className="grid-two">
        <section className="stat-card">
          <span className="stat-label">The HBAR Gauge</span>
          <span className="stat-value">{stats ? `${stats.balanceHbar} ℏ` : "Loading..."}</span>
          <span className="stat-sub">Contract Balance ({stats?.contractId || "..."})</span>
          <button className="secondary-btn" style={{ marginTop: '1rem' }} onClick={loadStats}>Refresh Balance</button>
        </section>

        <section className="stat-card">
          <span className="stat-label">AI Automation Shield</span>
          <span className="stat-value">{automation ? "ACTIVE" : "OFFLINE"}</span>
          <span className="stat-sub">{automation ? "Agent handling anchoring fees" : "Manual verification required"}</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className="primary-btn" 
              style={{ background: automation ? '#ef4444' : '#10b981', flex: 1 }}
              onClick={toggleAutomation}
              disabled={loading}
            >
              {automation ? "Emergency Stop (Kill Switch)" : "Enable AI Agent"}
            </button>
            <button className="secondary-btn" onClick={updateFee}>Set Fee</button>
          </div>
        </section>
      </div>
    </div>
  );
};
