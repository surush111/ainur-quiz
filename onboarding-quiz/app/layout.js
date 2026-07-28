import "./globals.css";

export const metadata = {
  title: "Персональная анкета — онлайн-заработок",
  description:
    "Короткая анкета, чтобы подобрать для вас подходящий формат обучения онлайн-заработку.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
