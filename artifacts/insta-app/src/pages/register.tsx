import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores and periods"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({
            title: "Welcome to InstaClone!",
            description: "Your account has been created successfully.",
          });
          setLocation("/");
        },
        onError: (error) => {
          toast({
            title: "Registration Failed",
            description: error.error || "An error occurred during registration.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold font-display">
            <span className="instaclone-gradient-text">InstaClone</span>
          </h1>
          <p className="text-muted-foreground font-medium px-4">Sign up to see photos and videos from your friends.</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email address" {...field} className="bg-background h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} className="bg-background h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Username" {...field} className="bg-background h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} className="bg-background h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-md font-bold instaclone-gradient text-white border-0 hover:opacity-90 transition-opacity mt-2" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Signing up..." : "Sign up"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl text-center shadow-sm">
          <p className="text-muted-foreground font-medium">
            Have an account?{" "}
            <Link href="/login">
              <span className="text-primary font-bold hover:underline cursor-pointer">Log in</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
