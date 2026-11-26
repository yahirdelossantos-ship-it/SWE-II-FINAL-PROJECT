import { nanoid } from "nanoid";
import { create } from "zustand";
import { type NotificationType } from "./types";

export type NotificationStore = {
	notifications: NotificationType[];
	addNotification: (notification: Omit<NotificationType, "id">) => void;
	dismissNotification: (id: string) => void;
};

// use { addNotification } for adding a nofitication to the state
export const useNotifications = create<NotificationStore>((set) => ({
	notifications: [],
	addNotification: (notification) => {
		const id = nanoid();
		set((state) => ({
			notifications: [...state.notifications, { id, ...notification }],
		}));
		window.setTimeout(() => {
			set((state) => ({
				notifications: state.notifications.filter(
					(item) => item.id !== id,
				),
			}));
		}, 5_000);
	},
	dismissNotification: (id) =>
		set((state) => ({
			notifications: state.notifications.filter(
				(notification) => notification.id !== id,
			),
		})),
}));
