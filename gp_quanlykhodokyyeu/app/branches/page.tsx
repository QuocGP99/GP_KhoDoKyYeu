type Warehouse = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

type Branch = {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  warehouses: Warehouse[];
};

async function getBranches(): Promise<Branch[]> {
  const res = await fetch("http://localhost:3000/api/branches", {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Không tải được danh sách chi nhánh");

  return res.json();
}

function countActiveWarehouses(warehouses: Warehouse[]) {
  return warehouses.filter((w) => w.isActive).length;
}

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Quản lý chi nhánh</p>
            <h1 style={styles.title}>Danh sách chi nhánh</h1>
            <p style={styles.subtitle}>
              Tạo và theo dõi các chi nhánh để gắn kho cho từng địa điểm.
            </p>
          </div>

          <a href="/api/branches" target="_blank" style={styles.button}>
            Mở JSON API
          </a>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Tổng chi nhánh</span>
            <strong style={styles.statValue}>{branches.length}</strong>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Đang hoạt động</span>
            <strong style={styles.statValue}>
              {branches.filter((b) => b.isActive).length}
            </strong>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Tổng kho</span>
            <strong style={styles.statValue}>
              {branches.reduce((sum, b) => sum + b.warehouses.length, 0)}
            </strong>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mã CN</th>
                <th style={styles.th}>Tên chi nhánh</th>
                <th style={styles.th}>Địa chỉ</th>
                <th style={styles.th}>Số điện thoại</th>
                <th style={styles.th}>Số kho</th>
                <th style={styles.th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.code}>{branch.code}</span>
                  </td>
                  <td style={styles.td}>{branch.name}</td>
                  <td style={styles.td}>{branch.address || "—"}</td>
                  <td style={styles.td}>{branch.phone || "—"}</td>
                  <td style={styles.td}>{countActiveWarehouses(branch.warehouses)}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(branch.isActive ? styles.badgeActive : styles.badgeInactive),
                      }}
                    >
                      {branch.isActive ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {branches.length === 0 && (
            <div style={styles.empty}>
              <h2 style={styles.emptyTitle}>Chưa có chi nhánh nào</h2>
              <p style={styles.emptyText}>
                Hãy dùng form tạo chi nhánh ở bên dưới hoặc gọi API POST `/api/branches`.
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
    background: "linear-gradient(180deg, #f7f6f2 0%, #f1efea 100%)",
    color: "#28251d",
    padding: "32px 16px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  container: { maxWidth: "1200px", margin: "0 auto" },
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
  title: { margin: "8px 0", fontSize: "36px", lineHeight: 1.15 },
  subtitle: { margin: 0, fontSize: "16px", color: "#66635d", maxWidth: "720px" },
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
  statLabel: { display: "block", fontSize: "14px", color: "#77736d", marginBottom: "8px" },
  statValue: { fontSize: "28px", lineHeight: 1.1 },
  tableWrap: {
    overflowX: "auto",
    backgroundColor: "#fffdf9",
    border: "1px solid #ddd8cf",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
  th: {
    textAlign: "left",
    fontSize: "14px",
    padding: "16px",
    borderBottom: "1px solid #ece7df",
    color: "#6d685f",
    backgroundColor: "#f8f5ef",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f0ebe4" },
  td: { padding: "16px", fontSize: "15px", verticalAlign: "top" },
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
  badgeActive: { backgroundColor: "#e7f3e2", color: "#2f6b12" },
  badgeInactive: { backgroundColor: "#f6e7e7", color: "#8a2f2f" },
  empty: { padding: "40px 24px", textAlign: "center" },
  emptyTitle: { margin: "0 0 8px", fontSize: "24px" },
  emptyText: { margin: 0, color: "#6f6b64" },
};