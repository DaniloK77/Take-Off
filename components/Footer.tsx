import { siteConfig } from "@/lib/config";

const Footer = () => (
  <footer>
    <div className="footer-inner">
      <p>
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
      <p>
        Flight data from Google Flights via{" "}
        <a
          href="https://serpapi.com/google-flights-api"
          target="_blank"
          rel="noopener noreferrer"
        >
          SerpApi
        </a>
      </p>
    </div>
  </footer>
);

export default Footer;
