import Image from "next/image";

export default function EditorialLogo({
  href = "https://www.ugto.mx/editorial/",
  newTab = true,
  linkTitle = "Editorial UG",
  srText = "Editorial de la Universidad de Guanajuato",
  className = "",
  imageClassName = "h-12 sm:h-14 md:h-16 w-auto",
  priority = false,
  alt = "Logo Editorial de la Universidad de Guanajuato",
}) {
  const linkProps = newTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      title={linkTitle}
      className="inline-flex items-center"
      {...linkProps}
    >
      <span className="sr-only">{srText}</span>
      <div className={`logo-pill ${className}`}>
        <Image
          src="/images/editorial-ug.png"
          alt={alt}
          width={220}
          height={70}
          className={imageClassName}
          priority={priority}
        />
      </div>
    </a>
  );
}
