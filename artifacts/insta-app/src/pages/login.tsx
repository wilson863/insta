import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().min(1, "Please enter your email or username"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function PhoneMockup({ offset = 0 }: { offset?: number }) {
  const screens = [
    ["bg-pink-300", "bg-purple-300", "bg-yellow-300", "bg-blue-300"],
    ["bg-green-300", "bg-red-300", "bg-indigo-300", "bg-orange-300"],
  ];
  const s = screens[offset % 2];
  return (
    <div className="relative w-[220px] h-[430px] rounded-[36px] border-[8px] border-gray-800 bg-white shadow-2xl overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-800 rounded-b-xl z-10" />
      <div className="grid grid-cols-3 gap-0.5 p-0.5 mt-5">
        <div className={`${s[0]} aspect-square rounded-sm`} />
        <div className={`${s[1]} aspect-square rounded-sm`} />
        <div className={`${s[2]} aspect-square rounded-sm`} />
        <div className={`${s[3]} aspect-square rounded-sm`} />
        <div className={`${s[0]} aspect-square rounded-sm`} />
        <div className={`${s[1]} aspect-square rounded-sm`} />
        <div className={`${s[2]} aspect-square rounded-sm`} />
        <div className={`${s[3]} aspect-square rounded-sm`} />
        <div className={`${s[0]} aspect-square rounded-sm`} />
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600" />
          <div>
            <div className="h-2 w-20 bg-gray-200 rounded" />
            <div className="h-1.5 w-14 bg-gray-100 rounded mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`${s[i % 4]} aspect-square rounded-sm opacity-80`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: () => {
          setLocation("/");
        },
        onError: (error: any) => {
          toast({
            title: "Login failed",
            description: error?.error || "Incorrect credentials. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
      <div className="flex items-center justify-center gap-8 w-full max-w-[900px]">

        <div className="hidden lg:flex items-center justify-center relative w-[380px] h-[480px] flex-shrink-0">
          <div className="absolute left-0 top-10 z-10">
            <PhoneMockup offset={0} />
          </div>
          <div className="absolute left-[120px] top-0 z-20">
            <PhoneMockup offset={1} />
          </div>
        </div>

        <div className="w-full max-w-[350px] flex flex-col items-center gap-3">

          <div className="w-full border border-[#dbdbdb] bg-white px-10 py-8 flex flex-col items-center gap-4">
            <h1 style={{ fontFamily: "'Grand Hotel', cursive" }} className="text-[52px] text-gray-800 mb-2 select-none">
              Instagram
            </h1>

            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-2">
              <input
                {...form.register("email")}
                placeholder="Phone number, username, or email"
                className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-sm px-2 py-[9px] text-[12px] text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-400"
              />
              {form.formState.errors.email && (
                <span className="text-red-500 text-xs">{form.formState.errors.email.message}</span>
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
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full mt-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-[14px] py-[7px] rounded-lg transition-colors disabled:opacity-60"
              >
                {loginMutation.isPending ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="flex items-center w-full gap-4 my-1">
              <div className="flex-1 h-px bg-[#dbdbdb]" />
              <span className="text-[13px] font-semibold text-gray-500 tracking-widest">OR</span>
              <div className="flex-1 h-px bg-[#dbdbdb]" />
            </div>

            <button className="flex items-center gap-2 text-[#385185] font-semibold text-[14px] hover:text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Log in with Facebook
            </button>

            <Link href="/forgot-password">
              <span className="text-[12px] text-[#00376b] cursor-pointer hover:underline">Forgot password?</span>
            </Link>
          </div>

          <div className="w-full border border-[#dbdbdb] bg-white py-4 text-center text-[14px]">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-[#0095f6] font-semibold cursor-pointer hover:underline">Sign up</span>
            </Link>
          </div>

          <div className="text-center mt-2">
            <p className="text-[14px] text-gray-800 mb-3">Get the app.</p>
            <div className="flex items-center justify-center gap-2">
              <img
                src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Ql5Cs_Jdp.png"
                alt="Get it on Google Play"
                className="h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <img
                src="https://static.cdninstagram.com/rsrc.php/v3/yu/r/EHY6QnZYdgX.png"
                alt="Get it from Microsoft"
                className="h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
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
    </div>
  );
}
