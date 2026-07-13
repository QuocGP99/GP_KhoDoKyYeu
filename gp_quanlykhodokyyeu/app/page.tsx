import Link from "next/link";

const stats = [
  {
    label: "Tổng số đồ",
    value: "2,480",
    note: "Toàn bộ đồ đang quản lý trong hệ thống",
    tone: "neutral",
  },
  {
    label: "Còn lại khả dụng",
    value: "1,860",
    note: "Sẵn sàng cho thuê ngay",
    tone: "success",
  },
  {
    label: "Kho đang hoạt động",
    value: "08",
    note: "Quản lý theo chuỗi chi nhánh",
    tone: "primary",
  },
  {
    label: "Size sắp thiếu",
    value: "14",
    note: "Cần kiểm tra trong ngày",
    tone: "warning",
  },
];

const alerts = [
  {
    title: "Đủ hàng",
    count: "126",
    color: "#2f6b12",
    bg: "#e8f3e3",
    desc: "Các mặt hàng đang đáp ứng tốt nhu cầu hiện tại.",
  },
  {
    title: "Sắp thiếu",
    count: "22",
    color: "#9a5a00",
    bg: "#fff1dd",
    desc: "Cần theo dõi hoặc chuyển kho để tránh thiếu hàng.",
  },
  {
    title: "Thiếu hàng",
    count: "7",
    color: "#982c3f",
    bg: "#f8e6ea",
    desc: "Cần xử lý ngay bằng nhập thêm hoặc đổi size phù hợp.",
  },
];

const aiSuggestions = [
  "Áo sơ mi size S tại Kho Quận 10 sắp thiếu; có thể bù bằng 12 áo size M ở Kho Bình Thạnh.",
  "Nhu cầu thuê váy size M cho tuần tới đang tăng; nên ưu tiên nhập thêm 20 bộ.",
  "Kho Gò Vấp đang dư quần size L; có thể điều chuyển sang Kho Thủ Đức để cân tồn.",
];

const inventoryRows = [
  {
    code: "AO-001",
    name: "Áo sơ mi kỷ yếu",
    category: "Áo",
    warehouse: "Kho Quận 10",
    size: "S",
    total: 120,
    remain: 18,
    demand: 22,
    alert: "Vàng",
    substitute: "M, L",
    image: "Có link",
  },
  {
    code: "VY-014",
    name: "Váy tốt nghiệp",
    category: "Váy",
    warehouse: "Kho Bình Thạnh",
    size: "M",
    total: 80,
    remain: 6,
    demand: 15,
    alert: "Đỏ",
    substitute: "L",
    image: "Có link",
  },
  {
    code: "QN-020",
    name: "Quần tây đồng phục",
    category: "Quần",
    warehouse: "Kho Thủ Đức",
    size: "L",
    total: 150,
    remain: 62,
    demand: 30,
    alert: "Xanh",
    substitute: "—",
    image: "Có link",
  },
  {
    code: "AO-008",
    name: "Áo cử nhân",
    category: "Áo",
    warehouse: "Kho Gò Vấp",
    size: "M",
    total: 90,
    remain: 11,
    demand: 14,
    alert: "Vàng",
    substitute: "L",
    image: "Có link",
  },
];

function getAlertBadge(alert: string): React.CSSProperties {
  if (alert === "Xanh") {
    return {
      backgroundColor: "#e8f3e3",
      color: "#2f6b12",
    };
  }

  if (alert === "Vàng") {
    return {
      backgroundColor: "#fff1dd",
      color: "#9a5a00",
    };
  }

  return {
    backgroundColor: "#f8e6ea",
    color: "#982c3f",
  };
}

function getStatTone(tone: string): React.CSSProperties {
  switch (tone) {
    case "success":
      return {
        background: "#eef8eb",
        color: "#2f6b12",
      };
    case "primary":
      return {
        background: "#edf6f5",
        color: "#01696f",
      };
    case "warning":
      return {
        background: "#fff5e8",
        color: "#9a5a00",
      };
    default:
      return {
        background: "#f1eee8",
        color: "#5c5851",
      };
  }
}

