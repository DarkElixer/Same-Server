import { useEffect, useRef } from "react";
import styled from "styled-components";

const StyledImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: ${(prop) => (prop.$variant === "small" ? "none" : "cover")};
  mask-image: linear-gradient(black, transparent 90%);
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
  border-radius: inherit;
  z-index: 0;
`;
function Image({ variant, src, altText }) {
  const imageRef = useRef(null);
  useEffect(() => {
    const imageEle = imageRef.current;
    function addImg(e) {
      e.target.src =
        "https://cdn.pixabay.com/photo/2020/11/23/06/21/television-5768804_640.png";
      e.target.style.objectFit = "cover";
    }
    imageEle.addEventListener("error", addImg);
    imageEle.src = src;
    return () => imageEle.removeEventListener("error", addImg);
  }, [src]);
  return (
    <StyledImage
      $variant={variant}
      ref={imageRef}
      alt={altText}
      loading="lazy"
    />
  );
}

export default Image;
