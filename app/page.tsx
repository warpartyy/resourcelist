import Link from "next/link";
import Container from "../components/ui/Container";
import CategoryCard from "../components/ui/CategoryCard";
import CrisisBanner from "../components/ui/CrisisBanner";

export default function Home() {
  return (
    <Container>

      <CrisisBanner />

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">
          Find the Help You Need
        </h1>

        <p className="text-zinc-400 max-w-2xl">
          This resource navigator connects Oklahoma residents to verified
          services including food assistance, housing support, healthcare,
          transportation, legal services, and behavioral health resources.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        <CategoryCard
          href="/food"
          title="Food Assistance"
          description="Food banks, meal programs, and nutrition services."
        />

        <CategoryCard
          href="/housing"
          title="Housing Support"
          description="Emergency shelter, rental assistance, and transitional housing."
        />

        <CategoryCard
          href="/substance-use"
          title="Substance Use Treatment"
          description="Detox, MAT, outpatient and inpatient services."
        />

        <CategoryCard
          href="/mental-health"
          title="Mental Health Services"
          description="Counseling, therapy, and crisis support."
        />

        <CategoryCard
          href="/transportation"
          title="Transportation"
          description="Non-emergency medical transportation and transit services."
        />

        <CategoryCard
          href="/employment"
          title="Employment & Job Support"
          description="Workforce training, resume support, and job placement services."
        />

        <CategoryCard
          href="/healthcare"
          title="Healthcare Services"
          description="Primary care, community clinics, and preventive services."
        />

        <CategoryCard
          href="/financial-assistance"
          title="Financial Assistance"
          description="Utility assistance, rental support, and emergency financial aid."
        />

        <CategoryCard
          href="/legal"
          title="Legal Assistance"
          description="Expungement, re-entry legal services, and advocacy."
        />

        <CategoryCard
          href="/domestic-violence"
          title="Domestic Violence & Safety"
          description="Emergency shelter, advocacy, and survivor support services."
        />
<Link href="/suggest-resource">
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-800 transition">
    <h2 className="text-xl font-semibold mb-2">
      Suggest a Resource
    </h2>
    <p className="text-zinc-400">
      Help us expand this directory by submitting a resource for review.
    </p>
  </div>
</Link>

      </div>
    </Container>
  );
}