export default function DashboardPage() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <div style={styles.brandBlock}>
            <div style={styles.brandMark}>K</div>
            <div>
              <p style={styles.brandEyebrow}>Web app quản lý</p>
              <h1 style={styles.brandTitle}>Kho đồ kỷ yếu</h1>
            </div>
          </div>

          <nav style={styles.nav}>
            <Link href="/" style={{ ...styles.navItem, ...styles.navItemActive }}>
              Dashboard
            </Link>
            <Link href="/branches" style={styles.navItem}>
              Chi nhánh
            </Link>
            <Link href="/warehouses" style={styles.navItem}>
              Kho
            </Link>
            <Link href="/items" style={styles.navItem}>
              Items
            </Link>
            <Link href="/api/branches" style={styles.navItem}>
              API chi nhánh
            </Link>
            <Link href="/api/warehouses" style={styles.navItem}>
              API kho
            </Link>
            <Link href="/api/items" style={styles.navItem}>
              API items
            </Link>
          </nav>

          <div style={styles.sidebarCard}>
            <span style={styles.sidebarLabel}>AI gợi ý</span>
            <p style={styles.sidebarText}>
              Ưu tiên xử lý các mặt hàng cảnh báo đỏ trước, sau đó kiểm tra các size sắp thiếu để điều phối giữa các kho.
            </p>
          </div>
        </aside>

        <section style={styles.content}>
          <header style={styles.topbar}>
            <div>
              <p style={styles.eyebrow}>Tổng quan kho</p>
              <h2 style={styles.pageTitle}>Dashboard quản lý kho chuỗi</h2>
              <p style={styles.subtitle}>
                Theo dõi số lượng đồ, size, nhu cầu thuê, cảnh báo tồn và gợi ý điều phối giữa các kho.
              </p>
            </div>

            <div style={styles.topbarActions}>
              <button style={styles.primaryButton}>Nhập Excel kho đồ</button>
              <button style={styles.secondaryButton}>Xuất ảnh / link</button>
            </div>
          </header>

          <section style={styles.filterBar}>
            <div style={styles.filterField}>
              <label style={styles.filterLabel}>Tìm kiếm nhanh</label>
              <input
                style={styles.input}
                placeholder="Tên đồ, mã đồ, mã item..."
              />
            </div>

            <div style={styles.filterField}>
              <label style={styles.filterLabel}>Chi nhánh</label>
              <select style={styles.select} defaultValue="all">
                <option value="all">Tất cả chi nhánh</option>
                <option>Quận 10</option>
                <option>Bình Thạnh</option>
                <option>Thủ Đức</option>
              </select>
            </div>

            <div style={styles.filterField}>
              <label style={styles.filterLabel}>Kho</label>
              <select style={styles.select} defaultValue="all">
                <option value="all">Tất cả kho</option>
                <option>Kho Quận 10</option>
                <option>Kho Bình Thạnh</option>
                <option>Kho Gò Vấp</option>
              </select>
            </div>

            <div style={styles.filterField}>
              <label style={styles.filterLabel}>Loại đồ</label>
              <select style={styles.select} defaultValue="all">
                <option value="all">Tất cả loại đồ</option>
                <option>Áo</option>
                <option>Váy</option>
                <option>Quần</option>
              </select>
            </div>

            <div style={styles.filterField}>
              <label style={styles.filterLabel}>Size</label>
              <select style={styles.select} defaultValue="all">
                <option value="all">Tất cả size</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
              </select>
            </div>

            <div style={styles.filterField}>
              <label style={styles.filterLabel}>Mức cảnh báo</label>
              <select style={styles.select} defaultValue="all">
                <option value="all">Tất cả</option>
                <option>Xanh</option>
                <option>Vàng</option>
                <option>Đỏ</option>
              </select>
            </div>
          </section>

          <section style={styles.statsGrid}>
            {stats.map((stat) => (
              <article key={stat.label} style={styles.statCard}>
                <span style={{ ...styles.statBadge, ...getStatTone(stat.tone) }}>
                  {stat.label}
                </span>
                <strong style={styles.statValue}>{stat.value}</strong>
                <p style={styles.statNote}>{stat.note}</p>
              </article>
            ))}
          </section>

          <section style={styles.mainGrid}>
            <div style={styles.leftCol}>
              <section style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div>
                    <p style={styles.panelEyebrow}>Cảnh báo tồn kho</p>
                    <h3 style={styles.panelTitle}>Xanh · Vàng · Đỏ</h3>
                  </div>
                </div>

                <div style={styles.alertGrid}>
                  {alerts.map((alert) => (
                    <article
                      key={alert.title}
                      style={{
                        ...styles.alertCard,
                        backgroundColor: alert.bg,
                      }}
                    >
                      <span style={{ ...styles.alertTitle, color: alert.color }}>
                        {alert.title}
                      </span>
                      <strong style={{ ...styles.alertCount, color: alert.color }}>
                        {alert.count}
                      </strong>
                      <p style={styles.alertDesc}>{alert.desc}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div>
                    <p style={styles.panelEyebrow}>Tồn kho chi tiết</p>
                    <h3 style={styles.panelTitle}>Theo kho, loại đồ và size</h3>
                  </div>
                  <button style={styles.ghostButton}>Xem tất cả</button>
                </div>

                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Mã đồ</th>
                        <th style={styles.th}>Tên đồ</th>
                        <th style={styles.th}>Loại</th>
                        <th style={styles.th}>Kho</th>
                        <th style={styles.th}>Size</th>
                        <th style={styles.th}>Tổng</th>
                        <th style={styles.th}>Còn lại</th>
                        <th style={styles.th}>Nhu cầu</th>
                        <th style={styles.th}>Cảnh báo</th>
                        <th style={styles.th}>Size bù</th>
                        <th style={styles.th}>Ảnh / link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryRows.map((row) => (
                        <tr key={`${row.code}-${row.warehouse}-${row.size}`} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={styles.codePill}>{row.code}</span>
                          </td>
                          <td style={styles.td}>{row.name}</td>
                          <td style={styles.td}>{row.category}</td>
                          <td style={styles.td}>{row.warehouse}</td>
                          <td style={styles.td}>
                            <span style={styles.sizePill}>{row.size}</span>
                          </td>
                          <td style={styles.td}>{row.total}</td>
                          <td style={styles.td}>{row.remain}</td>
                          <td style={styles.td}>{row.demand}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.alertBadge, ...getAlertBadge(row.alert) }}>
                              {row.alert}
                            </span>
                          </td>
                          <td style={styles.td}>{row.substitute}</td>
                          <td style={styles.td}>
                            <button style={styles.linkButton}>{row.image}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div style={styles.rightCol}>
              <section style={styles.panelDark}>
                <p style={styles.panelDarkEyebrow}>AI gợi ý điều phối</p>
                <h3 style={styles.panelDarkTitle}>
                  Gợi ý xử lý thiếu size và cân đối tồn kho
                </h3>

                <div style={styles.suggestionList}>
                  {aiSuggestions.map((item, index) => (
                    <div key={index} style={styles.suggestionItem}>
                      <span style={styles.suggestionIndex}>{index + 1}</span>
                      <p style={styles.suggestionText}>{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div>
                    <p style={styles.panelEyebrow}>Hành động nhanh</p>
                    <h3 style={styles.panelTitle}>Tác vụ vận hành</h3>
                  </div>
                </div>

                <div style={styles.quickActions}>
                  <Link href="/branches" style={styles.quickActionCard}>
                    <strong style={styles.quickActionTitle}>Thêm chi nhánh</strong>
                    <span style={styles.quickActionDesc}>
                      Tạo điểm quản lý mới cho chuỗi kho.
                    </span>
                  </Link>

                  <Link href="/warehouses" style={styles.quickActionCard}>
                    <strong style={styles.quickActionTitle}>Thiết lập kho</strong>
                    <span style={styles.quickActionDesc}>
                      Tạo kho và gắn với từng chi nhánh.
                    </span>
                  </Link>

                  <Link href="/items" style={styles.quickActionCard}>
                    <strong style={styles.quickActionTitle}>Quản lý items</strong>
                    <span style={styles.quickActionDesc}>
                      Kiểm tra tồn thực tế theo mã item.
                    </span>
                  </Link>
                </div>
              </section>

              <section style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div>
                    <p style={styles.panelEyebrow}>Quy trình đề xuất</p>
                    <h3 style={styles.panelTitle}>Luồng vận hành V1</h3>
                  </div>
                </div>

                <ol style={styles.flowList}>
                  <li style={styles.flowItem}>Import Excel kho đồ và chuẩn hóa size.</li>
                  <li style={styles.flowItem}>Tính số lượng còn lại theo từng kho.</li>
                  <li style={styles.flowItem}>So sánh với nhu cầu thuê của học sinh.</li>
                  <li style={styles.flowItem}>Hiển thị cảnh báo xanh, vàng, đỏ.</li>
                  <li style={styles.flowItem}>AI gợi ý size thay thế và kho bù phù hợp.</li>
                </ol>
              </section>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f6f5f1 0%, #efede8 100%)",
    color: "#28251d",
    fontFamily: "Inter, Arial, sans-serif",
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    minHeight: "100vh",
  },
  sidebar: {
    borderRight: "1px solid #ddd8cf",
    background: "#fcfbf8",
    padding: "24px 18px",
    display: "grid",
    gridTemplateRows: "auto auto 1fr",
    gap: "20px",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  brandBlock: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  brandMark: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "#01696f",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontSize: "20px",
  },
  brandEyebrow: {
    margin: 0,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#7a766e",
  },
  brandTitle: {
    margin: "4px 0 0",
    fontSize: "22px",
    lineHeight: 1.2,
  },
  nav: {
    display: "grid",
    gap: "8px",
  },
  navItem: {
    textDecoration: "none",
    color: "#444038",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
  },
  navItemActive: {
    background: "#edf6f5",
    color: "#01696f",
  },
  sidebarCard: {
    alignSelf: "end",
    background: "#1f2526",
    color: "#f3f3ef",
    borderRadius: "20px",
    padding: "18px",
  },
  sidebarLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#87c0c5",
    marginBottom: "8px",
  },
  sidebarText: {
    margin: 0,
    lineHeight: 1.7,
    fontSize: "14px",
    color: "#d0d5d3",
  },
  content: {
    padding: "28px",
    display: "grid",
    gap: "22px",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#01696f",
  },
  pageTitle: {
    margin: "8px 0",
    fontSize: "38px",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    color: "#656159",
    fontSize: "16px",
    lineHeight: 1.7,
    maxWidth: "70ch",
  },
  topbarActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    minHeight: "44px",
    padding: "0 16px",
    borderRadius: "12px",
    background: "#01696f",
    color: "#fff",
    border: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    minHeight: "44px",
    padding: "0 16px",
    borderRadius: "12px",
    background: "#ece8df",
    color: "#28251d",
    border: "1px solid #d6d0c6",
    fontWeight: 700,
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "1.5fr repeat(5, minmax(140px, 1fr))",
    gap: "14px",
    padding: "18px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid #ddd8cf",
    borderRadius: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.04)",
  },
  filterField: {
    display: "grid",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "13px",
    color: "#6d695f",
    fontWeight: 600,
  },
  input: {
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #d8d2c8",
    background: "#fffdf9",
    padding: "0 14px",
    fontSize: "14px",
    color: "#28251d",
  },
  select: {
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #d8d2c8",
    background: "#fffdf9",
    padding: "0 14px",
    fontSize: "14px",
    color: "#28251d",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },
  statCard: {
    background: "#fffdf9",
    border: "1px solid #ddd8cf",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.04)",
    display: "grid",
    gap: "12px",
  },
  statBadge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  statValue: {
    fontSize: "34px",
    lineHeight: 1,
  },
  statNote: {
    margin: 0,
    fontSize: "14px",
    color: "#6a665e",
    lineHeight: 1.6,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.75fr) minmax(320px, 0.9fr)",
    gap: "18px",
    alignItems: "start",
  },
  leftCol: {
    display: "grid",
    gap: "18px",
  },
  rightCol: {
    display: "grid",
    gap: "18px",
  },
  panel: {
    background: "#fffdf9",
    border: "1px solid #ddd8cf",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.04)",
  },
  panelDark: {
    background: "#1f2627",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 16px 36px rgba(0,0,0,0.12)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },
  panelEyebrow: {
    margin: 0,
    fontSize: "12px",
    color: "#01696f",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },
  panelTitle: {
    margin: "6px 0 0",
    fontSize: "24px",
    lineHeight: 1.2,
  },
  panelDarkEyebrow: {
    margin: 0,
    color: "#89c0c6",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },
  panelDarkTitle: {
    margin: "8px 0 18px",
    color: "#f4f4ef",
    fontSize: "24px",
    lineHeight: 1.2,
  },
  ghostButton: {
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "12px",
    background: "#f1eee8",
    color: "#3c3832",
    border: "1px solid #ddd8cf",
    fontWeight: 600,
  },
  alertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  alertCard: {
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "10px",
  },
  alertTitle: {
    fontSize: "14px",
    fontWeight: 700,
  },
  alertCount: {
    fontSize: "34px",
    lineHeight: 1,
  },
  alertDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#5f5b54",
    lineHeight: 1.6,
  },
  suggestionList: {
    display: "grid",
    gap: "12px",
  },
  suggestionItem: {
    display: "grid",
    gridTemplateColumns: "32px 1fr",
    gap: "12px",
    alignItems: "start",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "14px",
  },
  suggestionIndex: {
    width: "32px",
    height: "32px",
    borderRadius: "999px",
    background: "#2b3a3b",
    color: "#a8d7db",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: "13px",
  },
  suggestionText: {
    margin: 0,
    color: "#d9dedd",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  quickActions: {
    display: "grid",
    gap: "12px",
  },
  quickActionCard: {
    textDecoration: "none",
    color: "inherit",
    border: "1px solid #e4ddd4",
    background: "#fffaf4",
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "6px",
  },
  quickActionTitle: {
    fontSize: "16px",
    lineHeight: 1.3,
  },
  quickActionDesc: {
    color: "#6a655e",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  flowList: {
    margin: 0,
    paddingLeft: "20px",
    display: "grid",
    gap: "10px",
  },
  flowItem: {
    color: "#5e5a53",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: "16px",
    border: "1px solid #ebe5dc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
    background: "#fffdf9",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    fontSize: "13px",
    color: "#6a665e",
    background: "#f8f5ef",
    borderBottom: "1px solid #ece7df",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #f0ebe4",
  },
  td: {
    padding: "14px",
    fontSize: "14px",
    color: "#2f2b25",
    verticalAlign: "top",
  },
  codePill: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#edf6f5",
    color: "#01696f",
    fontWeight: 700,
    fontSize: "12px",
  },
  sizePill: {
    display: "inline-flex",
    minWidth: "36px",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#f0ece5",
    color: "#37342e",
    fontWeight: 700,
    fontSize: "12px",
  },
  alertBadge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "12px",
  },
  linkButton: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: "10px",
    background: "#ece8df",
    color: "#2f2b25",
    border: "1px solid #d9d3ca",
    fontWeight: 600,
  },
};