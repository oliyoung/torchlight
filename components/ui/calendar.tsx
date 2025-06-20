"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "../../lib/utils";

export function Calendar({
	className = "",
	classNames = {},
	showOutsideDays = true,
	...props
}) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			classNames={classNames}
			{...props}
		/>
	);
}

export default Calendar;
