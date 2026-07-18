"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TopBar } from "@/components/top-bar";
import { FlowStepper } from "@/components/flow-stepper";
import { useDraftSplit } from "@/lib/store/draft-split";
import { formatPeso } from "@/lib/money";
import { receiptSubtotal } from "@/lib/split-math";

export default function ReceiptPage() {
  const router = useRouter();
  const split = useDraftSplit((s) => s.split);
  const addItem = useDraftSplit((s) => s.addItem);
  const updateItem = useDraftSplit((s) => s.updateItem);
  const removeItem = useDraftSplit((s) => s.removeItem);
  const setCharges = useDraftSplit((s) => s.setCharges);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  const parsedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const parsedPrice = Number(price);
  const canAdd = name.trim().length > 0 && parsedPrice > 0;

  function handleAdd() {
    if (!canAdd) return;
    addItem({ name: name.trim(), quantity: parsedQuantity, totalPrice: parsedPrice });
    setName("");
    setQuantity("1");
    setPrice("");
  }

  const canContinue = split.items.length > 0;

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <TopBar />
      <FlowStepper current={0} />

      <main className="flex flex-1 flex-col gap-6 px-4 pb-28 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold">Build the receipt</h1>
          <p className="text-sm text-muted-foreground">Add each line item from the receipt.</p>
        </div>

        {split.items.length > 0 && (
          <ul className="flex flex-col gap-2">
            {split.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      className="h-8 border-none px-0 font-medium shadow-none focus-visible:ring-0"
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>qty</span>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, {
                            quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                          })
                        }
                        className="h-7 w-14 px-2"
                      />
                    </div>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.totalPrice || ""}
                    onChange={(e) => updateItem(item.id, { totalPrice: Number(e.target.value) || 0 })}
                    className="h-8 w-24 text-right"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}

        <Card>
          <CardContent className="flex flex-col gap-3 py-4">
            <p className="text-sm font-medium">Add an item</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-20"
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="₱ Total"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-28"
                />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={!canAdd} className="self-start">
              <Plus className="size-4" />
              Add item
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardContent className="flex flex-col gap-4 py-4">
            <p className="text-sm font-medium">VAT &amp; service charge (optional)</p>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="vat">VAT (₱)</Label>
                <Input
                  id="vat"
                  type="number"
                  min={0}
                  step="0.01"
                  value={split.charges.vat || ""}
                  onChange={(e) => setCharges({ vat: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="service">Service charge (₱)</Label>
                <Input
                  id="service"
                  type="number"
                  min={0}
                  step="0.01"
                  value={split.charges.serviceCharge || ""}
                  onChange={(e) => setCharges({ serviceCharge: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Split equally across everyone at the table, regardless of what they ordered.
            </p>
          </CardContent>
        </Card>
      </main>

      <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <span className="text-sm text-muted-foreground">
          Subtotal: <span className="font-medium text-foreground">{formatPeso(receiptSubtotal(split.items))}</span>
        </span>
        <Button disabled={!canContinue} onClick={() => router.push("/new/people")}>
          Next
        </Button>
      </div>
    </div>
  );
}
