import { Button } from "@/components/ui/button";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button>Click me</Button>
      <GoogleSignInButton />
    </main>
  );
}
