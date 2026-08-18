import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut, Download, Search, Eye, EyeOff, Users, UtensilsCrossed, FileSpreadsheet,
  Mail, Save, RefreshCw, ChevronRight, X, Info, MicVocal, Image as ImageIcon,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function apiFetch(path: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem("admin_token");
  return fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

type Application = {
  id: number;
  submittedAt: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  emailAddress: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  onlineStore: string | null;
  otherSocialMedia: string | null;
  productCategories: string;
  productDescription: string;
  artistBio: string;
  isArtisanFoodVendor: string;
  logoFileName: string | null;
  photoFileNames: string | null;
  grantPromoPermission: string;
  agreeToTerms: string;
  applicantType: string | null;
  setupType: string | null;
};

type PerformerApplication = {
  id: number;
  submittedAt: string;
  performerName: string;
  performanceType: string;
  genre: string;
  contactPersonName: string;
  emailAddress: string;
  phoneNumber: string;
  performanceDescription: string;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  otherMediaLink: string | null;
  requiresCompensation: string;
  performanceFee: string | null;
  logoFileName: string | null;
  photoFileNames: string | null;
  videoLink: string;
  agreeToTerms: string;
  agreeToPaSystem: string;
};

type Summary = {
  total: number;
  categoryCount: Record<string, number>;
  foodVendorCount: { yes: number; no: number };
  provinceCount: Record<string, number>;
  cityCount: Record<string, number>;
};

type EmailSettings = { subject: string; body: string };

// ─── Login ───────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [resetKey, setResetKey] = useState("");
  const [showResetKey, setShowResetKey] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [resetting, setResetting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setBlocked(true);
        setError(data.error || "Too many attempts. Enter your reset key below to unblock.");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Invalid password");
        return;
      }
      sessionStorage.setItem("admin_token", data.token);
      onLogin();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResetting(true);
    setResetMsg("");
    try {
      const res = await fetch(`${BASE}/api/admin/reset-lockout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: resetKey }),
      });
      if (res.ok) {
        setBlocked(false);
        setError("");
        setResetKey("");
        setResetMsg("Unblocked! You can try logging in again.");
      } else {
        setResetMsg("Invalid reset key.");
      }
    } catch {
      setResetMsg("Connection error.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg border-primary/20">
        <CardHeader className="text-center pb-2">
          <h1 className="text-2xl font-serif font-bold text-primary uppercase tracking-tight">
            Sauga Artisan Festival
          </h1>
          <p className="text-sm font-caveat text-muted-foreground text-lg">Admin Portal</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Admin Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  disabled={blocked}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            {resetMsg && <p className="text-sm text-green-600 font-medium">{resetMsg}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-secondary hover:text-secondary-foreground font-semibold" disabled={loading || blocked}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {blocked && (
            <form onSubmit={handleReset} className="mt-5 space-y-3 border-t pt-4">
              <p className="text-xs text-muted-foreground">Enter your reset key to unblock your IP:</p>
              <div className="relative">
                <Input
                  type={showResetKey ? "text" : "password"}
                  placeholder="Reset key"
                  value={resetKey}
                  onChange={(e) => setResetKey(e.target.value)}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowResetKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showResetKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button type="submit" variant="outline" className="w-full" disabled={resetting || !resetKey}>
                {resetting ? "Unblocking…" : "Unblock My IP"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ app, onClose, token }: { app: Application; onClose: () => void; token: string }) {
  const { toast } = useToast();
  const [resending, setResending] = useState(false);

  async function handleResendEmail() {
    setResending(true);
    try {
      const res = await apiFetch(`/admin/applications/${app.id}/resend-email`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Failed", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Email sent", description: `Confirmation email sent to ${app.emailAddress}` });
      }
    } catch {
      toast({ title: "Error", description: "Could not send email", variant: "destructive" });
    } finally {
      setResending(false);
    }
  }

  function handleExport() {
    const a = document.createElement("a");
    a.href = `${BASE}/api/admin/applications/${app.id}/export`;
    a.setAttribute("download", "");
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    fetch(a.href, { headers })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `application-${app.id}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
      });
  }

  const Field = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div className="py-2 border-b border-border/40 last:border-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-card shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary text-primary-foreground">
          <div>
            <p className="font-bold text-lg">{app.firstName} {app.lastName}</p>
            {app.businessName && <p className="text-sm opacity-80">{app.businessName}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleExport} className="text-xs gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
              <Download className="w-3 h-3" /> Export
            </Button>
            <Button size="sm" variant="secondary" onClick={handleResendEmail} disabled={resending} className="text-xs gap-1 bg-white/20 hover:bg-white/30 text-white border-0">
              <Mail className="w-3 h-3" /> {resending ? "Sending…" : "Resend Email"}
            </Button>
            <button onClick={onClose} className="ml-2 p-1 rounded hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">
              Submitted: {new Date(app.submittedAt).toLocaleString()}
            </span>
            <Badge className={app.applicantType === "food" ? "bg-orange-100 text-orange-700 border-orange-200 text-xs" : "bg-primary/10 text-primary border-primary/20 text-xs"}>
              {app.applicantType === "food" ? "🍽 Food Vendor" : "🎨 Artisan Vendor"}
            </Badge>
            {app.applicantType === "food" && app.setupType && (
              <Badge className="bg-muted text-muted-foreground border-border text-xs">
                {app.setupType === "truck" ? "🚚 Food Truck" : "⛺ Tent Setup"}
              </Badge>
            )}
            {app.applicantType !== "food" && (
              <span className="text-xs text-muted-foreground">
                Food Vendor: <strong>{app.isArtisanFoodVendor === "yes" ? "Yes" : "No"}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <Field label="Email" value={app.emailAddress} />
            <Field label="Phone" value={app.phoneNumber} />
            <Field label="City" value={`${app.city}, ${app.province}`} />
            <Field label="Postal Code" value={app.postalCode} />
          </div>
          <Field label="Street Address" value={app.streetAddress} />

          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Product Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {app.productCategories.split(",").map(c => (
                <Badge key={c.trim()} className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                  {c.trim()}
                </Badge>
              ))}
            </div>
          </div>

          <Field label="Product Description" value={app.productDescription} />
          <Field label="Artist / Exhibitor Bio" value={app.artistBio} />

          {(app.website || app.instagram || app.facebook || app.onlineStore || app.otherSocialMedia) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 mt-2">Online Presence</p>
              <div className="space-y-0.5">
                {app.website && <p className="text-sm"><span className="font-medium">Website:</span> {app.website}</p>}
                {app.instagram && <p className="text-sm"><span className="font-medium">Instagram:</span> {app.instagram}</p>}
                {app.facebook && <p className="text-sm"><span className="font-medium">Facebook:</span> {app.facebook}</p>}
                {app.onlineStore && <p className="text-sm"><span className="font-medium">Store:</span> {app.onlineStore}</p>}
                {app.otherSocialMedia && <p className="text-sm"><span className="font-medium">Other:</span> {app.otherSocialMedia}</p>}
              </div>
            </div>
          )}

          {app.photoFileNames && (
            <div className="py-2 border-b border-border/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Submitted Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {app.photoFileNames.split(",").map((url, i) => (
                  <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={url.trim()}
                      alt={`Product photo ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-md border border-border hover:opacity-75 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
          {app.logoFileName && (
            <div className="py-2 border-b border-border/40 last:border-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Logo</p>
              <a href={app.logoFileName} target="_blank" rel="noopener noreferrer" className="inline-block">
                <img
                  src={app.logoFileName}
                  alt="Business logo"
                  className="h-20 w-auto object-contain rounded-md border border-border hover:opacity-75 transition-opacity"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Responses Tab ────────────────────────────────────────────────────────────

function ResponsesTab({ token }: { token: string }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const { toast } = useToast();

  const debounce = useCallback((val: string) => {
    const t = setTimeout(() => setDebouncedSearch(val), 350);
    return () => clearTimeout(t);
  }, []);

  function handleSearch(val: string) {
    setSearch(val);
    debounce(val);
  }

  const { data: applications = [], isLoading, refetch } = useQuery<Application[]>({
    queryKey: ["admin-applications", debouncedSearch],
    queryFn: async () => {
      const params = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
      const res = await apiFetch(`/admin/applications${params}`);
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
  });



  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, business…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading submissions…</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {debouncedSearch ? "No submissions match your search." : "No submissions yet."}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left px-4 py-3 font-semibold">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Business</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">City</th>
                  <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">Food?</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`border-t border-border hover:bg-muted/40 cursor-pointer transition-colors ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                    onClick={() => setSelected(app)}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(app.submittedAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-medium">{app.firstName} {app.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{app.businessName || "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{app.emailAddress}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{app.city}</td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <Badge className={app.isArtisanFoodVendor === "yes" ? "bg-secondary/30 text-secondary-foreground border-secondary/30" : "bg-muted text-muted-foreground"}>
                        {app.isArtisanFoodVendor === "yes" ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-primary hover:text-accent transition-colors flex items-center gap-1 ml-auto text-xs font-semibold">
                        <Eye className="w-3.5 h-3.5" /> View <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {applications.length} submission{applications.length !== 1 ? "s" : ""}
            {debouncedSearch && " matching your search"}
          </div>
        </div>
      )}

      {selected && (
        <DetailDrawer app={selected} onClose={() => setSelected(null)} token={token} />
      )}
    </div>
  );
}

function PerformerDetailDrawer({ app, onClose }: { app: PerformerApplication; onClose: () => void }) {
  const Field = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div className="py-2 border-b border-border/40 last:border-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-card shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary text-primary-foreground">
          <div>
            <p className="font-bold text-lg">{app.performerName}</p>
            <p className="text-sm opacity-80">Contact: {app.contactPersonName}</p>
          </div>
          <button onClick={onClose} className="ml-2 p-1 rounded hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">
              Submitted: {new Date(app.submittedAt).toLocaleString()}
            </span>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {app.performanceType}
            </Badge>
            <Badge className="bg-muted text-muted-foreground border-border text-xs">
              {app.genre}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <Field label="Email" value={app.emailAddress} />
            <Field label="Phone" value={app.phoneNumber} />
          </div>

          <Field label="Performance Description" value={app.performanceDescription} />
          <Field label="Video Link" value={app.videoLink} />
          <Field label="Requires Compensation" value={app.requiresCompensation === "yes" ? "Yes" : "No"} />
          <Field label="Performance Fee" value={app.performanceFee} />

          {(app.website || app.instagram || app.facebook || app.otherMediaLink) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 mt-2">Online Presence</p>
              <div className="space-y-0.5">
                {app.website && <p className="text-sm"><span className="font-medium">Website:</span> {app.website}</p>}
                {app.instagram && <p className="text-sm"><span className="font-medium">Instagram:</span> {app.instagram}</p>}
                {app.facebook && <p className="text-sm"><span className="font-medium">Facebook:</span> {app.facebook}</p>}
                {app.otherMediaLink && <p className="text-sm"><span className="font-medium">Other:</span> {app.otherMediaLink}</p>}
              </div>
            </div>
          )}

          {app.photoFileNames && (
            <div className="py-2 border-b border-border/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Submitted Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {app.photoFileNames.split(",").map((url, i) => (
                  <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={url.trim()}
                      alt={`Performer photo ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-md border border-border hover:opacity-75 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {app.logoFileName && (
            <div className="py-2 border-b border-border/40 last:border-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Logo</p>
              <a href={app.logoFileName} target="_blank" rel="noopener noreferrer" className="inline-block">
                <img
                  src={app.logoFileName}
                  alt="Performer logo"
                  className="h-20 w-auto object-contain rounded-md border border-border hover:opacity-75 transition-opacity"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PerformerResponsesTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<PerformerApplication | null>(null);

  const debounce = useCallback((val: string) => {
    const t = setTimeout(() => setDebouncedSearch(val), 350);
    return () => clearTimeout(t);
  }, []);

  function handleSearch(val: string) {
    setSearch(val);
    debounce(val);
  }

  const { data: applications = [], isLoading, refetch } = useQuery<PerformerApplication[]>({
    queryKey: ["admin-performer-applications", debouncedSearch],
    queryFn: async () => {
      const params = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
      const res = await apiFetch(`/admin/performer-applications${params}`);
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by performer, contact, email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading performer submissions…</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {debouncedSearch ? "No performer submissions match your search." : "No performer submissions yet."}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left px-4 py-3 font-semibold">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Performer</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Email</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`border-t border-border hover:bg-muted/40 cursor-pointer transition-colors ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                    onClick={() => setSelected(app)}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(app.submittedAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-medium">{app.performerName}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{app.performanceType}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{app.contactPersonName}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">{app.emailAddress}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-primary hover:text-accent transition-colors flex items-center gap-1 ml-auto text-xs font-semibold">
                        <Eye className="w-3.5 h-3.5" /> View <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {applications.length} performer submission{applications.length !== 1 ? "s" : ""}
            {debouncedSearch && " matching your search"}
          </div>
        </div>
      )}

      {selected && <PerformerDetailDrawer app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────

const CHART_COLORS = ["#3D0082", "#FDB92E", "#FF724F", "#DA0B85", "#6B21A8", "#D97706", "#DC2626", "#7C3AED"];

function SummaryTab() {
  const { data, isLoading } = useQuery<Summary>({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const res = await apiFetch("/admin/summary");
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
  });

  if (isLoading) return <div className="text-center py-16 text-muted-foreground">Loading summary…</div>;
  if (!data) return null;

  const categoryData = Object.entries(data.categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const foodData = [
    { name: "Food Vendor", value: data.foodVendorCount.yes },
    { name: "Non-Food", value: data.foodVendorCount.no },
  ];

  const provinceData = Object.entries(data.provinceCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
            </div>
            <p className="text-3xl font-bold text-primary">{data.total}</p>
            <p className="text-xs text-muted-foreground">Applications</p>
          </CardContent>
        </Card>
        <Card className="border-secondary/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UtensilsCrossed className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Food</span>
            </div>
            <p className="text-3xl font-bold text-secondary-foreground">{data.foodVendorCount.yes}</p>
            <p className="text-xs text-muted-foreground">Artisan food vendors</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Non-Food</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{data.foodVendorCount.no}</p>
            <p className="text-xs text-muted-foreground">Other vendors</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Categories</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{Object.keys(data.categoryCount).length}</p>
            <p className="text-xs text-muted-foreground">Unique product types</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-primary">Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip formatter={(v) => [v, "Applications"]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-primary">Food vs Non-Food</CardTitle>
            </CardHeader>
            <CardContent>
              {data.total === 0 ? (
                <p className="text-muted-foreground text-sm">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={foodData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      <Cell fill="#3D0082" />
                      <Cell fill="#FDB92E" />
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {provinceData.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-primary">By Province</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {provinceData.map(({ name, value }) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-primary w-8">{name}</span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(value / data.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Email Settings Tab ───────────────────────────────────────────────────────

function EmailSettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(false);

  const { data: emailData } = useQuery<EmailSettings>({
    queryKey: ["admin-email-settings"],
    queryFn: async () => {
      const res = await apiFetch("/admin/email-settings");
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
  });

  useEffect(() => {
    if (emailData && !loaded) {
      setSubject(emailData.subject || "");
      setBody(emailData.body || "");
      setLoaded(true);
    }
  }, [emailData, loaded]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/admin/email-settings", {
        method: "PUT",
        body: JSON.stringify({ subject, body }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-email-settings"] });
      toast({ title: "Email template saved", description: "Future submissions will use this template." });
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-3">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-semibold text-primary">Automatic Confirmation Email</p>
              <p className="text-muted-foreground">
                This email is sent automatically to each applicant after they submit the form.
                Use the variables below in your message — they will be replaced with the applicant's actual details.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {["{{firstName}}", "{{lastName}}", "{{emailAddress}}", "{{businessName}}"].map(v => (
                  <code key={v} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono">{v}</code>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Emails are sent via Resend. Set <code className="bg-muted px-1 rounded">RESEND_API_KEY</code> in your environment variables to enable sending.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Email Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Thank you for applying to the Sauga Artisan Festival!"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Email Body</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Hi {{firstName}},\n\nThank you for submitting your application to the Sauga Artisan Festival!\n\n[Write your confirmation message and next steps here...]\n\nWarm regards,\nSauga Artisan Festival Team`}
            rows={14}
            className="font-mono text-sm resize-y"
          />
          <p className="text-xs text-muted-foreground">Plain text. Use line breaks for paragraphs.</p>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !subject.trim() || !body.trim()}
          className="gap-2 bg-primary hover:bg-secondary hover:text-secondary-foreground"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Saving…" : "Save Template"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

type Tab = "responses" | "performers" | "summary" | "email";

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [tab, setTab] = useState<Tab>("responses");
  const { toast } = useToast();

  function handleLogin() {
    setToken(sessionStorage.getItem("admin_token") || "");
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    setToken("");
  }

  function handleDownload(downloadType: "logos" | "csv") {
    const appType = tab === "performers" ? "performers" : "vendors";
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    const url = `${BASE}/api/admin/download/${downloadType}?type=${appType}`;
    
    fetch(url, { headers })
      .then(r => {
        if (!r.ok) {
          return r.json().then(err => { throw new Error(err.error || "Download failed"); });
        }
        return r.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const prefix = tab === "performers" ? "performer-" : "vendor-";
        link.download = downloadType === "logos" 
          ? `${prefix}logos-${new Date().toISOString().slice(0, 10)}.zip`
          : `${prefix}applications-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        toast({ title: "Download failed", description: err.message, variant: "destructive" });
      });
  }

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "responses", label: "Responses", icon: <Users className="w-4 h-4" /> },
    { id: "performers", label: "Performers", icon: <MicVocal className="w-4 h-4" /> },
    { id: "summary", label: "Summary", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: "email", label: "Email Settings", icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="font-serif font-bold text-lg uppercase tracking-wide">Sauga Artisan Festival</h1>
          <p className="text-xs opacity-75">Admin Portal</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem onClick={() => handleDownload("logos")} className="gap-2">
                <ImageIcon className="w-4 h-4" /> Just Logos (ZIP)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("csv")} className="gap-2">
                <FileSpreadsheet className="w-4 h-4" /> All Details (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleLogout}
            className="gap-1.5 bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {tab === "responses" && <ResponsesTab token={token} />}
        {tab === "performers" && <PerformerResponsesTab />}
        {tab === "summary" && <SummaryTab />}
        {tab === "email" && <EmailSettingsTab />}
      </main>
    </div>
  );
}
