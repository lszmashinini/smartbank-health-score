import type { Transaction } from "@/lib/types";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-black text-slate-950">Sample Banking Transactions</h2>
        <p className="text-sm text-slate-500">Salary deposits, debit orders, subscriptions, loans, savings and risk spending.</p>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Merchant</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.slice(0, 24).map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">{transaction.date}</td>
                <td className="px-5 py-3 font-semibold text-slate-800">{transaction.merchant}</td>
                <td className="px-5 py-3 text-slate-600">{transaction.category.replaceAll("_", " ")}</td>
                <td className="px-5 py-3 text-slate-500">{transaction.description}</td>
                <td className={`px-5 py-3 text-right font-bold ${transaction.amount >= 0 ? "text-emerald-700" : "text-slate-900"}`}>
                  {transaction.amount >= 0 ? "+" : "-"}R{Math.abs(transaction.amount).toLocaleString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
