import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePost } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon } from "lucide-react";

const createPostSchema = z.object({
  imageUrl: z.string().url("Please enter a valid image URL"),
  caption: z.string().max(2200, "Caption is too long").optional(),
});

type CreatePostValues = z.infer<typeof createPostSchema>;

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreatePost();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      imageUrl: "",
      caption: "",
    },
  });

  const onSubmit = (data: CreatePostValues) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: (post) => {
          toast({
            title: "Post created!",
            description: "Your post is now live.",
          });
          setLocation("/");
        },
        onError: (error) => {
          toast({
            title: "Error creating post",
            description: "Please try again later.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue("imageUrl", url);
    
    // Basic validation to show preview
    if (url.match(/^https?:\/\/.+/)) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Create new post</h1>
        
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Image Preview Area */}
          <div className="w-full md:w-[500px] aspect-square bg-muted flex flex-col items-center justify-center border-r border-border shrink-0">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={() => setPreviewUrl(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-bold text-lg mb-2">Image Preview</p>
                <p className="text-sm">Enter a valid image URL to see preview.</p>
              </div>
            )}
          </div>

          {/* Form Area */}
          <div className="flex-1 p-6 flex flex-col">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                          onChange={handleUrlChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col">
                      <FormLabel>Caption</FormLabel>
                      <FormControl className="flex-1 min-h-[150px]">
                        <Textarea 
                          placeholder="Write a caption..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 mt-auto">
                  <Button 
                    type="submit" 
                    className="w-full instaclone-gradient text-white border-0 font-bold h-10" 
                    disabled={createMutation.isPending || !form.formState.isValid}
                  >
                    {createMutation.isPending ? "Sharing..." : "Share Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
