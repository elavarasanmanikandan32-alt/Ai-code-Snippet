import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center grid-bg hero-gradient"
      style={{ position: "relative" }}
    >
      <div className="relative z-10 animate-fade-in-up">
        <SignUp
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
