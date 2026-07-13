"use client";

import * as React from "react";

type HistoryItem = {
  id: string;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  fromStatus: {
    id: string;
    code: string;
    name: string;
    color: string | null;
  } | null;
  toStatus: {
    id: string;
    code: string;
    name: string;
    color: string | null;
  };
  changedByUser: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  };
};

type ItemHistoryResponse = {
  item: {
    id: string;
    itemCode: string;
  };
  histories: HistoryItem[];
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function refTypeLabel(value: string | null) {
  switch (value) {
    case "ALLOCATION":
      return "Cấp phát";
    case "RETURN":
      return "Trả đồ";
    case "IMPORT":
      return "Import";
    case "MANUAL":
      return "Thủ công";
    case "ADJUSTMENT":
      return "Điều chỉnh kho";
    default:
      return "Khác";
  }
}

export default function ItemHistoryTimeline({ itemId }: { itemId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState<ItemHistoryResponse | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/items/${itemId}/history`, {
          method: "GET",
          cache: "no-store",
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result?.error || "Không thể tải lịch sử item");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Không thể tải lịch sử item");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Lịch sử item</h2>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi các lần tạo item, đổi trạng thái và điều chỉnh thủ công.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Đang tải lịch sử...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : !data || data.histories.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Chưa có lịch sử cho item này.
        </div>
      ) : (
        <div className="space-y-4">
          {data.histories.map((history, index) => (
            <div key={history.id} className="relative flex gap-4">
              <div className="flex w-6 flex-col items-center">
                <div className="mt-1 h-3 w-3 rounded-full bg-slate-900" />
                {index < data.histories.length - 1 ? (
                  <div className="mt-2 w-px flex-1 bg-slate-200" />
                ) : null}
              </div>

              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {history.fromStatus ? history.fromStatus.name : "Khởi tạo"} →{" "}
                      {history.toStatus.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Người thao tác:{" "}
                      {history.changedByUser.fullName ||
                        history.changedByUser.username ||
                        history.changedByUser.email}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    {formatDateTime(history.createdAt)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {refTypeLabel(history.referenceType)}
                  </span>

                  {history.referenceId ? (
                    <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                      Ref: {history.referenceId}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 text-sm text-slate-600">
                  {history.reason || "Không có ghi chú."}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}