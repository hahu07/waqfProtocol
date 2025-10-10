import type { Donation } from "@/types/waqfs";
import { AssetCard } from "@/components/waqf/AssetCard";
import { TableHeader } from "@/components/waqf/tableHeader";

export function TransactionHistory({ transactions }: { transactions: Donation[] }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <TableHeader 
        onShowCauses={() => {/* handle cause browsing */}} 
        subtitle="Recent Transactions"
        showFormButton={false}
      />
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {transactions.map((tx) => (
          <AssetCard key={tx.id} asset={tx} />
        ))}
      </div>
    </div>
  );
}