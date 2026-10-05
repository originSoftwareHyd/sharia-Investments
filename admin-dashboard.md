# Admin Dashboard — Export (Blog + Enquiries)

Full admin dashboard with blog management and enquiry management.  
Search for `TODO` to find every place that needs your branding/config.

---

## 1. Install dependencies

```bash
npm install next-auth@beta bcryptjs zod cloudinary \
  @prisma/client @prisma/adapter-pg \
  @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/pm \
  lucide-react clsx tailwind-merge

npm install -D prisma @types/bcryptjs
```

Exact versions used:
```
next: 16.2.10 | next-auth: ^5.0.0-beta.31 | prisma: ^7.8.0
@tiptap/*: ^3.27.3 | cloudinary: ^2.10.0 | zod: ^4.4.3 | bcryptjs: ^3.0.3
```

---

## 2. Environment variables (`.env.local`)

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate with: openssl rand -base64 32"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 3. File tree

```
prisma/
  schema.prisma
prisma.config.ts
src/
  lib/
    auth.ts
    db.ts
    utils.ts
    validations/
      post.ts
      contact.ts
    storage/
      interface.ts
      cloudinary.ts
      index.ts
  app/
    api/
      auth/[...nextauth]/route.ts
      posts/route.ts
      posts/[id]/route.ts
      enquiries/route.ts
      enquiries/[id]/route.ts
      contact/route.ts          ← public form submission endpoint
      upload/route.ts
      upload/sign/route.ts
      upload/confirm/route.ts
    admin/
      page.tsx
      layout.tsx
      login/page.tsx
      (authenticated)/
        layout.tsx
        dashboard/page.tsx
        posts/page.tsx
        posts/new/page.tsx
        posts/[id]/edit/page.tsx
        enquiries/page.tsx
        enquiries/[id]/page.tsx
  components/
    ui/Button.tsx
    admin/
      AdminSidebar.tsx
      PostForm.tsx
      PostActions.tsx
      TiptapEditor.tsx
      MediaUploader.tsx
```

---

## 4. `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Admin {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Post {
  id            Int       @id @default(autoincrement())
  slug          String    @unique
  title         String
  excerpt       String
  content       String
  coverImageUrl String?
  coverImageId  String?
  category      String
  categoryName  String
  readTime      String
  published     Boolean   @default(false)
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Enquiry {
  id         Int      @id @default(autoincrement())
  name       String
  email      String
  phone      String?
  subject    String
  message    String
  isRead     Boolean  @default(false)
  isArchived Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model MediaAsset {
  id        Int      @id @default(autoincrement())
  url       String
  publicId  String   @unique
  altText   String?
  width     Int?
  height    Int?
  createdAt DateTime @default(now())
}
```

---

## 5. `prisma.config.ts`

```ts
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

---

## 6. `src/lib/auth.ts`

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const admin = await prisma.admin.findUnique({
          where: { email: parsed.data.email },
        });
        if (!admin) return null;

        const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
        if (!valid) return null;

        return { id: String(admin.id), email: admin.email };
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
});
```

---

## 7. `src/lib/db.ts`

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

## 8. `src/lib/utils.ts`

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
```

---

## 9. `src/lib/validations/contact.ts`

```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Please enter a message (at least 10 characters)"),
  website: z.string(), // honeypot — must be empty string
});

export type ContactInput = z.infer<typeof contactSchema>;
```

---

## 10. `src/lib/validations/post.ts`

```ts
import { z } from "zod";

export const createPostSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required").max(300),
  excerpt: z.string().min(1, "Excerpt is required").max(500),
  content: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  coverImageId: z.string().optional().or(z.null()),
  category: z.string().min(1, "Category is required").max(100),
  categoryName: z.string().min(1).max(100),
  readTime: z.string().min(1).max(50),
  published: z.boolean().default(false),
});

export const updatePostSchema = createPostSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
```

---

## 11. `src/lib/storage/interface.ts`

```ts
export interface UploadOptions { folder: string; filename?: string; }
export interface UploadResult { url: string; publicId: string; width: number; height: number; }
export interface IStorageProvider {
  upload(file: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
}
```

---

## 11. `src/lib/storage/cloudinary.ts`

```ts
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import type { IStorageProvider, UploadOptions, UploadResult } from "./interface";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryProvider: IStorageProvider = {
  async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
    const uploadPromise = new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: options.folder,
            public_id: options.filename,
            transformation: [
              { width: 1600, crop: "limit" },
              { fetch_format: "auto", quality: "auto" },
            ],
          },
          (error, result) => {
            if (error || !result) reject(error ?? new Error("Upload failed"));
            else resolve(result);
          }
        )
        .end(file);
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Cloudinary upload timed out after 30s")), 30_000)
    );

    const result = await Promise.race([uploadPromise, timeoutPromise]);
    return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height };
  },

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  },
};
```

---

## 12. `src/lib/storage/index.ts`

