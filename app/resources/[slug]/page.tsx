import resourcesData from "../../../data/resources.json";
import Container from "../../../components/ui/Container";

type Resource = {
  id: string;
  slug: string;
  organization: string;
  categories: string[];
  countiesServed: string[];
  phone: string;
  website: string;
  applicationLink: string;
  address: string;
  description: string;
  services: string[];
  eligibility: string;
  lastVerified: string;
};

const resources = resourcesData as Resource[];

export default function ResourcePage({
  params,
}: {
  params: { slug: string };
}) {
  const resource = resources.find(
    (r) => r.slug === params.slug
  );

  if (!resource) {
    return (
      <Container>
        <h1 className="text-2xl font-bold">Resource not found.</h1>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="text-4xl font-bold mb-4">
        {resource.organization}
      </h1>

      <p className="text-zinc-400 mb-6">
        {resource.description}
      </p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Services Provided
        </h2>
        <ul className="list-disc list-inside text-zinc-300">
          {resource.services.map((service, index) => (
            <li key={index}>{service}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Eligibility
        </h2>
        <p className="text-zinc-300">{resource.eligibility}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Contact Information
        </h2>
        <p>📞 {resource.phone}</p>
        <p>📍 {resource.address}</p>
        <a
          href={resource.website}
          target="_blank"
          className="text-blue-400 underline"
        >
          Visit Website
        </a>
        <br />
        <a
          href={resource.applicationLink}
          target="_blank"
          className="text-blue-400 underline"
        >
          Apply Here
        </a>
      </div>

      <p className="text-sm text-zinc-500">
        Last Verified: {resource.lastVerified}
      </p>
    </Container>
  );
}
