"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RentalGroupStatus =
  | "DRAFT"
  | "REVIEWED"
  | "CONFIRMED"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

type BranchOption = {
  id: string;
  code: string;
  name: string;
};

type WarehouseOption = {
  id: string;
  code: string;
  name: string;
  branchId: string;
};

type RentalGroupFormItem = {
  id: string;
  branchId: string;
  warehouseId: string;
  groupCode: string | null;
  groupName: string;
  schoolName: string | null;
  shootDate: string | Date | null;
  status: RentalGroupStatus;
  note: string | null;
};

type RentalGroupFormProps = {
  mode: "create" | "edit";
  item?: RentalGroupFormItem;
  branches: BranchOption[];
  warehouses: WarehouseOption[];
  currentUserId: string;
};

const statusOptions: { value: RentalGroupStatus; label: string }[] = [
  { value: "DRAFT", label: "Nháp" },
  { value: "REVIEWED", label: "Đã duyệt sơ bộ" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "READY", label: "Sẵn sàng" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function normalizeSpaces(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function buildGroupName(className: string, schoolName: string) {
  const normalizedClassName = normalizeSpaces(className);
  const normalizedSchoolName = normalizeSpaces(schoolName);
  if (!normalizedClassName || !normalizedSchoolName) return "";
  return `Lớp ${normalizedClassName} - Trường ${normalizedSchoolName}`;
}

function extractClassName(groupName?: string | null) {
  if (!groupName) return "";
  const normalized = normalizeSpaces(groupName);
  const match = normalized.match(/^Lớp\s+(.+?)\s+-\s+Trường\s+(.+)$/i);
  return match?.[1] ?? "";
}

function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function RentalGroupForm({
  mode,
  item,
  branches,
  warehouses,
  currentUserId,
}: RentalGroupFormProps) {
  const router = useRouter();

  const [branchId, setBranchId] = useState(item?.branchId ?? "");
  const [warehouseId, setWarehouseId] = useState(item?.warehouseId ?? "");
  const [groupCode, setGroupCode] = useState(item?.groupCode ?? "");
  const [className, setClassName] = useState(extractClassName(item?.groupName));
  const [schoolName, setSchoolName] = useState(item?.schoolName ?? "");
  const [shootDate, setShootDate] = useState(toDateInputValue(item?.shootDate));
  const [status, setStatus] = useState<RentalGroupStatus>(item?.status ?? "DRAFT");
  const [note, setNote] = useState(item?.note ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredWarehouses = useMemo(() => {
    if (!branchId) return [];
    return warehouses.filter((warehouse) => warehouse.branchId === branchId);
  }, [branchId, warehouses]);

  const previewGroupName = useMemo(() => {
    return buildGroupName(className, schoolName);
  }, [className, schoolName]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!branchId) {
      setError("Vui lòng chọn chi nhánh");
      return;
    }

    if (!warehouseId) {
      setError("Vui lòng chọn kho phục vụ");
      return;
    }

    if (!className.trim()) {
      setError("Vui lòng nhập tên lớp/nhóm");
      return;
    }

    if (!schoolName.trim()) {
      setError("Vui lòng nhập tên trường");
      return;
    }

    if (!shootDate) {
      setError("Vui lòng chọn ngày chụp/ngày thuê");
      return;
    }

    const payload =
      mode === "create"
        ? {
            branchId,
            warehouseId,
            groupCode: groupCode.trim() || undefined,
            className: normalizeSpaces(className),
            schoolName: normalizeSpaces(schoolName),
            groupName: previewGroupName,
            shootDate,
            status,
            note: note.trim() || undefined,
            createdByUserId: currentUserId,
          }
        : {
            branchId,
            warehouseId,
            groupCode: groupCode.trim() || undefined,
            className: normalizeSpaces(className),
            schoolName: normalizeSpaces(schoolName),
            groupName: previewGroupName,
            shootDate,
            status,
            note: note.trim() || undefined,
          };

    try {
      setSubmitting(true);

      const res = await fetch(
        mode === "create" ? "/api/rental-groups" : `/api/rental-groups/${item?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        const message =
          result?.error ||
          result?.details?.formErrors?.[0] ||
          "Không thể lưu nhóm thuê";
        throw new Error(message);
      }

      router.push("/admin/rental-groups");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Không thể lưu nhóm thuê");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {mode === "create" ? "Tạo nhóm thuê" : "Cập nhật nhóm thuê"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tên nhóm sẽ được chuẩn hóa theo mẫu: Lớp ... - Trường ...
          </p>
        </div>

        <Link
          href="/admin/rental-groups"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Quay lại
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Chi nhánh</label>
            <select
              value={branchId}
              onChange={(e) => {
                const nextBranchId = e.target.value;
                setBranchId(nextBranchId);

                const isWarehouseStillValid = warehouses.some(
                  (warehouse) =>
                    warehouse.id === warehouseId && warehouse.branchId === nextBranchId
                );

                if (!isWarehouseStillValid) {
                  setWarehouseId("");
                }
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option value="">Chọn chi nhánh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.code} - {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Kho phục vụ</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              disabled={!branchId}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400 disabled:bg-slate-100"
            >
              <option value="">{branchId ? "Chọn kho phục vụ" : "Chọn chi nhánh trước"}</option>
              {filteredWarehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.code} - {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên lớp/nhóm</label>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ví dụ: 12A1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên trường</label>
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Ví dụ: THPT Nguyễn Huệ"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Tên nhóm chuẩn hóa</label>
            <input
              value={previewGroupName}
              readOnly
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mã nhóm</label>
            <input
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="Tùy chọn, ví dụ: KYYEU-12A1-2026"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ngày chụp / ngày thuê</label>
            <input
              type="date"
              value={shootDate}
              onChange={(e) => setShootDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RentalGroupStatus)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Ghi chú thêm về nhóm thuê..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 md:flex-row md:justify-end">
          <Link
            href="/admin/rental-groups"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Đang lưu..."
              : mode === "create"
              ? "Tạo nhóm thuê"
              : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}