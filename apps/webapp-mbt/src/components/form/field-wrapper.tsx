import * as React from "react";

import { Error } from "./error";
import { Label } from "./label";
import { type FieldError } from "./types";

type FieldWrapperProps = {
	label?: string;
	className?: string;
	children: React.ReactNode;
	error?: FieldError | undefined;
};

export type FieldWrapperPassThroughProps = Omit<
	FieldWrapperProps,
	"className" | "children"
>;

export const FieldWrapper = (props: FieldWrapperProps) => {
	const { label, error, children, className } = props;

	if (!label) {
		return (
			<div className={className}>
				{children}
				<Error errorMessage={error?.message} />
			</div>
		);
	}

	return (
		<div className={className}>
			<Label>
				{label}
				<div className="mt-1">{children}</div>
			</Label>
			<Error errorMessage={error?.message} />
		</div>
	);
};
