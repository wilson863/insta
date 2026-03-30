import { useState } from "react";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          setLocation("/");
        },
        onError: (error) => {
          toast({
            title: "Login Failed",
            description: error.error || "Please check your credentials and try again.",
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
          <p className="text-muted-foreground font-medium">Log in to see photos and videos from your friends.</p>
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
              <Button type="submit" className="w-full h-12 text-md font-bold instaclone-gradient text-white border-0 hover:opacity-90 transition-opacity" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl text-center shadow-sm">
          <p className="text-muted-foreground font-medium">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-primary font-bold hover:underline cursor-pointer">Sign up</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
