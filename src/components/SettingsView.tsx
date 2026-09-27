import React, { useState } from "react";
import { Shield, Database, Cloud, Key, CheckCircle2, Server, Save, ExternalLink, Copy, Check, Terminal, Eye, EyeOff, KeyRound } from "lucide-react";
import { COGNITO_CONFIG } from "../config/aws-cognito";
import { API_BASE_URL } from "../services/api";

const RENDER_ENV_VARS = [
  { key: "NEXT_PUBLIC_API_BASE_URL", value: "https://digitano-backend.onrender.com", note: "FastAPI Backend Gateway Endpoint" },
  { key: "NEXT_PUBLIC_COGNITO_REGION", value: "us-east-1", note: "Cognito User Pool Region" },
  { key: "NEXT_PUBLIC_COGNITO_USER_POOL_ID", value: "us-east-1_Gx1XLOLRJ", note: "Cognito User Pool ID" },
  { key: "NEXT_PUBLIC_COGNITO_APP_CLIENT_ID", value: "408ssjnnva8r0p9adutse6q1ht", note: "Cognito App Client ID (USER_PASSWORD_AUTH)" },
  { key: "AWS_REGION", value: "us-east-1", note: "Primary AWS deployment region" },
  { key: "AWS_ACCESS_KEY_ID", value: "AKIA5RURABIWRXNTZAMQ", note: "Boto3 IAM credential for Bedrock & DynamoDB" },
  { key: "AWS_SECRET_ACCESS_KEY", value: "Enter 40-character AWS Secret Key", note: "AWS IAM secret key (40 chars)" },
  { key: "COGNITO_USER_POOL_ID", value: "us-east-1_Gx1XLOLRJ", note: "Cognito User Pool ID for JWKS validation" },
  { key: "COGNITO_APP_CLIENT_ID", value: "408ssjnnva8r0p9adutse6q1ht", note: "Cognito App Client ID" },
  { key: "DYNAMODB_TABLE_NAME", value: "DigitanoProjects", note: "DynamoDB On-Demand Single-Table name" },
  { key: "BEDROCK_MODEL_ID", value: "anthropic.claude-sonnet-4-6", note: "Primary Reasoning Model (Model 1 Priority)" },
  { key: "BEDROCK_MODEL_2_ID", value: "anthropic.claude-3-5-sonnet-20241022-v2:0", note: "Secondary Reasoning Model (Model 2 Priority)" },
  { key: "GEMINI_API_KEY", value: "AIzaSy...", note: "Google Gemini Flash Failover API Key 1" },
  { key: "GEMINI_API2_KEY", value: "AIzaSy...", note: "Google Gemini Flash Failover API Key 2" },
  { key: "GEMINI_API3_KEY", value: "AIzaSy...", note: "Google Gemini Flash Failover API Key 3" },
];

