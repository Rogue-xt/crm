"use client";

import { useState } from "react";
import { updateLeadStatus, addLeadRemark } from "@/actions/lead-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare, RefreshCcw } from "lucide-react";

interface UpdateLeadModalProps {
  lead: any;
  newStatusId?: string; // If present, we are changing status
  statusLabel?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateLeadModal({
  lead,
  newStatusId,
  statusLabel,
  isOpen,
  onClose,
}: UpdateLeadModalProps) {
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const isStatusChange = !!newStatusId;

  async function handleAction() {
    if (!remark.trim())
      return alert("Please enter a remark for the history log.");

    setLoading(true);
    const result = isStatusChange
      ? await updateLeadStatus(lead.id, newStatusId, remark)
      : await addLeadRemark(lead.id, remark);

    setLoading(false);
    if (result.success) {
      setRemark("");
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 font-black italic uppercase tracking-tighter">
            {isStatusChange ? (
              <RefreshCcw className="h-5 w-5 text-blue-600" />
            ) : (
              <MessageSquare className="h-5 w-5 text-emerald-600" />
            )}
            {isStatusChange ? `Move to ${statusLabel}` : "Add Remark"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
              Target Lead
            </p>
            <p className="text-sm font-bold text-slate-700">{lead.name}</p>
          </div>

          <div className="grid gap-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isStatusChange ? "Reason for status change" : "Your Note/Remark"}
            </Label>
            <Textarea
              placeholder={
                isStatusChange
                  ? "Why is this lead moving?"
                  : "Enter updates or notes..."
              }
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="bg-slate-50 border-slate-200 min-h-[120px] resize-none focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleAction}
            disabled={loading || !remark.trim()}
            className={`w-full font-black h-12 shadow-lg transition-all ${
              isStatusChange
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isStatusChange ? (
              "CONFIRM STATUS UPDATE"
            ) : (
              "SAVE REMARK"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
