import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState, useCallback } from "react";
import { Box } from "@chakra-ui/react";
import Image from "next/image";

const Carrusel = ({ slides }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);

    // Cleanup listener on component unmount
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || !autoScroll) return;
    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000); // Cambia la imagen cada 3 segundos

    return () => clearInterval(intervalId);
  }, [emblaApi, autoScroll]);

  return (
    <Box position="relative">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
            <div className="embla__slide" key={index}>
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botones hexagonales */}
      <button
        className="carrusel-button carrusel-button--prev"
        onClick={() => emblaApi.scrollPrev()}
      >
        &#9664; {/* Flecha izquierda */}
      </button>
      <button
        className="carrusel-button carrusel-button--next"
        onClick={() => emblaApi.scrollNext()}
      >
        &#9654; {/* Flecha derecha */}
      </button>
    </Box>
  );
};

export default Carrusel;