export function SettingsView() {
  const [cognitoRegion, setCognitoRegion] = useState(COGNITO_CONFIG.region);
  const [userPoolId, setUserPoolId] = useState(COGNITO_CONFIG.UserPoolId);
  const [clientId, setClientId] = useState(COGNITO_CONFIG.ClientId);
  const [tableName, setTableName] = useState("DigitanoProjects");
  const [backendUrl, setBackendUrl] = useState(API_BASE_URL);
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("AKIA5RURABIWRXNTZAMQ");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [bedrockModelId, setBedrockModelId] = useState("anthropic.claude-sonnet-4-6");
  const [bedrockModel2Id, setBedrockModel2Id] = useState("anthropic.claude-3-5-sonnet-20241022-v2:0");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiApi2Key, setGeminiApi2Key] = useState("");
  const [geminiApi3Key, setGeminiApi3Key] = useState("");
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showTableSecrets, setShowTableSecrets] = useState(true);
  const [showSecretInput, setShowSecretInput] = useState(true);

  // Load any previously saved custom settings
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("digitano_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.cognitoRegion) setCognitoRegion(parsed.cognitoRegion);
        if (parsed.userPoolId) setUserPoolId(parsed.userPoolId);
        if (parsed.clientId) setClientId(parsed.clientId);
        if (parsed.tableName) setTableName(parsed.tableName);
        if (parsed.backendUrl) setBackendUrl(parsed.backendUrl);
        if (parsed.awsAccessKeyId) setAwsAccessKeyId(parsed.awsAccessKeyId);
        if (parsed.awsSecretAccessKey && parsed.awsSecretAccessKey !== "20un1TmaK/JGV6p6uVKY6gLRejK+4oBySjRr9") {
          setAwsSecretAccessKey(parsed.awsSecretAccessKey);
        }
        if (parsed.bedrockModelId && !parsed.bedrockModelId.includes("20240620") && !parsed.bedrockModelId.includes("sonnet-5")) {
          setBedrockModelId(parsed.bedrockModelId);
        }
        if (parsed.bedrockModel2Id && !parsed.bedrockModel2Id.includes("sonnet-5")) {
          setBedrockModel2Id(parsed.bedrockModel2Id);
        }
        if (parsed.geminiApiKey) setGeminiApiKey(parsed.geminiApiKey);
        if (parsed.geminiApi2Key) setGeminiApi2Key(parsed.geminiApi2Key);
        if (parsed.geminiApi3Key) setGeminiApi3Key(parsed.geminiApi3Key);
      }
    } catch (e) {
      console.warn("Settings load notice:", e);
    }
  }, []);

  const handleCopySingle = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const raw = RENDER_ENV_VARS.map((item) => `${item.key}=${item.value}`).join("\n");
    navigator.clipboard.writeText(raw);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("digitano_settings", JSON.stringify({
      cognitoRegion,
      userPoolId,
      clientId,
      tableName,
      backendUrl,
      awsAccessKeyId,
      awsSecretAccessKey,
      bedrockModelId,
      bedrockModel2Id,
      geminiApiKey,
      geminiApi2Key,
      geminiApi3Key,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          System Infrastructure &amp; Cloud Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Active AWS credentials, DynamoDB Single-Table schema parameters, and FastAPI connection endpoints.
        </p>
      </div>

      {/* Render Web Service Environment 7 Key-Values Card */}
      <div className="p-6 rounded-2xl bg-[#131924] border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Render Web Service Environment Variables</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
                  7 Keys Loaded
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configured in <code className="text-slate-300">/backend/.env</code> and ready for the Render Dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setShowTableSecrets(!showTableSecrets)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-slate-200 transition-colors cursor-pointer"
            >
              {showTableSecrets ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mask Secrets</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reveal Plaintext</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied All 7 Variables</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy All Key-Values</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table of Keys */}
        <div className="overflow-x-auto rounded-xl border border-[#1E293B] bg-[#0B0F17]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#131924]/80 text-[11px] text-slate-400 uppercase border-b border-[#1E293B]">
              <tr>
                <th className="py-2.5 px-4">Key</th>
                <th className="py-2.5 px-4">Active Value</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
              {RENDER_ENV_VARS.map((item) => {
                const isSecret = item.key.includes("SECRET") || item.key.includes("KEY");
                const displayVal = isSecret && !showTableSecrets ? "••••••••••••••••••••••••••••" : item.value;
                return (
                  <tr key={item.key} className="hover:bg-[#131924]/40 transition-colors">
                    <td className="py-2.5 px-4 text-cyan-300 font-semibold">{item.key}</td>
                    <td className="py-2.5 px-4 text-slate-200 font-mono break-all">
                      <div className="flex items-center gap-2">
                        <span>{displayVal}</span>
                        {isSecret && showTableSecrets && (
                          <span className="px-1.5 py-0.5 rounded bg-[#1E293B] text-[10px] text-slate-400">
                            {item.value.length} chars
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopySingle(item.value, item.key)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-[#1E293B] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        {copiedKey === item.key ? (
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AWS Cognito Identity */}
        <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AWS Cognito User Pool</h2>
              <p className="text-xs text-slate-400">
                Identity provider authenticating users via USER_PASSWORD_AUTH and issuing JWT tokens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                AWS REGION
              </label>
              <input
                type="text"
                value={cognitoRegion}
                onChange={(e) => setCognitoRegion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                USER POOL ID
              </label>
              <input
                type="text"
                value={userPoolId}
                onChange={(e) => setUserPoolId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                APP CLIENT ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-[11px] font-mono text-slate-400">
            <span className="text-amber-400 font-semibold">Note on Cognito Configuration:</span> If you encounter{" "}
            <code className="text-rose-400">USER_PASSWORD_AUTH flow not enabled</code> in Cognito, visit AWS Cognito Console &gt; User Pools &gt; {userPoolId} &gt; App Integration &gt; App clients &gt; Edit client &gt; enable <strong className="text-slate-200">ALLOW_USER_PASSWORD_AUTH</strong>.
          </div>
        </div>

        {/* Section 2: DynamoDB & Backend */}
        <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Amazon DynamoDB &amp; FastAPI Backend</h2>
              <p className="text-xs text-slate-400">
                Single-table persistence parameters and cloud-hosted Render microservice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                DYNAMODB TABLE NAME
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                FASTAPI BACKEND URL (RENDER)
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-2 text-xs font-mono">
            <div className="text-cyan-400 font-semibold">// Single-Table Schema:</div>
            <div className="text-slate-300">Partition Key (PK): <span className="text-cyan-300">USER#&lt;cognito_sub_id&gt;</span> (String)</div>
            <div className="text-slate-300">Sort Key (SK): <span className="text-cyan-300">PROJECT#&lt;project_id&gt;</span> (String)</div>
            <div className="text-slate-400 text-[11px] pt-1">
              Billing: PAY_PER_REQUEST (On-Demand). Encrypted at rest via AWS KMS.
            </div>
          </div>
        </div>

        {/* Section 3: AWS Bedrock Reasoning Engine & Dual-LLM Failover */}
        <div className="p-6 rounded-2xl bg-[#131924] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AWS Bedrock Reasoning Engine &amp; Failover Architecture</h2>
              <p className="text-xs text-slate-400">
                Primary execution on Claude Sonnet with Google Gemini 3.5+ Flash automated failover.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                AWS ACCESS KEY ID
              </label>
              <input
                type="text"
                value={awsAccessKeyId}
                onChange={(e) => setAwsAccessKeyId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                <span>AWS SECRET ACCESS KEY</span>
                <span className={`text-[10px] font-mono ${awsSecretAccessKey.length === 40 ? "text-[#10B981]" : "text-amber-400"}`}>
                  {awsSecretAccessKey.length}/40 chars
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showSecretInput ? "text" : "password"}
                  value={awsSecretAccessKey}
                  onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                  placeholder="40-character secret key"
                  className={`w-full pl-3.5 pr-10 py-2 rounded-xl bg-[#0B0F17] border text-xs font-mono text-white focus:outline-none ${
                    awsSecretAccessKey.length === 40 ? "border-[#1E293B] focus:border-cyan-400" : "border-amber-500/50 focus:border-amber-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretInput(!showSecretInput)}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showSecretInput ? "Mask secret" : "Reveal secret"}
                >
                  {showSecretInput ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Prioritized Bedrock Claude Sonnet Models Pool */}
            <div className="sm:col-span-2 space-y-3 pt-2 border-t border-[#1E293B]/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                  BEDROCK CLAUDE SONNET MODELS (PRIORITIZED POOL)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Priority 1 &rarr; Priority 2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    PRIORITY #1 (PRIMARY MODEL)
                  </label>
                  <input
                    type="text"
                    value={bedrockModelId}
                    onChange={(e) => setBedrockModelId(e.target.value)}
                    placeholder="anthropic.claude-sonnet-4-6"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    PRIORITY #2 (SECONDARY MODEL)
                  </label>
                  <input
                    type="text"
                    value={bedrockModel2Id}
                    onChange={(e) => setBedrockModel2Id(e.target.value)}
                    placeholder="anthropic.claude-3-5-sonnet-20241022-v2:0"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* 3 Rotated Gemini API Keys */}
            <div className="sm:col-span-2 space-y-3 pt-2 border-t border-[#1E293B]/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  GOOGLE GEMINI FAILOVER API KEYS (3-KEY ROTATION POOL)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Gemini Flash 3.5+ &bull; Auto-rotates on quota limits
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    GEMINI_API_KEY (Key 1)
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy... (Key 1)"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    GEMINI_API2_KEY (Key 2)
                  </label>
                  <input
                    type="password"
                    value={geminiApi2Key}
                    onChange={(e) => setGeminiApi2Key(e.target.value)}
                    placeholder="AIzaSy... (Key 2)"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    GEMINI_API3_KEY (Key 3)
                  </label>
                  <input
                    type="password"
                    value={geminiApi3Key}
                    onChange={(e) => setGeminiApi3Key(e.target.value)}
                    placeholder="AIzaSy... (Key 3)"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {awsSecretAccessKey.length !== 40 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
              ⚠️ <strong>Note on Secret Key Length:</strong> Your current Secret Key is {awsSecretAccessKey.length} characters. AWS IAM Secret Access Keys must be exactly 40 characters long. If characters were truncated when copying from a mobile device or screenshot, paste your complete 40-character key above. While invalid or truncated, the autonomous engine safely engages the Gemini 3.5+ Flash failover layer.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-cyan-500/30">
              <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Primary Engine (Active)</span>
              </div>
              <div className="text-xs font-mono text-cyan-400">AWS Bedrock (Claude Sonnet)</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                {bedrockModelId}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F17] border border-emerald-500/30">
              <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Automated Failover (Standby)</span>
              </div>
              <div className="text-xs font-mono text-emerald-400">Google Gemini Flash (3.5+)</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                gemini-3.8-flash / gemini-3.5-flash
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white font-medium text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
