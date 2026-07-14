"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Gender = "MALE" | "FEMALE" | "OTHER";

type RentalGroupOption = {
  id: string;
  groupName: string;
  groupCode: string | null;
  schoolName: string | null;
  status: string;
};

type SizeOption = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

type RenterFormItem = {
  id: string;
  rentalGroupId: string;
  studentCode: string | null;
  fullName: string;
  gender: Gender | null;
  heightCm: number;
  weightKg: number | string;
  confirmedSizeId: string | null;
  note: string | null;
};

type RenterFormProps = {
  mode: "create" | "edit";
  item?: RenterFormItem;
  rentalGroups: RentalGroupOption[];
  sizes: SizeOption[];
};

const genderOptions: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

function normalizeSpaces(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function RenterForm({
  mode,
  item,
  rentalGroups,
  sizes,
}: RenterFormProps) {
  const router = useRouter();

  const [rentalGroupId, setRentalGroupId] = useState(item?.rentalGroupId ?? "");
  const [studentCode, setStudentCode] = useState(item?.studentCode ?? "");
  const [fullName, setFullName] = useState(item?.fullName ?? "");
  const [gender, setGender] = useState<Gender | "">(item?.gender ?? "");
  const [heightCm, setHeightCm] = useState(
    item?.heightCm ? String(item.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    item?.weightKg != null ? String(item.weightKg) : ""
  );
  const [confirmedSizeId, setConfirmedSizeId] = useState(
    item?.confirmedSizeId ?? ""
  );
  const [note, setNote] = useState(item?.note ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sortedRentalGroups = useMemo(() => {
    return [...rentalGroups].sort((a, b) =>
      a.groupName.localeCompare(b.groupName, "vi")
    );
  }, [rentalGroups]);

  const sortedSizes = useMemo(() => {
    return [...sizes].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name, "vi");
    });
  }, [sizes]);

  const selectedRentalGroup = useMemo(() => {
    return sortedRentalGroups.find((group) => group.id === rentalGroupId);
  }, [sortedRentalGroups, rentalGroupId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const normalizedFullName = normalizeSpaces(fullName);

    if (!rentalGroupId) {
      setError("Vui lòng chọn nhóm thuê.");
      return;
    }

    if (!normalizedFullName) {
      setError("Vui lòng nhập họ tên.");
      return;
    }

    if (!heightCm || Number(heightCm) <= 0) {
      setError("Chiều cao phải lớn hơn 0.");
      return;
    }

    if (!weightKg || Number(weightKg) <= 0) {
      setError("Cân nặng phải lớn hơn 0.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        rentalGroupId,
        studentCode: studentCode.trim() || "",
        fullName: normalizedFullName,
        gender: gender || "",
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        confirmedSizeId: confirmedSizeId || "",
        note: note.trim(),
      };

      const res = await fetch(
        mode === "create" ? "/api/renters" : `/api/renters/${item?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Không thể lưu người mặc.");
        return;
      }

      router.push("/admin/renters");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi gửi dữ liệu.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === "create" ? "Thêm người mặc" : "Cập nhật người mặc"}
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Lưu thông tin cơ bản, số đo và size chốt của người mặc. Size gợi ý sẽ
          được hệ thống tự tính sau khi lưu.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Nhóm thuê <span className="text-rose-500">*</span>
          </label>
          <select
            value={rentalGroupId}
            onChange={(e) => setRentalGroupId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
            required
          >
            <option value="">Chọn nhóm thuê</option>
            {sortedRentalGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.groupName}
                {group.schoolName ? ` - ${group.schoolName}` : ""}
                {group.groupCode ? ` (${group.groupCode})` : ""}
              </option>
            ))}
          </select>

          {selectedRentalGroup ? (
            <p className="text-xs text-slate-500">
              Đang chọn: {selectedRentalGroup.groupName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Mã học sinh
          </label>
          <input
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder="Ví dụ: 12A1-015"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Giới tính
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender | "")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="">Chưa chọn</option>
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Họ tên <span className="text-rose-500">*</span>
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ tên người mặc"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Chiều cao (cm) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min={50}
            max={250}
            step={1}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="Ví dụ: 165"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Cân nặng (kg) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={999.99}
            step={0.01}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="Ví dụ: 52.5"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Size chốt
          </label>
          <select
            value={confirmedSizeId}
            onChange={(e) => setConfirmedSizeId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="">Chưa chọn size chốt</option>
            {sortedSizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.code} - {size.name}
              </option>
            ))}
          </select>
          <p className="text-xs leading-5 text-slate-500">
            Size gợi ý sẽ được hệ thống tính tự động sau khi lưu dựa trên giới
            tính, chiều cao, cân nặng và rule size hiện hành.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Ghi chú
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            placeholder="Ghi chú thêm về người mặc, số đo thực tế, lưu ý thử đồ..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/admin/renters"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Hủy
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Đang lưu..."
            : mode === "create"
            ? "Tạo người mặc"
            : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}