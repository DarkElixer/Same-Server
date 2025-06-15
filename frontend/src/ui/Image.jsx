import { useEffect, useRef } from "react";
import styled from "styled-components";

const StyledImage = styled.img`
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: ${(prop) => (prop.$variant === "small" ? "none" : "fill")};
  mask-image: linear-gradient(black, transparent 90%);
  background: rgba(255, 255, 255, 0.1);
  border-radius: inherit;
  z-index: 100;
`;
function Image({ variant, src, altText }) {
  const imageRef = useRef(null);
  useEffect(() => {
    const imageEle = imageRef.current;
    function addImg(e) {
      e.target.src =
        "https://cdn.pixabay.com/photo/2020/11/23/06/21/television-5768804_640.png";
      e.target.style.objectFit = "fill";
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
