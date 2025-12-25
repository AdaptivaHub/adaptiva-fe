/**
 * BrandLogo Component - Displays the Adaptiva logo with customizable colors
 * 
 * Uses CSS variables to control both colors:
 * - --logo-primary: The main brand color (default: currentColor)
 * - --logo-secondary: The background/accent color (default: transparent)
 * 
 * Or use the convenience props: primaryColor, secondaryColor
 */

import { type SVGProps } from 'react';
import { cn } from './ui/utils';

interface BrandLogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
  /** Primary color (the brand shape). Defaults to currentColor. */
  primaryColor?: string;
  /** Secondary color (the background). Defaults to transparent for icon use. */
  secondaryColor?: string;
}

/**
 * BrandLogo component that displays the Adaptiva logo.
 * 
 * The logo has two parts:
 * - Background frame (teal) - controlled by primaryColor / --logo-primary
 * - Wave overlay (white) - controlled by secondaryColor / --logo-secondary
 * 
 * Usage examples:
 * ```tsx
 * // Single color (icon style) - frame inherits text color, wave is transparent
 * <BrandLogo className="w-5 h-5 text-brand-600" />
 * 
 * // Two colors matching original logo
 * <BrandLogo className="w-8 h-8" primaryColor="#557d8c" secondaryColor="#ebeceb" />
 * 
 * // Two colors with Tailwind CSS variables
 * <BrandLogo className="w-8 h-8 [--logo-primary:theme(colors.brand.600)] [--logo-secondary:white]" />
 * ```
 */
export function BrandLogo({ 
  className, 
  primaryColor,
  secondaryColor,
  style,
  ...props 
}: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 400 402.23"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      style={{
        '--logo-primary': primaryColor ?? 'currentColor',
        '--logo-secondary': secondaryColor ?? 'transparent',
        ...style,
      } as React.CSSProperties}
      aria-label="Adaptiva Logo"
      {...props}    >      {/* Background frame - teal (uses primary color) */}
      <path
        d="M0.095 48.580 C 0.180 87.795,0.300 97.260,0.720 97.680 C 1.143 98.103,20.961 98.239,106.920 98.408 L 212.600 98.615 217.200 99.530 C 285.721 113.155,311.252 196.752,261.762 245.443 C 255.423 251.679,251.119 254.748,237.225 262.939 C 226.765 269.105,232.255 270.979,254.358 268.787 C 331.462 261.139,383.882 233.014,398.412 191.498 C 399.017 189.769,399.622 188.244,399.756 188.110 C 399.890 187.976,400.000 145.597,400.000 93.933 L 400.000 0.000 199.995 -0.000 L -0.009 -0.000 0.095 48.580 M154.000 132.816 C 89.846 138.686,43.617 156.782,19.667 185.400 C 11.482 195.181,4.305 209.210,1.865 220.200 C -0.167 229.348,-0.051 223.157,0.079 315.800 L 0.200 401.800 200.100 401.900 L 400.000 402.001 400.000 353.000 L 400.000 304.000 301.100 303.996 C 240.687 303.994,199.672 303.839,195.705 303.598 C 131.439 299.689,94.288 227.657,128.235 172.778 C 136.416 159.553,147.284 149.634,163.539 140.558 C 168.702 137.675,171.600 135.525,171.600 134.579 C 171.600 132.750,163.543 131.943,154.000 132.816"
        fill="var(--logo-primary)"
      />
      {/* Wave - white/light (uses secondary color, transparent by default for icon mode) */}
      <path
        d="M0.064 162.400 C 0.077 221.516,0.141 228.300,0.663 225.800 C 2.916 215.016,4.202 211.202,8.485 202.600 C 22.625 174.203,51.439 154.611,97.000 142.416 C 122.949 135.470,164.486 130.330,170.300 133.346 C 172.794 134.640,171.319 136.213,163.539 140.558 C 147.284 149.634,136.416 159.553,128.235 172.778 C 94.288 227.657,131.439 299.689,195.705 303.598 C 199.672 303.839,240.687 303.994,301.100 303.996 L 400.000 304.000 400.000 245.933 C 400.000 213.997,399.890 187.976,399.756 188.110 C 399.622 188.244,399.017 189.769,398.412 191.498 C 383.882 233.014,331.462 261.139,254.358 268.787 C 232.255 270.979,226.765 269.105,237.225 262.939 C 251.119 254.748,255.423 251.679,261.762 245.443 C 311.252 196.752,285.721 113.155,217.200 99.530 L 212.600 98.615 106.800 98.397 C 48.610 98.278,0.949 98.139,0.887 98.090 C 0.825 98.040,0.611 97.595,0.412 97.100 C 0.195 96.558,0.056 122.550,0.064 162.400"
        fill="var(--logo-secondary)"
      />
    </svg>
  );
}
