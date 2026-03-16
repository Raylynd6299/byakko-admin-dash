import { ReactElement, useState } from "react";
import { Copy, Check, ShieldAlert } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientApiKeyDialogProps {
  open:       boolean;
  onClose:    () => void;
  clientName: string;
  apiKey:     string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientApiKeyDialog({
  open,
  onClose,
  clientName,
  apiKey,
}: ClientApiKeyDialogProps): ReactElement {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Client Created"
      description={`API key for "${clientName}"`}
      size="md"
      footer={
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Warning banner */}
        <div
          className="flex items-start gap-3 rounded-lg border p-3"
          style={{
            backgroundColor: "var(--warning-bg)",
            borderColor:     "var(--warning)",
          }}
        >
          <ShieldAlert
            size={16}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--warning-fg)" }}
          />
          <p className="text-xs leading-relaxed" style={{ color: "var(--warning-fg)" }}>
            <strong>Copy this key now.</strong> For security reasons, it will not be shown again.
            Store it in a safe place — you will need to regenerate it if lost.
          </p>
        </div>

        {/* Key display */}
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2"
          style={{
            backgroundColor: "var(--surface-1)",
            borderColor:     "var(--border-default)",
          }}
        >
          <code
            className="flex-1 truncate text-xs font-mono"
            style={{ color: "var(--text-primary)" }}
          >
            {apiKey}
          </code>
          <button
            onClick={handleCopy}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-150 hover:bg-[var(--surface-3)]"
            style={{ color: copied ? "var(--success-fg)" : "var(--text-muted)" }}
            aria-label="Copy API key"
          >
            {copied ? (
              <Check size={14} strokeWidth={2} />
            ) : (
              <Copy size={14} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
