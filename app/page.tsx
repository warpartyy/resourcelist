"use client";

import Link from "next/link";
import Container from "../components/ui/Container";
import CategoryCard from "../components/ui/CategoryCard";
import CrisisBanner from "../components/ui/CrisisBanner";
import { useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";


export default function Home() {

const testLogin = async () => {
  const supabase = getSupabase();

  await supabase.auth.signInWithOtp({
    email: "vvillamodel@gmail.com",
  });
};

  const router = useRouter();

  useEffect(() => {
    const handleInvite = async () => {
      const supabase = getSupabase();

      const hash = window.location.hash;

      console.log("HASH:", hash);

      if (hash && hash.includes("access_token")) {
        // 🔥 Parse tokens from URL
        const params = new URLSearchParams(hash.replace("#", ""));

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (!access_token || !refresh_token) {
          console.error("Missing tokens");
          return;
        }

        // 🔥 THIS is the fix
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error("Session error:", error);
          return;
        }

        // Clean URL
        window.history.replaceState({}, document.title, "/");

        // Redirect
        router.replace("/admin");
      }
    };

    handleInvite();
  }, [router]);

  return (
    <div>
      <CrisisBanner />
      <Container>

        {/* Category Grid */}
        <section className="mt-5 md:mt-8 mb-16 md:mb-20">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">
            Categories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <CategoryCard
              href="/health-wellness"
              title="Health & Wellness"
              subcategories={[
                { label: "Mental Health Services", href: "/mental-health-services" },
                { label: "Substance Use & Recovery", href: "/substance-use-recovery" },
                { label: "General Healthcare Services", href: "/general-healthcare-services" },
                { label: "Support Groups", href: "/support-groups" },
              ]}
              />
                
            <CategoryCard
              href="/essential-support"
              title="Essential Support"
              subcategories={[
                { label: "Housing Support", href: "/housing-support" },
                { label: "Food Assistance", href: "/food-assistance" },
                { label: "Transportation Services", href: "/transportation-services" },
                { label: "Utility & Rental Assistance", href: "/utility-rental-assistance" },
              ]}
              />

            <CategoryCard
              href="/work-money-legal"
              title="Work, Money & Legal"
              subcategories={[
                { label: "Employment & Job Support", href: "/employment-job-support" },
                { label: "Financial & Benefits Assistance", href: "/financial-benefits-assistance" },
                { label: "Legal Assistance", href: "/legal-assistance" },
              ]}
              />

<CategoryCard
  href="/safety-crisis"
  title="Safety & Crisis"
  subcategories={[
    { label: "Domestic Violence & Safety", href: "/domestic-violence-safety" },
    { label: "Crisis Services", href: "/crisis-services" },
    { label: "Emergency Shelter", href: "/emergency-shelter" },
  ]}
/>

<CategoryCard
  href="/family-community-support"
  title="Family & Community Support"
  subcategories={[
    { label: "Youth Programs", href: "/youth-programs" },
    { label: "Parenting & Family Support", href: "/parenting-family-support" },
    { label: "Peer Support Services", href: "/peer-support-services" },
    { label: "Community & Cultural Programs", href: "/community-cultural-programs" },
  ]}
/>
  </div>
</section>

      </Container>

{/* Community Section */}
<section className="bg-surface py-10 md:py-14 border-b border-subtle text-center">


<Container>
    <div className="max-w-2xl mx-auto">

      <h2 className="text-2xl md:text-3xl font-semibold mb-3">
        Help Expand This Directory
      </h2>

      <p className="text-muted text-sm md:text-base mb-5">
        This directory grows through shared knowledge.
        If you know of a service that should be included, 
        submit it for review and help expand access for others.
      </p>

      <Link
        href="/suggest-resource"
        className="button button-primary"
      >
        Suggest a Resource
      </Link>

    </div>
  </Container>

</section>
    </div>
  );
}
