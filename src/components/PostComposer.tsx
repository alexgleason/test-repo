import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useAuthor } from '@/hooks/useAuthor';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Image, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';

interface PostComposerProps {
  replyTo?: string;
  onSuccess?: () => void;
  placeholder?: string;
  className?: string;
}

export function PostComposer({ replyTo, onSuccess, placeholder = "What's happening?", className }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { user } = useCurrentUser();
  const { mutate: publish, isPending: isPublishing } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();
  const author = useAuthor(user?.pubkey);

  const handleSubmit = () => {
    if (!content.trim() && uploadedImages.length === 0) return;

    let postContent = content.trim();
    if (uploadedImages.length > 0) {
      postContent += '\n\n' + uploadedImages.join('\n');
    }

    const tags: string[][] = [];
    if (replyTo) {
      tags.push(['e', replyTo, '', 'reply']);
    }

    if (uploadedImages.length > 0) {
      uploadedImages.forEach((url) => {
        tags.push([
          'imeta',
          `url ${url}`,
          'm image/jpeg',
        ]);
      });
    }

    publish(
      { 
        kind: 1, 
        content: postContent,
        tags,
      },
      {
        onSuccess: () => {
          setContent('');
          setUploadedImages([]);
          toast({
            title: 'Posted!',
            description: 'Your note has been published to Nostr.',
          });
          onSuccess?.();
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: 'Failed to publish note. Please try again.',
            variant: 'destructive',
          });
          console.error('Failed to publish:', error);
        },
      }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const tags = await uploadFile(file);
      const url = tags[0][1];
      setUploadedImages([...uploadedImages, url]);
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
      console.error('Upload error:', error);
    }
  };

  const removeImage = (url: string) => {
    setUploadedImages(uploadedImages.filter((img) => img !== url));
  };

  if (!user) {
    return null;
  }

  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(user.pubkey);
  const avatarUrl = metadata?.picture;

  return (
    <Card className={className}>
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[100px] resize-none border-0 p-0 text-lg focus-visible:ring-0"
              disabled={isPublishing}
            />
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((url) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt="Upload preview"
                      className="rounded-lg w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => removeImage(url)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
                      disabled={isPublishing}
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-primary hover:bg-primary/10"
                  disabled={isPublishing || isUploading}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Image className="h-5 w-5" />
                  )}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isPublishing || isUploading}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && uploadedImages.length === 0) || isPublishing}
                className="rounded-full px-6 font-semibold"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  replyTo ? 'Reply' : 'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
