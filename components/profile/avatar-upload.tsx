"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  name?: string | null;
  onUpload: (url: string) => void;
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  name,
  onUpload,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("头像不能超过 2MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("只支持 jpg、png、webp 格式");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert("上传失败: " + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    onUpload(publicUrl);
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-24 w-24 ring-2 ring-brand/20" aria-hidden="true">
        <AvatarImage src={currentAvatarUrl || undefined} />
        <AvatarFallback className="text-2xl bg-brand/10 text-brand">
          {name?.[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "上传中..." : "更换头像"}
      </Button>
    </div>
  );
}
