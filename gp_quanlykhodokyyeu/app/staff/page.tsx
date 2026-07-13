export default function StaffPage() {
  const stats = [
    { label: "Đồ sẵn sàng", value: 128, color: "bg-emerald-50 text-emerald-700" },
    { label: "Đang cho thuê", value: 42, color: "bg-amber-50 text-amber-700" },
    { label: "Cần xử lý", value: 11, color: "bg-rose-50 text-rose-700" },
    { label: "Sắp hết đồ", value: 6, color: "bg-sky-50 text-sky-700" },
  ];

  const tasks = [
    {
      code: "PM-00124",
      customer: "12A1 - THPT Phan Châu Trinh",
      status: "Chờ trả đồ",
      due: "Hôm nay, 16:30",
    },
    {
      code: "PM-00125",
      customer: "12C3 - THPT Nguyễn Hiền",
      status: "Chuẩn bị xuất kho",
      due: "Hôm nay, 17:00",
    },
    {
      code: "PM-00126",
      customer: "12B2 - THPT Trần Phú",
      status: "Cần kiểm tra size",
      due: "Ngày mai, 08:00",
    },
  ];

  const inventory = [
    { name: "Áo sơ mi kỷ yếu", size: "M", available: 25, rented: 8 },
    { name: "Áo sơ mi kỷ yếu", size: "L", available: 14, rented: 11 },
    { name: "Quần tây kỷ yếu", size: "M", available: 18, rented: 6 },
    { name: "Quần tây kỷ yếu", size: "L", available: 9, rented: 10 },
  ];

  const actions = [
    "Nhập kho",
    "Xuất kho",
    "Trả đồ",
    "Kiểm kê",
    "Quét barcode",
    "Tra cứu sản phẩm",
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">Dashboard nhân viên kho</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Quản lý kho đồ kỷ yếu
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 md:block">
              Staff • Ca làm việc hôm nay
            </div>

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
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}>
                  Cập nhật mới
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Công việc cần xử lý</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Danh sách phiếu và yêu cầu gần nhất trong ca làm việc
                </p>
              </div>

              <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Xem tất cả
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.code}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{task.code}</p>
                      <p className="mt-1 text-sm text-slate-600">{task.customer}</p>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {task.status}
                      </span>
                      <p className="text-xs text-slate-500">{task.due}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Tác vụ nhanh</h2>
              <p className="mt-1 text-sm text-slate-500">
                Truy cập nhanh các thao tác thường dùng trong ngày
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {actions.map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Ghi chú ca làm</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>• Ưu tiên xử lý đơn trả đồ trước 17:00.</li>
                <li>• Kiểm tra lại size L của áo sơ mi trước khi xuất kho.</li>
                <li>• Các món lỗi cần chuyển sang khu vực chờ xử lý.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tồn kho nhanh</h2>
              <p className="mt-1 text-sm text-slate-500">
                Theo dõi nhanh số lượng sẵn sàng và đang cho thuê
              </p>
            </div>

            <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Xem chi tiết kho
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="px-4 py-2">Sản phẩm</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Sẵn sàng</th>
                  <th className="px-4 py-2">Đang cho thuê</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={index} className="rounded-2xl bg-slate-50 text-sm text-slate-700">
                    <td className="rounded-l-xl px-4 py-3 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3">{item.size}</td>
                    <td className="px-4 py-3">{item.available}</td>
                    <td className="rounded-r-xl px-4 py-3">{item.rented}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}