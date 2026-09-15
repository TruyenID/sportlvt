"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers";
import { login } from "@/lib/endpoints";

const REMEMBER_KEY = "levantruyen_admin_remember";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      // Migrate old format that stored a JSON object with { email, password }.
      let savedEmail = saved;
      if (saved.startsWith("{")) {
        try {
          savedEmail = JSON.parse(saved).email ?? "";
        } catch {
          savedEmail = "";
        }
        if (savedEmail) {
          window.localStorage.setItem(REMEMBER_KEY, savedEmail);
        } else {
          window.localStorage.removeItem(REMEMBER_KEY);
        }
      }
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await login(email, password);
      if (remember) {
        window.localStorage.setItem(REMEMBER_KEY, email);
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
      }
      setSession(user);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/15">
            <Dumbbell className="size-5" />
          </div>
          <span className="text-lg font-semibold">LevanTruyen</span>
        </div>
        <div className="relative flex flex-col gap-2">
          <h2 className="text-3xl font-bold leading-tight">
            Quản lý cửa hàng đồ thể thao dễ dàng hơn
          </h2>
          <p className="max-w-md text-sm text-primary-foreground/80">
            Theo dõi sản phẩm, đơn hàng, khách hàng và doanh thu trong một bảng điều khiển duy nhất.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm border-none shadow-lg">
          <CardHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary lg:hidden">
              <Dumbbell className="size-5" />
            </div>
            <CardTitle className="text-xl">Đăng nhập quản trị</CardTitle>
            <p className="text-sm text-muted-foreground">Nhập thông tin tài khoản admin để tiếp tục.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@levantruyen.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded border-input accent-primary"
                />
                Ghi nhớ tài khoản
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
