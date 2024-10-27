import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-row w-screen min-h-screen">
            {children}
        </div>
      </body>
    </html>
  );
}
