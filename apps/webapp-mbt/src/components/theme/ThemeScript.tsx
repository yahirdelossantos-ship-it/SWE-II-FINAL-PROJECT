const script = `
(() => {
	const storageKey = "mb-transfer-theme";
	const root = document.documentElement;
	const storedTheme = window.localStorage.getItem(storageKey);
	const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
	const resolvedTheme =
		storedTheme === "light" || storedTheme === "dark" ? storedTheme : systemTheme;

	root.dataset.theme = resolvedTheme;
	root.style.colorScheme = resolvedTheme;
})();
`;

export function ThemeScript() {
	return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
