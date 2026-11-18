import { useState } from "react";
import {
  Bell,
  Cpu,
  Server,
  Save,
  Eye,
  EyeOff,
  Check,
  Database,
  Shield,
  Clock,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";

/* ─── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ message, visible }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        background: "#ffffff",
        border: "1px solid var(--pb-border)",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
        padding: "14px 22px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.28s ease, transform 0.28s ease",
        pointerEvents: "none",
        minWidth: 220,
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "#16a34a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Check size={14} color="#fff" strokeWidth={3} />
      </span>
      <span
        style={{
          fontFamily: "var(--pb-font-body)",
          fontSize: 14,
          fontWeight: 600,
          color: "#1a1a2e",
        }}
      >
        {message}
      </span>
    </div>
  );
}

/* ─── Toggle Switch ──────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 48,
        height: 26,
        borderRadius: 999,
        background: checked ? "var(--pb-leaf)" : "#cbd5e1",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.22s ease",
        flexShrink: 0,
        outline: "none",
      }}
      aria-checked={checked}
      role="switch"
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 24 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          transition: "left 0.22s ease",
        }}
      />
    </button>
  );
}

/* ─── Section Card ───────────────────────────────────────────────────────── */
function SectionCard({ children }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid var(--pb-border)",
        boxShadow: "var(--pb-shadow)",
        padding: "32px 36px",
        marginBottom: 28,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--pb-rose), var(--pb-plum))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} color="#fff" />
        </span>
        <h2
          style={{
            fontFamily: "var(--pb-font-heading)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--pb-plum)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <p
        style={{
          fontFamily: "var(--pb-font-body)",
          fontSize: 13.5,
          color: "#64748b",
          margin: "0 0 0 52px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

/* ─── Number Input Row ───────────────────────────────────────────────────── */
function NumberInputRow({ label, value, onChange, unit }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          fontFamily: "var(--pb-font-body)",
          fontSize: 14,
          fontWeight: 500,
          color: "#334155",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: 72,
            padding: "7px 12px",
            borderRadius: 10,
            border: "1.5px solid var(--pb-border)",
            fontFamily: "var(--pb-font-body)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--pb-plum)",
            background: "var(--pb-tint)",
            outline: "none",
            textAlign: "center",
          }}
        />
        {unit && (
          <span
            style={{
              fontFamily: "var(--pb-font-body)",
              fontSize: 13,
              color: "#94a3b8",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Select Row ─────────────────────────────────────────────────────────── */
function SelectRow({ label, value, onChange, options }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          fontFamily: "var(--pb-font-body)",
          fontSize: 14,
          fontWeight: 500,
          color: "#334155",
        }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "7px 36px 7px 14px",
          borderRadius: 10,
          border: "1.5px solid var(--pb-border)",
          fontFamily: "var(--pb-font-body)",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--pb-plum)",
          background: "var(--pb-tint)",
          cursor: "pointer",
          outline: "none",
          appearance: "auto",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─── Toggle Row ─────────────────────────────────────────────────────────── */
function ToggleRow({ label, checked, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          fontFamily: "var(--pb-font-body)",
          fontSize: 14,
          fontWeight: 500,
          color: "#334155",
        }}
      >
        {label}
      </span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ─── Info Row ───────────────────────────────────────────────────────────── */
function InfoRow({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid #f1f5f9",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--pb-font-body)",
          fontSize: 14,
          fontWeight: 500,
          color: "#334155",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{children}</div>
    </div>
  );
}

/* ─── Pill Value ─────────────────────────────────────────────────────────── */
function PillValue({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 14px",
        borderRadius: 999,
        background: "#f1f5f9",
        fontFamily: "var(--pb-font-body)",
        fontSize: 13,
        fontWeight: 600,
        color: "#334155",
        letterSpacing: 0.1,
      }}
    >
      {children}
    </span>
  );
}

/* ─── Status Dot ─────────────────────────────────────────────────────────── */
function GreenDot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#16a34a",
        boxShadow: "0 0 0 2px #dcfce7",
      }}
    />
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function SystemSettings() {
  /* Stock section state */
  const [roseLevel, setRoseLevel] = useState(50);
  const [orchidLevel, setOrchidLevel] = useState(30);
  const [criticalLevel, setCriticalLevel] = useState(20);
  const [autoReorder, setAutoReorder] = useState(true);
  const [stockToast, setStockToast] = useState(false);

  /* ML section state */
  const [confidence, setConfidence] = useState("90");
  const [horizon, setHorizon] = useState("4weeks");
  const [modelType, setModelType] = useState("ensemble");
  const [surgeAlerts, setSurgeAlerts] = useState(true);
  const [mlToast, setMlToast] = useState(false);

  /* System info state */
  const [showKey, setShowKey] = useState(false);

  /* Toast helper */
  const fireToast = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--pb-tint)",
        fontFamily: "var(--pb-font-body)",
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="System Settings"
        subtitle="Configure platform behavior and preferences"
      />

      {/* Content */}
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "36px 24px 60px",
        }}
      >
        {/* ── Section 1: Stock & Reorder Alerts ─────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={Bell}
            title="Stock & Reorder Alerts"
            subtitle="Set automatic reorder thresholds for your warehouse"
          />

          <NumberInputRow
            label="Rose Reorder Level"
            value={roseLevel}
            onChange={setRoseLevel}
            unit="stems"
          />
          <NumberInputRow
            label="Orchid Reorder Level"
            value={orchidLevel}
            onChange={setOrchidLevel}
            unit="stems"
          />
          <NumberInputRow
            label="Critical Stock Alert"
            value={criticalLevel}
            onChange={setCriticalLevel}
            unit="stems"
          />
          <ToggleRow
            label="Enable auto-reorder emails"
            checked={autoReorder}
            onChange={setAutoReorder}
          />

          <div style={{ marginTop: 28 }}>
            <Button
              variant="primary"
              onClick={() => fireToast(setStockToast)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Save size={15} />
              Save Changes
            </Button>
          </div>
        </SectionCard>

        {/* ── Section 2: ML Forecast Settings ───────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={Cpu}
            title="ML Forecast Settings"
            subtitle="Configure the demand forecasting model behavior"
          />

          <SelectRow
            label="Confidence Threshold"
            value={confidence}
            onChange={setConfidence}
            options={[
              { value: "70", label: "70%" },
              { value: "80", label: "80%" },
              { value: "90", label: "90%" },
              { value: "95", label: "95%" },
            ]}
          />
          <SelectRow
            label="Forecast Horizon"
            value={horizon}
            onChange={setHorizon}
            options={[
              { value: "2weeks", label: "2 weeks" },
              { value: "4weeks", label: "4 weeks" },
              { value: "6weeks", label: "6 weeks" },
              { value: "8weeks", label: "8 weeks" },
            ]}
          />
          <SelectRow
            label="Model Type"
            value={modelType}
            onChange={setModelType}
            options={[
              { value: "randomforest", label: "Random Forest" },
              { value: "prophet", label: "Prophet" },
              { value: "ensemble", label: "Ensemble" },
            ]}
          />
          <ToggleRow
            label="Enable seasonal surge alerts"
            checked={surgeAlerts}
            onChange={setSurgeAlerts}
          />

          <div style={{ marginTop: 28 }}>
            <Button
              variant="primary"
              onClick={() => fireToast(setMlToast)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Save size={15} />
              Save Changes
            </Button>
          </div>
        </SectionCard>

        {/* ── Section 3: System Info ─────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={Server}
            title="System Info"
            subtitle="Platform infrastructure and security details"
          />

          <InfoRow label="App Version">
            <PillValue>v2.4.1</PillValue>
          </InfoRow>

          <InfoRow label="Database">
            <PillValue>
              <Database size={13} color="#475569" />
              PostgreSQL 15.3
            </PillValue>
            <PillValue>
              <GreenDot />
              Online
            </PillValue>
          </InfoRow>

          <InfoRow label="API Gateway">
            <PillValue>
              <Shield size={13} color="#475569" />
              Running
            </PillValue>
            <GreenDot />
          </InfoRow>

          <InfoRow label="Backup Schedule">
            <PillValue>
              <Clock size={13} color="#475569" />
              Daily at 2:00 AM
            </PillValue>
          </InfoRow>

          <InfoRow label="API Key">
            <PillValue>
              {showKey ? "pb_live_sk_xK9mRpQ7wNv3" : "pb_live_sk_••••••••••••••"}
            </PillValue>
            <button
              onClick={() => setShowKey((prev) => !prev)}
              title={showKey ? "Hide API key" : "Show API key"}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1.5px solid var(--pb-border)",
                background: "#f8fafc",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                transition: "background 0.18s",
                outline: "none",
                flexShrink: 0,
              }}
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </InfoRow>
        </SectionCard>
      </div>

      {/* Toasts */}
      <Toast message="Stock settings saved ✓" visible={stockToast} />
      <Toast message="ML settings saved ✓" visible={mlToast} />
    </div>
  );
}
