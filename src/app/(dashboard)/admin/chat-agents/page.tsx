"use client";
import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getToken } from "@/lib/auth";
import {
  getAdminChatAgents,
  createChatAgent,
  updateChatAgent,
  deleteChatAgent,
  type ChatAgent,
} from "@/lib/chatApi";

export default function ChatAgentsPage() {
  const token = getToken();
  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAgents = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getAdminChatAgents(token);
      setAgents(data);
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const resetForm = () => {
    setFormUsername("");
    setFormPassword("");
    setFormDisplayName("");
    setFormError("");
    setShowCreate(false);
    setEditId(null);
  };

  const handleCreate = async () => {
    if (!token || !formUsername || !formPassword || !formDisplayName) {
      setFormError("All fields are required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createChatAgent(token, { username: formUsername, password: formPassword, displayName: formDisplayName });
      resetForm();
      loadAgents();
    } catch (err: any) {
      setFormError(err.message || "Failed to create agent");
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!token || !editId) return;
    setSaving(true);
    setFormError("");
    try {
      const data: any = {};
      if (formDisplayName) data.displayName = formDisplayName;
      if (formPassword) data.password = formPassword;
      await updateChatAgent(token, editId, data);
      resetForm();
      loadAgents();
    } catch (err: any) {
      setFormError(err.message || "Failed to update");
    }
    setSaving(false);
  };

  const handleToggleActive = async (agent: ChatAgent) => {
    if (!token) return;
    try {
      await updateChatAgent(token, agent._id, { isActive: !agent.isActive });
      loadAgents();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this agent?")) return;
    try {
      await deleteChatAgent(token, id);
      loadAgents();
    } catch {}
  };

  const startEdit = (agent: ChatAgent) => {
    setEditId(agent._id);
    setFormDisplayName(agent.displayName);
    setFormPassword("");
    setFormUsername(agent.username);
    setShowCreate(true);
  };

  return (
      <AdminLayout>
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-base font-normal font-ui text-white">Chat Agents</h1>
            <button
              onClick={() => { resetForm(); setShowCreate(true); }}
              className="h-9 px-4 rounded-lg text-xs font-ui font-normal text-black hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)" }}
            >
              + Add Agent
            </button>
          </div>

          {/* Create/Edit Form */}
          {showCreate && (
            <div className="bg-[#111113] border border-[#FFFFFF14] rounded-xl p-5 mb-6">
              <h2 className="text-sm font-ui text-white mb-4">{editId ? "Edit Agent" : "Create Agent"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  placeholder="Username"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  disabled={!!editId}
                  className="h-10 px-3 rounded-lg bg-[#1E1E20] border border-[#FFFFFF14] text-sm text-white font-ui placeholder:text-[#FFFFFF40] outline-none disabled:opacity-50"
                />
                <input
                  placeholder="Display Name"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#1E1E20] border border-[#FFFFFF14] text-sm text-white font-ui placeholder:text-[#FFFFFF40] outline-none"
                />
                <input
                  type="password"
                  placeholder={editId ? "New password (optional)" : "Password"}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#1E1E20] border border-[#FFFFFF14] text-sm text-white font-ui placeholder:text-[#FFFFFF40] outline-none"
                />
              </div>
              {formError && <p className="text-red-400 text-xs font-ui mb-2">{formError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={editId ? handleUpdate : handleCreate}
                  disabled={saving}
                  className="h-9 px-4 rounded-lg text-xs font-ui font-normal text-black disabled:opacity-50"
                  style={{ background: "linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)" }}
                >
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
                <button onClick={resetForm} className="h-9 px-4 rounded-lg text-xs font-ui text-[#FFFFFF60] border border-[#FFFFFF14] hover:bg-[#FFFFFF08]">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Agents Table */}
          <div className="bg-[#111113] border border-[#FFFFFF14] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#FFFFFF14]">
                  <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Username</th>
                  <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Display Name</th>
                  <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Status</th>
                  <th className="text-left text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Online</th>
                  <th className="text-right text-xs font-ui font-normal text-[#FFFFFF60] px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-[#FFFFFF40] font-ui">Loading...</td></tr>
                )}
                {!loading && agents.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-[#FFFFFF40] font-ui">No agents yet</td></tr>
                )}
                {agents.map((agent) => (
                  <tr key={agent._id} className="border-b border-[#FFFFFF08] hover:bg-[#FFFFFF04]">
                    <td className="px-4 py-3 text-sm font-ui text-white">{agent.username}</td>
                    <td className="px-4 py-3 text-sm font-ui text-white">{agent.displayName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-ui px-2 py-0.5 rounded-full ${agent.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {agent.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`w-2 h-2 rounded-full inline-block ${agent.isOnline ? "bg-green-400" : "bg-[#FFFFFF30]"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => startEdit(agent)} className="text-xs font-ui text-[#6B63DF] hover:underline">Edit</button>
                        <button onClick={() => handleToggleActive(agent)} className="text-xs font-ui text-yellow-400 hover:underline">
                          {agent.isActive ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => handleDelete(agent._id)} className="text-xs font-ui text-red-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
  );
}
