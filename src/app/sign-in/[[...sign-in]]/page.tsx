import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center grid-bg hero-gradient"
      style={{ position: "relative" }}
    >
      <div className="relative z-10 animate-fade-in-up">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-[rgba(99,102,241,0.15)] bg-[#12121a]",
            },
          }}
        />
      </div>
    </div>
  );
}
