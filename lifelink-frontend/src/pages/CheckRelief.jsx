import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function CheckRelief() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function verify() {
    setError(null);
    setResult(null);
    if (!id.trim()) {
      setError("Please enter a transaction or tracking ID.");
      return;
    }
    setLoading(true);
    try {
      // Primary unified verification endpoint (donation OR supply)
      const url = `${API_BASE}/verifyRecord/${encodeURIComponent(id.trim())}`;
      let res = await fetch(url, { method: "GET" });

      // fallback to older /verifyRecord or /checkRelief patterns if needed
      if (res.status === 404) {
        // try legacy endpoints
        res = await fetch(`${API_BASE}/verify/${encodeURIComponent(id.trim())}`);
        if (!res.ok) {
          const res2 = await fetch(`${API_BASE}/checkRelief/${encodeURIComponent(id.trim())}`);
          if (!res2.ok) throw new Error("Record not found");
          const legacy = await res2.json();
          setResult({ type: "legacy", data: legacy });
          setLoading(false);
          return;
        }
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Record not found");
      }

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError(err.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }

  function renderResult() {
    if (!result) return null;

    // result format expected:
    // { type: "donation"|"supply"|"legacy", data: {...} } OR legacy raw object
    if (result.type === "legacy") {
      const d = result.data;
      return (
        <div style={styles.card}>
          <h4>Relief (legacy)</h4>
          {Object.entries(d).map(([k, v]) => (
            <p key={k}><strong>{k}:</strong> {String(v)}</p>
          ))}
          <VerifyLinks idProp={d.id || d.txHash || d.trackingId} />
        </div>
      );
    }

    const { type, data } = result;
    if (!data) return null;

    if (type === "donation") {
      return (
        <div style={styles.card}>
          <h4>Donation Verified ✅</h4>
          <p><strong>Donor:</strong> {data.donor || data.donorName || data.donorName}</p>
          <p><strong>Amount:</strong> {data.amount || data.qty || "-"}</p>
          <p><strong>Purpose:</strong> {data.purpose || "-"}</p>
          <p><strong>Recorded By:</strong> {data.createdBy || data.sender || "-"}</p>
          <p><strong>Timestamp:</strong> {data.ts || data.timestamp || "-"}</p>
          <VerifyLinks idProp={data.txHash || data.id} />
        </div>
      );
    }

    if (type === "supply") {
      return (
        <div style={styles.card}>
          <h4>Supply / Dispatch Verified ✅</h4>
          <p><strong>Item:</strong> {data.item || "-"}</p>
          <p><strong>Quantity:</strong> {data.quantity || data.qty || "-"}</p>
          <p><strong>From:</strong> {data.from || "-"}</p>
          <p><strong>To:</strong> {data.to || data.location?.to || "-"}</p>
          <p><strong>Tracking ID:</strong> {data.trackingId || data.trackingId || "-"}</p>
          <p><strong>Last Known Location:</strong> {data.location ? `${data.location.lat}, ${data.location.lng}` : "N/A"}</p>
          <p><strong>Recorded By:</strong> {data.createdBy || "-"}</p>
          <p><strong>Timestamp:</strong> {data.ts || data.timestamp || "-"}</p>
          <VerifyLinks idProp={data.trackingId || data.trackingId} />
        </div>
      );
    }

    // fallback: show raw
    return (
      <div style={styles.card}>
        <h4>Record</h4>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>LifeLink — Check & Verify Relief</h2>

      <div style={styles.panel}>
        <input
          placeholder="Enter TX hash or tracking ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={styles.input}
        />
        <button onClick={verify} style={styles.button} disabled={loading}>
          {loading ? "Checking…" : "Verify"}
        </button>

        {error && <div style={styles.error}>{error}</div>}

        {renderResult()}
      </div>

      <div style={styles.help}>
        <p>Tip: you can paste the trackingId returned by the admin when they create a dispatch, or scan a QR (mobile).</p>
       
