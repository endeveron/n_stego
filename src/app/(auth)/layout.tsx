export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="size-full bg-area trans-c">{children}</div>;
}
