import Image from "next/image";
import logoImg from "@/public/logo.png";

export default function BrandMark({
  size = 32,
  alt = "Subscription X-Ray logo",
}: {
  size?: number;
  alt?: string;
}) {
  return (
    <Image
      src={logoImg}
      alt={alt}
      width={size}
      height={size}
      className="brand-logo"
      referrerPolicy="no-referrer"
      priority
    />
  );
}
