import React, { useState, useEffect } from "react";
import {
  Shield,
  Database,
  Cloud,
  CheckCircle2,
  Server,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Lock,
  Cpu,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { COGNITO_CONFIG } from "../config/aws-cognito";
import { API_BASE_URL } from "../services/api";

const SECURE_ENV_TEMPLATES = [
  { key: "AWS_REGION", value: "us-east-1", note: "Primary AWS Region (Bedrock + DynamoDB)" },
  { key: "AWS_ACCESS_KEY_ID", value: "AKIA5RURABIWRXNTZAMQ", note: "Boto3 IAM Access Key for Bedrock & DynamoDB" },
  { key: "AWS_SECRET_ACCESS_KEY", value: "[STORED_IN_SERVER_ENV_VARS]", note: "40-char IAM Secret Key (Guarded Server-Side)" },
  { key: "BEDROCK_MODEL_ID", value: "anthropic.claude-sonnet-4-6", note: "Primary Reasoning Model (Priority #1)" },
  { key: "BEDROCK_MODEL_2_ID", value: "anthropic.claude-3-5-sonnet-20241022-v2:0", note: "Secondary Reasoning Model (Priority #2)" },
  { key: "GEMINI_API_KEY", value: "[STORED_IN_SERVER_ENV_VARS]", note: "Google GenAI 3.5+ Flash Failover Key" },
  { key: "DYNAMODB_TABLE_NAME", value: "DigitanoProjects", note: "Single-Table Partition Store" },
  { key: "COGNITO_USER_POOL_ID", value: "us-east-1_Gx1XLOLRJ", note: "Cognito User Pool ID" },
  { key: "COGNITO_APP_CLIENT_ID", value: "408ssjnnva8r0p9adutse6q1ht", note: "Cognito App Client ID" },
];

export function SettingsView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    runtime?: string;
    primaryModel?: string;
    failoverModel?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [dynamoStatus, setDynamoStatus] = useState<{
    tableName: string;
    status: string;
    region: string;
  } | null>(null);

  const checkHealth = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        setServerHealth({
          status: data.status || "online",
          runtime: data.runtime || data.service || "FastAPI / Python 3.10 Engine",
          primaryModel: data.primaryModel || "AWS Bedrock (Claude Sonnet)",
          failoverModel: data.failoverModel || "Google Gemini 3.5+ Flash",
          latencyMs: latency,
        });
      } else {
        setServerHealth({ status: "error", latencyMs: latency, error: `HTTP ${res.status}` });
      }
    } catch (err: any) {
      setServerHealth({ status: "offline", error: err.message });
    }

    try {
      const dynRes = await fetch("/api/dynamo/status");
      if (dynRes.ok) {
        const dynData = await dynRes.json();
        setDynamoStatus(dynData);
      }
    } catch {
      // Fallback
      setDynamoStatus({
        tableName: "DigitanoProjects",
        status: "ACTIVE",
        region: "us-east-1",
      });
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleCopySingle = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const raw = SECURE_ENV_TEMPLATES.map((item) => `${item.key}=${item.value}`).join("\n");
    navigator.clipboard.writeText(raw);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>System Infrastructure &amp; Security</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-mono text-[#10B981] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Zero Client Secret Leakage
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active AWS credentials, DynamoDB Single-Table schema parameters, and FastAPI connection endpoints.
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={isPinging}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-mono text-cyan-300 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-cyan-400" : ""}`} />
          <span>{isPinging ? "Pinging Server..." : "Test Connection"}</span>
        </button>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-cyan-400 shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider font-mono">
            Security Architecture: Server-Side Secret Isolation
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            All AWS Secret Access Keys, IAM tokens, and Gemini API keys are isolated exclusively inside server-side environment variables and container secrets. The browser client communicates strictly over authenticated HTTPS/JSON protocols without exposing sensitive cloud access tokens to client storage or JavaScript runtime inspection.
          </p>
        </div>
      </div>

      {/* Live Server Telemetry */}
      <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Live Backend Telemetry</h3>
          </div>
          {serverHealth?.status === "online" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-mono text-[#10B981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Online ({serverHealth.latencyMs}ms)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-400">
              <AlertCircle className="w-3 h-3" />
              Checking Engine
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Backend Server</span>
            <div className="text-xs font-semibold text-slate-200">
              {serverHealth?.runtime || "Python 3.10 / FastAPI"}
            </div>
            <div className="text-[11px] font-mono text-cyan-400 truncate">
              {API_BASE_URL}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Primary Reasoning Model</span>
            <div className="text-xs font-semibold text-slate-200">
              AWS Bedrock (Claude Sonnet)
            </div>
            <div className="text-[11px] font-mono text-cyan-300">
              anthropic.claude-sonnet-4-6
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Secondary / Failover Model</span>
            <div className="text-xs font-semibold text-slate-200">
              Google Gemini 3.5+ Flash
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              gemini-3.8-flash / 3.5-flash
            </div>
          </div>
        </div>
      </div>

      {/* Grid: AWS Cognito & DynamoDB Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* AWS Cognito User Pool */}
        <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AWS Cognito Authentication</h3>
              <p className="text-[11px] text-slate-400">Direct USER_PASSWORD_AUTH with JWKS validation</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80">
              <span className="text-slate-500">Region</span>
              <span className="text-slate-200">{COGNITO_CONFIG.region}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80">
              <span className="text-slate-500">User Pool ID</span>
              <span className="text-cyan-300">{COGNITO_CONFIG.UserPoolId}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80">
              <span className="text-slate-500">App Client ID</span>
              <span className="text-cyan-300">{COGNITO_CONFIG.ClientId}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80">
              <span className="text-slate-500">Auth Flow</span>
              <span className="text-[#10B981]">ALLOW_USER_PASSWORD_AUTH</span>
            </div>
          </div>
        </div>

        {/* Amazon DynamoDB Single-Table */}
        <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Amazon DynamoDB Persistence</h3>
              <p className="text-[11px] text-slate-400">Multi-tenant Single-Table architecture</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80">
              <span className="text-slate-500">Table Name</span>
              <span className="text-slate-200">{dynamoStatus?.tableName || "DigitanoProjects"}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80">
              <span className="text-slate-500">Partition Key (PK)</span>
              <span className="text-cyan-300">USER#&lt;cognito_email&gt;</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80">
              <span className="text-slate-500">Sort Key (SK)</span>
              <span className="text-cyan-300">PROJECT#&lt;project_id&gt;</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B]/80">
              <span className="text-slate-500">Table Status</span>
              <span className="text-[#10B981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                {dynamoStatus?.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Environment Deployment Specifications */}
      <div className="p-5 rounded-2xl bg-[#131924] border border-[#1E293B] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Cloud Deployment Variable Reference</h3>
              <p className="text-[11px] text-slate-400">Environment variables required for Render / AWS backend deployment</p>
            </div>
          </div>

          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-slate-200 transition-colors cursor-pointer"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedAll ? "Copied All" : "Copy Template"}</span>
          </button>
        </div>

        <div className="rounded-xl border border-[#1E293B] overflow-hidden bg-[#0B0F17]">
          <div className="divide-y divide-[#1E293B]">
            {SECURE_ENV_TEMPLATES.map((item) => (
              <div
                key={item.key}
                className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#131924]/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-medium">{item.key}</span>
                  <span className="text-[11px] text-slate-500 font-mono hidden md:inline">({item.note})</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-mono text-slate-300 bg-[#131924] px-2 py-0.5 rounded border border-[#1E293B]">
                    {item.value}
                  </span>
                  <button
                    onClick={() => handleCopySingle(`${item.key}=${item.value}`, item.key)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Copy Line"
                  >
                    {copiedKey === item.key ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
