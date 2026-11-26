import type { ChangeEventHandler, FocusEventHandler, Ref } from "react";

export type FieldError = {
	message?: string;
};

export type FieldRegistration<TElement> = Partial<{
	name: string;
	onBlur: FocusEventHandler<TElement>;
	onChange: ChangeEventHandler<TElement>;
	ref: Ref<TElement>;
}>;
