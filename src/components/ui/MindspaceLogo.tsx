import type { SVGProps } from "react";

interface MindspaceLogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Official Mindspace Brand Vector Logo.
 * Extracted from assets/mindspace-logo.svg.
 * Fully supports Tailwind text color inheritance (fill="currentColor"), sizing, and dark mode.
 */
export function MindspaceLogo({
  className = "size-8",
  size,
  ...props
}: MindspaceLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2160 2160"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M1889.99,1579.72c-101.01,6.82-157.15-183.89-157.15-183.89-163.74-418.741-462.55-489.4-462.55-489.4C1030.34,815.759,825.519,918.3,825.519,918.3c7.825-21.526,77.093-74.152,77.093-74.152C1213.45,691.364,1546.04,944.989,1546.04,944.989c296.98,211.521,385.47,501.261,385.47,501.261C1985.47,1592.57,1889.99,1579.72,1889.99,1579.72ZM1305.87,725.5c-277.9-143.8-501.106,169.064-501.106,169.064s-73.451,100.6-133.43,222.454c-54.219,110.15-118.6,246.18-118.6,246.18-103.081,217.82-225.348,186.86-225.348,186.86-174.893-28.28-100.814-228.38-100.814-228.38s18.661-78.27,145.29-222.46C536.669,911.564,617.962,909.4,617.962,909.4L546.8,1036.94c-74.869,51.9-177.907,174.99-177.907,174.99-133.986,194.84-38.546,204.66-38.546,204.66,69.124,7.23,148.848-148.52,189.767-252.11,75.054-190.014,234.244-394.488,234.244-394.488C1017.7,485.069,1246.57,606.86,1246.57,606.86,1479.51,687.5,1626.1,977.615,1626.1,977.615,1354.98,721.611,1305.87,725.5,1305.87,725.5Z"
      />
    </svg>
  );
}
