import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  email: z.string().email("Enter a valid mobile number or email address."),
  fullName: z.string().min(2, "Enter your full name."),
  username: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-zA-Z0-9_.]+$/, "Only letters, numbers, underscores and periods."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", fullName: "", username: "", password: "" },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: () => {
          setLocation("/");
        },
        onError: (error: any) => {
          toast({
            title: "Sign up failed",
            description: error?.error || "An error occurred. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[350px] flex flex-col items-center gap-3">

        <div className="w-full border border-[#dbdbdb] bg-white px-10 py-8 flex flex-col items-center gap-3">
          <h1 style={{ fontFamily: "'Grand Hotel', cursive" }} className="text-[52px] text-gray-800 mb-1 select-none">
            Instagram
          </h1>

          <p className="text-[17px] font-semibold text-[#737373] text-center leading-snug">
            Sign up to see photos and videos from your friends.
          </p>

          <button className="w-full flex items-center justify-center gap-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-[14px] py-[7px] rounded-lg transition-colors mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Log in with Facebook
          </button>

          <div className="flex items-center w-full gap-4 my-1">
            <div className="flex-1 h-px bg-[#dbdbdb]" />
            <span className="text-[13px] font-semibold text-gray-500 tracking-widest">OR</span>
            <div className="flex-1 h-px bg-[#dbdbdb]" />
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-2">
            <input
              {...form.register("email")}
              placeholder="Mobile Number or Email"
              className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-sm px-2 py-[9px] text-[12px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-400"
            />
            {form.formState.errors.email && (
              <span className="text-red-500 text-xs">{form.formState.errors.email.message}</span>
            )}

            <input
              {...form.register("fullName")}
              placeholder="Full Name"
              className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-sm px-2 py-[9px] text-[12px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-400"
            />
            {form.formState.errors.fullName && (
              <span className="text-red-500 text-xs">{form.formState.errors.fullName.message}</span>
            )}

            <input
              {...form.register("username")}
              placeholder="Username"
              className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-sm px-2 py-[9px] text-[12px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-400"
            />
            {form.formState.errors.username && (
              <span className="text-red-500 text-xs">{form.formState.errors.username.message}</span>
            )}

            <input
              {...form.register("password")}
              type="password"
              placeholder="Password"
              className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-sm px-2 py-[9px] text-[12px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-400"
            />
            {form.formState.errors.password && (
              <span className="text-red-500 text-xs">{form.formState.errors.password.message}</span>
            )}

            <p className="text-center text-[12px] text-[#737373] leading-relaxed mt-1">
              People who use our service may have uploaded your contact information to Instagram.{" "}
              <a href="#" className="text-[#00376b]">Learn more</a>
            </p>
            <p className="text-center text-[12px] text-[#737373] leading-relaxed">
              By signing up, you agree to our{" "}
              <a href="#" className="text-[#00376b]">Terms</a>,{" "}
              <a href="#" className="text-[#00376b]">Privacy Policy</a> and{" "}
              <a href="#" className="text-[#00376b]">Cookies Policy</a>.
            </p>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full mt-1 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-[14px] py-[7px] rounded-lg transition-colors disabled:opacity-60"
            >
              {registerMutation.isPending ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="w-full border border-[#dbdbdb] bg-white py-4 text-center text-[14px]">
          Have an account?{" "}
          <Link href="/login">
            <span className="text-[#0095f6] font-semibold cursor-pointer hover:underline">Log in</span>
          </Link>
        </div>

        <div className="text-center mt-2">
          <p className="text-[14px] text-gray-800 mb-3">Get the app.</p>
          <div className="flex items-center justify-center gap-2">
            <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="border border-gray-800 rounded px-2 py-1 flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-800">
                <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l13 8.5-13 8.5c-.5.33-1.5.33-1.5-.5z"/>
              </svg>
              <div className="text-left">
                <div className="text-[8px] text-gray-800 leading-none">GET IT ON</div>
                <div className="text-[11px] font-semibold text-gray-800 leading-none">Google Play</div>
              </div>
            </a>
            <a href="https://www.microsoft.com/store" target="_blank" rel="noreferrer" className="border border-gray-800 rounded px-2 py-1 flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-800">
                <path d="M11.5 2.75H2.75V11.5H11.5V2.75ZM21.25 2.75H12.5V11.5H21.25V2.75ZM11.5 12.5H2.75V21.25H11.5V12.5ZM21.25 12.5H12.5V21.25H21.25V12.5Z"/>
              </svg>
              <div className="text-left">
                <div className="text-[8px] text-gray-800 leading-none">GET IT FROM</div>
                <div className="text-[11px] font-semibold text-gray-800 leading-none">Microsoft</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
