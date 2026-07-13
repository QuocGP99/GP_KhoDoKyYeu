"use client";

import Link from "next/link";
import * as React from "react";
import { useMemo, useState } from "react";

type CategoryOption = {
  id: string;
  code: string;
  name: string;
};

type ProductOption = {
  id: string;
  code: string;
  name: string;
  hasSize: boolean;
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
  color: string | null;
};

type ItemRow = {
  id: string;
  itemCode: string;
  barcode: string | null;
  condition: string;
  purchaseDate: string | Date | null;
  note: string | null;
  isActive: boolean;
  createdAt?: string | Date;
  product: {
    id: string;
    code: string;
    name: string;
    hasSize: boolean;
    category: {
      id: string;
      code: string;
      name: string;
    };
  };
  size: {
    id: string;
    code: string;
    name: string;
  } | null;
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
  status: {
    id: string;
    code: string;
    name: string;
    color: string | null;
  };
};

type ItemsTableProps = {
  initialItems: ItemRow[];
  categories: CategoryOption[];
  products: ProductOption[];
  warehouses: WarehouseOption[];
  statuses: StatusOption[];
};

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function statusBadgeClass(color?: string | null) {
  if (!color) {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export default function ItemsTable({
  initialItems,
  categories,
  products,
  warehouses,
  statuses,
}: ItemsTableProps) {
  const [items] = useState<ItemRow[]>(initialItems);
  const [q, setQ] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const sizeOptions = useMemo(() => {
    return Array.from(
      new Map(
        items
          .filter((item) => item.size)
          .map((item) => [item.size!.id, item.size!])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const filteredItems = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return items.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.itemCode.toLowerCase().includes(keyword) ||
        (item.barcode ?? "").toLowerCase().includes(keyword) ||
        item.product.code.toLowerCase().includes(keyword) ||
        item.product.name.toLowerCase().includes(keyword) ||
        (item.note ?? "").toLowerCase().includes(keyword);

      const matchWarehouse = !warehouseId || item.warehouse.id === warehouseId;
      const matchCategory = !categoryId || item.product.category.id === categoryId;
      const matchSize = !sizeId || item.size?.id === sizeId;
      const matchStatus = !statusId || item.status.id === statusId;
      const matchActive = showInactive ? true : item.isActive;

      return (
        matchKeyword &&
        matchWarehouse &&
        matchCategory &&
        matchSize &&
        matchStatus &&
        matchActive
      );
    });
  }, [items, q, warehouseId, categoryId, sizeId, statusId, showInactive]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Danh sách item</h1>
            <p className="mt-1 text-sm text-slate-500">
              Tìm kiếm và lọc item theo mã, kho, loại đồ, size và trạng thái.
            </p>
          </div>

          <Link
            href="/admin/items/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Tạo item
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            placeholder="Tìm theo mã item..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            <option value="">Tất cả kho</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.code} - {warehouse.name}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Tất cả loại đồ</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.code} - {category.name}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={sizeId}
            onChange={(e) => setSizeId(e.target.value)}
          >
            <option value="">Tất cả size</option>
            {sizeOptions.map((size) => (
              <option key={size.id} value={size.id}>
                {size.code} - {size.name}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Hiển thị cả item ngưng hoạt động
          </label>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setWarehouseId("");
              setCategoryId("");
              setSizeId("");
              setStatusId("");
              setShowInactive(false);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Xóa bộ lọc
          </button>

          <div className="ml-auto text-sm text-slate-500">
            Tổng: <span className="font-medium text-slate-900">{filteredItems.length}</span> item
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-4 py-3 font-medium">Mã item</th>
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th className="px-4 py-3 font-medium">Loại đồ</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Kho</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Tình trạng</th>
                <th className="px-4 py-3 font-medium">Ngày mua</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    Không có item phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="text-sm text-slate-700">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-slate-900">{item.itemCode}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Barcode: {item.barcode || "-"}
                      </div>
                      {!item.isActive ? (
                        <div className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                          Inactive
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-slate-900">{item.product.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.product.code}</div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="text-slate-900">{item.product.category.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.product.category.code}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      {item.size ? (
                        <>
                          <div className="text-slate-900">{item.size.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{item.size.code}</div>
                        </>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="text-slate-900">{item.warehouse.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.warehouse.code}</div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(
                          item.status.color
                        )}`}
                      >
                        {item.status.name}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">{item.condition}</td>

                    <td className="px-4 py-3 align-top">{formatDate(item.purchaseDate)}</td>

                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/items/${item.id}/edit`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Sửa
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}