import Link from "next/link";

const stats = [
  {
    label: "Tổng người dùng",
    value: 12,
    color: "bg-blue-50 text-blue-700",
  },
  {
    label: "Tài khoản Admin",
    value: 2,
    color: "bg-purple-50 text-purple-700",
  },
  {
    label: "Tài khoản Staff",
    value: 10,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Tài khoản bị khóa",
    value: 1,
    color: "bg-rose-50 text-rose-700",
  },
];

const modules = [
  {
    title: "Quản lý người dùng",
    description: "CRUD user, phân quyền Admin/Staff, khóa và mở tài khoản.",
    href: "/admin/users",
  },
  {
    title: "Chi nhánh",
    description: "Quản lý chi nhánh",
    href: "/admin/branches",
  },
  {
    title: "Kho",
    description: "Quản lý kho",
    href: "/admin/warehouses",
  },
  {
    title: "Danh mục sản phẩm",
    description: "Quản lý category, size, product và cấu hình size.",
    href: "/admin/products",
  },
  {
    title: "Trạng thái item",
    description: "Quản lý available, reserved, rented, inactive và mở rộng sau này.",
    href: "/admin/item-statuses",
  },
];

const todos = [
  "Hoàn thiện CRUD user cho admin.",
  "Bổ sung form tạo và sửa user.",
  "Kết nối dữ liệu thật từ Prisma cho dashboard.",
  "Làm filter theo role và trạng thái user.",
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Dashboard quản trị hệ thống
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Quản trị kho đồ kỷ yếu
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Quản lý user
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}
                >
                  Theo dõi
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Module quản trị
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Các nhóm dữ liệu nền cần triển khai ở giai đoạn 2
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {modules.map((module) => (
                <Link
                  key={module.title}
                  href={module.href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <h3 className="text-base font-bold text-slate-900">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {module.description}
                  </p>
                  <div className="mt-4 text-sm font-semibold text-slate-900">
                    Truy cập module →
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Bắt đầu nhanh
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Các thao tác ưu tiên để hoàn thiện module user
              </p>

              <div className="mt-5 space-y-3">
                <Link
                  href="/admin/users"
                  className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Xem danh sách user
                </Link>

                <Link
                  href="/admin/users/new"
                  className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Tạo user mới
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Việc cần làm
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Checklist ngắn cho admin module hiện tại
              </p>

              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {todos.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl bg-slate-50 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}