type Branch = {
  id: string;
  code: string;
  name: string;
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  branch?: Branch | null;
};

type ProductCategory = {
  id: string;
  code: string;
  name: string;
};

type Product = {
  id: string;
  code: string;
  name: string;
  color?: string | null;
  category?: ProductCategory | null;
};

type Size = {
  id: string;
  code: string;
  name: string;
};

type ItemStatus = {
  id: string;
  code: string;
  name: string;
};

type Item = {
  id: string;
  itemCode: string;
  note?: string | null;
  condition?: string | null;
  purchasePrice?: number | null;
  rentalPrice?: number | null;
  createdAt?: string;
  product?: Product | null;
  size?: Size | null;
  status?: ItemStatus | null;
  warehouse?: Warehouse | null;
};

async function getItems(): Promise<Item[]> {
  const res = await fetch("http://localhost:3000/api/items", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không tải được danh sách items");
  }

  return res.json();
}

function formatMoney(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusStyle(statusCode?: string) {
  switch (statusCode) {
    case "AVAILABLE":
      return {
        background: "#e7f3e2",
        color: "#2f6b12",
      };
    case "RENTED":
      return {
        background: "#e8efff",
        color: "#234ea5",
      };
    case "CLEANING":
      return {
        background: "#fff1dd",
        color: "#9a5a00",
      };
    case "DAMAGED":
      return {
        background: "#f7e6ea",
        color: "#9a2f55",
      };
    default:
      return {
        background: "#ece9e2",
        color: "#5f5a52",
      };
  }
}

export default async function ItemsPage() {
  const items = await getItems();

  const availableCount = items.filter(
    (item) => item.status?.code === "AVAILABLE"
  ).length;

  const rentedCount = items.filter(
    (item) => item.status?.code === "RENTED"
  ).length;

  const damagedCount = items.filter(
    (item) => item.status?.code === "DAMAGED"
  ).length;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Kho đồ kỷ yếu</p>
            <h1 style={styles.title}>Danh sách items</h1>
            <p style={styles.subtitle}>
              Theo dõi từng món đồ theo mã item, size, kho, trạng thái và giá thuê.
            </p>
          </div>

          <div style={styles.headerActions}>
            <a href="/items" style={styles.buttonPrimary}>
              Làm mới
            </a>
            <a href="/api/items" target="_blank" style={styles.buttonSecondary}>
              Mở JSON API
            </a>
          </div>
        </div>

        <section style={styles.stats}>
          <article style={styles.statCard}>
            <span style={styles.statLabel}>Tổng items</span>
            <strong style={styles.statValue}>{items.length}</strong>
          </article>

          <article style={styles.statCard}>
            <span style={styles.statLabel}>Sẵn sàng</span>
            <strong style={styles.statValue}>{availableCount}</strong>
          </article>

          <article style={styles.statCard}>
            <span style={styles.statLabel}>Đang cho thuê</span>
            <strong style={styles.statValue}>{rentedCount}</strong>
          </article>

          <article style={styles.statCard}>
            <span style={styles.statLabel}>Hỏng</span>
            <strong style={styles.statValue}>{damagedCount}</strong>
          </article>
        </section>

        <section style={styles.tableWrap}>
          {items.length === 0 ? (
            <div style={styles.empty}>
              <h2 style={styles.emptyTitle}>Chưa có item nào</h2>
              <p style={styles.emptyText}>
                Hãy chạy seed hoặc tạo item đầu tiên để bắt đầu quản lý kho đồ.
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mã item</th>
                  <th style={styles.th}>Sản phẩm</th>
                  <th style={styles.th}>Danh mục</th>
                  <th style={styles.th}>Size</th>
                  <th style={styles.th}>Kho</th>
                  <th style={styles.th}>Chi nhánh</th>
                  <th style={styles.th}>Trạng thái</th>
                  <th style={styles.th}>Tình trạng</th>
                  <th style={styles.th}>Giá thuê</th>
                  <th style={styles.th}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const statusStyle = getStatusStyle(item.status?.code);

                  return (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.code}>{item.itemCode}</span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.mainCell}>
                          <strong style={styles.primaryText}>
                            {item.product?.name ?? "—"}
                          </strong>
                          <span style={styles.subText}>
                            {item.product?.code ?? "Không có mã SP"}
                          </span>
                        </div>
                      </td>

                      <td style={styles.td}>
                        {item.product?.category?.name ?? "—"}
                      </td>

                      <td style={styles.td}>
                        <span style={styles.sizeBadge}>
                          {item.size?.code ?? "—"}
                        </span>
                      </td>

                      <td style={styles.td}>{item.warehouse?.name ?? "—"}</td>

                      <td style={styles.td}>
                        {item.warehouse?.branch?.name ?? "—"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: statusStyle.background,
                            color: statusStyle.color,
                          }}
                        >
                          {item.status?.name ?? "Không rõ"}
                        </span>
                      </td>

                      <td style={styles.td}>{item.condition ?? "—"}</td>

                      <td style={styles.td}>{formatMoney(item.rentalPrice)}</td>

                      <td style={styles.td}>{item.note || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
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
  container: {
    maxWidth: "1280px",
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
    margin: "8px 0",
    fontSize: "36px",
    lineHeight: 1.15,
  },
  subtitle: {
    margin: 0,
    maxWidth: "720px",
    fontSize: "16px",
    color: "#66635d",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  buttonPrimary: {
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
  buttonSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "0 16px",
    borderRadius: "10px",
    backgroundColor: "#ebe7df",
    color: "#28251d",
    textDecoration: "none",
    fontWeight: 600,
    border: "1px solid #d9d3ca",
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
    minWidth: "1200px",
  },
  th: {
    textAlign: "left",
    fontSize: "14px",
    padding: "16px",
    borderBottom: "1px solid #ece7df",
    color: "#6d685f",
    backgroundColor: "#f8f5ef",
    whiteSpace: "nowrap",
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
    whiteSpace: "nowrap",
  },
  mainCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "160px",
  },
  primaryText: {
    fontSize: "15px",
    lineHeight: 1.4,
  },
  subText: {
    fontSize: "13px",
    color: "#78736b",
  },
  sizeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px",
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "#f0ece6",
    color: "#39352f",
    fontSize: "13px",
    fontWeight: 700,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
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