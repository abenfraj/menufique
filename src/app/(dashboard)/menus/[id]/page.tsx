import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MenuEditor } from "@/components/editor/menu-editor";

interface MenuEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuEditPage({ params }: MenuEditPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  return <MenuEditor menuId={id} userPlan={session.user.plan ?? "FREE"} />;
}