```ts
import { cloudinaryProvider } from "./cloudinary";
export const storageProvider = cloudinaryProvider;
```

---

## 13. `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

---

## 14. `src/app/api/posts/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPostSchema } from "@/lib/validations/post";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" }, skip, take: limit,
      select: {
        id: true, slug: true, title: true, category: true, categoryName: true,
        published: true, publishedAt: true, createdAt: true, readTime: true,
        excerpt: true, coverImageUrl: true,
      },
    }),
    prisma.post.count(),
  ]);
  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg = Object.entries(flat.fieldErrors)
      .map(([f, m]) => `${f}: ${(m as string[]).join(", ")}`)
      .join("; ") || "Validation failed";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const existing = await prisma.post.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });

  const post = await prisma.post.create({
    data: {
      ...parsed.data,
      coverImageUrl: parsed.data.coverImageUrl || null,
      coverImageId: parsed.data.coverImageId || null,
      publishedAt: parsed.data.published ? new Date() : null,
    },
  });

  revalidatePath("/admin/posts/");
  return NextResponse.json(post, { status: 201 });
}
```

---

## 15. `src/app/api/posts/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updatePostSchema } from "@/lib/validations/post";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const numId = parseId(id);
  if (!numId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const post = await prisma.post.findUnique({ where: { id: numId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const numId = parseId(id);
  if (!numId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg = Object.entries(flat.fieldErrors)
      .map(([f, m]) => `${f}: ${(m as string[]).join(", ")}`)
      .join("; ") || "Validation failed";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const existing = await prisma.post.findUnique({ where: { id: numId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = { ...parsed.data };
  if ("coverImageUrl" in parsed.data) data.coverImageUrl = parsed.data.coverImageUrl || null;
  if ("coverImageId" in parsed.data) data.coverImageId = parsed.data.coverImageId || null;
  if (parsed.data.published === true && !existing.publishedAt) data.publishedAt = new Date();

  const post = await prisma.post.update({ where: { id: numId }, data });
  revalidatePath("/admin/posts/");
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const numId = parseId(id);
  if (!numId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await prisma.post.findUnique({ where: { id: numId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.post.delete({ where: { id: numId } });
  revalidatePath("/admin/posts/");
  return new NextResponse(null, { status: 204 });
}
```

---

## 16. `src/app/api/upload/route.ts`

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storageProvider } from "@/lib/storage";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, publicId: true, altText: true, width: true, height: true, createdAt: true },
  });
  return NextResponse.json({ assets });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId");
  if (!publicId) return NextResponse.json({ error: "publicId required" }, { status: 400 });

  const asset = await prisma.mediaAsset.findUnique({ where: { publicId } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try { await storageProvider.delete(publicId); } catch { /* already gone */ }
  await prisma.mediaAsset.delete({ where: { publicId } });
  return new NextResponse(null, { status: 204 });
}
```

---

## 17. `src/app/api/upload/sign/route.ts`

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "YOUR_SITE_NAME/blog"; // TODO: change to your site name

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature, timestamp, folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
```

---

## 18. `src/app/api/upload/confirm/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, publicId, width, height } = await request.json();
  if (!url || !publicId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const asset = await prisma.mediaAsset.create({
    data: { url, publicId, width: width ?? null, height: height ?? null },
  });
  return NextResponse.json(asset, { status: 201 });
}
```

---

## 19. `src/app/admin/page.tsx`

```tsx
import { redirect } from "next/navigation";
export default function AdminRoot() {
  redirect("/admin/dashboard");
}
```

---

## 20. `src/app/admin/layout.tsx`

```tsx
import type { ReactNode } from "react";
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

---

## 21. `src/app/admin/login/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      if (result?.error) { setError("Invalid email or password."); setLoading(false); }
      else router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* TODO: change site name */}
          <h1 className="font-cormorant font-medium text-3xl text-white">YOUR SITE Admin</h1>
          <p className="font-sans text-sm text-white/50 mt-1">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs font-medium text-white/70 mb-1.5">Email</label>
            <input name="email" type="email" required autoComplete="email"
              className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-white font-sans text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald transition-colors" />
          </div>
          <div>
            <label className="block font-sans text-xs font-medium text-white/70 mb-1.5">Password</label>
            <input name="password" type="password" required autoComplete="current-password"
              className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-white font-sans text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald transition-colors" />
          </div>
          {error && <p className="font-sans text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald hover:bg-emerald-light disabled:opacity-60 text-white font-sans font-medium text-sm py-3 rounded-md transition-all duration-200 cursor-pointer">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 22. `src/app/admin/(authenticated)/layout.tsx`

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { ReactNode } from "react";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const unreadCount = await prisma.enquiry.count({
    where: { isRead: false, isArchived: false },
  });

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <AdminSidebar unreadCount={unreadCount} />
      <main className="flex-1 overflow-y-auto p-4 pt-14 sm:p-6 sm:pt-14 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 23. `src/app/admin/(authenticated)/dashboard/page.tsx`

```tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [totalPosts, publishedPosts, totalEnquiries, unreadEnquiries, recentPosts, recentEnquiries] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.enquiry.count({ where: { isArchived: false } }),
      prisma.enquiry.count({ where: { isRead: false, isArchived: false } }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" }, take: 5,
        select: { id: true, title: true, published: true, createdAt: true },
      }),
      prisma.enquiry.findMany({
        orderBy: { createdAt: "desc" }, take: 5,
        where: { isArchived: false },
        select: { id: true, name: true, subject: true, createdAt: true, isRead: true },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-cormorant font-medium text-3xl text-navy">Dashboard</h1>
        <p className="font-sans text-sm text-slate mt-0.5">Welcome back.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Posts" value={totalPosts} />
        <StatCard label="Published" value={publishedPosts} />
        <StatCard label="Total Enquiries" value={totalEnquiries} />
        <StatCard label="Unread Enquiries" value={unreadEnquiries} highlight={unreadEnquiries > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Panel title="Recent Posts" linkHref="/admin/posts" linkLabel="View all">
          {recentPosts.length === 0 ? (
            <p className="font-sans text-sm text-slate">No posts yet.</p>
          ) : recentPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-charcoal truncate">{post.title}</p>
                <p className="font-sans text-xs text-slate">{formatDate(post.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${post.published ? "bg-emerald/10 text-emerald" : "bg-slate/10 text-slate"}`}>
                  {post.published ? "Published" : "Draft"}
                </span>
                <Link href={`/admin/posts/${post.id}/edit`} className="font-sans text-xs text-emerald hover:underline">Edit</Link>
              </div>
            </div>
          ))}
        </Panel>

        {/* Recent Enquiries */}
        <Panel title="Recent Enquiries" linkHref="/admin/enquiries" linkLabel="View all">
          {recentEnquiries.length === 0 ? (
            <p className="font-sans text-sm text-slate">No enquiries yet.</p>
          ) : recentEnquiries.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {!e.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald flex-shrink-0" />}
                  <p className="font-sans text-sm text-charcoal truncate">{e.name}</p>
                </div>
                <p className="font-sans text-xs text-slate truncate">{e.subject}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-sans text-xs text-slate">{formatDate(e.createdAt)}</span>
                <Link href={`/admin/enquiries/${e.id}`} className="font-sans text-xs text-emerald hover:underline">View</Link>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border p-5 ${highlight ? "border-emerald" : "border-border"}`}>
      <p className="font-sans text-xs text-slate tracking-wide">{label}</p>
      <p className={`font-cormorant font-medium text-4xl mt-1 ${highlight ? "text-emerald" : "text-navy"}`}>{value}</p>
    </div>
  );
}

function Panel({ title, linkHref, linkLabel, children }: { title: string; linkHref: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sans font-medium text-sm text-charcoal">{title}</h2>
        <Link href={linkHref} className="font-sans text-xs text-emerald hover:underline">{linkLabel}</Link>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
```

---

## 24. `src/app/admin/(authenticated)/posts/page.tsx`

```tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PostActions } from "@/components/admin/PostActions";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, categoryName: true, published: true, publishedAt: true, createdAt: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cormorant font-medium text-3xl text-navy">Posts</h1>
          <p className="font-sans text-sm text-slate mt-0.5">{posts.length} total</p>
        </div>
        <Link href="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-emerald hover:bg-emerald-light text-white font-sans font-medium text-sm px-4 py-2.5 rounded-md shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
          <Plus size={14} /> New Post
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-stone-50">
                {["Title", "Category", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-sans font-medium text-xs text-slate tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-sans text-sm text-charcoal font-medium">{post.title}</span>
                    {/* TODO: update to match your public blog URL */}
                    <span className="block font-sans text-xs text-slate mt-0.5">/blog/{post.slug}</span>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-slate">{post.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-sans font-medium ${post.published ? "bg-emerald/10 text-emerald" : "bg-slate/10 text-slate"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-slate">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <Link href={`/admin/posts/${post.id}/edit`} className="font-sans text-sm text-emerald hover:underline">Edit</Link>
                      <PostActions postId={post.id} published={post.published} />
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center font-sans text-sm text-slate">
                    No posts yet.{" "}
                    <Link href="/admin/posts/new" className="text-emerald underline">Create your first post</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## 25. `src/app/admin/(authenticated)/posts/new/page.tsx`

```tsx
import { PostForm } from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="font-cormorant font-medium text-3xl text-navy mb-6">New Post</h1>
      <PostForm />
    </div>
  );
}
```

---

## 26. `src/app/admin/(authenticated)/posts/[id]/edit/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId < 1) notFound();

  const post = await prisma.post.findUnique({ where: { id: numId } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-cormorant font-medium text-3xl text-navy mb-6">Edit Post</h1>
      <PostForm initialData={{
        id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt,
        content: post.content, coverImageUrl: post.coverImageUrl, coverImageId: post.coverImageId,
        category: post.category, readTime: post.readTime, published: post.published,
      }} />
    </div>
  );
}
```

---

## 27. `src/components/admin/AdminSidebar.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, FileText, Mail, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/posts",      label: "Posts",      icon: FileText },
  { href: "/admin/enquiries",  label: "Enquiries",  icon: Mail },
];

function SidebarContent({
  unreadCount,
  onClose,
}: {
  unreadCount: number;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  return (
    <>
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          {/* TODO: change site name */}
          <span className="font-cormorant font-medium text-xl text-white">YOUR SITE</span>
          <span className="font-sans text-xs text-white/40 block">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white p-1 cursor-pointer" aria-label="Close sidebar">
            <X size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-sans font-medium transition-colors",
                active
                  ? "bg-white/10 text-white border-l-[3px] border-emerald pl-[9px]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}>
              <Icon size={16} strokeWidth={1.75} />
              {label}
              {label === "Enquiries" && unreadCount > 0 && (
                <span className="ml-auto bg-emerald text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-white/60 hover:text-white hover:bg-white/5 rounded-md text-sm font-sans transition-colors cursor-pointer">
          <LogOut size={16} strokeWidth={1.75} /> Sign Out
        </button>
      </div>
    </>
  );
}

export function AdminSidebar({ unreadCount }: { unreadCount: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <aside className="hidden lg:flex w-60 bg-navy flex-col shrink-0 h-full">
        <SidebarContent unreadCount={unreadCount} />
      </aside>

      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-navy text-white rounded-md shadow-md cursor-pointer" aria-label="Open admin menu">
        <Menu size={20} strokeWidth={1.5} />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside
        aria-hidden={!mobileOpen}
        {...(!mobileOpen ? { inert: "" } as unknown as React.HTMLAttributes<HTMLElement> : {})}
        className={cn(
          "lg:hidden fixed top-0 left-0 z-[51] w-60 bg-navy flex flex-col h-full transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
        <SidebarContent unreadCount={unreadCount} onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
```

---

## 28. `src/components/admin/PostForm.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "./TiptapEditor";
import { MediaUploader } from "./MediaUploader";
import { Button } from "@/components/ui/Button";

// TODO: update categories for your site
const CATEGORIES = [
  { slug: "shariah-investing",  name: "Shariah Investing" },
  { slug: "market-commentary",  name: "Market Commentary" },
  { slug: "financial-planning", name: "Financial Planning" },
  { slug: "retirement",         name: "Retirement Planning" },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function estimateReadTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

type InitialData = {
  id: number; slug: string; title: string; excerpt: string; content: string;
  coverImageUrl: string | null; coverImageId: string | null;
  category: string; readTime: string; published: boolean;
};

export function PostForm({ initialData }: { initialData?: InitialData }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [readTime, setReadTime] = useState(initialData?.readTime ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");
  const [coverImageId, setCoverImageId] = useState(initialData?.coverImageId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function onTitleChange(v: string) { setTitle(v); if (!slugEdited) setSlug(slugify(v)); }
  function onContentChange(html: string) { setContent(html); setReadTime(estimateReadTime(html)); }

  async function submit(publish: boolean) {
    if (!title.trim()) { setError("Title is required."); return; }
    if (!slug.trim()) { setError("Slug is required."); return; }
    if (!excerpt.trim()) { setError("Excerpt is required."); return; }
    if (!category) { setError("Category is required."); return; }
    if (!content.trim() || content === "<p></p>") { setError("Content is required."); return; }

    setSaving(true); setError(""); setSuccess("");
    const cat = CATEGORIES.find((c) => c.slug === category);
    const payload = {
      slug, title, excerpt, content,
      coverImageUrl: coverImageUrl || null,
      coverImageId: coverImageId || null,
      category,
      categoryName: cat?.name ?? "",
      readTime: readTime || "1 min read",
      published: publish,
    };

    try {
      const url = isEdit ? `/api/posts/${initialData.id}/` : "/api/posts/";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { error?: string } = {};
      try { data = await res.json(); }
      catch { if (!res.ok) { setError(`Server error (${res.status}).`); return; } }

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : `Failed to save (${res.status}).`);
        return;
      }

      setSuccess(publish ? "Post published!" : "Draft saved!");
      setTimeout(() => router.push("/admin/posts/"), 800);
    } catch {
      setError("Network error — could not reach the server.");
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">{error}</div>
      )}
      {success && (
        <div className="bg-emerald/10 border border-emerald/30 text-emerald text-sm px-4 py-3 rounded-md">{success}</div>
      )}

      <Field label="Title" required>
        <input type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Post title"
          className="w-full font-sans text-base text-charcoal bg-white border border-border rounded-md px-4 py-3 focus:outline-none focus:border-emerald transition-colors" />
      </Field>

      <Field label="Slug" required>
        <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          className="w-full font-sans text-sm text-charcoal bg-white border border-border rounded-md px-4 py-3 focus:outline-none focus:border-emerald transition-colors font-mono" />
        {/* TODO: update preview path to match your public blog URL */}
        <p className="font-sans text-xs text-slate mt-1">/blog/{slug || "…"}</p>
      </Field>

      <Field label="Excerpt" required>
        <textarea rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief description used in post lists and SEO"
          className="w-full font-sans text-base text-charcoal bg-white border border-border rounded-md px-4 py-3 focus:outline-none focus:border-emerald transition-colors resize-none" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" required>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full font-sans text-base text-charcoal bg-white border border-border rounded-md px-4 py-3 focus:outline-none focus:border-emerald transition-colors appearance-none">
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Read Time">
          <input type="text" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="8 min read"
            className="w-full font-sans text-base text-charcoal bg-white border border-border rounded-md px-4 py-3 focus:outline-none focus:border-emerald transition-colors" />
        </Field>
      </div>

      <Field label="Cover Image">
        <MediaUploader
          value={coverImageUrl}
          onSelect={(url, id) => { setCoverImageUrl(url); setCoverImageId(id); }}
          onRemove={() => { setCoverImageUrl(""); setCoverImageId(""); }}
        />
      </Field>

      <Field label="Content" required>
        <TiptapEditor content={content} onChange={onContentChange} />
      </Field>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button onClick={() => submit(true)} disabled={saving} variant="primary">
          {saving ? "Saving…" : isEdit ? "Update & Publish" : "Publish"}
        </Button>
        <Button onClick={() => submit(false)} disabled={saving} variant="secondary">Save as Draft</Button>
        <Button href="/admin/posts" variant="ghost">Cancel</Button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-sans font-medium text-xs text-charcoal mb-1.5 tracking-wide">
        {label} {required && <span className="text-emerald">*</span>}
      </label>
      {children}
    </div>
  );
}
```

---

## 29. `src/components/admin/PostActions.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostActions({ postId, published }: { postId: number; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true); setError("");
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    if (!res.ok) setError("Failed to update.");
    else router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusy(true); setError("");
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (!res.ok) { setError("Failed to delete."); setBusy(false); return; }
    router.push("/admin/posts");
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="font-sans text-xs text-red-500">{error}</span>}
      <button onClick={toggle} disabled={busy}
        className="font-sans text-sm text-slate hover:text-charcoal disabled:opacity-50 transition-colors">
        {published ? "Unpublish" : "Publish"}
      </button>
      <button onClick={remove} disabled={busy}
        className="font-sans text-sm text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors">
        Delete
      </button>
    </div>
  );
}
```

---

## 30. `src/components/admin/TiptapEditor.tsx`

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import { useState, useEffect } from "react";
import { Bold, Italic, Heading2, Heading3, Quote, List, ListOrdered, Minus, Link2, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Asset = { id: number; url: string; altText: string | null };

export function TiptapEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ allowBase64: false }),
      TiptapLink.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose max-w-none min-h-[400px] px-4 py-3 focus:outline-none font-sans text-charcoal" },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  function handleLink() {
    const url = window.prompt("URL:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }

  async function openPicker() {
    setShowPicker(true);
    const res = await fetch("/api/upload");
    const data = await res.json();
    setAssets(data.assets ?? []);
  }

  function insertImage(url: string) {
    editor?.chain().focus().setImage({ src: url }).run();
    setShowPicker(false);
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-stone-50 border-b border-border">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={14} /></Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2"><Heading2 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3"><Heading3 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote"><Quote size={14} /></Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list"><ListOrdered size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={14} /></Btn>
        <Sep />
        <Btn onClick={handleLink} active={editor.isActive("link")} title="Link"><Link2 size={14} /></Btn>
        <Btn onClick={openPicker} title="Insert image"><ImageIcon size={14} /></Btn>
      </div>

      <EditorContent editor={editor} />

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-cormorant font-medium text-xl text-navy">Select Image</h3>
              <button type="button" onClick={() => setShowPicker(false)} className="text-slate hover:text-charcoal"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-6">
              {assets.length === 0 ? (
                <p className="font-sans text-sm text-slate text-center py-8">No images uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {assets.map((a) => (
                    <button key={a.id} type="button" onClick={() => insertImage(a.url)}
                      className="aspect-square rounded border border-border overflow-hidden hover:border-emerald transition-colors">
                      <img src={a.url} alt={a.altText ?? ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Btn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={cn("p-1.5 rounded transition-colors", active ? "bg-navy text-white" : "text-slate hover:text-charcoal hover:bg-gray-100")}>
      {children}
    </button>
  );
}

function Sep() { return <div className="w-px h-5 bg-gray-200 mx-1" />; }
```

---

## 31. `src/components/admin/MediaUploader.tsx`

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Images } from "lucide-react";
import { cn } from "@/lib/utils";

type Asset = { id: number; url: string; publicId: string; altText: string | null };

type MediaUploaderProps = {
  value: string;
  onSelect: (url: string, publicId: string) => void;
  onRemove: () => void;
};

export function MediaUploader({ value, onSelect, onRemove }: MediaUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true); setProcessing(false); setProgress(0); setUploadError("");

    let signData: { signature: string; timestamp: number; folder: string; cloudName: string; apiKey: string };
    try {
      const res = await fetch("/api/upload/sign");
      if (!res.ok) throw new Error();
      signData = await res.json();
    } catch {
      setUploading(false); setUploadError("Upload failed. Please try again."); return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", signData.apiKey);
    fd.append("timestamp", String(signData.timestamp));
    fd.append("signature", signData.signature);
    fd.append("folder", signData.folder);

    type CloudinaryResponse = { secure_url: string; public_id: string; width: number; height: number };
    let cloudResult: CloudinaryResponse | null = null;

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 90);
          setProgress(pct);
          if (pct >= 90) setProcessing(true);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) { cloudResult = JSON.parse(xhr.responseText); }
        else {
          try { const err = JSON.parse(xhr.responseText); setUploadError(err?.error?.message ?? "Upload failed."); }
          catch { setUploadError("Upload failed. Please try again."); }
        }
        setUploading(false); setProcessing(false); setProgress(0); resolve();
      };
      xhr.onerror = () => { setUploading(false); setProcessing(false); setUploadError("Network error."); resolve(); };
      xhr.ontimeout = () => { setUploading(false); setProcessing(false); setUploadError("Upload timed out."); resolve(); };
      xhr.onabort = () => { setUploading(false); setProcessing(false); resolve(); };
      xhr.timeout = 120_000;
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`);
      xhr.send(fd);
    });

    if (!cloudResult) return;

    try {
      const res = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: (cloudResult as CloudinaryResponse).secure_url,
          publicId: (cloudResult as CloudinaryResponse).public_id,
          width: (cloudResult as CloudinaryResponse).width,
          height: (cloudResult as CloudinaryResponse).height,
        }),
      });
      if (res.ok) { const asset: Asset = await res.json(); onSelect(asset.url, asset.publicId); }
      else setUploadError("Image uploaded but failed to save. Refresh and try again.");
    } catch {
      setUploadError("Image uploaded but failed to save. Refresh and try again.");
    }
  }

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await upload(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSelect]);

  async function openLibrary() {
    setShowLibrary(true); setLoadingLib(true);
    const res = await fetch("/api/upload");
    const data = await res.json();
    setAssets(data.assets ?? []); setLoadingLib(false);
  }

  if (value) {
    return (
      <div className="relative inline-block">
        <img src={value} alt="" className="h-40 w-auto rounded-md border border-border object-cover" />
        <button type="button" onClick={onRemove}
          className="absolute -top-2 -right-2 bg-white border border-border rounded-full p-1 shadow-sm hover:bg-red-50 transition-colors">
          <X size={12} className="text-charcoal" />
        </button>
      </div>
    );
  }

  return (
    <div>
      {uploadError && <p className="font-sans text-xs text-red-600 mb-2">{uploadError}</p>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn("border-2 border-dashed rounded-md p-8 text-center transition-colors",
          dragging ? "border-emerald bg-emerald/5" : "border-gray-200 hover:border-gray-400")}>
        {uploading ? (
          <div className="space-y-3">
            <p className="font-sans text-sm text-slate">{processing ? "Processing…" : "Uploading…"}</p>
            <div className="w-48 mx-auto bg-gray-200 rounded-full h-1.5 overflow-hidden">
              {processing
                ? <div className="bg-emerald h-1.5 rounded-full w-1/3 animate-pulse" />
                : <div className="bg-emerald h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />}
            </div>
            {!processing && <p className="font-sans text-xs text-slate">{progress}%</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={24} className="mx-auto text-slate" strokeWidth={1.5} />
            <p className="font-sans text-sm text-slate">
              Drag & drop, or{" "}
              <button type="button" onClick={() => fileRef.current?.click()} className="text-emerald underline">browse files</button>
            </p>
            <p className="font-sans text-xs text-slate/60">PNG, JPG, WebP · Max 10 MB</p>
          </div>
        )}
      </div>

      <button type="button" onClick={openLibrary}
        className="mt-2 flex items-center gap-1.5 font-sans text-sm text-slate hover:text-charcoal transition-colors">
        <Images size={14} /> Select from library
      </button>

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await upload(f); }} />

      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-cormorant font-medium text-xl text-navy">Media Library</h3>
              <button type="button" onClick={() => setShowLibrary(false)} className="text-slate hover:text-charcoal"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-6">
              {loadingLib ? (
                <p className="font-sans text-sm text-slate text-center py-8">Loading…</p>
              ) : assets.length === 0 ? (
                <p className="font-sans text-sm text-slate text-center py-8">No images yet.</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {assets.map((a) => (
                    <button key={a.id} type="button" onClick={() => { onSelect(a.url, a.publicId); setShowLibrary(false); }}
                      className="aspect-square rounded border border-border overflow-hidden hover:border-emerald transition-colors">
                      <img src={a.url} alt={a.altText ?? ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 32. `src/components/ui/Button.tsx`

```tsx
"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald text-white shadow-sm hover:bg-emerald-light hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200 ease-out",
  secondary:
    "bg-transparent border border-navy text-navy hover:bg-navy hover:text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200 ease-out",
  ghost:
    "bg-transparent text-emerald underline-offset-4 hover:underline transition-all duration-200 ease-out",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-7 py-3.5 text-sm",
  lg: "px-8 py-4 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", href, external, className, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center font-sans font-medium tracking-wide rounded-md cursor-pointer",
      "focus-visible:outline-2 focus-visible:outline-offset-2",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (href) {
      return (
        <a href={href} className={classes} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {children}
        </a>
      );
    }
    return <button ref={ref} className={classes} {...props}>{children}</button>;
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonVariant, ButtonSize };
```

---

## 33. Seed the first admin user

Create `scripts/seed-admin.ts` and run it once:

```ts
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const hash = await bcrypt.hash("YOUR_PASSWORD_HERE", 12);
  await prisma.admin.upsert({
    where: { email: "admin@yoursite.com" },
    update: {},
    create: { email: "admin@yoursite.com", passwordHash: hash },
  });
  console.log("Admin user created");
}

main().finally(() => prisma.$disconnect());
```

```bash
npx tsx scripts/seed-admin.ts
```

---

---

## 34. `src/app/api/enquiries/route.ts`

Admin read-only list endpoint (used if you want to build a custom UI later).

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");
  const q = searchParams.get("q") ?? "";

  type Where = {
    isRead?: boolean;
    isArchived?: boolean;
    OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>;
  };

  const where: Where = {};
  if (filter === "unread") { where.isRead = false; where.isArchived = false; }
  else if (filter === "archived") { where.isArchived = true; }
  else { where.isArchived = false; }

  if (q) where.OR = [{ name: { contains: q } }, { email: { contains: q } }];

  const enquiries = await prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, subject: true, isRead: true, isArchived: true, createdAt: true },
  });

  return NextResponse.json({ enquiries });
}
```

---

## 35. `src/app/api/enquiries/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

const updateSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
}).refine((d) => Object.keys(d).length > 0, { message: "At least one field required" });

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseId(id);
  if (!numId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const enquiry = await prisma.enquiry.findUnique({ where: { id: numId } });
  if (!enquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Auto-mark as read on view
  if (!enquiry.isRead) {
    await prisma.enquiry.update({ where: { id: numId }, data: { isRead: true } });
  }

  return NextResponse.json({ ...enquiry, isRead: true });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseId(id);
  if (!numId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const existing = await prisma.enquiry.findUnique({ where: { id: numId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.enquiry.update({ where: { id: numId }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseId(id);
  if (!numId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await prisma.enquiry.findUnique({ where: { id: numId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.enquiry.delete({ where: { id: numId } });
  return new NextResponse(null, { status: 204 });
}
```

---

## 36. `src/app/api/contact/route.ts`

Public endpoint — wire this up to your website's contact form.

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validations/contact";

// In-memory rate limiter: max 3 submissions per IP per 10 minutes
const store = new Map<string, { count: number; resetAt: number }>();

function allowed(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000;
  const rec = store.get(ip);
  if (!rec || rec.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (rec.count >= 3) return false;
  rec.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!allowed(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  // Honeypot: non-empty website field = bot — succeed silently
  if (parsed.data.website !== "") {
    return NextResponse.json({ success: true });
  }

  const { website: _hp, ...enquiryData } = parsed.data;
  const enquiry = await prisma.enquiry.create({ data: enquiryData });

  return NextResponse.json({ success: true, id: enquiry.id });
}
```

> **Note:** The original contact route also sends an email notification via a Resend provider. If you want emails on new enquiries, add `resend` to your dependencies, create `src/lib/email/` (resend.ts + index.ts), and call `emailProvider.sendEnquiryNotification(enquiryData)` after the DB insert. Otherwise the above is sufficient — all enquiries land in the admin panel.

**Contact form payload your frontend should POST to `/api/contact`:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+44 7700 123456",
  "subject": "Investment enquiry",
  "message": "I would like to learn more...",
  "website": ""
}
```
The `website` field is a honeypot — render it as a hidden input, leave it empty. Bots fill it and get silently ignored.

---

## 37. `src/app/admin/(authenticated)/enquiries/page.tsx`

```tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

type Filter = "all" | "unread" | "archived";

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter = "all", q = "" } = await searchParams;

  type Where = {
    isRead?: boolean;
    isArchived?: boolean;
    OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>;
  };

  const where: Where = {};
  if (filter === "unread") { where.isRead = false; where.isArchived = false; }
  else if (filter === "archived") { where.isArchived = true; }
  else { where.isArchived = false; }

  if (q) where.OR = [{ name: { contains: q } }, { email: { contains: q } }];

  const enquiries = await prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, subject: true, isRead: true, isArchived: true, createdAt: true },
  });

  const tabs: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <div>
      <h1 className="font-cormorant font-medium text-3xl text-navy mb-6">Enquiries</h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/enquiries?filter=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-md font-sans text-sm transition-colors ${
                filter === tab.value ? "bg-navy text-white" : "text-slate hover:text-charcoal hover:bg-stone-100"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form method="GET" action="/admin/enquiries">
          <input type="hidden" name="filter" value={filter} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or email…"
            className="font-sans text-sm text-charcoal bg-white border border-border rounded-md px-3 py-2 w-full sm:w-56 focus:outline-none focus:border-emerald transition-colors"
          />
        </form>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-stone-50">
                {["", "Name", "Subject", "Date", ""].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-sans font-medium text-xs text-slate tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enquiries.map((e) => (
                <tr key={e.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3 w-6">
                    {!e.isRead && <span className="w-2 h-2 rounded-full bg-emerald inline-block" title="Unread" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-sans text-sm ${!e.isRead ? "font-medium text-charcoal" : "text-charcoal"}`}>
                      {e.name}
                    </span>
                    <span className="block font-sans text-xs text-slate">{e.email}</span>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-slate">{e.subject}</td>
                  <td className="px-4 py-3 font-sans text-sm text-slate">{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/enquiries/${e.id}`} className="font-sans text-sm text-emerald hover:underline">View</Link>
                  </td>
                </tr>
              ))}
              {enquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center font-sans text-sm text-slate">
                    No enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## 38. `src/app/admin/(authenticated)/enquiries/[id]/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Enquiry = {
  id: number; name: string; email: string; phone: string | null;
  subject: string; message: string; isRead: boolean; isArchived: boolean; createdAt: string;
};

export default function EnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/enquiries/${id}`, { signal: controller.signal })
      .then((r) => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then((data) => { if (data) setEnquiry(data); })
      .catch((err) => { if (err.name !== "AbortError") setNotFound(true); });
    return () => controller.abort();
  }, [id]);

  async function patch(data: Partial<Pick<Enquiry, "isRead" | "isArchived">>) {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setEnquiry(await res.json());
  }

  async function remove() {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/enquiries");
  }

  if (notFound) return <p className="font-sans text-sm text-slate p-8">Enquiry not found.</p>;
  if (!enquiry) return <p className="font-sans text-sm text-slate p-8">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 font-sans text-sm text-slate hover:text-charcoal mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Enquiries
      </Link>

      <div className="bg-white rounded-lg border border-border p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-cormorant font-medium text-2xl text-navy">{enquiry.subject}</h1>
            <p className="font-sans text-sm text-slate mt-1">
              {enquiry.name} · <a href={`mailto:${enquiry.email}`} className="text-emerald">{enquiry.email}</a>
              {enquiry.phone && ` · ${enquiry.phone}`}
            </p>
          </div>
          <span className={`flex-shrink-0 text-xs font-sans px-2 py-1 rounded-full ${enquiry.isRead ? "bg-slate/10 text-slate" : "bg-emerald/10 text-emerald"}`}>
            {enquiry.isRead ? "Read" : "Unread"}
          </span>
        </div>

        <hr className="border-border" />

        <p className="font-sans text-base text-charcoal whitespace-pre-wrap leading-relaxed">
          {enquiry.message}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
          <button onClick={() => patch({ isRead: !enquiry.isRead })}
            className="font-sans text-sm text-slate hover:text-charcoal transition-colors">
            {enquiry.isRead ? "Mark as Unread" : "Mark as Read"}
          </button>
          <button onClick={() => patch({ isArchived: !enquiry.isArchived })}
            className="font-sans text-sm text-slate hover:text-charcoal transition-colors">
            {enquiry.isArchived ? "Unarchive" : "Archive"}
          </button>
          <button onClick={remove} className="font-sans text-sm text-red-500 hover:text-red-700 transition-colors ml-auto">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## What to change (search `TODO`)

| File | What to change |
|---|---|
| `login/page.tsx` | Site name in the `<h1>` |
| `AdminSidebar.tsx` | Site name in the sidebar header |
| `PostForm.tsx` | `CATEGORIES` array — slugs and display names |
| `upload/sign/route.ts` | `folder` value — change `YOUR_SITE_NAME` |
| `posts/page.tsx` | `/blog/{slug}` path — match your public blog URL |
| `PostForm.tsx` | `/blog/{slug}` slug preview — same |
| `contact/route.ts` | Rate limit (currently 3 per 10 min per IP) — adjust if needed |
| `validations/contact.ts` | `subject` — if you want a predefined list, add `z.enum([...])` |
| Tailwind config | `emerald`, `navy`, `charcoal`, `slate`, `border` color tokens |
| `formatDate` locale | Change `"en-IN"` in `utils.ts` if needed |
