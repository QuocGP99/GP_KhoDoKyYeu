type Branch = {
  id: string;
  code: string;
  name: string;
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  branch: Branch;
};

async function getWarehouses(): Promise<Warehouse[]> {
  const res = await fetch("http://localhost:3000/api/warehouses", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không tải được danh sách kho");
  }

  return res.json();
}

export default async function WarehousesPage() {
  const warehouses = await getWarehouses();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Quản lý kho</p>
            <h1 style={styles.title}>Danh sách kho</h1>
            <p style={styles.subtitle}>
              Theo dõi các kho đồ áo, quần và trạng thái hoạt động của từng kho.
            </p>
          </div>

          <a href="/api/warehouses" target="_blank" style={styles.button}>
            Mở JSON API
          </a>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Tổng số kho</span>
            <strong style={styles.statValue}>{warehouses.length}</strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statLabel}>Đang hoạt động</span>
            <strong style={styles.statValue}>
              {warehouses.filter((w) => w.isActive).length}
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statLabel}>Ngừng hoạt động</span>
            <strong style={styles.statValue}>
              {warehouses.filter((w) => !w.isActive).length}
            </strong>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mã kho</th>
                <th style={styles.th}>Tên kho</th>
                <th style={styles.th}>Chi nhánh</th>
                <th style={styles.th}>Mã CN</th>
                <th style={styles.th}>Mô tả</th>
                <th style={styles.th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.code}>{warehouse.code}</span>
                  </td>
                  <td style={styles.td}>{warehouse.name}</td>
                  <td style={styles.td}>{warehouse.branch?.name ?? "-"}</td>
                  <td style={styles.td}>{warehouse.branch?.code ?? "-"}</td>
                  <td style={styles.td}>{warehouse.description || "—"}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(warehouse.isActive
                          ? styles.badgeActive
                          : styles.badgeInactive),
                      }}
                    >
                      {warehouse.isActive ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {warehouses.length === 0 && (
            <div style={styles.empty}>
              <h2 style={styles.emptyTitle}>Chưa có kho nào</h2>
              <p style={styles.emptyText}>
                Hãy seed dữ liệu hoặc tạo kho đầu tiên để bắt đầu quản lý.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f7f6f2 0%, #f1efea 100%)",
    color: "#28251d",
    padding: "32px 16px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  eyebrow: {
    margin: 0,
    fontSize: "14px",
    color: "#01696f",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: "8px 0 8px",
    fontSize: "36px",
    lineHeight: 1.15,
  },
  subtitle: {
    margin: 0,
    maxWidth: "680px",
    fontSize: "16px",
    color: "#66635d",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "0 16px",
    borderRadius: "10px",
    backgroundColor: "#01696f",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "#ffffffcc",
    border: "1px solid #ddd8cf",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  },
  statLabel: {
    display: "block",
    fontSize: "14px",
    color: "#77736d",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    lineHeight: 1.1,
  },
  tableWrap: {
    overflowX: "auto",
    backgroundColor: "#fffdf9",
    border: "1px solid #ddd8cf",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "860px",
  },
  th: {
    textAlign: "left",
    fontSize: "14px",
    padding: "16px",
    borderBottom: "1px solid #ece7df",
    color: "#6d685f",
    backgroundColor: "#f8f5ef",
  },
  tr: {
    borderBottom: "1px solid #f0ebe4",
  },
  td: {
    padding: "16px",
    fontSize: "15px",
    verticalAlign: "top",
  },
  code: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "#edf6f5",
    color: "#01696f",
    fontSize: "13px",
    fontWeight: 700,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },
  badgeActive: {
    backgroundColor: "#e7f3e2",
    color: "#2f6b12",
  },
  badgeInactive: {
    backgroundColor: "#f6e7e7",
    color: "#8a2f2f",
  },
  empty: {
    padding: "40px 24px",
    textAlign: "center",
  },
  emptyTitle: {
    margin: "0 0 8px",
    fontSize: "24px",
  },
  emptyText: {
    margin: 0,
    color: "#6f6b64",
  },
};