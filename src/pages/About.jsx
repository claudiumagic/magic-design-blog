import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>Despre autor – Claudiu</title>
        <meta
          name="description"
          content="Claudiu – designer UI/UX și developer frontend. Articole despre design, experiența utilizatorului și dezvoltare web."
        />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": `${window.location.origin}/despre#author`,
            name: "Claudiu",
            url: `${window.location.origin}/despre`,
            jobTitle: "UI/UX Designer & Frontend Developer",
            description:
              "Designer UI/UX și frontend developer, autor al articolelor publicate pe blogul personal.",
            knowsAbout: [
              "UI Design",
              "UX Design",
              "Frontend Development",
              "React",
              "Web Design"
            ]
          })}
        </script>
      </Helmet>

      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Despre autor</h1>
        <p>
          Sunt Claudiu, designer UI/UX și frontend developer.
          Pe acest blog public articole despre design, UX și dezvoltare web.
        </p>
      </div>
    </>
  );
}
