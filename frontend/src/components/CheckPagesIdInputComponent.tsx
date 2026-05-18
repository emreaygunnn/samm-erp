import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const muiDarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6366f1" },
    background: { paper: "#0f172a", default: "#0a0e1a" },
    text: { primary: "#f1f5f9", secondary: "#94a3b8" },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: "Inter, -apple-system, sans-serif" },
});

interface CheckPageIdInputProps {
  namespace: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function CheckPageIdInputComponent({ namespace, value, onChange, onSearch, loading }: CheckPageIdInputProps) {
  const { t } = useTranslation();

  return (
    <ThemeProvider theme={muiDarkTheme}>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <TextField
            label={t(`${namespace}.inputLabel`)}
            placeholder={t(`${namespace}.inputPlaceholder`)}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
            disabled={loading}
            size="small"
            variant="outlined"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={onSearch}
            disabled={!value.trim() || loading}
            startIcon={loading ? <span className="spinner" /> : <Search size={15} />}
            sx={{ minWidth: 120, height: 40, whiteSpace: "nowrap" }}
          >
            {loading ? t(`${namespace}.fetching`) : t(`${namespace}.fetchButton`)}
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
}
