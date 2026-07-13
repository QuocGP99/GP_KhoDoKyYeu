"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ItemCondition } from "@prisma/client";

type ProductOption = {
  id: string;
  code: string;
  name: string;
  hasSize: boolean;
  category?: {
    id: string;
    code: string;
    name: string;
  } | null;
  productSizes?: {
    id: string;
    sizeId: string;
    isDefault: boolean;
    size: {
      id: string;
      code: string;
      name: string;
    };
  }[];
};

type WarehouseOption = {
  id: string;
  code: string;
  name: string;
};

type StatusOption = {
  id: string;
  code: string;
  name: string;
  color?: string | null;
};

type SizeOption = {
  id: string;
  code: string;
  name: string;
  sortOrder?: number;
};

type ItemData = {
  id: string;
  itemCode: string;
  barcode: string | null;
  condition: ItemCondition;
  purchaseDate: string | Date | null;
  note: string | null;
  isActive: boolean;
  productId: string;
  warehouseId: string;
  statusId: string;
  sizeId: string | null;
  product?: {
    id: string;
    code: string;
    name: string;
    hasSize: boolean;
    productSizes?: {
      id: string;
      sizeId: string;
      isDefault: boolean;
      size: {
        id: string;
        code: string;
        name: string;
      };
    }[];
  } | null;
};

type ItemFormProps = {
  mode: "create" | "edit";
  item?: ItemData | null;
  products: ProductOption[];
  warehouses: WarehouseOption[];
  statuses: StatusOption[];
  sizes?: SizeOption[];
  currentUserId: string;
};

function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function ItemForm({
  mode,
  item,
  products,
  warehouses,
  statuses,
  sizes = [],
  currentUserId,
}: ItemFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [itemCodeMode, setItemCodeMode] = useState<"AUTO" | "MANUAL">(
    mode === "create" ? "AUTO" : "MANUAL"
  );
  const [itemCode, setItemCode] = useState(item?.itemCode ?? "");
  const [productId, setProductId] = useState(item?.productId ?? "");
  const [warehouseId, setWarehouseId] = useState(item?.warehouseId ?? "");
  const [statusId, setStatusId] = useState(item?.statusId ?? "");
  const [sizeId, setSizeId] = useState(item?.sizeId ?? "");
  const [barcode, setBarcode] = useState(item?.barcode ?? "");
  const [condition, setCondition] = useState<ItemCondition>(
    item?.condition ?? ItemCondition.GOOD
  );
  const [purchaseDate, setPurchaseDate] = useState(
    toDateInputValue(item?.purchaseDate)
  );
  const [note, setNote] = useState(item?.note ?? "");
  const [isActive, setIsActive] = useState(item?.isActive ?? true);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === productId) ?? null;
  }, [products, productId]);

  const hasSize = selectedProduct?.hasSize ?? false;

  const availableSizes = useMemo(() => {
    if (!selectedProduct) return [];

    if (selectedProduct.productSizes && selectedProduct.productSizes.length > 0) {
      return selectedProduct.productSizes
        .map((ps) => ps.size)
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return sizes.sort((a, b) => {
      const orderA = a.sortOrder ?? 0;
      const orderB = b.sortOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [selectedProduct, sizes]);

  React.useEffect(() => {
    if (!hasSize) {
      setSizeId("");
      return;
    }

    if (hasSize && availableSizes.length > 0) {
      const stillValid = availableSizes.some((size) => size.id === sizeId);
      if (!stillValid) {
        const defaultSize =
          selectedProduct?.productSizes?.find((ps) => ps.isDefault)?.size.id ??
          availableSizes[0]?.id ??
          "";
        setSizeId(defaultSize);
      }
    }
  }, [hasSize, availableSizes, selectedProduct, sizeId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        itemCodeMode,
        itemCode:
          itemCodeMode === "MANUAL" ? itemCode.trim() || undefined : undefined,
        productId,
        warehouseId,
        statusId,
        sizeId: hasSize ? sizeId || null : null,
        barcode: barcode.trim() || null,
        condition,
        purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
        note: note.trim() || null,
        isActive,
      };

      const endpoint = mode === "create" ? "/api/items" : `/api/items/${item?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result?.error || "Có lỗi xảy ra khi lưu item");
        return;
      }

      router.push("/admin/items");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Không thể lưu item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {mode === "create" ? "Tạo item mới" : "Cập nhật item"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý từng món đồ riêng lẻ theo mã item, kho, size và trạng thái.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/items")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Quay lại
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Sản phẩm <span className="text-red-500">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 focus:border-slate-400"
              required
              disabled={loading || mode === "edit"}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.code} - {product.name}
                  {product.category ? ` (${product.category.name})` : ""}
                </option>
              ))}
            </select>
            {mode === "edit" ? (
              <p className="text-xs text-slate-500">
                Ở chế độ edit, nên hạn chế đổi sản phẩm để tránh lệch dữ liệu size và lịch sử.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Kho <span className="text-red-500">*</span>
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              required
              disabled={loading}
            >
              <option value="">Chọn kho</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.code} - {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              required
              disabled={loading}
            >
              <option value="">Chọn trạng thái</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Cách tạo mã item
            </label>

            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="itemCodeMode"
                  value="AUTO"
                  checked={itemCodeMode === "AUTO"}
                  onChange={() => setItemCodeMode("AUTO")}
                  disabled={loading || mode === "edit"}
                />
                Tự sinh mã
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="itemCodeMode"
                  value="MANUAL"
                  checked={itemCodeMode === "MANUAL"}
                  onChange={() => setItemCodeMode("MANUAL")}
                  disabled={loading}
                />
                Nhập thủ công
              </label>
            </div>

            {mode === "edit" ? (
              <p className="text-xs text-slate-500">
                Ở chế độ edit, mã item hiện tại được xem là thủ công để tránh đổi logic tự sinh.
              </p>
            ) : null}
          </div>

          {itemCodeMode === "MANUAL" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Mã item {itemCodeMode === "MANUAL" ? <span className="text-red-500">*</span> : null}
              </label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="VD: K1-AO-DEN-M-0001"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                required={itemCodeMode === "MANUAL"}
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Barcode
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Nhập barcode nếu có"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              disabled={loading}
            />
          </div>

          {hasSize ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Size <span className="text-red-500">*</span>
              </label>
              <select
                value={sizeId}
                onChange={(e) => setSizeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                required={hasSize}
                disabled={loading}
              >
                <option value="">Chọn size</option>
                {availableSizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.code} - {size.name}
                  </option>
                ))}
              </select>
            </div>
          ) : productId ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Size</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                Sản phẩm này không dùng size.
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Tình trạng
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              disabled={loading}
            >
              <option value={ItemCondition.GOOD}>GOOD</option>
              <option value={ItemCondition.FAIR}>FAIR</option>
              <option value={ItemCondition.DAMAGED}>DAMAGED</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Ngày mua
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              disabled={loading}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Ghi chú
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Ghi chú thêm về item, tình trạng, nguồn gốc..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              disabled={loading}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={loading}
              />
              Item đang hoạt động
            </label>
            <p className="text-xs text-slate-500">
              Bỏ chọn nếu muốn ẩn item khỏi vận hành nhưng chưa xóa khỏi hệ thống.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => router.push("/admin/items")}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Hủy
          </button>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading
              ? mode === "create"
                ? "Đang tạo..."
                : "Đang cập nhật..."
              : mode === "create"
              ? "Tạo item"
              : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </form>
  );
}