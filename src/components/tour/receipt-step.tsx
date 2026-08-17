import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal, receiptSubtotal } from "@/lib/split-math";
import { TOUR_RECEIPT_SPLIT } from "@/lib/tour-fixture";

const cellInput = "h-8 rounded-md border-none bg-transparent px-1.5 text-xs shadow-none";

export function ReceiptStep() {
  const split = TOUR_RECEIPT_SPLIT;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-4 py-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em]">Build the receipt</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add each line item, then the service charge.</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-[0.08em] uppercase">Item</TableHead>
                <TableHead className="w-14 text-center font-mono text-[10px] tracking-[0.08em] uppercase">
                  Qty
                </TableHead>
                <TableHead className="w-24 text-right font-mono text-[10px] tracking-[0.08em] uppercase">
                  Total Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {split.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-transparent">
                  <TableCell className="whitespace-normal p-1">
                    <Input readOnly tabIndex={-1} value={item.name} className={cellInput} />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input readOnly tabIndex={-1} value={item.quantity} className={`${cellInput} text-center font-mono`} />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      readOnly
                      tabIndex={-1}
                      value={item.totalPrice}
                      className={`${cellInput} text-right font-mono`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="text-muted-foreground">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-mono text-xs">{formatPeso(receiptSubtotal(split.items))}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="text-muted-foreground">
                  Service charge
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatPeso(split.charges.serviceCharge)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="text-muted-foreground">
                  Delivery fee
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatPeso(split.charges.deliveryFee)}
                </TableCell>
              </TableRow>
              {split.discounts.map((discount) => (
                <TableRow key={discount.id} className="hover:bg-transparent">
                  <TableCell colSpan={2} className="text-muted-foreground">
                    {discount.label}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">-{formatPeso(discount.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-bold">
                  {formatPeso(receiptGrandTotal(split))}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-background/95 px-4 py-3">
        <Button variant="outline" tabIndex={-1} className="min-w-[9.5rem]">
          <ScanLine className="size-4" />
          Scan receipt
        </Button>
        <Button tabIndex={-1}>Next</Button>
      </div>
    </div>
  );
}
