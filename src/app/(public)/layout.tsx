import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SiteProgressModal } from "@/components/site-progress-modal";
import { TechNoticeBanner } from "@/components/tech-notice-banner";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getPublicShellData } from "@/lib/public-site-data";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { brand, footer, navigation } = await getPublicShellData();

  return (
    <>
      <SmoothScroll />
      <a
        href="#main-content"
        className="sr-only z-[100] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-sm focus:border focus:border-laser-cyan focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-laser-cyan focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar brand={brand} navigation={navigation} />
      <SiteProgressModal />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer brand={brand} footer={footer} navigation={navigation} />
      <TechNoticeBanner />
    </>
  );
}
