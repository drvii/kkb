"use client";

import { useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDraftSplit } from "@/lib/store/draft-split";
import { getStoredScanPasscode, setStoredScanPasscode } from "@/lib/scan-passcode";
import { roundCentavos, formatPeso } from "@/lib/money";
import { isScanReceiptResult, SCAN_PASSCODE_HEADER, type ScanReceiptResult } from "@/lib/ocr";

const SUBTOTAL_MISMATCH_TOLERANCE = 0.01;

export function ScanReceiptControl() {
  const split = useDraftSplit((s) => s.split);
  const addItem = useDraftSplit((s) => s.addItem);
  const setCharges = useDraftSplit((s) => s.setCharges);
  const addDiscount = useDraftSplit((s) => s.addDiscount);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passcodeDialogOpen, setPasscodeDialogOpen] = useState(false);
  const [passcodeDraft, setPasscodeDraft] = useState("");
  const [scanning, setScanning] = useState(false);

  function handleScanClick() {
    if (getStoredScanPasscode()) {
      fileInputRef.current?.click();
    } else {
      setPasscodeDialogOpen(true);
    }
  }

  function handlePasscodeSubmit() {
    if (!passcodeDraft.trim()) return;
    setStoredScanPasscode(passcodeDraft.trim());
    setPasscodeDraft("");
    setPasscodeDialogOpen(false);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("That's not an image — pick a photo of the receipt.");
      return;
    }

    const passcode = getStoredScanPasscode();
    if (!passcode) {
      setPasscodeDialogOpen(true);
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { [SCAN_PASSCODE_HEADER]: passcode },
        body: formData,
      });

      if (response.status === 401) {
        setStoredScanPasscode("");
        toast.error("Wrong passcode — try again.");
        setPasscodeDialogOpen(true);
        return;
      }

      if (!response.ok) {
        toast.error("Couldn't read that receipt — try again or enter items manually.");
        return;
      }

      const result: unknown = await response.json();
      if (!isScanReceiptResult(result)) {
        toast.error("Couldn't read that receipt — try again or enter items manually.");
        return;
      }

      applyResult(result);
    } catch {
      toast.error("Couldn't read that receipt — try again or enter items manually.");
    } finally {
      setScanning(false);
    }
  }

  function applyResult(result: ScanReceiptResult) {
    for (const item of result.items) {
      addItem(item);
    }
    // Only fill in the service charge if it isn't already set — never clobber a manual entry.
    if (result.serviceCharge > 0 && split.charges.serviceCharge === 0) {
      setCharges({ serviceCharge: result.serviceCharge });
    }
    for (const discount of result.discounts) {
      if (discount.amount > 0) {
        addDiscount({ label: discount.label, amount: discount.amount, appliesTo: "everyone" });
      }
    }

    const expectedSubtotal = roundCentavos(
      [...split.items, ...result.items].reduce((sum, item) => sum + item.totalPrice, 0),
    );
    if (result.subtotal > 0 && Math.abs(result.subtotal - expectedSubtotal) > SUBTOTAL_MISMATCH_TOLERANCE) {
      toast.warning(
        `Scanned subtotal ${formatPeso(result.subtotal)} doesn't match the items total ${formatPeso(expectedSubtotal)} — double-check the scanned rows.`,
      );
    } else {
      toast.success(`Added ${result.items.length} item${result.items.length === 1 ? "" : "s"} from the scan.`);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button variant="outline" className="min-w-[9.5rem]" onClick={handleScanClick} disabled={scanning}>
        <ScanLine className="size-4" />
        {scanning ? "Scanning…" : "Scan receipt"}
      </Button>

      <Dialog open={passcodeDialogOpen} onOpenChange={setPasscodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter scan passcode</DialogTitle>
            <DialogDescription>
              Ask whoever set up this app for the passcode. It&apos;s only needed once per device.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={passcodeDraft}
            onChange={(e) => setPasscodeDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePasscodeSubmit()}
            placeholder="Passcode"
            autoFocus
          />
          <DialogFooter>
            <Button onClick={handlePasscodeSubmit} disabled={!passcodeDraft.trim()}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
