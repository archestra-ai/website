'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

import { getMcpServerImageAlt, getMcpServerImageUrl, getMcpServerImageFallbacks } from '@mcpCatalog/lib/images';
import { ArchestraMcpServerManifest } from '@mcpCatalog/types';

interface McpServerImageProps {
    server: ArchestraMcpServerManifest;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
}

export default function McpServerImage({
    server,
    width = 64,
    height = 64,
    className = '',
    priority = false,
}: McpServerImageProps) {
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    // const [imageLoading, setImageLoading] = useState(true); // Commented out for now
    const [fallbackIndex, setFallbackIndex] = useState(-1);

    const primaryImageUrl = getMcpServerImageUrl(server);
    const fallbackUrls = getMcpServerImageFallbacks(server);
    const allUrls = [primaryImageUrl, ...fallbackUrls];
    const altText = getMcpServerImageAlt(server);

    // Initialize with the primary image URL
    useEffect(() => {
        setCurrentImageUrl(primaryImageUrl);
        setFallbackIndex(0);
    }, [primaryImageUrl]);

    const handleImageLoad = () => {
        // setImageLoading(false); // Commented out for now
    };

    const handleImageError = () => {
        const nextIndex = fallbackIndex + 1;
        if (nextIndex < allUrls.length) {
            // Try the next fallback URL
            setCurrentImageUrl(allUrls[nextIndex]);
            setFallbackIndex(nextIndex);
        } else {
            // All URLs failed, show fallback icon
            setImageError(true);
            // setImageLoading(false); // Commented out for now
        }
    };

    // Commented out loading state for now to avoid stuck loading
    // if (imageLoading) {
    //     return (
    //         <div
    //             className={`bg-gray-200 animate-pulse rounded-lg flex items-center justify-center ${className}`}
    //             style={{ width, height }}
    //         >
    //             <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
    //         </div>
    //     );
    // }

    // Show fallback icon if image failed to load
    if (imageError) {
        return (
            <div
                className={`bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 ${className}`}
                style={{ width, height }}
                title={altText}
            >
                <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            </div>
        );
    }

    // Don't render anything if we don't have a current URL
    if (!currentImageUrl) {
        return (
            <div
                className={`bg-gray-200 animate-pulse rounded-lg flex items-center justify-center ${className}`}
                style={{ width, height }}
            >
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <Image
            src={currentImageUrl}
            alt={altText}
            width={width}
            height={height}
            className={`rounded-lg object-cover ${className}`}
            priority={priority}
            onLoad={handleImageLoad}
            onError={handleImageError}
        />
    );
}
