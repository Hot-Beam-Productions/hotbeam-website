import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TechNoticeBanner } from "@/components/tech-notice-banner";
import { getPublicShellData } from "@/lib/public-site-data";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { brand, footer, navigation } = await getPublicShellData();

  return (
    <>
      <Navbar brand={brand} navigation={navigation} />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer brand={brand} footer={footer} navigation={navigation} />
      <TechNoticeBanner />
    </>
  );
}
