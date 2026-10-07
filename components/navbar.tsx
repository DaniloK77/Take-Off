import Link from "next/link";
import { Plane } from "lucide-react";
import NavLinks from "@/components/NavLinks";
import { siteConfig } from "@/lib/config";

const Navbar = () => {
  return (
    <header>
      <nav aria-label="Main">
        <Link href="/" className="logo" aria-label={`${siteConfig.name} home`}>
          <span className="logo-mark">
            <Plane aria-hidden className="size-4" />
          </span>
          <p>{siteConfig.name}</p>
        </Link>
        <NavLinks />
      </nav>
    </header>
  );
};

export default Navbar;
