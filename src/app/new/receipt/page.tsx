"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopBar } from "@/components/top-bar";
import { FlowStepper } from "@/components/flow-stepper";
import { AppShell } from "@/components/app-shell";
import { useDraftSplit } from "@/lib/store/draft-split";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal, receiptSubtotal } from "@/lib/split-math";

const cellInput =
  "h-8 border-none bg-transparent px-1.5 shadow-none focus-visible:ring-1 focus-visible:ring-ring";
const cellInputNumeric = `${cellInput} font-mono`;

export default function ReceiptPage() {
  const router = useRouter();
  const split = useDraftSplit((s) => s.split);
  const addItem = useDraftSplit((s) => s.addItem);
  const updateItem = useDraftSplit((s) => s.updateItem);
  const removeItem = useDraftSplit((s) => s.removeItem);
  const setCharges = useDraftSplit((s) => s.setCharges);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const parsedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const parsedPrice = Number(price);
  const canAdd = name.trim().length > 0 && parsedPrice > 0;

  function handleAdd() {
    if (!canAdd) return;
    addItem({ name: name.trim(), quantity: parsedQuantity, totalPrice: parsedPrice });
    setName("");
    setQuantity("");
    setPrice("");
  }

  function handleAddKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  function handleAddRowBlur(e: React.FocusEvent<HTMLTableRowElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    if (canAdd) handleAdd();
  }

  const canContinue = split.items.length > 0;

  return (
    <AppShell>
      <TopBar />
      <FlowStepper current={0} />

      <main className="flex flex-1 flex-col gap-4 px-4 pb-28 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold">Build the receipt</h1>
          <p className="text-sm text-muted-foreground">Add each line item, then the service charge if there is one.</p>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Item</TableHead>
                <TableHead className="w-14 text-center">Qty</TableHead>
                <TableHead className="w-24 text-right font-mono">Price</TableHead>
                <TableHead className="w-9 p-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {split.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-transparent">
                  <TableCell className="whitespace-normal p-1">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      className={cellInput}
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, {
                          quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                        })
                      }
                      className={`${cellInputNumeric} text-center`}
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.totalPrice || ""}
                      onChange={(e) => updateItem(item.id, { totalPrice: Number(e.target.value) || 0 })}
                      className={`${cellInputNumeric} text-right`}
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              <TableRow className="hover:bg-transparent" onBlur={handleAddRowBlur}>
                <TableCell className="p-1">
                  <Input
                    placeholder="Add item"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleAddKeyDown}
                    className={cellInput}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onKeyDown={handleAddKeyDown}
                    className={`${cellInputNumeric} text-center`}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onKeyDown={handleAddKeyDown}
                    className={`${cellInputNumeric} text-right`}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Add item"
                    disabled={!canAdd}
                    onClick={handleAdd}
                  >
                    <Plus className="size-4 text-primary" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>

            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="text-muted-foreground">
                  Subtotal
                </TableCell>
                <TableCell colSpan={2} className="text-right font-mono">
                  {formatPeso(receiptSubtotal(split.items))}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="text-muted-foreground">
                  Service charge
                </TableCell>
                <TableCell colSpan={2} className="p-1">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    aria-label="Service charge"
                    value={split.charges.serviceCharge || ""}
                    onChange={(e) => setCharges({ serviceCharge: Number(e.target.value) || 0 })}
                    className={`${cellInputNumeric} text-right`}
                  />
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="font-semibold">
                  Total
                </TableCell>
                <TableCell colSpan={2} className="text-right font-mono font-semibold">
                  {formatPeso(receiptGrandTotal(split))}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Service charge is split equally across everyone at the table, regardless of what they ordered.
        </p>
      </main>

      <div className="sticky bottom-0 flex items-center justify-end border-t bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button disabled={!canContinue} onClick={() => router.push("/new/people")}>
          Next
        </Button>
      </div>
    </AppShell>
  );
}
