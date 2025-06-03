"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import Breadcrumbs, { type BreadcrumbItemType } from "../breadcrumbs";
import { Heading } from "./heading";
import { LoadingSpinner } from "./loading";

interface PageWrapperProps {
	children: ReactNode;
	className?: string;
	title?: string;
	description?: string;
	actions?: ReactNode;
	isLoading?: boolean;
	breadcrumbs?: BreadcrumbItemType[];
}

export function PageWrapper({
	children,
	className,
	title,
	isLoading,
	description,
	actions,
	breadcrumbs,
}: Readonly<PageWrapperProps>) {
	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className={cn(
				"min-h-[calc(100vh-12rem)] rounded-4xl p-8 mb-4 shadow-sm bg-white",
				className,
			)}
		>
			{/* Breadcrumbs */}
			{breadcrumbs && (
				<div className={cn("mb-4")}>
					<Breadcrumbs breadcrumbs={breadcrumbs} />
				</div>
			)}
			{isLoading && <LoadingSpinner />}
			{/* Page Header */}
			{(title || description || actions) && (
				<div className={cn("mb-6 sm:mb-8")} >
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							{title && <Heading>{title}</Heading>}
							{description && (
								<p className="text-muted-foreground">{description}</p>
							)}
						</div>
						{actions && (
							<div className="flex items-center gap-2">{actions}</div>
						)}
					</div>
				</div>
			)}
			<main>
				{children}
			</main>
		</motion.div>
	);
}

// Sub-components for common page sections
export function PageSection({
	children,
	className,
	title,
	description,
	actions,
}: {
	children: ReactNode;
	className?: string;
	title?: string;
	description?: string;
	actions?: ReactNode;
}) {
	return (
		<section className={cn("space-y-4", className)}>
			{(title || description || actions) && (
				<div className="flex items-center justify-between">
					<div>
						{title && <h2 className="text-lg font-medium">{title}</h2>}
						{description && (
							<p className="text-sm text-muted-foreground">{description}</p>
						)}
					</div>
					{actions && <div>{actions}</div>}
				</div>
			)}
			{children}
		</section>
	);
}

// Card wrapper for content sections
export function PageCard({
	title,
	subtitle,
	href,
	children,
	className,
	noPadding = false,
}: {
	title?: string;
	subtitle?: string;
	href?: string;
	children: ReactNode;
	className?: string;
	noPadding?: boolean;
}) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [rotateX, setRotateX] = useState(0);
	const [rotateY, setRotateY] = useState(0);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;

		const card = cardRef.current;
		const rect = card.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		// Calculate rotation based on mouse position relative to card center
		const mouseX = e.clientX - centerX;
		const mouseY = e.clientY - centerY;

		// Limit rotation to ±15 degrees
		const maxRotation = 15;
		const rotateYValue = (mouseX / (rect.width / 2)) * maxRotation;
		const rotateXValue = -(mouseY / (rect.height / 2)) * maxRotation;

		setRotateX(rotateXValue);
		setRotateY(rotateYValue);
	};

	const handleMouseLeave = () => {
		setRotateX(0);
		setRotateY(0);
	};

	const heading = href ? <Link href={href}>
		<Heading level={3}>{title}</Heading>
	</Link> : <Heading level={3}>{title}</Heading>

	return (
		<motion.div
			ref={cardRef}
			className={cn("hover: transition-shadow",
				" border bg-card transition-all duration-200",
				!noPadding && "p-6",
				className,
			)}
			style={{
				transformStyle: "preserve-3d",
			}}
			animate={{
				rotateX,
				rotateY,
			}}
			transition={{
				type: "spring",
				stiffness: 300,
				damping: 30,
			}}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			<div style={{ transform: "translateZ(20px)", }} >
				{heading}
				<div className="text-sm text-muted-foreground">
					{subtitle}
				</div>
				{children}
			</div>
		</motion.div>
	);
}

// Grid layout helper
export function PageGrid({
	children,
	className,
	columns = 1,
}: {
	children: ReactNode;
	className?: string;
	columns?: 1 | 2 | 3 | 4;
}) {
	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div className={cn("grid gap-4 sm:gap-6", gridCols[columns], className)}>
			{children}
		</div>
	);
}
