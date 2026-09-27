import React, { useState, useEffect } from "react";
import { KeyRound, Eye, EyeOff, Copy, Check, X, ShieldAlert, CheckCircle2, Save, Cloud, Server } from "lucide-react";
import { COGNITO_CONFIG } from "../config/aws-cognito";
import { API_BASE_URL } from "../services/api";

interface SecretsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecretsModal({ isOpen, onClose }: SecretsModalProps) {
  const [showAllSecrets, setShowAllSecrets] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable fields
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("AKIA5RURABIWRXNTZAMQ");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("us-east-1");
  const [bedrockModelId, setBedrockModelId] = useState("anthropic.claude-sonnet-4-6");
  const [bedrockModel2Id, setBedrockModel2Id] = useState("anthropic.claude-3-5-sonnet-20241022-v2:0");
  const [userPoolId, setUserPoolId] = useState(COGNITO_CONFIG.UserPoolId);
  const [clientId, setClientId] = useState(COGNITO_CONFIG.ClientId);
  const [tableName, setTableName] = useState("DigitanoProjects");
  const [backendUrl, setBackendUrl] = useState(API_BASE_URL);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiApi2Key, setGeminiApi2Key] = useState("");
  const [geminiApi3Key, setGeminiApi3Key] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("digitano_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.awsAccessKeyId) setAwsAccessKeyId(parsed.awsAccessKeyId);
        if (parsed.awsSecretAccessKey && parsed.awsSecretAccessKey !== "20un1TmaK/JGV6p6uVKY6gLRejK+4oBySjRr9") {
          setAwsSecretAccessKey(parsed.awsSecretAccessKey);
        }
        if (parsed.awsRegion) setAwsRegion(parsed.awsRegion);
        if (parsed.bedrockModelId && !parsed.bedrockModelId.includes("20240620") && !parsed.bedrockModelId.includes("sonnet-5")) {
          setBedrockModelId(parsed.bedrockModelId);
        }
        if (parsed.bedrockModel2Id && !parsed.bedrockModel2Id.includes("sonnet-5")) {
          setBedrockModel2Id(parsed.bedrockModel2Id);
        }
        if (parsed.userPoolId) setUserPoolId(parsed.userPoolId);
        if (parsed.clientId) setClientId(parsed.clientId);
        if (parsed.tableName) setTableName(parsed.tableName);
        if (parsed.backendUrl) setBackendUrl(parsed.backendUrl);
        if (parsed.geminiApiKey) setGeminiApiKey(parsed.geminiApiKey);
        if (parsed.geminiApi2Key) setGeminiApi2Key(parsed.geminiApi2Key);
        if (parsed.geminiApi3Key) setGeminiApi3Key(parsed.geminiApi3Key);
      }
    } catch (e) {
      console.warn("SecretsModal load warning:", e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      "digitano_settings",
      JSON.stringify({
        awsAccessKeyId,
        awsSecretAccessKey,
        awsRegion,
        bedrockModelId,
        bedrockModel2Id,
        userPoolId,
        clientId,
        tableName,
        backendUrl,
        geminiApiKey,
        geminiApi2Key,
        geminiApi3Key,
      })
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const secretLength = awsSecretAccessKey.length;
  const isSecretValidLength = secretLength === 40;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#131924]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Active Credentials &amp; Secrets Inspector</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
                  Live Values
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect and verify active environment credentials for AWS Bedrock, Cognito, and DynamoDB.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllSecrets(!showAllSecrets)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-slate-200 transition-colors cursor-pointer"
            >
              {showAllSecrets ? (
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
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Credentials saved. Updated values will be used for all subsequent agent requests.</span>
            </div>
          )}

          {/* Secret Key Alert / Inspector */}
          <div className={`p-4 rounded-xl border ${isSecretValidLength ? "bg-[#10B981]/5 border-[#10B981]/30" : "bg-amber-500/10 border-amber-500/30"} space-y-3`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {isSecretValidLength ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">
                    AWS_SECRET_ACCESS_KEY Status:{" "}
                    <span className={isSecretValidLength ? "text-[#10B981]" : "text-amber-400"}>
                      {secretLength} / 40 characters
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {isSecretValidLength
                      ? "Length is 40 characters. Format matches standard AWS IAM Secret Keys."
                      : "AWS IAM Secret Access Keys must be exactly 40 characters. If characters were truncated when copying from mobile, enter your full 40-character key below."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(awsSecretAccessKey, "secret_key")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1E293B] text-[11px] text-slate-300 font-mono transition-colors cursor-pointer shrink-0"
              >
                {copiedKey === "secret_key" ? (
                  <>
                    <Check className="w-3 h-3 text-[#10B981]" />
                    <span className="text-[#10B981]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-cyan-400" />
                    <span>Copy Secret</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Secret Display / Edit */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono text-slate-400">
                ACTIVE VALUE (EDITABLE):
              </label>
              <div className="relative">
                <input
                  type={showAllSecrets ? "text" : "password"}
                  value={awsSecretAccessKey}
                  onChange={(e) => setAwsSecretAccessKey(e.target.value.trim())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] focus:border-cyan-400 text-xs font-mono text-cyan-300 focus:outline-none"
                  placeholder="Enter full 40-character secret key"
                />
              </div>
            </div>
          </div>

          {/* Complete Secrets & Configuration Table */}
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>All Configured Cloud Credentials &amp; Services</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* AWS Access Key ID */}
              <div className="p-3.5 rounded-xl bg-[#131924] border border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>AWS_ACCESS_KEY_ID</span>
                  <span className="text-cyan-400 text-[10px]">{awsAccessKeyId.length} chars (Valid)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={awsAccessKeyId}
                    onChange={(e) => setAwsAccessKeyId(e.target.value.trim())}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(awsAccessKeyId, "access_key")}
                    className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedKey === "access_key" ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* AWS Region */}
              <div className="p-3.5 rounded-xl bg-[#131924] border border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>AWS_REGION</span>
                  <span className="text-emerald-400 text-[10px]">Active Runtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value.trim())}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(awsRegion, "aws_region")}
                    className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedKey === "aws_region" ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Bedrock Claude Sonnet Models (Prioritized Pool) */}
              <div className="p-3.5 rounded-xl bg-[#131924] border border-[#1E293B] space-y-2.5 sm:col-span-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-cyan-400 font-semibold">BEDROCK CLAUDE SONNET MODELS (PRIORITIZED POOL)</span>
                  <span className="text-slate-500 text-[10px]">Priority 1 &rarr; Priority 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">Priority 1 (Primary Model)</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={bedrockModelId}
                        onChange={(e) => setBedrockModelId(e.target.value.trim())}
                        placeholder="anthropic.claude-sonnet-4-6"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(bedrockModelId, "model_id_1")}
                        className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer shrink-0"
                      >
                        {copiedKey === "model_id_1" ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">Priority 2 (Secondary Model)</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={bedrockModel2Id}
                        onChange={(e) => setBedrockModel2Id(e.target.value.trim())}
                        placeholder="anthropic.claude-3-5-sonnet-20241022-v2:0"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(bedrockModel2Id, "model_id_2")}
                        className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer shrink-0"
                      >
                        {copiedKey === "model_id_2" ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cognito User Pool ID */}
              <div className="p-3.5 rounded-xl bg-[#131924] border border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>COGNITO_USER_POOL_ID</span>
                  <span className="text-cyan-400 text-[10px]">Auth Identity</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userPoolId}
                    onChange={(e) => setUserPoolId(e.target.value.trim())}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(userPoolId, "pool_id")}
                    className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedKey === "pool_id" ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Cognito Client ID */}
              <div className="p-3.5 rounded-xl bg-[#131924] border border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>COGNITO_APP_CLIENT_ID</span>
                  <span className="text-cyan-400 text-[10px]">USER_PASSWORD_AUTH</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value.trim())}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(clientId, "client_id")}
                    className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedKey === "client_id" ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* DynamoDB Table */}
              <div className="p-3.5 rounded-xl bg-[#131924] border border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>DYNAMODB_TABLE_NAME</span>
                  <span className="text-cyan-400 text-[10px]">PK: USER# / SK: PROJECT#</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value.trim())}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(tableName, "table_name")}
                    className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedKey === "table_name" ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Backend URL */}
              <div className="p-3.5 rounded-xl bg-[#131924] border border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>RENDER_BACKEND_URL</span>
                  <span className="text-cyan-400 text-[10px]">FastAPI Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value.trim())}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(backendUrl, "backend_url")}
                    className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedKey === "backend_url" ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Gemini API Keys (3-Key Rotation) */}
              <div className="p-3.5 rounded-xl bg-[#131924] border border-[#1E293B] space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-semibold">GEMINI FAILOVER KEYS (3-KEY ROTATION POOL)</span>
                  <span className="text-slate-500 text-[10px]">Rotates on quota error</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">GEMINI_API_KEY (Key 1)</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type={showAllSecrets ? "text" : "password"}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value.trim())}
                        placeholder="AIzaSy... (Key 1)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-emerald-300 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(geminiApiKey, "gemini_key_1")}
                        className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer shrink-0"
                      >
                        {copiedKey === "gemini_key_1" ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">GEMINI_API2_KEY (Key 2)</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type={showAllSecrets ? "text" : "password"}
                        value={geminiApi2Key}
                        onChange={(e) => setGeminiApi2Key(e.target.value.trim())}
                        placeholder="AIzaSy... (Key 2)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-emerald-300 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(geminiApi2Key, "gemini_key_2")}
                        className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer shrink-0"
                      >
                        {copiedKey === "gemini_key_2" ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400">GEMINI_API3_KEY (Key 3)</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type={showAllSecrets ? "text" : "password"}
                        value={geminiApi3Key}
                        onChange={(e) => setGeminiApi3Key(e.target.value.trim())}
                        placeholder="AIzaSy... (Key 3)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-emerald-300 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(geminiApi3Key, "gemini_key_3")}
                        className="p-1.5 rounded bg-[#0B0F17] border border-[#1E293B] text-slate-400 hover:text-cyan-300 cursor-pointer shrink-0"
                      >
                        {copiedKey === "gemini_key_3" ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
              <span className="text-[11px] text-slate-400 font-mono">
                Changes persist locally in browser storage &amp; apply automatically.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#131924] hover:bg-[#1E293B] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white font-medium text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
