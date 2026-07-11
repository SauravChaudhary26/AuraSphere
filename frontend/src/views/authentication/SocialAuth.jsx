import { useGoogleLogin } from "@react-oauth/google";
import { Github, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../assets/google-icon";
import api, { API_BASE } from "../../lib/http";
import { useAuth } from "../../contexts/AuthContext";
import { handleError } from "../../utils/ToastMessages";

/** Google (code flow, works today) + GitHub/Facebook (redirect flow via backend). */
export default function SocialAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      try {
        const { data } = await api.get(`/auth/google?code=${encodeURIComponent(code)}`);
        login(data);
        navigate("/dashboard");
      } catch (e) {
        handleError(e?.response?.data?.message || "Google sign-in failed");
      }
    },
    onError: () => handleError("Google sign-in failed"),
  });

  const oauthRedirect = (provider) => {
    window.location.assign(`${API_BASE}/auth/${provider}/start`);
  };

  const btn =
    "flex h-11 flex-1 items-center justify-center gap-2 rounded-[11px] border border-border bg-surface text-sm font-semibold text-ink transition hover:border-primary";

  return (
    <div className="flex gap-3">
      <button type="button" className={btn} onClick={() => googleLogin()} aria-label="Continue with Google">
        <GoogleIcon width="20px" height="20px" /> Google
      </button>
      <button type="button" className={btn} onClick={() => oauthRedirect("github")} aria-label="Continue with GitHub">
        <Github size={18} />
      </button>
      <button type="button" className={btn} onClick={() => oauthRedirect("facebook")} aria-label="Continue with Facebook">
        <Facebook size={18} />
      </button>
    </div>
  );
}
