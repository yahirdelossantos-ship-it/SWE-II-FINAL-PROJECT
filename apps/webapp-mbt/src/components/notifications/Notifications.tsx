"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { Notification } from "./Notification";
import { useNotifications } from "./notifications-store";

const subscribe = () => () => {};

export const Notifications = () => {
	const { notifications, dismissNotification } = useNotifications();
	const isMounted = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);

	if (!isMounted) return null;

	return createPortal(
		<div
			aria-live="assertive"
			className="pointer-events-none fixed inset-0 z-[100010] flex flex-col items-end space-y-4 px-4 py-6 sm:p-6"
		>
			{notifications.map((notification) => (
				<Notification
					key={notification.id}
					notification={notification}
					onDismiss={dismissNotification}
				/>
			))}
		</div>,
		document.body,
	);
};
