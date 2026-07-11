import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button, Card } from "../components/ui";
import Logo from "../components/Logo";
import AuraRing from "../components/ui/AuraRing";

export default function Error() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Logo size={30} />
        </div>

        <div className="mb-6 flex justify-center">
          <AuraRing value={44} size={168} thickness={18}>
            <div className="mono text-[52px] font-extrabold leading-none text-primary">404</div>
          </AuraRing>
        </div>

        <h1 className="serif text-2xl font-extrabold">This page drifted out of orbit</h1>
        <p className="mt-2 text-muted">
          The page you were looking for couldn&apos;t be found. It may have been moved,
          renamed, or never existed in this galaxy.
        </p>

        <Link to="/" className="mt-6 inline-flex justify-center">
          <Button>
            <Home size={16} />
            Back to home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
