import Link from "next/link";
import Container from "../components/ui/Container";
import CategoryCard from "../components/ui/CategoryCard";
import CrisisBanner from "../components/ui/CrisisBanner";

export default function Home() {
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


        {/* Browse Options */}
        <section className="mt-12 md:mt-16 mb-6 md:mb-10">



          <h2 className="text-2xl font-semibold mb-6">
            Browse Resources
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="card p-6">
              <h3 className="font-semibold mb-2">By Category</h3>
              <p className="text-sm text-text-muted">
                Explore services grouped by major areas of need.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-2">By Service Type</h3>
              <p className="text-sm text-text-muted">
                Search for specific types of support like counseling,
                residential treatment, or financial aid.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-2">By Population</h3>
              <p className="text-sm text-text-muted">
                Find services tailored to youth, veterans, families,
                tribal members, and more.
              </p>
            </div>

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
