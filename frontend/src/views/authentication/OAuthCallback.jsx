import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setAuth } from "../../lib/http";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingScreen } from "../../components/ui";
import { handleError } from "../../utils/ToastMessages";

/** Lands here after a GitHub/Facebook redirect: stores the token, then routes on. */
export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      handleError("Sign-in was cancelled or failed");
      navigate("/login", { replace: true });
      return;
    }
    setAuth({ token, name: params.get("name"), userId: params.get("userId") });
    refresh().finally(() => navigate("/dashboard", { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingScreen label="Signing you in…" />;
}
