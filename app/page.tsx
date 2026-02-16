import Link from "next/link";
import Container from "../components/ui/Container";
import CategoryCard from "../components/ui/CategoryCard";
import CrisisBanner from "../components/ui/CrisisBanner";

export default function Home() {
  return (
    <div>

      <CrisisBanner />

{/* ---------------- Hero Section ---------------- */}
<section className="relative w-full h-[38vh] min-h-[300px] md:h-[45vh] md:min-h-[380px] overflow-hidden">


  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/hero.jpg')",
    }}
  />

  {/* Softer Overlay */}
  <div className="absolute inset-0 bg-black/40" />

  {/* Content */}
  <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
    <div className="max-w-3xl relative">

      {/* Subtle text contrast helper */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/20 to-black/40 blur-2xl" />

      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-white drop-shadow-lg">
        War Party Resources
      </h1>

      <p className="text-base md:text-lg text-zinc-200 mb-2 drop-shadow-md">
        Community-driven access to essential services.
      </p>

      <p className="text-zinc-300 text-sm md:text-base drop-shadow-md">
        Built to help people navigate support systems with clarity,
        dignity, and direct access.
      </p>

    </div>
  </div>

</section>




{/* ---------------- Purpose Section ---------------- */}
<section className="bg-zinc-950 py-10 md:py-14 border-b border-zinc-900">
  <Container>
    <div className="max-w-2xl mx-auto text-center">


      <h2 className="text-2xl md:text-3xl font-semibold mb-3">
        Built for Community
      </h2>

      <p className="text-zinc-400 leading-relaxed mb-4">
        Navigating support systems shouldn’t feel overwhelming. Services are
        often scattered, difficult to understand, or hard to access. War Party
        Resources exists to bring clarity and connection into one place.
      </p>

      <p className="text-zinc-400 leading-relaxed">
        While open to the public, this directory is intentionally centered on
        Native individuals and families — honoring community knowledge,
        strengthening access to culturally responsive services, and supporting
        well-being with dignity and respect.
      </p>

    </div>
  </Container>
</section>



      {/* ---------------- Main Content ---------------- */}
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


        {/* Browse Options */}
        <section className="mt-12 md:mt-16 mb-6 md:mb-10">



          <h2 className="text-2xl font-semibold mb-6">
            Browse Resources
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 md:p-6">
              <h3 className="font-semibold mb-2">By Category</h3>
              <p className="text-sm text-zinc-400">
                Explore services grouped by major areas of need.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">By Service Type</h3>
              <p className="text-sm text-zinc-400">
                Search for specific types of support like counseling,
                residential treatment, or financial aid.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">By Population</h3>
              <p className="text-sm text-zinc-400">
                Find services tailored to youth, veterans, families,
                tribal members, and more.
              </p>
            </div>

          </div>
        </section>


      </Container>

{/* Community Section */}
<section className="bg-zinc-900 border-t border-zinc-800 py-2 md:py-10 text-center">


  <Container>
    <div className="max-w-2xl mx-auto">

      <h2 className="text-2xl md:text-3xl font-semibold mb-3">
        Built by the Community
      </h2>

      <p className="text-zinc-400 text-sm md:text-base mb-5">
        This directory grows through shared knowledge.
        If you know of a resource that should be listed,
        submit it for review and help expand access for others.
      </p>

      <Link
        href="/suggest-resource"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition shadow-md"
      >
        Suggest a Resource
      </Link>

    </div>
  </Container>

</section>




    </div>
  );
}
