import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export interface BreadcrumbItemType {
	href: string;
	label: string;
	current?: boolean;
}

interface BreadcrumbsProps {
	breadcrumbs?: BreadcrumbItemType[];
}

export default function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs?.map((breadcrumb, index) => (
					<Fragment key={`breadcrumb-${breadcrumb.href}`}>
						{index > 0 && <BreadcrumbSeparator />}
						<BreadcrumbItem>
							{breadcrumb.current ? (
								<BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={breadcrumb.href}>
									{breadcrumb.label}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
