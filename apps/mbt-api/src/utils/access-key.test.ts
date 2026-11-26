import assert from "node:assert/strict";
import test from "node:test";

import {
	hashAccessKey,
	isHashedAccessKey,
	verifyAccessKey,
} from "./access-key";

test("verifies only the correct access key against a stored hash", async () => {
	const hash = await hashAccessKey("correct-access-key");

	assert.equal(isHashedAccessKey(hash), true);
	assert.equal(await verifyAccessKey("correct-access-key", hash), true);
	assert.equal(await verifyAccessKey("wrong-access-key", hash), false);
});

test("rejects legacy plaintext values after migration", async () => {
	assert.equal(
		await verifyAccessKey("legacy-access-key", "legacy-access-key"),
		false,
	);
});
