const ADMIN_EMAIL = "gwizard50621@gmail.com";

const Footer: React.FC = () => {
  return (
    <footer style={{
      width: "100%",
      padding: "2rem 0",
      background: "#f5f5f5",
      textAlign: "center",
      marginTop: "3rem",
      borderTop: "1px solid #e0e0e0",
      fontSize: "1rem",
      color: "#333"
    }}>
      <span>
        문의: {ADMIN_EMAIL}
      </span>
      <div style={{ fontSize: "0.95em", color: "#888", marginTop: "0.3em" }}>
        © 2025 WebRating
      </div>
    </footer>
  );
};

export default Footer; 