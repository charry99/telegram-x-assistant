import React, { useEffect, useState } from "react";
import { ApiClient } from "../lib/api";
import { TelegramService } from "../lib/telegram";
import Navbar from "../components/Navbar";
import "./Queue.css";

interface Draft {
  id: string;
  draftText: string;
  tone?: string;
  status: string;
  createdAt: string;
}

function Queue({ user }: { user: any }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = (await ApiClient.getDrafts("pending", 50)) as any;
      setDrafts(res.data || []);
    } catch (err: any) {
      TelegramService.sendAlert("Error loading queue: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDraft = (draft: Draft) => {
    setSelectedDraftId(draft.id);
    setEditText(draft.draftText);
    setEditing(false);
  };

  const handleApproveDraft = async (draftId: string) => {
    try {
      if (editing && editText !== drafts.find(d => d.id === draftId)?.draftText) {
        // Update draft first
        await ApiClient.updateDraft(draftId, { draftText: editText });
      }

      await ApiClient.approveDraft(draftId);
      TelegramService.sendAlert("✅ Draft approved!");
      loadQueue();
      setSelectedDraftId(null);
    } catch (err: any) {
      TelegramService.sendAlert("Error: " + err.message);
    }
  };

  const handleRejectDraft = async (draftId: string) => {
    try {
      await ApiClient.rejectDraft(draftId);
      TelegramService.sendAlert("Draft rejected");
      loadQueue();
      setSelectedDraftId(null);
    } catch (err: any) {
      TelegramService.sendAlert("Error: " + err.message);
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    try {
      await ApiClient.publishDraft(draftId);
      TelegramService.sendAlert("✅ Tweet published!");
      loadQueue();
      setSelectedDraftId(null);
    } catch (err: any) {
      TelegramService.sendAlert("Error publishing: " + err.message);
    }
  };

  const selectedDraft = drafts.find(d => d.id === selectedDraftId);

  return (
    <>
      <Navbar title="Draft Queue" />
      <div className="queue-container">
        {loading ? (
          <div className="queue-loading">
            <div className="spinner"></div>
            <p>Loading drafts...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="queue-empty">
            <p>✅ No pending drafts!</p>
            <p>All set — create new drafts to get started.</p>
          </div>
        ) : (
          <div className="queue-layout">
            <div className="queue-list">
              <h2>Pending ({drafts.length})</h2>
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className={`queue-item ${selectedDraftId === draft.id ? "active" : ""}`}
                  onClick={() => handleSelectDraft(draft)}
                >
                  <div className="queue-item-content">
                    <p className="draft-text">{draft.draftText.substring(0, 60)}...</p>
                    <div className="draft-meta">
                      {draft.tone && <span className="tone-badge">{draft.tone}</span>}
                      <span className="time">
                        {new Date(draft.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedDraft && (
              <div className="queue-detail">
                <h2>Review Draft</h2>

                <div className="detail-section">
                  <label>Content</label>
                  {editing ? (
                    <textarea
                      className="draft-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={280}
                    />
                  ) : (
                    <div className="draft-preview">{selectedDraft.draftText}</div>
                  )}
                  <div className="char-count">{editText.length}/280</div>
                </div>

                <div className="detail-section">
                  <label>Tone</label>
                  <p>{selectedDraft.tone || "Not specified"}</p>
                </div>

                {editing ? (
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditing(false);
                        handleApproveDraft(selectedDraft.id);
                      }}
                    >
                      Save & Approve
                    </button>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRejectDraft(selectedDraft.id)}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApproveDraft(selectedDraft.id)}
                    >
                      Approve
                    </button>
                  </div>
                )}

                {selectedDraft.status === "approved" && (
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "10px" }}
                    onClick={() => handlePublishDraft(selectedDraft.id)}
                  >
                    🚀 Publish Now
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Queue;
