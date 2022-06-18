module.exports = {
    roots: ["<rootDir>/src", "<rootDir>/test"],
    globalSetup: "./test/setup/setup.js",
    globalTeardown: "./test/setup/teardown.js",
    testEnvironment: "node",
    testTimeout: 3 * 60 * 1000,
    verbose: true,
};
