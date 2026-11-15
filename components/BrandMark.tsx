import Image from "next/image";
import logoImg from "@/public/logo.png";

export default function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src={logoImg}
      alt=""
      width={size}
      height={size}
      className="brand-logo"
      referrerPolicy="no-referrer"
      priority
      aria-hidden="true"
    />
  );
}
