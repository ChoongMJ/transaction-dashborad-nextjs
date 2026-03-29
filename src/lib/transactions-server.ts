import {
  addTransactionNote,
  bulkDeleteTransactions,
  bulkUpdateTransactionStatus,
  getTransactionById,
  getTransactionsOverview,
  listTransactions,
  updateTransactionStatus,
  wait,
} from "@/data/mock-backend";
import {
  bulkTransactionActionSchema,
  transactionNoteSchema,
  transactionStatusSchema,
} from "@/lib/core";
import { getAdminAccessPayload } from "@/lib/auth-server";
import {
  transactionStatuses,
  type TransactionListParams,
} from "@/types/transaction";

type ServerResult<T> = {
  status: number;
  body: T;
};

export function parseTransactionListParams(
  searchParams: URLSearchParams,
): TransactionListParams {
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  return {
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 10),
    search: searchParams.get("search") ?? "",
    status:
      status && transactionStatuses.includes(status as (typeof transactionStatuses)[number])
        ? (status as (typeof transactionStatuses)[number])
        : "all",
    sortBy: sortBy === "amount" ? "amount" : "createdAt",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  };
}

export async function getTransactionsPayload(
  searchParams: URLSearchParams,
): Promise<
  ServerResult<
    | ReturnType<typeof listTransactions>
    | ReturnType<typeof getTransactionsOverview>
  >
> {
  await wait(350);

  if (searchParams.get("view") === "overview") {
    return {
      status: 200,
      body: getTransactionsOverview(),
    };
  }

  return {
    status: 200,
    body: listTransactions(parseTransactionListParams(searchParams)),
  };
}

export async function getTransactionByIdPayload(
  id: string,
): Promise<
  ServerResult<
    { data: NonNullable<ReturnType<typeof getTransactionById>> } | { message: string }
  >
> {
  const transaction = getTransactionById(id);

  await wait(250);

  if (!transaction) {
    return {
      status: 404,
      body: { message: "Transaction not found." },
    };
  }

  return {
    status: 200,
    body: { data: transaction },
  };
}

export async function updateTransactionPayload(
  id: string,
  payload: unknown,
): Promise<
  ServerResult<
    { data: NonNullable<ReturnType<typeof updateTransactionStatus>> } | { message: string }
  >
> {
  const accessError = await getAdminAccessPayload();

  if (accessError) {
    return accessError;
  }

  const parsedPayload = transactionStatusSchema.safeParse(payload);

  await wait(300);

  if (!parsedPayload.success) {
    return {
      status: 400,
      body: { message: "Please choose a valid transaction status." },
    };
  }

  const transaction = updateTransactionStatus(id, parsedPayload.data.status);

  if (!transaction) {
    return {
      status: 404,
      body: { message: "Transaction not found." },
    };
  }

  return {
    status: 200,
    body: { data: transaction },
  };
}

export async function createTransactionNotePayload(
  id: string,
  payload: unknown,
): Promise<
  ServerResult<
    { data: NonNullable<ReturnType<typeof addTransactionNote>> } | { message: string }
  >
> {
  const accessError = await getAdminAccessPayload();

  if (accessError) {
    return accessError;
  }

  const parsedPayload = transactionNoteSchema.safeParse(payload);

  await wait(250);

  if (!parsedPayload.success) {
    return {
      status: 400,
      body: { message: "Please enter a concise internal note." },
    };
  }

  const transaction = addTransactionNote(id, parsedPayload.data.message);

  if (!transaction) {
    return {
      status: 404,
      body: { message: "Transaction not found." },
    };
  }

  return {
    status: 200,
    body: { data: transaction },
  };
}

export async function bulkTransactionActionPayload(
  payload: unknown,
): Promise<
  ServerResult<
    | {
        data: {
          action: "update_status" | "delete";
          affectedIds: string[];
          transactions: ReturnType<typeof bulkUpdateTransactionStatus>;
        };
      }
    | { message: string }
  >
> {
  const accessError = await getAdminAccessPayload();

  if (accessError) {
    return accessError;
  }

  const parsedPayload = bulkTransactionActionSchema.safeParse(payload);

  await wait(325);

  if (!parsedPayload.success) {
    return {
      status: 400,
      body: { message: "Select transactions and choose a valid bulk action." },
    };
  }

  if (parsedPayload.data.action === "update_status") {
    const transactions = bulkUpdateTransactionStatus(
      parsedPayload.data.ids,
      parsedPayload.data.status,
    );

    return {
      status: 200,
      body: {
        data: {
          action: "update_status",
          affectedIds: parsedPayload.data.ids,
          transactions,
        },
      },
    };
  }

  const transactions = bulkDeleteTransactions(parsedPayload.data.ids);

  return {
    status: 200,
    body: {
      data: {
        action: "delete",
        affectedIds: parsedPayload.data.ids,
        transactions,
      },
    },
  };
}
