import * as React from "react";

export const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M20 12H4M4 12L10 6M4 12L10 18"
                stroke="url(#paint0_linear)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient
                    id="paint0_linear"
                    x1="12"
                    y1="6"
                    x2="12"
                    y2="18"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#fff" />
                    <stop offset="1" stopColor="#fff" />
                </linearGradient>
            </defs>
        </svg>
    );
};