import { HeroSection } from "./home/heroSection";
import { ServiceSection } from "./home/serviceSection";
import { TestimonialsSection } from "./home/testimonalSection";
import HomeLayout from "./homeLayout";
import { StatsSection } from "./home/statsSection";
import { FaqSection } from "./home/faqSection";
import { CtaSection } from "./home/ctaSection";
import GoogleAd from "./googleads";

export default function Home() {
  return (
    <HomeLayout>
      <HeroSection />
      <ServiceSection />
      <StatsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <GoogleAd slot="5872708392333567" />
    </HomeLayout>
  );
}
