"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUpload } from "./avatar-upload";
import { updateProfile } from "@/lib/actions/profile";
import { CheckCircle, XCircle } from "lucide-react";

interface ProfileFormProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const result = await updateProfile({ name, avatar_url: avatarUrl });
    setIsLoading(false);

    if (result.success) {
      setMessage("保存成功");
      router.refresh();
    } else {
      setMessage(result.error?.message || "保存失败");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl">个人资料</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center">
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={avatarUrl}
              name={name}
              onUpload={setAvatarUrl}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">昵称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入昵称"
            />
          </div>

          <div className="space-y-2">
            <Label>邮箱</Label>
            <Input value={user.email || "未绑定"} disabled />
          </div>

          <div className="space-y-2">
            <Label>手机号</Label>
            <Input value={user.phone || "未绑定"} disabled />
          </div>

          {message && (
            <div
              className={`flex items-center justify-center gap-1.5 text-sm ${
                message.includes("成功")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              role={message.includes("成功") ? "status" : "alert"}
              aria-live="polite"
            >
              {message.includes("成功") ? (
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
              ) : (
                <XCircle className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{message}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-dark"
            disabled={isLoading}
          >
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
