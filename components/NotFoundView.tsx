import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

const NotFoundView = ({ title, description }: Props) => (
  <section id="not-found">
    <p className="code" aria-hidden>
      404
    </p>
    <h1>{title}</h1>
    <p className="description">{description}</p>
    <div className="actions">
      <Link href="/" className="button-primary">
        <ArrowLeft aria-hidden className="size-4" />
        Back to home
      </Link>
      <Link href="/flights" className="button-secondary">
        <Search aria-hidden className="size-4" />
        Search flights
      </Link>
    </div>
  </section>
);

export default NotFoundView;
