import Transactions from "@/components/Dashboard/Transactions/Transactions";
import { TTransaction } from "@/types/transaction.type";

const transactions: TTransaction[] = [
  {
    _id: "1",
    transactionId: "T-2401",
    type: "payout",
    description: "Weekly Payout (SEPA)",
    amount: "84.50",
    positive: true,
    createdAt: "2025-11-08T10:00:00Z",
    updatedAt: "2025-11-08T10:00:00Z",
  },
  {
    _id: "2",
    transactionId: "T-2402",
    type: "earning",
    description: "Order #DG-9031 Completed",
    amount: "12.90",
    positive: true,
    createdAt: "2025-11-08T09:30:00Z",
    updatedAt: "2025-11-08T09:30:00Z",
  },
  {
    _id: "3",
    transactionId: "T-2403",
    type: "fee",
    description: "Platform Service Fee",
    amount: "2.50",
    positive: false,
    createdAt: "2025-11-07T15:45:00Z",
    updatedAt: "2025-11-07T15:45:00Z",
  },
  {
    _id: "4",
    transactionId: "T-2404",
    type: "earning",
    description: "Order #DG-9022 Completed",
    amount: "19.40",
    positive: true,
    createdAt: "2025-11-07T14:20:00Z",
    updatedAt: "2025-11-07T14:20:00Z",
  },
  {
    _id: "5",
    transactionId: "T-2405",
    type: "earning",
    description: "Order #DG-9018 Completed",
    amount: "24.80",
    positive: true,
    createdAt: "2025-11-06T18:10:00Z",
    updatedAt: "2025-11-06T18:10:00Z",
  },
  {
    _id: "6",
    transactionId: "T-2406",
    type: "fee",
    description: "Platform Service Fee",
    amount: "3.10",
    positive: false,
    createdAt: "2025-11-06T17:50:00Z",
    updatedAt: "2025-11-06T17:50:00Z",
  },
  {
    _id: "7",
    transactionId: "T-2407",
    type: "earning",
    description: "Order #DG-9010 Completed",
    amount: "31.20",
    positive: true,
    createdAt: "2025-11-05T20:30:00Z",
    updatedAt: "2025-11-05T20:30:00Z",
  },
];

export default function TransactionsPage() {
  return (
    <Transactions
      transactionsResult={{
        data: transactions,
        meta: {
          total: 7,
          page: 1,
          limit: 10,
          totalPage: 1,
        },
      }}
    />
  );
}
