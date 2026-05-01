"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface InventorySettingsFormProps {
  initialDefaultLowStock: number;
}

export function InventorySettingsForm({
  initialDefaultLowStock,
}: InventorySettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const fd = new FormData(e.currentTarget);
    const raw = fd.get("defaultLowStock");
    const defaultLowStock =
      typeof raw === "string" ? parseInt(raw, 10) : Number(raw);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultLowStock }),
    });

    if (res.ok) {
      setSaved(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error || "Could not save settings");
    }
    setLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? <p className="text-red-500 text-sm">{error}</p> : null}
      {saved ? (
        <p className="text-green-600 text-sm">Settings saved.</p>
      ) : null}
      <div>
        <Input
          id="defaultLowStock"
          label="Global Low Stock Threshold"
          name="defaultLowStock"
          type="number"
          min={0}
          required
          defaultValue={String(initialDefaultLowStock)}
        />
        <p className="text-xs text-gray-400 mt-2">
          Items at or below this quantity trigger a warning on the dashboard.
        </p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
